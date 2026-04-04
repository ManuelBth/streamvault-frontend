import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Subscription } from '../models/subscription.model';

export type LoadingState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  private _subscription = signal<LoadingState<Subscription | null>>({ state: 'idle', data: undefined });
  
  readonly subscription = this._subscription.asReadonly();

  private isErrorState<T>(state: LoadingState<T>): boolean {
    return state.state === 'error';
  }

  readonly isLoading = computed(() => this._subscription().state === 'loading');
  readonly hasError = computed(() => this.isErrorState(this._subscription()));
  readonly errorMessage = computed(() => 
    this._subscription().state === 'error' ? this._subscription().error ?? null : null
  );

  getMySubscription(): Observable<Subscription | null> {
    return this.http.get<Subscription | null>(`${this.apiUrl}/me`);
  }

  loadMySubscription(): void {
    this._subscription.set({ state: 'loading', data: undefined });

    this.getMySubscription().subscribe({
      next: (sub) => this._subscription.set({ state: 'success', data: sub }),
      error: (err) => this._subscription.set({ state: 'error', error: err.message })
    });
  }

  purchase(): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/purchase`, {});
  }
}
