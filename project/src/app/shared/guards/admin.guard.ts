import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isAdmin } from '../store/app.store';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if (isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
