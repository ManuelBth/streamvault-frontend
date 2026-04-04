import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit {
  private router = inject(Router);
  
  searchTerm = '';
  results = signal<any[]>([]);
  searched = signal<boolean>(false);

  ngOnInit(): void {
    const url = this.router.url;
    const queryMatch = url.match(/q=([^&]+)/);
    if (queryMatch) {
      this.searchTerm = decodeURIComponent(queryMatch[1]);
      this.performSearch();
    }
  }

  performSearch(): void {
    if (!this.searchTerm.trim()) return;
    
    this.router.navigate(['/catalog'], { queryParams: { q: this.searchTerm } });
  }

  navigateToDetail(item: any): void {
    const route = item.type === 'MOVIE' ? 'movie' : 'series';
    this.router.navigate(['/catalog', route, item.id]);
  }
}