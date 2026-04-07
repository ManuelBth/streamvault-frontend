import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, catchError, throwError, Subject, debounceTime, EMPTY } from 'rxjs';

import { ConfigService } from '../../shared/services/config.service';
import { HistoryRecord, CreateHistoryRequest, UpdateProgressRequest } from '../../shared/models/history.model';
import { activeProfile } from '../../shared/store/app.store';

export type HistoryState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private readonly apiUrl = `${this.configService.apiUrl}/history`;

  private _historyRecords = signal<HistoryState<HistoryRecord[]>>({ state: 'idle', data: undefined });
  private _currentRecord = signal<HistoryState<HistoryRecord>>({ state: 'idle', data: undefined });
  
  // Subject for debounced progress saving
  private progressSubject = new Subject<{ id: string; progressSec: number }>();

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

  createHistoryRecord(episodeId: string, progressSec?: number, completed?: boolean, profileId?: string): Observable<HistoryRecord> {
    const currentProfileId = profileId || activeProfile()?.id;
    const body: CreateHistoryRequest = {
      episodeId,
      ...(progressSec !== undefined && { progressSec }),
      ...(completed !== undefined && { completed }),
      ...(currentProfileId && { profileId: currentProfileId })
    };

    return this.http.post<HistoryRecord>(this.apiUrl, body).pipe(
      catchError(err => {
        const message = err.error?.message || err.message || 'Failed to create history record';
        return throwError(() => new Error(message));
      })
    );
  }

  loadCreateHistoryRecord(episodeId: string, progressSec?: number, completed?: boolean, profileId?: string): void {
    this._currentRecord.set({ state: 'loading', data: undefined });

    this.createHistoryRecord(episodeId, progressSec, completed, profileId).subscribe({
      next: (record) => this._currentRecord.set({ state: 'success', data: record }),
      error: (err) => this._currentRecord.set({ state: 'error', error: err.message })
    });
  }

  updateProgress(historyId: string, progressSec: number, completed?: boolean, profileId?: string): Observable<HistoryRecord> {
    const currentProfileId = profileId || activeProfile()?.id;
    const body: UpdateProgressRequest = {
      progressSec,
      ...(completed !== undefined && { completed }),
      ...(currentProfileId && { profileId: currentProfileId })
    };

    return this.http.put<HistoryRecord>(`${this.apiUrl}/${historyId}/progress`, body).pipe(
      catchError(err => {
        const message = err.error?.message || err.message || 'Failed to update progress';
        return throwError(() => new Error(message));
      })
    );
  }

  loadUpdateProgress(historyId: string, progressSec: number, completed?: boolean, profileId?: string): void {
    this._currentRecord.set({ state: 'loading', data: undefined });

    this.updateProgress(historyId, progressSec, completed, profileId).subscribe({
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

  constructor() {
    // Setup debounced progress saving (500ms)
    this.progressSubject.pipe(
      debounceTime(500)
    ).subscribe(({ id, progressSec }) => {
      this.updateProgress(id, progressSec).subscribe({
        next: (record) => this._currentRecord.set({ state: 'success', data: record }),
        error: (err) => console.error('Failed to save progress:', err.message)
      });
    });
  }

  // ============================================
  // New Methods for Phase 1
  // ============================================

  /**
   * Get a single history record by ID
   * GET /history/{id}
   */
  getById(id: string): Observable<HistoryRecord> {
    return this.http.get<HistoryRecord>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        const message = err.error?.message || err.message || 'Failed to get history record';
        return throwError(() => new Error(message));
      })
    );
  }

  /**
   * Load a single history record by ID into signal state
   */
  loadGetById(id: string): void {
    this._currentRecord.set({ state: 'loading', data: undefined });

    this.getById(id).subscribe({
      next: (record) => this._currentRecord.set({ state: 'success', data: record }),
      error: (err) => this._currentRecord.set({ state: 'error', error: err.message })
    });
  }

  /**
   * Save progress with 500ms debounce
   * Uses Subject + debounceTime to avoid excessive API calls
   */
  saveProgress(id: string, progressSec: number): void {
    this.progressSubject.next({ id, progressSec });
  }

  /**
   * Mark a history record as completed
   */
  markAsCompleted(id: string, profileId?: string): Observable<HistoryRecord> {
    return this.updateProgress(id, 0, true, profileId);
  }

  /**
   * Load mark as completed into signal state
   */
  loadMarkAsCompleted(id: string, profileId?: string): void {
    this._currentRecord.set({ state: 'loading', data: undefined });

    this.markAsCompleted(id, profileId).subscribe({
      next: (record) => this._currentRecord.set({ state: 'success', data: record }),
      error: (err) => this._currentRecord.set({ state: 'error', error: err.message })
    });
  }

  /**
   * Start watching an episode - creates record if not exists, returns existing if found
   */
  startWatching(episodeId: string, profileId?: string): Observable<HistoryRecord> {
    const currentProfileId = profileId || activeProfile()?.id;
    
    // First try to get existing record for this episode
    return new Observable(subscriber => {
      // Get history and find existing record for this episode
      this.getHistory(currentProfileId).subscribe({
        next: (records) => {
          const existing = records.find(r => r.episodeId === episodeId);
          if (existing) {
            subscriber.next(existing);
            subscriber.complete();
          } else {
            // Create new record
            this.createHistoryRecord(episodeId, 0, false, currentProfileId).subscribe({
              next: (record) => {
                subscriber.next(record);
                subscriber.complete();
              },
              error: (err) => subscriber.error(err)
            });
          }
        },
        error: (err) => subscriber.error(err)
      });
    });
  }

  /**
   * Load start watching into signal state
   */
  loadStartWatching(episodeId: string, profileId?: string): void {
    this._currentRecord.set({ state: 'loading', data: undefined });

    this.startWatching(episodeId, profileId).subscribe({
      next: (record) => this._currentRecord.set({ state: 'success', data: record }),
      error: (err) => this._currentRecord.set({ state: 'error', error: err.message })
    });
  }
}