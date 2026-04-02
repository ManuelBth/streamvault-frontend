import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Content, CatalogResponse, ContentDetailResponse } from '../models/content.model';
import { Season } from '../models/season.model';
import { Episode } from '../models/episode.model';
import { Genre } from '../models/genre.model';

// ============================================
// LOADING STATE - Simple type with optional properties
// ============================================
export type LoadingState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/catalog`;

  // State signals with proper typing
  private _catalog = signal<LoadingState<CatalogResponse>>({ state: 'idle', data: undefined });
  private _contentDetail = signal<LoadingState<ContentDetailResponse>>({ state: 'idle', data: undefined });
  private _searchResults = signal<LoadingState<CatalogResponse>>({ state: 'idle', data: undefined });
  private _seasons = signal<LoadingState<Season[]>>({ state: 'idle', data: undefined });
  private _episodes = signal<LoadingState<Episode[]>>({ state: 'idle', data: undefined });
  private _genres = signal<LoadingState<Genre[]>>({ state: 'idle', data: undefined });

  readonly catalog = this._catalog.asReadonly();
  readonly contentDetail = this._contentDetail.asReadonly();
  readonly searchResults = this._searchResults.asReadonly();
  readonly seasons = this._seasons.asReadonly();
  readonly episodes = this._episodes.asReadonly();
  readonly genres = this._genres.asReadonly();

  // Simple type guard for error state
  private isErrorState<T>(state: LoadingState<T>): boolean {
    return state.state === 'error';
  }

  readonly isCatalogLoading = computed(() => this._catalog().state === 'loading');
  readonly hasCatalogError = computed(() => this.isErrorState(this._catalog()));
  readonly catalogErrorMessage = computed(() => 
    this._catalog().state === 'error' ? this._catalog().error ?? null : null
  );

  readonly isContentDetailLoading = computed(() => this._contentDetail().state === 'loading');
  readonly hasContentDetailError = computed(() => this.isErrorState(this._contentDetail()));
  readonly contentDetailErrorMessage = computed(() => 
    this._contentDetail().state === 'error' ? this._contentDetail().error ?? null : null
  );

  readonly isSearchLoading = computed(() => this._searchResults().state === 'loading');
  readonly hasSearchError = computed(() => this.isErrorState(this._searchResults()));
  readonly searchErrorMessage = computed(() => 
    this._searchResults().state === 'error' ? this._searchResults().error ?? null : null
  );

  readonly isSeasonsLoading = computed(() => this._seasons().state === 'loading');
  readonly hasSeasonsError = computed(() => this.isErrorState(this._seasons()));
  readonly seasonsErrorMessage = computed(() => 
    this._seasons().state === 'error' ? this._seasons().error ?? null : null
  );

  readonly isEpisodesLoading = computed(() => this._episodes().state === 'loading');
  readonly hasEpisodesError = computed(() => this.isErrorState(this._episodes()));
  readonly episodesErrorMessage = computed(() => 
    this._episodes().state === 'error' ? this._episodes().error ?? null : null
  );

  readonly isGenresLoading = computed(() => this._genres().state === 'loading');
  readonly hasGenresError = computed(() => this.isErrorState(this._genres()));
  readonly genresErrorMessage = computed(() => 
    this._genres().state === 'error' ? this._genres().error ?? null : null
  );

  loadCatalog(page: number = 0, size: number = 20): void {
    this._catalog.set({ state: 'loading', data: undefined });

    this.getCatalog(page, size).subscribe({
      next: (response) => this._catalog.set({ state: 'success', data: response }),
      error: (err) => this._catalog.set({ state: 'error', error: err.message })
    });
  }

  loadContentById(id: string): void {
    this._contentDetail.set({ state: 'loading', data: undefined });

    this.getContentById(id).subscribe({
      next: (response) => this._contentDetail.set({ state: 'success', data: response }),
      error: (err) => this._contentDetail.set({ state: 'error', error: err.message })
    });
  }

  search(query: string, page: number = 0, size: number = 20): void {
    this._searchResults.set({ state: 'loading', data: undefined });

    this.searchEndpoint(query, page, size).subscribe({
      next: (response) => this._searchResults.set({ state: 'success', data: response }),
      error: (err) => this._searchResults.set({ state: 'error', error: err.message })
    });
  }

  loadSeasons(contentId: string): void {
    this._seasons.set({ state: 'loading', data: undefined });

    this.getSeasons(contentId).subscribe({
      next: (seasons) => this._seasons.set({ state: 'success', data: seasons }),
      error: (err) => this._seasons.set({ state: 'error', error: err.message })
    });
  }

  loadEpisodes(seasonId: string): void {
    this._episodes.set({ state: 'loading', data: undefined });

    this.getEpisodes(seasonId).subscribe({
      next: (episodes) => this._episodes.set({ state: 'success', data: episodes }),
      error: (err) => this._episodes.set({ state: 'error', error: err.message })
    });
  }

  loadGenres(): void {
    this._genres.set({ state: 'loading', data: undefined });

    this.getGenres().subscribe({
      next: (genres) => this._genres.set({ state: 'success', data: genres }),
      error: (err) => this._genres.set({ state: 'error', error: err.message })
    });
  }

  getCatalog(page: number = 0, size: number = 20): Observable<CatalogResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<CatalogResponse>(this.apiUrl, { params });
  }

  getContentById(id: string): Observable<ContentDetailResponse> {
    return this.http.get<ContentDetailResponse>(`${this.apiUrl}/${id}`);
  }

  searchEndpoint(query: string, page: number = 0, size: number = 20): Observable<CatalogResponse> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<CatalogResponse>(`${this.apiUrl}/search`, { params });
  }

  getSeasons(contentId: string): Observable<Season[]> {
    return this.http.get<Season[]>(`${this.apiUrl}/${contentId}/seasons`);
  }

  getEpisodes(seasonId: string): Observable<Episode[]> {
    return this.http.get<Episode[]>(`${this.apiUrl}/seasons/${seasonId}/episodes`);
  }

  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.apiUrl}/genres`);
  }
}
