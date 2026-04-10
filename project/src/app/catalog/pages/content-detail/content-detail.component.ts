import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CatalogService } from '../../services/catalog.service';
import { Content, ContentDetailResponse } from '../../models/content.model';
import { ContentType } from '../../models/catalog.enums';
import { Season } from '../../models/season.model';
import { Episode } from '../../models/episode.model';
import { getThumbnailUrl } from '../../../shared/utils/minio-url';
import { ConfigService } from '../../../shared/services/config.service';

@Component({
  selector: 'app-content-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-detail.component.html',
  styleUrl: './content-detail.component.css'
})
export class ContentDetailComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private configService = inject(ConfigService);

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

  thumbnailUrl = () => getThumbnailUrl(this.content()?.thumbnailKey, this.configService.minioUrl);
  backdropUrl = () => getThumbnailUrl(this.content()?.thumbnailKey, this.configService.minioUrl);

  constructor() {
    effect(() => {
      const state = this.catalogService.contentDetail();
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
    return getThumbnailUrl(episode.thumbnailKey, this.configService.minioUrl) || '/assets/images/placeholder-poster.jpg';
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