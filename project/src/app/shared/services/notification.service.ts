import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Notification } from '../models';

export type LoadingState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  private _notifications = signal<LoadingState<Notification[]>>({ state: 'idle', data: undefined });
  private _unreadCount = signal<number>(0);
  
  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();

  private isErrorState<T>(state: LoadingState<T>): boolean {
    return state.state === 'error';
  }

  readonly isLoading = computed(() => this._notifications().state === 'loading');
  readonly hasError = computed(() => this.isErrorState(this._notifications()));
  readonly errorMessage = computed(() => 
    this._notifications().state === 'error' ? this._notifications().error ?? null : null
  );

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  loadAll(): void {
    this._notifications.set({ state: 'loading', data: undefined });

    // Fetch user notifications only (no GET endpoint for broadcasts)
    this.getAll().subscribe({
      next: (userNotifications) => {
        this._notifications.set({ state: 'success', data: userNotifications });
      },
      error: (err) => this._notifications.set({ state: 'error', error: err.message })
    });
  }

  getUnread(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread/count`);
  }

  loadUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (response) => this._unreadCount.set(response.count),
      error: () => this._unreadCount.set(0)
    });
  }

  markAsRead(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {});
  }

  // Add notification from WebSocket
  addNotificationFromWebSocket(notification: Notification): void {
    const current = this._notifications();
    const currentList = current.data ?? [];
    
    // Add to the beginning of the list
    this._notifications.set({
      ...current,
      data: [notification, ...currentList]
    });
    
    // Increment unread count
    if (!notification.isRead) {
      this._unreadCount.update(count => count + 1);
    }
  }

  // Show a toast notification (client-side only)
  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    const notification: Notification = {
      id: `toast-${Date.now()}`,
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    this.addNotificationFromWebSocket(notification);
  }
}
