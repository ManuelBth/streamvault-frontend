import { Component, output, input, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Content } from '../../models/content.model';
import { ContentCardComponent } from '../content-card/content-card.component';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, ContentCardComponent],
  template: `
    <div class="carousel-container relative">
      <!-- Título de la categoría -->
      <h2 class="text-sv-text text-xl md:text-2xl font-semibold mb-4 px-4">
        {{ title() }}
      </h2>

      <!-- Contenedor con scroll horizontal -->
      <div 
        #scrollContainer
        class="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-4"
      >
        @for (item of items(); track item.id) {
          <div class="flex-shrink-0 w-48 md:w-56">
            <app-content-card
              [content]="item"
              (onSelect)="onSelect.emit($event)"
              (onPlay)="onPlay.emit($event)"
            />
          </div>
        }
      </div>

      <!-- Botones de navegación -->
      @if (showArrows()) {
        <button
          (click)="scroll('left')"
          class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 
                 text-white p-2 rounded-r-md transition-colors hidden md:block"
        >
          ‹
        </button>
        <button
          (click)="scroll('right')"
          class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 
                 text-white p-2 rounded-l-md transition-colors hidden md:block"
        >
          ›
        </button>
      }
    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class CarouselComponent {
  // Signal inputs (Angular 17.1+)
  title = input.required<string>();
  items = input.required<Content[]>();

  // Signal outputs (Angular 17.1+)
  onSelect = output<Content>();
  onPlay = output<Content>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  showArrows = input<boolean>(false);

  scroll(direction: 'left' | 'right'): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
}