import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-sv-black p-4 md:p-8">
      <!-- Input de búsqueda -->
      <div class="max-w-2xl mx-auto">
        <div class="relative">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (keyup.enter)="performSearch()"
            placeholder="Buscar películas, series..."
            class="w-full bg-sv-card text-sv-text px-6 py-4 rounded-lg 
                   placeholder-sv-muted text-lg focus:outline-none 
                   focus:ring-2 focus:ring-sv-red"
          />
          <button
            (click)="performSearch()"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-sv-muted 
                   hover:text-sv-text transition-colors"
          >
            🔍
          </button>
        </div>

        <!-- Resultados -->
        @if (results().length > 0) {
          <div class="mt-8">
            <h2 class="text-sv-text text-xl font-semibold mb-4">
              Resultados para "{{ searchTerm }}"
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              @for (item of results(); track item.id) {
                <div 
                  class="bg-sv-card rounded-lg overflow-hidden cursor-pointer 
                         hover:scale-105 transition-transform"
                  (click)="navigateToDetail(item)"
                >
                  <img
                    [src]="item.thumbnailKey"
                    [alt]="item.title"
                    class="w-full aspect-video object-cover"
                    loading="lazy"
                  />
                  <div class="p-3">
                    <h3 class="text-sv-text text-sm font-semibold truncate">
                      {{ item.title }}
                    </h3>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        @if (searched() && results().length === 0) {
          <div class="text-center mt-8">
            <p class="text-sv-muted">No se encontraron resultados para "{{ searchTerm }}"</p>
          </div>
        }
      </div>
    </div>
  `
})
export class SearchComponent implements OnInit {
  private router = inject(Router);
  
  searchTerm = '';
  results = signal<any[]>([]);
  searched = signal<boolean>(false);

  ngOnInit(): void {
    // Leer query param de la URL
    const url = this.router.url;
    const queryMatch = url.match(/q=([^&]+)/);
    if (queryMatch) {
      this.searchTerm = decodeURIComponent(queryMatch[1]);
      this.performSearch();
    }
  }

  performSearch(): void {
    if (!this.searchTerm.trim()) return;
    
    // Navegar a la página de catálogo con query param
    this.router.navigate(['/catalog'], { queryParams: { q: this.searchTerm } });
  }

  navigateToDetail(item: any): void {
    const route = item.type === 'MOVIE' ? 'movie' : 'series';
    this.router.navigate(['/catalog', route, item.id]);
  }
}