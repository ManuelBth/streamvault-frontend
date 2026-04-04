import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Notification, BroadcastNotification } from '../models';

export type LoadingState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;
  private adminApiUrl = `${environment.apiUrl}/admin/notifications`;

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

  getBroadcasts(): Observable<BroadcastNotification[]> {
    return this.http.get<BroadcastNotification[]>(`${this.adminApiUrl}/broadcast`);
  }

  loadAll(): void {
    this._notifications.set({ state: 'loading', data: undefined });

    // Fetch both user notifications and broadcast notifications in parallel
    forkJoin({
      userNotifications: this.getAll(),
      broadcastNotifications: this.getBroadcasts()
    }).subscribe({
      next: ({ userNotifications, broadcastNotifications }) => {
        // Combine both types, converting broadcast to notification format
        const broadcasts: Notification[] = broadcastNotifications.map(b => ({
          id: b.id,
          type: 'info' as const,
          title: b.title,
          message: b.message,
          relatedId: b.relatedId,
          isRead: true, // Broadcasts are always "read" for the badge count
          createdAt: b.createdAt
        }));

        // Sort by createdAt descending
        const allNotifications = [...userNotifications, ...broadcasts]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        this._notifications.set({ state: 'success', data: allNotifications });
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
}
