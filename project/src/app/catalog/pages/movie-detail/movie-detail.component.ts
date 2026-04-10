import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CatalogService } from '../../services/catalog.service';
import { Content } from '../../models/content.model';
import { getThumbnailUrl } from '../../../shared/utils/minio-url';
import { ConfigService } from '../../../shared/services/config.service';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-detail.component.html'
})
export class MovieDetailComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private configService = inject(ConfigService);

  content = signal<Content | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  thumbnailUrl = () => getThumbnailUrl(this.content()?.thumbnailKey, this.configService.minioUrl);
  backdropUrl = () => getThumbnailUrl(this.content()?.thumbnailKey, this.configService.minioUrl);

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
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el contenido');
        this.loading.set(false);
      }
    });
  }

  play(): void {
    const content = this.content();
    if (content) {
      this.router.navigate(['/player', content.id]);
    }
  }
}