import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEventType } from '@angular/common/http';
import { tap } from 'rxjs';
import { setLoading } from '../store/app.store';

export const loadingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  if (req.method !== 'GET') {
    setLoading(true);
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          setLoading(false);
        }
      },
      error: () => {
        setLoading(false);
      }
    })
  );
};
