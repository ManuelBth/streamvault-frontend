import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

import { ConfigService } from '../../shared/services/config.service';
import { Subscription, Plan, PlanType, AVAILABLE_PLANS } from '../models/subscription.model';

export type LoadingState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiUrl = `${this.configService.apiUrl}/subscriptions`;

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

  getPlans(): Plan[] {
    return AVAILABLE_PLANS;
  }

  getMySubscription(): Observable<Subscription | null> {
    return this.http.get<Subscription | null>(`${this.apiUrl}/me`);
  }

  loadMySubscription(): void {
    this._subscription.set({ state: 'loading', data: undefined });

    this.getMySubscription().subscribe({
      next: (sub) => {
        // 404 means no subscription - that's valid, not an error
        this._subscription.set({ state: 'success', data: sub });
      },
      error: (err) => {
        // If 404, user has no subscription - that's OK
        if (err.status === 404) {
          this._subscription.set({ state: 'success', data: null });
        } else {
          this._subscription.set({ state: 'error', error: err.message });
        }
      }
    });
  }

  purchase(plan: PlanType): Observable<Subscription> {
    // Call real backend endpoint
    return this.http.post<Subscription>(`${this.apiUrl}/purchase`, { plan });
  }

  // Método real que llama al backend (para uso futuro)
  purchaseReal(): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/purchase`, {});
  }

  // Set FREE plan locally (no backend call - backend always creates DEFAULT)
  setFreePlanLocally(): void {
    const freeSubscription: Subscription = {
      id: 'free-local-' + Date.now(),
      plan: 'FREE',
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      active: true
    };
    this._subscription.set({ state: 'success', data: freeSubscription });
  }
}
