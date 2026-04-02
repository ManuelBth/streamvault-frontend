import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { addNotification } from '../store/app.store';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to server';
          break;
        case 400:
          errorMessage = error.error?.message || 'Bad request';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 500:
          errorMessage = 'Server error';
          break;
        case 503:
          errorMessage = 'Service unavailable';
          break;
        default:
          errorMessage = error.message || 'An error occurred';
      }

      addNotification({
        id: crypto.randomUUID(),
        title: 'Error',
        message: errorMessage,
        type: 'error',
        read: false,
        createdAt: new Date()
      });

      return throwError(() => new Error(errorMessage));
    })
  );
};
