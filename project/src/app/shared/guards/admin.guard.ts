import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStore } from '../store/app.store';

export const adminGuard: CanActivateFn = (route, state) => {
  const store = inject(AppStore);
  const router = inject(Router);

  if (store.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
