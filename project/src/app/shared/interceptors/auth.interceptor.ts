import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppStore } from '../store/app.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AppStore);
  const user = store.currentUser();

  if (user) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.id}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
