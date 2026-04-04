# Proposal: User Subscription Services

## Intent

Implement profile domain services (UserService, SubscriptionService) and integrate notifications into the settings page. This addresses the gap where the profile domain has empty services/, models/, and components/ folders, preventing users from managing their account, viewing subscription status, and accessing notifications.

## Scope

### In Scope
- UserService with getMe(), updateMe(), and changePassword() methods
- SubscriptionService with getMySubscription() and purchase() methods
- Notification integration in settings page (read/unread notifications)
- Update shared models (User, Notification) to match API response structure

### Out of Scope
- WebSocket implementation for real-time notifications (future MVP enhancement)
- Profile CRUD operations (already exist in pages, services only)
- Payment gateway integration details

## Approach

Follow existing service patterns from the codebase:
- **State Management**: Use CatalogService pattern with `signal<LoadingState>` for async operations
- **HTTP Calls**: Use AuthService pattern returning Observables for user actions
- **Store Integration**: Integrate with existing app.store signals (currentUser, notifications, unreadCount)

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/profile/services/` | New | UserService, SubscriptionService |
| `src/app/profile/models/` | New | Profile domain models if needed |
| `src/app/profile/pages/settings/` | Modified | Integrate services for user info/subscription |
| `src/app/shared/models/` | Modified | Update User and Notification models |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Model mismatch between current models and API | Medium | Align shared models to API structure first before implementing services |
| Integration with existing app.store notifications | Medium | Clear separation: services handle API calls, store handles UI state |

## Rollback Plan

1. Delete all files in `src/app/profile/services/` created for this change
2. Delete all files in `src/app/profile/models/` created for this change
3. Revert changes to `src/app/shared/models/User.ts` and `src/app/shared/models/Notification.ts`
4. Revert any modifications to settings page components

## Dependencies

- API Reference endpoints must be accessible (documented in exploration)
- Existing app.store implementation for notifications

## Success Criteria

- [ ] UserService.getMe() returns user data from API
- [ ] UserService.updateMe() updates name/email via API
- [ ] UserService.changePassword() changes password via API
- [ ] SubscriptionService.getMySubscription() returns subscription data
- [ ] SubscriptionService.purchase() creates subscription via API
- [ ] Settings page displays user info and subscription status
- [ ] Notifications accessible in settings page