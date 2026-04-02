import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { CatalogService } from '../../services/catalog.service';
import { Content, CatalogResponse } from '../../models/content.model';
import { Genre } from '../../models/genre.model';

import { HeroComponent } from '../../components/hero/hero.component';
import { CarouselComponent } from '../../components/carousel/carousel.component';
import { ContentGridComponent } from '../../components/content-grid/content-grid.component';

interface CatalogGroup {
  genre: string;
  contents: Content[];
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, HeroComponent, CarouselComponent, ContentGridComponent],
  template: `
    <div class="min-h-screen bg-sv-black">
      <!-- Loading state -->
      @if (loading()) {
        <div class="flex items-center justify-center h-screen">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sv-red"></div>
        </div>
      }

      <!-- Error state -->
      @if (error()) {
        <div class="flex flex-col items-center justify-center h-screen text-center px-4">
          <h2 class="text-sv-text text-2xl font-bold mb-2">Error al cargar el catálogo</h2>
          <p class="text-sv-muted mb-4">{{ error() }}</p>
          <button 
            (click)="loadCatalog()"
            class="bg-sv-red hover:bg-sv-red-hover text-white px-4 py-2 rounded"
          >
            Reintentar
          </button>
        </div>
      }

      <!-- Contenido principal -->
      @if (!loading() && !error()) {
        <!-- Hero con contenido destacado -->
        @if (featuredContent(); as featured) {
          <app-hero
            [content]="featured"
            (onPlay)="navigateToPlayer($event)"
            (onSelect)="navigateToDetail($event)"
          />
        }

        <!-- Búsqueda (si hay query params) -->
        @if (searchQuery()) {
          <div class="px-4 md:px-8 py-6">
            <h2 class="text-sv-text text-xl font-semibold mb-4">
              Resultados para "{{ searchQuery() }}"
            </h2>
            @if (searchResults().length > 0) {
              <app-content-grid
                [contents]="searchResults()"
                (onSelect)="navigateToDetail($event)"
                (onPlay)="navigateToPlayer($event)"
              />
            } @else {
              <p class="text-sv-muted">No se encontraron resultados.</p>
            }
          </div>
        }

        <!-- Carruseles por género -->
        @if (!searchQuery()) {
          <div class="space-y-8 pb-8">
            @for (group of catalogGroups(); track group.genre) {
              <app-carousel
                [title]="group.genre"
                [items]="group.contents"
                (onSelect)="navigateToDetail($event)"
                (onPlay)="navigateToPlayer($event)"
              />
            }

            <!-- Si no hay grupos, mostrar todo en grid -->
            @if (catalogGroups().length === 0 && allContents().length > 0) {
              <div class="px-4 md:px-8">
                <h2 class="text-sv-text text-xl font-semibold mb-4">Todo el catálogo</h2>
                <app-content-grid
                  [contents]="allContents()"
                  (onSelect)="navigateToDetail($event)"
                  (onPlay)="navigateToPlayer($event)"
                />
              </div>
            }
          </div>
        }
      }
    </div>
  `
})
export class CatalogComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // State signals
  contents = signal<Content[]>([]);
  genres = signal<Genre[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  searchQuery = signal<string>('');
  searchResults = signal<Content[]>([]);

  // Computed
  featuredContent = computed(() => {
    const contents = this.contents();
    if (contents.length === 0) return null;
    // Usar el primero como destacado
    return contents[0];
  });

  allContents = computed(() => this.contents());

  catalogGroups = computed(() => {
    const contents = this.contents();
    const genreList = this.genres();

    if (contents.length === 0 || genreList.length === 0) {
      return [];
    }

    // Agrupar contenidos por género
    const groups: CatalogGroup[] = [];

    for (const genre of genreList) {
      const genreContents = contents.filter(c => 
        c.genres?.some(g => g.id === genre.id)
      );

      if (genreContents.length > 0) {
        groups.push({
          genre: genre.name,
          contents: genreContents.slice(0, 10) // Máximo 10 items por carrusel
        });
      }
    }

    return groups;
  });

  ngOnInit(): void {
    // Verificar si hay parámetro de búsqueda
    this.route.queryParams.subscribe(params => {
      const query = params['q'];
      if (query) {
        this.searchQuery.set(query);
        this.performSearch(query);
      } else {
        this.loadCatalog();
      }
    });

    this.loadGenres();
  }

  loadCatalog(): void {
    this.loading.set(true);
    this.error.set(null);

    this.catalogService.getCatalog(0, 50).subscribe({
      next: (response: CatalogResponse) => {
        this.contents.set(response.content);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo cargar el catálogo. Intenta más tarde.');
        this.loading.set(false);
        console.error('Error loading catalog:', err);
      }
    });
  }

  loadGenres(): void {
    this.catalogService.getGenres().subscribe({
      next: (genres) => {
        this.genres.set(genres);
      },
      error: (err) => {
        console.error('Error loading genres:', err);
      }
    });
  }

  performSearch(query: string): void {
    this.loading.set(true);
    this.error.set(null);

    // Use the observable endpoint method directly
    this.catalogService.searchEndpoint(query, 0, 20).subscribe({
      next: (response: CatalogResponse) => {
        this.searchResults.set(response.content);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set('Error en la búsqueda.');
        this.loading.set(false);
      }
    });
  }

  navigateToDetail(content: Content): void {
    const route = content.type === 'MOVIE' ? 'movie' : 'series';
    this.router.navigate(['/catalog', route, content.id]);
  }

  navigateToPlayer(content: Content): void {
    this.router.navigate(['/player', content.id]);
  }
}