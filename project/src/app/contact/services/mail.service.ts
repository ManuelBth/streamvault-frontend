import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from '../../shared/services/config.service';

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

@Injectable({ providedIn: 'root' })
export class MailService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiUrl = `${this.configService.apiUrl}/contact`;

  private _sending = signal<LoadingState<void>>({ state: 'idle', data: undefined });
  
  readonly sending = this._sending.asReadonly();

  private isErrorState<T>(state: LoadingState<T>): boolean {
    return state.state === 'error';
  }

  readonly isLoading = computed(() => this._sending().state === 'loading');
  readonly hasError = computed(() => this.isErrorState(this._sending()));
  readonly errorMessage = computed(() => 
    this._sending().state === 'error' ? this._sending().error ?? null : null
  );
  readonly isSuccess = computed(() => this._sending().state === 'success');

  send(request: MailRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/send`, request);
  }

  sendEmail(request: MailRequest): void {
    this._sending.set({ state: 'loading', data: undefined });

    this.send(request).subscribe({
      next: () => this._sending.set({ state: 'success', data: undefined }),
      error: (err) => this._sending.set({ state: 'error', error: err.message })
    });
  }

  reset(): void {
    this._sending.set({ state: 'idle', data: undefined });
  }
}