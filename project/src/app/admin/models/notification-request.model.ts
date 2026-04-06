export interface SendNotificationRequest {
  userId: string;
  type: 'USER_NOTIFICATION' | 'SYSTEM';
  title: string;
  message: string;
  relatedId?: string;
}

export interface BroadcastNotificationRequest {
  type: 'NEW_CONTENT' | 'NEW_EPISODE' | 'SYSTEM';
  title: string;
  message: string;
  relatedId?: string;
}