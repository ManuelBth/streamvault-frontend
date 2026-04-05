export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type BroadcastType = 'NEW_CONTENT' | 'NEW_EPISODE' | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface BroadcastNotification {
  id: string;
  type: BroadcastType;
  title: string;
  message: string;
  relatedId?: string;
  createdAt: string;
}

export type LoadingState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};
