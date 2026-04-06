import { inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { signal, computed } from '@angular/core';
import { User, Profile, Notification } from '../models';

export const currentUser = signal<User | null>(null);
export const activeProfile = signal<Profile | null>(null);
export const isLoading = signal<boolean>(false);
export const notifications = signal<Notification[]>([]);
export const searchQuery = signal<string>('');

export const isAuthenticated = computed(() => currentUser() !== null);
export const isAdmin = computed(() => {
  const role = currentUser()?.role?.toUpperCase();
  return role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'ADMINISTRATOR';
});
export const unreadCount = computed(() => 
  notifications().filter(n => !n.isRead).length
);

export function setCurrentUser(user: User | null): void {
  currentUser.set(user);
}

export function setActiveProfile(profile: Profile | null): void {
  activeProfile.set(profile);
}

export function setLoading(loading: boolean): void {
  isLoading.set(loading);
}

export function setSearchQuery(query: string): void {
  searchQuery.set(query);
}

export function setNotifications(list: Notification[]): void {
  notifications.set(list);
}

export function addNotification(notification: Notification): void {
  notifications.update(list => [notification, ...list]);
}

export function markNotificationRead(id: string): void {
  notifications.update(list =>
    list.map(n => n.id === id ? { ...n, isRead: true } : n)
  );
}

export function markAllNotificationsRead(): void {
  notifications.update(list =>
    list.map(n => ({ ...n, isRead: true }))
  );
}

export function clearNotifications(): void {
  notifications.set([]);
}

export function syncWithNotificationService(): void {
  const notificationService = inject(NotificationService);
  
  notificationService.loadAll();
  notificationService.loadUnreadCount();
}
