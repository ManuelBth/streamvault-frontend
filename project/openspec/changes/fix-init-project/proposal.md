# Proposal: Fix Init-Project Implementation

## Intent

Refactor init-project to align with PRD specifications and Angular 21 patterns. The current implementation has critical security issues (using `user.id` as JWT token), uses class-based state instead of standalone signals, and has routing mismatches. This change addresses proper JWT authentication, signal-based state management, and correct routing per PRD.

## Scope

### In Scope
- Refactor `app.store.ts` to use standalone signals per PRD section 10 (lines 819-835)
- Create `TokenService` for JWT token storage and management
- Create `AuthService` for login/register/logout HTTP operations
- Fix `auth.interceptor.ts` to use real JWT token from TokenService
- Fix `refresh.interceptor.ts` for silent token refresh on 401
- Implement `LoginPageComponent` with form validation
- Implement `RegisterPageComponent` with `@streamvault.com` email domain validation
- Fix routing to match PRD: login at `/`, register at `/register`
- Create shared layout components: navbar, footer, main-layout, auth-layout, admin-layout

### Out of Scope
- Full catalog implementation
- Player implementation  
- WebSocket implementation
- Profile system implementation

## Approach

Follow Angular skill Pattern 2 (Signals as Primary State) and PRD section 10:
1. Extract standalone signals from AppStore class to root-level signals
2. Create TokenService using localStorage for JWT persistence
3. Create AuthService with HTTP calls to backend auth endpoints
4. Update interceptors to use TokenService instead of AppStore user.id
5. Implement login/register pages with reactive forms
6. Create layout components with proper routing structure

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/shared/store/app.store.ts` | Modified | Convert from class to standalone signals |
| `src/app/shared/services/token.service.ts` | New | JWT token storage/retrieval |
| `src/app/shared/services/auth.service.ts` | New | Login/register/logout HTTP |
| `src/app/shared/interceptors/auth.interceptor.ts` | Modified | Use JWT from TokenService |
| `src/app/shared/interceptors/refresh.interceptor.ts` | Modified | Silent refresh logic |
| `src/app/auth/pages/login/` | New | Login page component |
| `src/app/auth/pages/register/` | New | Register page component |
| `src/app/shared/layouts/` | New | Navbar, footer, layouts |
| `src/app/app.routes.ts` | Modified | Root path routing |
| `src/app/auth/auth.routes.ts` | Modified | Match PRD paths |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Security: current interceptor uses user.id as token | High | Replace with proper JWT token from TokenService |
| Breaking existing auth flow | Medium | Test incrementally, verify guards still work |
| Routing changes break navigation | Medium | Verify all routes after changes |

## Rollback Plan

Revert to previous commit:
```bash
git checkout HEAD~1 -- .
```

## Dependencies

- Backend auth endpoints must exist at `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`
- PRD specification document for routing paths

## Success Criteria

- [ ] app.store.ts uses standalone signals (not class)
- [ ] auth.interceptor.ts uses real JWT token from TokenService
- [ ] refresh.interceptor.ts attempts silent refresh before redirect
- [ ] Login page works with form validation
- [ ] Register page validates @streamvault.com domain
- [ ] Routing matches PRD (/ for login, /register)
