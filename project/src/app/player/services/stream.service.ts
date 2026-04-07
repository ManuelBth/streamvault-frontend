import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';

import { ConfigService } from '../../shared/services/config.service';
import { StreamUrlResponse } from '../models/stream-url.response';

export type LoadingState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class StreamService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private readonly apiUrl = `${this.configService.apiUrl}/stream`;

  private _streamUrl = signal<LoadingState<StreamUrlResponse>>({ state: 'idle', data: undefined });
  private _episodeStreamUrl = signal<LoadingState<StreamUrlResponse>>({ state: 'idle', data: undefined });

  readonly streamUrl = this._streamUrl.asReadonly();
  readonly episodeStreamUrl = this._episodeStreamUrl.asReadonly();

  private isErrorState<T>(state: LoadingState<T>): boolean {
    return state.state === 'error';
  }

  readonly isStreamLoading = computed(() => this._streamUrl().state === 'loading');
  readonly hasStreamError = computed(() => this.isErrorState(this._streamUrl()));
  readonly streamErrorMessage = computed(() => 
    this._streamUrl().state === 'error' ? this._streamUrl().error ?? null : null
  );

  readonly isEpisodeStreamLoading = computed(() => this._episodeStreamUrl().state === 'loading');
  readonly hasEpisodeStreamError = computed(() => this.isErrorState(this._episodeStreamUrl()));
  readonly episodeStreamErrorMessage = computed(() => 
    this._episodeStreamUrl().state === 'error' ? this._episodeStreamUrl().error ?? null : null
  );

  getStreamUrl(contentId: string): Observable<StreamUrlResponse> {
    return this.http.get<StreamUrlResponse>(`${this.apiUrl}/${contentId}`).pipe(
      catchError(err => {
        const message = err.error?.message || err.message || 'Failed to get stream URL';
        return throwError(() => new Error(message));
      })
    );
  }

  loadStreamUrl(contentId: string): void {
    this._streamUrl.set({ state: 'loading', data: undefined });

    this.getStreamUrl(contentId).subscribe({
      next: (response) => this._streamUrl.set({ state: 'success', data: response }),
      error: (err) => this._streamUrl.set({ state: 'error', error: err.message })
    });
  }

  getEpisodeStreamUrl(contentId: string, episodeId: string): Observable<StreamUrlResponse> {
    return this.http.get<StreamUrlResponse>(`${this.apiUrl}/${contentId}/episode/${episodeId}`).pipe(
      catchError(err => {
        const message = err.error?.message || err.message || 'Failed to get episode stream URL';
        return throwError(() => new Error(message));
      })
    );
  }

  loadEpisodeStreamUrl(contentId: string, episodeId: string): void {
    this._episodeStreamUrl.set({ state: 'loading', data: undefined });

    this.getEpisodeStreamUrl(contentId, episodeId).subscribe({
      next: (response) => this._episodeStreamUrl.set({ state: 'success', data: response }),
      error: (err) => this._episodeStreamUrl.set({ state: 'error', error: err.message })
    });
  }

  clearStreamUrl(): void {
    this._streamUrl.set({ state: 'idle', data: undefined });
  }

  clearEpisodeStreamUrl(): void {
    this._episodeStreamUrl.set({ state: 'idle', data: undefined });
  }
}