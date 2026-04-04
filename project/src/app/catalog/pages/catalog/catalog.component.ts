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
  templateUrl: './catalog.component.html'
})
export class CatalogComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  contents = signal<Content[]>([]);
  genres = signal<Genre[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  searchQuery = signal<string>('');
  searchResults = signal<Content[]>([]);

  featuredContent = computed(() => {
    const contents = this.contents();
    if (contents.length === 0) return null;
    return contents[0];
  });

  allContents = computed(() => this.contents());

  catalogGroups = computed(() => {
    const contents = this.contents();
    const genreList = this.genres();

    if (contents.length === 0 || genreList.length === 0) {
      return [];
    }

    const groups: CatalogGroup[] = [];

    for (const genre of genreList) {
      const genreContents = contents.filter(c => 
        c.genres?.some(g => g.id === genre.id)
      );

      if (genreContents.length > 0) {
        groups.push({
          genre: genre.name,
          contents: genreContents.slice(0, 10)
        });
      }
    }

    return groups;
  });

  ngOnInit(): void {
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