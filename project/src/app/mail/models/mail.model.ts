export interface MailRequest {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export type LoadingState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};