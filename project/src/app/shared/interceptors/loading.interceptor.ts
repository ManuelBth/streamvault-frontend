import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEventType } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppStore } from '../store/app.store';
import { tap } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const store = inject(AppStore);
  
  if (req.method !== 'GET') {
    store.setLoading(true);
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          store.setLoading(false);
        }
      },
      error: () => {
        store.setLoading(false);
      }
    })
  );
};
