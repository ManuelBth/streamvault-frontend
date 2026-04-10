import { Injectable, APP_INITIALIZER, FactoryProvider } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  minioUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig | null = null;

  constructor(private http: HttpClient) {}

  loadConfig(): Promise<void> {
    return firstValueFrom(
      this.http.get<AppConfig>('/assets/config.json')
    ).then(config => {
      this.config = config;
      console.log('Runtime configuration loaded:', this.config);
    }).catch(() => {
      // Fallback to window location if config not available
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080/api/v1' 
        : `${window.location.protocol}//${window.location.host}/api/v1`;
      
      this.config = {
        apiUrl,
        wsUrl: apiUrl.replace('http', 'ws').replace('/api/v1', '/ws'),
        minioUrl: window.location.origin.replace(':4200', ':9000')
      };
      console.warn('Using fallback configuration:', this.config);
    });
  }

  get apiUrl(): string {
    return this.config?.apiUrl ?? 'http://localhost:8080/api/v1';
  }

  get wsUrl(): string {
    return this.config?.wsUrl ?? 'ws://localhost:8080/ws';
  }

  get minioUrl(): string {
    return this.config?.minioUrl ?? 'http://localhost:9000';
  }
}

export const configInitializer: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: (configService: ConfigService) => () => configService.loadConfig(),
  deps: [ConfigService],
  multi: true
};
