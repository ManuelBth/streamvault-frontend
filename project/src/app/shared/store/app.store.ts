import { signal, computed } from '@angular/core';

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

export const currentUser = signal<User | null>(null);
export const activeProfile = signal<Profile | null>(null);
export const isLoading = signal<boolean>(false);
export const notifications = signal<Notification[]>([]);
export const searchQuery = signal<string>('');

export const isAuthenticated = computed(() => currentUser() !== null);
export const isAdmin = computed(() => currentUser()?.role === 'ADMIN');
export const unreadCount = computed(() => 
  notifications().filter(n => !n.read).length
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

export function addNotification(notification: Notification): void {
  notifications.update(list => [notification, ...list]);
}

export function markNotificationRead(id: string): void {
  notifications.update(list =>
    list.map(n => n.id === id ? { ...n, read: true } : n)
  );
}

export function clearNotifications(): void {
  notifications.set([]);
}
