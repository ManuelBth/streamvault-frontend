# Design: Subscription Payment System

## Technical Approach

This change enhances the existing subscription functionality in the Settings page by adding a plan selector with FREE and PREMIUM plans, and a modal payment flow for premium purchases. The implementation integrates directly into the existing Settings component as presentational components, following the inline approach specified in the requirements.

## Architecture Decisions

### Decision: Inline Plan Selector in Settings

**Choice**: Integrate plan-selector as inline components in the existing Settings page rather than creating a separate route
**Alternatives considered**: Create a new lazy-loaded route `/subscriptions` with its own page container
**Rationale**: The requirements specify inline display in settings/profile. This maintains user context (they're already managing their account) and avoids navigation overhead. The existing Settings component already handles subscription display, so extending it is more consistent.

### Decision: Payment Modal with Emulated Flow

**Choice**: Use a modal dialog for payment entry instead of redirecting to a payment page
**Alternatives considered**: Full-page payment flow, external payment gateway redirect
**Rationale**: The backend handles payment emulation (no real card validation). A modal keeps the user in context and allows easy cancellation. The emulated nature means we don't need secure payment processing infrastructure.

### Decision: Shared Subscription Service Extension

**Choice**: Extend the existing `SubscriptionService` instead of creating a new service
**Alternatives considered**: Create `PaymentService` or `SubscriptionPurchaseService`
**Rationale**: The existing service already has `purchase()` method and signal-based state management. Adding `getPlans()` method keeps all subscription-related logic in one place and maintains the established pattern.

### Decision: Plan Data as Static Constants

**Choice**: Define plan definitions as TypeScript constants in the model file, not fetched from API
**Alternatives considered**: Fetch plan definitions from `/api/v1/subscriptions/plans` endpoint
**Rationale**: Plans are fixed (FREE, PREMIUM) and rarely change. Hardcoding them simplifies the implementation and avoids an unnecessary API call. The backend handles plan logic on purchase.

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         SettingsComponent                        │
│  (Container - orchestrates plan selection & payment flow)       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ PlanSelector │   │ PaymentModal │   │ Subscription │
│  Component   │   │   Component  │   │   Service    │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       │ selectPlan()     │ submitPayment()  │ HTTP calls
       └──────────────────┼──────────────────┘
                          ▼
                   ┌─────────────────┐
                   │   Backend API   │
                   │ POST /purchase  │
                   └─────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/profile/models/subscription.model.ts` | Modify | Add `Plan`, `PlanType`, `PaymentResult` interfaces; add `PLANS` constant |
| `src/app/profile/services/subscription.service.ts` | Modify | Add `getPlans()` method returning static plan data |
| `src/app/profile/components/plan-selector/plan-selector.component.ts` | Create | Presentational component displaying plan cards |
| `src/app/profile/components/plan-selector/plan-selector.component.html` | Create | Template with 2-column grid of plan cards |
| `src/app/profile/components/plan-selector/plan-selector.component.scss` | Create | Tailwind styles for plan cards |
| `src/app/profile/components/payment-modal/payment-modal.component.ts` | Create | Modal component with card form and emulated processing |
| `src/app/profile/components/payment-modal/payment-modal.component.html` | Create | Template with card number, expiry, CVV inputs |
| `src/app/profile/components/payment-modal/payment-modal.component.scss` | Create | Modal overlay and form styles |
| `src/app/profile/pages/settings/settings.component.ts` | Modify | Import plan-selector and payment-modal; add selection/payment state |
| `src/app/profile/pages/settings/settings.component.html` | Modify | Replace simple purchase button with plan-selector integration |

## Interfaces / Contracts

```typescript
// src/app/profile/models/subscription.model.ts

export type PlanType = 'FREE' | 'PREMIUM';

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

export interface Subscription {
  id: string;
  plan: PlanType;
  startedAt: string;
  expiresAt: string;
  active: boolean;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  subscription?: Subscription;
}

// Static plan definitions
export const PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Gratis',
    price: 0,
    features: [
      'Acceso básico al catálogo',
      'Qualidad estándar',
      '1 dispositivo'
    ]
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 9.99,
    isPopular: true,
    features: [
      'Catálogo completo',
      'Calidad 4K HDR',
      '5 dispositivos',
      'Sin publicidad',
      'Downloads offline'
    ]
  }
];
```

```typescript
// src/app/profile/services/subscription.service.ts additions

getPlans(): Plan[] {
  return PLANS;
}

// Existing purchase() already handles the API call
// It accepts empty body, backend determines plan from user state
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | PlanSelector renders correctly with plan data | Component test with mock plans input |
| Unit | PaymentModal form validation and state | Component test with formControl |
| Unit | SubscriptionService.getPlans() returns static data | Service test verifying PLANS constant |
| Integration | SettingsComponent flow: no sub → show plans → select → purchase | Component test with mocked service |
| E2E | Full subscription purchase flow | Playwright: navigate to settings → select premium → enter card → verify success |

## Migration / Rollout

No migration required. This is a frontend-only enhancement that works with the existing backend endpoint `/api/v1/subscriptions/purchase`. The backend already handles the subscription creation logic.

## Open Questions

- [ ] Does the backend support passing explicit `plan` in the purchase request body, or does it always default to PREMIUM? Current implementation sends empty body which may need clarification.
- [ ] Should the FREE plan also trigger a backend call to record the "downgrade" or is it client-side only? Currently the plan-selector would call purchase for FREE as well.

## Risks

1. **Backend contract mismatch**: If `/purchase` endpoint doesn't support FREE plan or requires different payload, the FREE selection will fail. Mitigation: Verify backend API contract.
2. **Modal state persistence**: If user navigates away during payment, state is lost. Low risk since modal is inline in settings.
3. **No card validation**: The emulated payment accepts any input. This is by design but should be documented to avoid confusion in QA.