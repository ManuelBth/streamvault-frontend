import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { CatalogService } from '../../services/catalog.service';
import { Content, CatalogResponse } from '../../models/content.model';
import { Genre } from '../../models/genre.model';

import { HeroComponent } from '../../components/hero/hero.component';
import { CarouselComponent } from '../../components/carousel/carousel.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';

interface CatalogGroup {
  genre: string;
  contents: Content[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent, CarouselComponent, SearchBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomePageComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // State signals
  contents = signal<Content[]>([]);
  genres = signal<Genre[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Computed signals
  featuredContent = computed(() => {
    const allContent = this.contents();
    if (allContent.length === 0) return null;
    // Return a random featured content or first one
    return allContent[Math.floor(Math.random() * Math.min(5, allContent.length))];
  });

  catalogGroups = computed(() => {
    const allContent = this.contents();
    const genreList = this.genres();

    if (allContent.length === 0 || genreList.length === 0) {
      return [];
    }

    const groups: CatalogGroup[] = [];

    for (const genre of genreList) {
      const genreContents = allContent.filter(c => 
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

  hasContent = computed(() => this.contents().length > 0);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const query = params['q'];
      if (query) {
        this.performSearch(query);
      } else {
        this.loadCatalog();
      }
    });

    this.loadGenres();
  }

  loadCatalog(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.catalogService.getCatalog(0, 50).subscribe({
      next: (response: CatalogResponse) => {
        this.contents.set(response.content);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('No se pudo cargar el catálogo. Intenta más tarde.');
        this.isLoading.set(false);
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
    if (!query.trim()) {
      this.loadCatalog();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.catalogService.searchEndpoint(query, 0, 20).subscribe({
      next: (response: CatalogResponse) => {
        this.contents.set(response.content);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set('Error en la búsqueda.');
        this.isLoading.set(false);
      }
    });
  }

  onSearch(query: string): void {
    if (query.trim()) {
      this.router.navigate(['/catalog'], { queryParams: { q: query } });
    } else {
      this.router.navigate(['/catalog/home']);
    }
  }

  onContentSelect(content: Content): void {
    const route = content.type === 'MOVIE' ? 'movie' : 'series';
    this.router.navigate(['/catalog', route, content.id]);
  }

  onContentPlay(content: Content): void {
    this.router.navigate(['/player', content.id]);
  }
}