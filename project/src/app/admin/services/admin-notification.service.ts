import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SendNotificationRequest, BroadcastNotificationRequest } from '../models/notification-request.model';

export type LoadingState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminNotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/notifications`;

  private _lastSent = signal<LoadingState<void>>({ state: 'idle', data: undefined });
  private _lastBroadcast = signal<LoadingState<void>>({ state: 'idle', data: undefined });

  readonly lastSent = this._lastSent.asReadonly();
  readonly lastBroadcast = this._lastBroadcast.asReadonly();

  private isErrorState<T>(state: LoadingState<T>): boolean {
    return state.state === 'error';
  }

  readonly isSending = computed(() => this._lastSent().state === 'loading');
  readonly hasSendError = computed(() => this.isErrorState(this._lastSent()));
  readonly sendErrorMessage = computed(() => 
    this._lastSent().state === 'error' ? this._lastSent().error ?? null : null
  );
  readonly sendSuccess = computed(() => this._lastSent().state === 'success');

  readonly isBroadcasting = computed(() => this._lastBroadcast().state === 'loading');
  readonly hasBroadcastError = computed(() => this.isErrorState(this._lastBroadcast()));
  readonly broadcastErrorMessage = computed(() => 
    this._lastBroadcast().state === 'error' ? this._lastBroadcast().error ?? null : null
  );
  readonly broadcastSuccess = computed(() => this._lastBroadcast().state === 'success');

  sendToUser(request: SendNotificationRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }

  broadcast(request: BroadcastNotificationRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/broadcast`, request);
  }

  sendNotificationToUser(request: SendNotificationRequest): void {
    this._lastSent.set({ state: 'loading', data: undefined });

    this.sendToUser(request).subscribe({
      next: () => this._lastSent.set({ state: 'success', data: undefined }),
      error: (err) => this._lastSent.set({ state: 'error', error: err.message })
    });
  }

  broadcastNotification(request: BroadcastNotificationRequest): void {
    this._lastBroadcast.set({ state: 'loading', data: undefined });

    this.broadcast(request).subscribe({
      next: () => this._lastBroadcast.set({ state: 'success', data: undefined }),
      error: (err) => this._lastBroadcast.set({ state: 'error', error: err.message })
    });
  }

  clearSendState(): void {
    this._lastSent.set({ state: 'idle', data: undefined });
  }

  clearBroadcastState(): void {
    this._lastBroadcast.set({ state: 'idle', data: undefined });
  }
}