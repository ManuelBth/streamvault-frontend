export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface BroadcastNotification {
  id: string;
  type: 'NEW_CONTENT' | 'NEW_EPISODE' | 'SYSTEM';
  title: string;
  message: string;
  relatedId?: string;
  createdAt: string;
}