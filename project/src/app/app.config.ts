import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { routes } from './app.routes';
import { ConfigService } from './shared/services/config.service';
import { AuthService } from './auth/services/auth.service';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { refreshInterceptor } from './shared/interceptors/refresh.interceptor';
import { errorInterceptor } from './shared/interceptors/error.interceptor';
import { loadingInterceptor } from './shared/interceptors/loading.interceptor';

export function initializeConfig(configService: ConfigService): () => Promise<void> {
  return () => configService.loadConfig();
}

export function initializeApp(configService: AuthService): () => Observable<any> {
  return () => configService.initializeAuth();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        loadingInterceptor,
        errorInterceptor,
        refreshInterceptor
      ])
    ),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-mode',
          cssLayer: false
        }
      }
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeConfig,
      deps: [ConfigService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true
    }
  ]
};
