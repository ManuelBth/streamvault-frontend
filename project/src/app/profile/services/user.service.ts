import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from '../../shared/services/config.service';
import { User } from '../../shared/models';

export type LoadingState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiUrl = `${this.configService.apiUrl}/users`;

  private _currentUser = signal<LoadingState<User>>({ state: 'idle', data: undefined });
  
  readonly currentUser = this._currentUser.asReadonly();

  private isErrorState<T>(state: LoadingState<T>): boolean {
    return state.state === 'error';
  }

  readonly isLoading = computed(() => this._currentUser().state === 'loading');
  readonly hasError = computed(() => this.isErrorState(this._currentUser()));
  readonly errorMessage = computed(() => 
    this._currentUser().state === 'error' ? this._currentUser().error ?? null : null
  );

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  loadMe(): void {
    this._currentUser.set({ state: 'loading', data: undefined });

    this.getMe().subscribe({
      next: (user) => this._currentUser.set({ state: 'success', data: user }),
      error: (err) => this._currentUser.set({ state: 'error', error: err.message })
    });
  }

  updateMe(req: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, req);
  }

  changePassword(req: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/me/password`, req);
  }
}
