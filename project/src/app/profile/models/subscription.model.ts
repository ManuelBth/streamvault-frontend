export interface Subscription {
  id: string;
  plan: 'FREE' | 'BASIC' | 'PREMIUM';
  startedAt: string;
  expiresAt: string;
  active: boolean;
}
