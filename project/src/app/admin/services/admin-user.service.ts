import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from '../../shared/services/config.service';
import { AdminUser, AdminUsersResponse } from '../models/admin-user.model';

export type LoadingState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiUrl = `${this.configService.apiUrl}/admin/users`;

  private _users = signal<LoadingState<AdminUsersResponse>>({ state: 'idle', data: undefined });
  private _currentUser = signal<LoadingState<AdminUser>>({ state: 'idle', data: undefined });

  readonly users = this._users.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();

  private isErrorState<T>(state: LoadingState<T>): boolean {
    return state.state === 'error';
  }

  readonly isUsersLoading = computed(() => this._users().state === 'loading');
  readonly hasUsersError = computed(() => this.isErrorState(this._users()));
  readonly usersErrorMessage = computed(() => 
    this._users().state === 'error' ? this._users().error ?? null : null
  );
  readonly usersList = computed(() => this._users().data?.users ?? []);
  readonly usersTotal = computed(() => this._users().data?.total ?? 0);
  readonly usersPage = computed(() => this._users().data?.page ?? 0);
  readonly usersSize = computed(() => this._users().data?.size ?? 20);
  readonly usersTotalPages = computed(() => {
    const data = this._users().data;
    return data ? Math.ceil(data.total / data.size) : 0;
  });

  readonly isCurrentUserLoading = computed(() => this._currentUser().state === 'loading');
  readonly hasCurrentUserError = computed(() => this.isErrorState(this._currentUser()));
  readonly currentUserErrorMessage = computed(() => 
    this._currentUser().state === 'error' ? this._currentUser().error ?? null : null
  );

  getUsers(page: number = 0, size: number = 20): Observable<AdminUsersResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<AdminUsersResponse>(this.apiUrl, { params });
  }

  getUserById(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/${id}`);
  }

  loadUsers(page: number = 0, size: number = 20): void {
    this._users.set({ state: 'loading', data: undefined });

    this.getUsers(page, size).subscribe({
      next: (response) => this._users.set({ state: 'success', data: response }),
      error: (err) => this._users.set({ state: 'error', error: err.message })
    });
  }

  loadUserById(id: string): void {
    this._currentUser.set({ state: 'loading', data: undefined });

    this.getUserById(id).subscribe({
      next: (user) => this._currentUser.set({ state: 'success', data: user }),
      error: (err) => this._currentUser.set({ state: 'error', error: err.message })
    });
  }

  clearCurrentUser(): void {
    this._currentUser.set({ state: 'idle', data: undefined });
  }
}