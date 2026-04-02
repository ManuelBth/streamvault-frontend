import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { refreshInterceptor } from './shared/interceptors/refresh.interceptor';
import { errorInterceptor } from './shared/interceptors/error.interceptor';
import { loadingInterceptor } from './shared/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useValue: authInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useValue: refreshInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useValue: errorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useValue: loadingInterceptor, multi: true }
  ]
};
