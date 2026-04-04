import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CatalogService } from '../../services/catalog.service';
import { Content } from '../../models/content.model';
import { Season } from '../../models/season.model';
import { Episode } from '../../models/episode.model';
import { getThumbnailUrl } from '../../../shared/utils/minio-url';

@Component({
  selector: 'app-series-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './series-detail.component.html',
  styleUrl: './series-detail.component.css'
})
export class SeriesDetailComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  content = signal<Content | null>(null);
  seasons = signal<Season[]>([]);
  episodes = signal<Episode[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedSeasonIndex = signal<number>(0);

  thumbnailUrl = () => getThumbnailUrl(this.content()?.thumbnailKey);
  backdropUrl = () => getThumbnailUrl(this.content()?.thumbnailKey);

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

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    this.loading.set(true);
    this.error.set(null);

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('ID de contenido no válido');
      this.loading.set(false);
      return;
    }

    this.catalogService.getContentById(id).subscribe({
      next: (data) => {
        this.content.set(data);
        this.loadSeasons(id);
      },
      error: (err) => {
        this.error.set('Error al cargar el contenido');
        this.loading.set(false);
      }
    });
  }

  loadSeasons(contentId: string): void {
    this.catalogService.getSeasons(contentId).subscribe({
      next: (seasons) => {
        this.seasons.set(seasons);
        if (seasons.length > 0) {
          this.loadEpisodes(seasons[0].id);
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading seasons:', err);
        this.loading.set(false);
      }
    });
  }

  loadEpisodes(seasonId: string): void {
    this.catalogService.getEpisodes(seasonId).subscribe({
      next: (episodes) => {
        this.episodes.set(episodes);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading episodes:', err);
        this.loading.set(false);
      }
    });
  }

  selectSeason(index: number): void {
    this.selectedSeasonIndex.set(index);
    const season = this.seasons()[index];
    if (season) {
      this.loadEpisodes(season.id);
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