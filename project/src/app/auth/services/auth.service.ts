import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, of } from 'rxjs';
import { TokenService } from './token.service';
import { setCurrentUser } from '../../shared/store/app.store';
import { environment } from '../../../environments/environment';

// Importar tipos del models folder (auth-specific)
import type { LoginRequest, RegisterRequest, AuthResponse } from '../models';
import type { User } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private readonly apiUrl = environment.apiUrl; // Ya incluye /api/v1

  initializeAuth(): Observable<User | null> {
    const token = this.tokenService.getToken();
    if (!token || this.tokenService.isExpired()) {
      this.tokenService.clearToken();
      setCurrentUser(null);
      return of(null);
    }

    return this.http.get<User>(`${this.apiUrl}/users/me`).pipe(
      tap({
        next: (user) => setCurrentUser(user),
        error: () => {
          this.tokenService.clearToken();
          setCurrentUser(null);
        }
      })
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.tokenService.setToken(response.accessToken);
        this.tokenService.setRefreshToken(response.refreshToken);
      }),
      switchMap(response => 
        this.http.get<User>(`${this.apiUrl}/users/me`).pipe(
          tap(user => setCurrentUser(user)),
          switchMap(() => of(response))
        )
      )
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(response => {
        this.tokenService.setToken(response.accessToken);
        this.tokenService.setRefreshToken(response.refreshToken);
      }),
      switchMap(response => 
        this.http.get<User>(`${this.apiUrl}/users/me`).pipe(
          tap(user => setCurrentUser(user)),
          switchMap(() => of(response))
        )
      )
    );
  }

  logout(): void {
    this.tokenService.clearToken();
    setCurrentUser(null);
  }

  isAuthenticated(): boolean {
    return !this.tokenService.isExpired();
  }

  refreshToken(): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/refresh`, {});
  }
}
