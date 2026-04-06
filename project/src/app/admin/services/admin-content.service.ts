import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ContentResponse,
  ContentListResponse,
  CreateContentRequest,
  UpdateContentRequest
} from '../models/content.model';
import { UploadResponse } from '../models/upload-response.model';
import { Genre } from '../../catalog/models/genre.model';

export type LoadingState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminContentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/catalog`;
  private uploadUrl = `${environment.apiUrl}/admin/upload/thumbnail`;

  private _contents = signal<LoadingState<ContentListResponse>>({ state: 'idle', data: undefined });
  private _currentContent = signal<LoadingState<ContentResponse>>({ state: 'idle', data: undefined });

  readonly contents = this._contents.asReadonly();
  readonly currentContent = this._currentContent.asReadonly();

  private isErrorState<T>(state: LoadingState<T>): boolean {
    return state.state === 'error';
  }

  readonly isContentsLoading = computed(() => this._contents().state === 'loading');
  readonly hasContentsError = computed(() => this.isErrorState(this._contents()));
  readonly contentsErrorMessage = computed(() => 
    this._contents().state === 'error' ? this._contents().error ?? null : null
  );
  readonly contentsList = computed(() => this._contents().data?.content ?? []);
  readonly contentsTotal = computed(() => this._contents().data?.totalElements ?? 0);
  readonly contentsPage = computed(() => this._contents().data?.page ?? 0);
  readonly contentsSize = computed(() => this._contents().data?.size ?? 20);
  readonly contentsTotalPages = computed(() => this._contents().data?.totalPages ?? 0);

  readonly isCurrentContentLoading = computed(() => this._currentContent().state === 'loading');
  readonly hasCurrentContentError = computed(() => this.isErrorState(this._currentContent()));
  readonly currentContentErrorMessage = computed(() => 
    this._currentContent().state === 'error' ? this._currentContent().error ?? null : null
  );

  getAllContents(page: number = 0, size: number = 20): Observable<ContentListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ContentListResponse>(this.apiUrl, { params });
  }

  getContentById(id: string): Observable<ContentResponse> {
    return this.http.get<ContentResponse>(`${this.apiUrl}/${id}`);
  }

  createContent(data: CreateContentRequest): Observable<ContentResponse> {
    return this.http.post<ContentResponse>(this.apiUrl, data);
  }

  updateContent(id: string, data: UpdateContentRequest): Observable<ContentResponse> {
    return this.http.put<ContentResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteContent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadThumbnail(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(this.uploadUrl, formData);
  }

  loadAllContents(page: number = 0, size: number = 20): void {
    this._contents.set({ state: 'loading', data: undefined });

    this.getAllContents(page, size).subscribe({
      next: (response) => this._contents.set({ state: 'success', data: response }),
      error: (err) => this._contents.set({ state: 'error', error: err.message })
    });
  }

  loadContentById(id: string): void {
    this._currentContent.set({ state: 'loading', data: undefined });

    this.getContentById(id).subscribe({
      next: (content) => this._currentContent.set({ state: 'success', data: content }),
      error: (err) => this._currentContent.set({ state: 'error', error: err.message })
    });
  }

  createNewContent(data: CreateContentRequest): Observable<ContentResponse> {
    return this.createContent(data);
  }

  updateExistingContent(id: string, data: UpdateContentRequest): Observable<ContentResponse> {
    return this.updateContent(id, data);
  }

  removeContent(id: string): Observable<void> {
    return this.deleteContent(id);
  }

  clearCurrentContent(): void {
    this._currentContent.set({ state: 'idle', data: undefined });
  }

  // Obtener todos los géneros disponibles
  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${environment.apiUrl}/catalog/genres`);
  }

  // Contar contenido por género a partir de los contenidos existentes
  countByGenre(contents: ContentResponse[]): Map<string, number> {
    const genreCount = new Map<string, number>();
    
    contents.forEach(content => {
      if (content.genres && content.genres.length > 0) {
        content.genres.forEach(genre => {
          const current = genreCount.get(genre.name) || 0;
          genreCount.set(genre.name, current + 1);
        });
      }
    });
    
    return genreCount;
  }
}