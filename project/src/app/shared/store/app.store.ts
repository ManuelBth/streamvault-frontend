import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar?: string;
  isMain: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class AppStore {
  private _currentUser = signal<User | null>(null);
  private _activeProfile = signal<Profile | null>(null);
  private _isLoading = signal<boolean>(false);
  private _notifications = signal<Notification[]>([]);
  private _searchQuery = signal<string>('');

  readonly currentUser = this._currentUser.asReadonly();
  readonly activeProfile = this._activeProfile.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly notifications = this._notifications.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();

  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');
  readonly unreadCount = computed(() => 
    this._notifications().filter(n => !n.read).length
  );

  setCurrentUser(user: User | null): void {
    this._currentUser.set(user);
  }

  setActiveProfile(profile: Profile | null): void {
    this._activeProfile.set(profile);
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  addNotification(notification: Notification): void {
    this._notifications.update(list => [notification, ...list]);
  }

  markNotificationRead(id: string): void {
    this._notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  clearNotifications(): void {
    this._notifications.set([]);
  }
}
