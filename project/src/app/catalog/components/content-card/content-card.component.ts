import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Content } from '../../models/content.model';
import { getThumbnailUrl } from '../../../shared/utils/minio-url';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative group cursor-pointer rounded-md overflow-hidden
             bg-sv-card transition-transform duration-300
             hover:scale-105 hover:z-10 hover:shadow-2xl"
      (click)="onSelect.emit(content())"
    >
      <!-- Miniatura -->
      <img
        [src]="thumbnailUrl()"
        [alt]="content().title"
        class="w-full aspect-video object-cover"
        loading="lazy"
      />

      <!-- Overlay en hover -->
      <div
        class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                  transition-opacity duration-300 flex flex-col justify-end p-3"
      >
        <h3 class="text-sv-text text-sm font-semibold truncate">
          {{ content().title }}
        </h3>
        <p class="text-sv-muted text-xs mt-1">
          {{ content().releaseYear }} · {{ content().rating }}
        </p>
        <div class="flex gap-2 mt-2">
          <button
            class="flex-1 bg-sv-text text-sv-black text-xs font-bold
                   py-1 rounded hover:bg-sv-muted transition-colors"
            (click)="$event.stopPropagation(); onPlay.emit(content())"
          >
            ▶ Play
          </button>
          <button
            class="flex-1 border border-sv-muted text-sv-text text-xs
                   py-1 rounded hover:border-sv-text transition-colors"
            (click)="$event.stopPropagation(); onSelect.emit(content())"
          >
            + Info
          </button>
        </div>
      </div>
    </div>
  `
})
export class ContentCardComponent {
  // Signal input (Angular 17.1+)
  content = input.required<Content>();

  // Signal outputs (Angular 17.1+)
  onSelect = output<Content>();
  onPlay = output<Content>();

  // Computed para thumbnail
  thumbnailUrl = () => getThumbnailUrl(this.content().thumbnailKey);
}