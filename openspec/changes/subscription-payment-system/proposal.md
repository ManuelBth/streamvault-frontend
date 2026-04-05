# Proposal: Subscription Payment System

## Intent

Implementar un sistema de suscripciones con pasarela de pago emulada. Los usuarios pueden elegir entre dos planes (Gratis y Premium $10/mes). Si eligen Premium, completan un proceso de pago emulado y obtienen la suscripción activa.

## Scope

### In Scope
- Modelos de planes de suscripción (FREE, PREMIUM)
- Página de selección de planes con UI atractiva
- Proceso de pago emulado (simulación de checkout)
- Actualización del servicio de suscripciones
- Integración con la página de profile/settings existente

### Out of Scope
- Payment gateway real (Stripe, PayPal)
- Renovación automática de suscripciones
- Sistema de facturación/recibos
- Planes familiares o múltiples

## Approach

- Crear componente de selección de planes en feature "subscriptions"
- Emular pago con delay de 2 segundos + éxito
- Usar el endpoint existente POST /subscriptions/purchase del backend
- Mostrar estado de suscripción en profile y settings

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/profile/pages/settings/` | Modified | Actualizar sección de suscripción |
| `src/app/notifications/` | New | Nuevo feature de subscriptions |
| `src/app/shared/services/notification.service.ts` | Modified | Referencia a actualizar |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| El backend puede no tener el endpoint /subscriptions/purchase implementado | Low | Verificar API Reference antes de implementar |
| Necesita testing del flujo completo | Medium | Crear pruebas E2E del flujo de suscripción |

## Rollback Plan

- Revertir cambios en el componente de payment
- El estado de suscripción queda en backend, no hay forma de "desactivar" desde frontend

## Dependencies

- API: POST /api/v1/subscriptions/purchase debe estar operativo
- API: GET /api/v1/subscriptions/me retorna la suscripción actual

## Success Criteria

- [ ] Usuario puede ver los dos planes disponibles
- [ ] Usuario puede seleccionar plan gratuito y se activa inmediatamente
- [ ] Usuario puede seleccionar plan Premium y ve modal de pago emulado
- [ ] Después del pago emulado, la suscripción Premium se activa
- [ ] La página de profile/settings muestra el plan activo correctamente
