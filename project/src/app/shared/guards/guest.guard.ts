import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isAuthenticated } from '../store/app.store';

export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if (!isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/catalog']);
};
