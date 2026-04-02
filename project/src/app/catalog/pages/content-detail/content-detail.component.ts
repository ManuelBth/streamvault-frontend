import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CatalogService } from '../../services/catalog.service';
import { Content, ContentDetailResponse } from '../../models/content.model';
import { ContentType } from '../../models/catalog.enums';
import { Season } from '../../models/season.model';
import { Episode } from '../../models/episode.model';
import { getThumbnailUrl } from '../../../shared/utils/minio-url';

@Component({
  selector: 'app-content-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-sv-black">
      @if (isLoading()) {
        <div class="flex items-center justify-center h-screen">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sv-red"></div>
        </div>
      }

      @if (hasError()) {
        <div class="flex flex-col items-center justify-center h-screen text-center">
          <h2 class="text-sv-text text-2xl font-bold mb-2">Error</h2>
          <p class="text-sv-muted">{{ errorMessage() }}</p>
          <button 
            (click)="loadContent()"
            class="bg-sv-red hover:bg-sv-red-hover text-white px-4 py-2 rounded mt-4"
          >
            Reintentar
          </button>
        </div>
      }

      @if (!isLoading() && !hasError() && content()) {
        <!-- Banner con backdrop -->
        <div 
          class="relative h-[50vh] md:h-[60vh]"
          [style.backgroundImage]="'url(' + backdropUrl() + ')'"
          [style.backgroundSize]="'cover'"
          [style.backgroundPosition]="'center'"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-sv-black via-sv-black/60 to-transparent"></div>
        </div>

        <!-- Contenido del detalle -->
        <div class="relative px-4 md:px-8 -mt-32 md:-mt-48 pb-8">
          <div class="flex flex-col md:flex-row gap-8">
            <!-- Poster -->
            <div class="flex-shrink-0">
              <img
                [src]="thumbnailUrl()"
                [alt]="content()!.title"
                class="w-48 md:w-64 rounded-lg shadow-2xl"
              />
            </div>

            <!-- Info -->
            <div class="flex-1">
              <!-- Título -->
              <h1 class="text-3xl md:text-5xl font-bold text-sv-text">
                {{ content()!.title }}
              </h1>

              <!-- Metadatos -->
              <div class="flex items-center gap-3 text-sv-muted mt-2">
                <span>{{ content()!.releaseYear }}</span>
                <span class="text-sv-border">|</span>
                <span>{{ content()!.rating }}</span>
                <span class="text-sv-border">|</span>
                <span>{{ contentTypeLabel() }}</span>
              </div>

              <!-- Géneros -->
              @if (content()?.genres?.length) {
                <div class="flex flex-wrap gap-2 mt-4">
                  @for (genre of content()!.genres; track genre.id) {
                    <span class="bg-sv-card text-sv-text px-3 py-1 rounded-full text-sm">
                      {{ genre.name }}
                    </span>
                  }
                </div>
              }

              <!-- Descripción -->
              <p class="text-sv-text mt-6 leading-relaxed">
                {{ content()!.description }}
              </p>

              <!-- Botones -->
              <div class="flex gap-4 mt-6">
                @if (isMovie()) {
                  <button
                    (click)="play()"
                    class="bg-sv-red hover:bg-sv-red-hover text-white px-8 py-3 
                           rounded font-semibold flex items-center gap-2 transition-colors"
                  >
                    <span>▶</span>
                    Reproducir
                  </button>
                } @else {
                  <button
                    (click)="playFirstEpisode()"
                    class="bg-sv-red hover:bg-sv-red-hover text-white px-8 py-3 
                           rounded font-semibold flex items-center gap-2 transition-colors"
                  >
                    <span>▶</span>
                    Reproducir
                  </button>
                }
                <button
                  class="bg-sv-card hover:bg-sv-border text-sv-text px-8 py-3 
                         rounded font-semibold transition-colors"
                >
                  + Mi lista
                </button>
              </div>
            </div>
          </div>

          <!-- Temporadas y Episodios (solo para SERIES) -->
          @if (isSeries()) {
            @if (seasonsLoading()) {
              <div class="mt-12 flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sv-red"></div>
              </div>
            }

            @if (!seasonsLoading() && seasons().length > 0) {
              <div class="mt-12">
                <h2 class="text-sv-text text-2xl font-bold mb-6">Temporadas</h2>
                
                <!-- Tabs de temporadas -->
                <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
                  @for (season of seasons(); track season.id; let i = $index) {
                    <button
                      (click)="selectSeason(i)"
                      [class]="selectedSeasonIndex() === i 
                        ? 'bg-sv-red text-white' 
                        : 'bg-sv-card text-sv-text hover:bg-sv-border'"
                      class="px-4 py-2 rounded font-semibold transition-colors whitespace-nowrap"
                    >
                      Temporada {{ season.seasonNumber }}
                    </button>
                  }
                </div>

                <!-- Episodios de la temporada seleccionada -->
                @if (episodesLoading()) {
                  <div class="flex items-center justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sv-red"></div>
                  </div>
                }

                @if (!episodesLoading() && selectedSeasonEpisodes().length > 0) {
                  <div class="space-y-2">
                    @for (episode of selectedSeasonEpisodes(); track episode.id; let i = $index) {
                      <div 
                        class="flex items-start gap-4 p-4 bg-sv-card rounded-lg hover:bg-sv-border 
                               cursor-pointer transition-colors"
                        (click)="playEpisode(episode)"
                      >
                        <!-- Número de episodio -->
                        <span class="text-sv-muted text-lg font-bold w-8">
                          {{ episode.episodeNumber }}
                        </span>

                        <!-- Thumbnail -->
                        <img
                          [src]="getEpisodeThumbnail(episode)"
                          [alt]="episode.title"
                          class="w-32 h-20 object-cover rounded"
                          loading="lazy"
                        />

                        <!-- Info del episodio -->
                        <div class="flex-1">
                          <h3 class="text-sv-text font-semibold">{{ episode.title }}</h3>
                          <p class="text-sv-muted text-sm mt-1 line-clamp-2">
                            {{ episode.description }}
                          </p>
                          <span class="text-sv-muted text-xs mt-2 block">
                            {{ formatDuration(episode.durationSec) }}
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                }

                @if (!episodesLoading() && selectedSeasonEpisodes().length === 0) {
                  <p class="text-sv-muted">No hay episodios disponibles para esta temporada.</p>
                }
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ContentDetailComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  content = signal<Content | null>(null);
  seasons = signal<Season[]>([]);
  episodes = signal<Episode[]>([]);
  selectedSeasonIndex = signal<number>(0);

  isLoading = computed(() => this.catalogService.isContentDetailLoading());
  hasError = computed(() => this.catalogService.hasContentDetailError());
  errorMessage = computed(() => this.catalogService.contentDetailErrorMessage());

  seasonsLoading = computed(() => this.catalogService.isSeasonsLoading());
  episodesLoading = computed(() => this.catalogService.isEpisodesLoading());

  isMovie = computed(() => this.content()?.type === ContentType.MOVIE);
  isSeries = computed(() => this.content()?.type === ContentType.SERIES);
  contentTypeLabel = computed(() => {
    const type = this.content()?.type;
    return type === ContentType.MOVIE ? 'Película' : type === ContentType.SERIES ? 'Serie' : 'Contenido';
  });

  selectedSeasonEpisodes = computed(() => {
    const episodes = this.episodes();
    const seasonIndex = this.selectedSeasonIndex();
    const seasonList = this.seasons();

    if (seasonList.length === 0 || episodes.length === 0) {
      return [];
    }

    const selectedSeason = seasonList[seasonIndex];
    return episodes.filter(e => e.seasonId === selectedSeason.id);
  });

  thumbnailUrl = () => getThumbnailUrl(this.content()?.thumbnailKey);
  backdropUrl = () => getThumbnailUrl(this.content()?.thumbnailKey);

  constructor() {
    // Use effect to reactively update content when state changes
    effect(() => {
      const state = this.catalogService.contentDetail();
      // Check for success state with data
      if (state.state === 'success' && state.data) {
        this.content.set(state.data);
        if (state.data.type === ContentType.SERIES) {
          this.loadSeasons(state.data.id);
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.catalogService.loadContentById(id);
  }

  loadSeasons(contentId: string): void {
    this.catalogService.loadSeasons(contentId);

    // Use effect to reactively update seasons when state changes
    effect(() => {
      const state = this.catalogService.seasons();
      if (state.state === 'success' && state.data && state.data.length > 0) {
        this.seasons.set(state.data);
        this.loadEpisodes(state.data[0].id);
      }
    });
  }

  loadEpisodes(seasonId: string): void {
    this.catalogService.loadEpisodes(seasonId);

    effect(() => {
      const state = this.catalogService.episodes();
      if (state.state === 'success' && state.data) {
        this.episodes.set(state.data);
      }
    });
  }

  selectSeason(index: number): void {
    this.selectedSeasonIndex.set(index);
    const season = this.seasons()[index];
    if (season) {
      this.episodes.set([]);
      this.loadEpisodes(season.id);
    }
  }

  play(): void {
    const content = this.content();
    if (content) {
      this.router.navigate(['/player', content.id]);
    }
  }

  playFirstEpisode(): void {
    const episodes = this.selectedSeasonEpisodes();
    if (episodes.length > 0) {
      this.playEpisode(episodes[0]);
    }
  }

  playEpisode(episode: Episode): void {
    const content = this.content();
    if (content && episode) {
      this.router.navigate(['/player', content.id, 'episode', episode.id]);
    }
  }

  getEpisodeThumbnail(episode: Episode): string {
    return getThumbnailUrl(episode.thumbnailKey) || '/assets/images/placeholder-poster.jpg';
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  }
}