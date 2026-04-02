import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HistoryRecord, CreateHistoryRequest, UpdateProgressRequest } from '../../shared/models/history.model';

export type HistoryState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/history`;

  private _historyRecords = signal<HistoryState<HistoryRecord[]>>({ state: 'idle', data: undefined });
  private _currentRecord = signal<HistoryState<HistoryRecord>>({ state: 'idle', data: undefined });

  readonly historyRecords = this._historyRecords.asReadonly();
  readonly currentRecord = this._currentRecord.asReadonly();

  private isErrorState<T>(state: HistoryState<T>): boolean {
    return state.state === 'error';
  }

  readonly isLoading = computed(() => this._historyRecords().state === 'loading');
  readonly hasError = computed(() => this.isErrorState(this._historyRecords()));
  readonly errorMessage = computed(() => 
    this._historyRecords().state === 'error' ? this._historyRecords().error ?? null : null
  );

  readonly isCurrentLoading = computed(() => this._currentRecord().state === 'loading');
  readonly hasCurrentError = computed(() => this.isErrorState(this._currentRecord()));
  readonly currentErrorMessage = computed(() => 
    this._currentRecord().state === 'error' ? this._currentRecord().error ?? null : null
  );

  getHistory(profileId?: string): Observable<HistoryRecord[]> {
    let params = new HttpParams();
    if (profileId) {
      params = params.set('profileId', profileId);
    }
    return this.http.get<HistoryRecord[]>(this.apiUrl, { params }).pipe(
      catchError(err => {
        const message = err.error?.message || err.message || 'Failed to get history';
        return throwError(() => new Error(message));
      })
    );
  }

  loadHistory(profileId?: string): void {
    this._historyRecords.set({ state: 'loading', data: undefined });

    this.getHistory(profileId).subscribe({
      next: (records) => this._historyRecords.set({ state: 'success', data: records }),
      error: (err) => this._historyRecords.set({ state: 'error', error: err.message })
    });
  }

  createHistoryRecord(episodeId: string, progressSec?: number, completed?: boolean): Observable<HistoryRecord> {
    const body: CreateHistoryRequest = {
      episodeId,
      ...(progressSec !== undefined && { progressSec }),
      ...(completed !== undefined && { completed })
    };

    return this.http.post<HistoryRecord>(this.apiUrl, body).pipe(
      catchError(err => {
        const message = err.error?.message || err.message || 'Failed to create history record';
        return throwError(() => new Error(message));
      })
    );
  }

  loadCreateHistoryRecord(episodeId: string, progressSec?: number, completed?: boolean): void {
    this._currentRecord.set({ state: 'loading', data: undefined });

    this.createHistoryRecord(episodeId, progressSec, completed).subscribe({
      next: (record) => this._currentRecord.set({ state: 'success', data: record }),
      error: (err) => this._currentRecord.set({ state: 'error', error: err.message })
    });
  }

  updateProgress(historyId: string, progressSec: number, completed?: boolean): Observable<HistoryRecord> {
    const body: UpdateProgressRequest = {
      progressSec,
      ...(completed !== undefined && { completed })
    };

    return this.http.put<HistoryRecord>(`${this.apiUrl}/${historyId}/progress`, body).pipe(
      catchError(err => {
        const message = err.error?.message || err.message || 'Failed to update progress';
        return throwError(() => new Error(message));
      })
    );
  }

  loadUpdateProgress(historyId: string, progressSec: number, completed?: boolean): void {
    this._currentRecord.set({ state: 'loading', data: undefined });

    this.updateProgress(historyId, progressSec, completed).subscribe({
      next: (record) => this._currentRecord.set({ state: 'success', data: record }),
      error: (err) => this._currentRecord.set({ state: 'error', error: err.message })
    });
  }

  clearHistory(): void {
    this._historyRecords.set({ state: 'idle', data: undefined });
  }

  clearCurrentRecord(): void {
    this._currentRecord.set({ state: 'idle', data: undefined });
  }
}