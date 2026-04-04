import { Component, Output, EventEmitter, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-top-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
      <button
        (click)="backClick.emit()"
        class="flex items-center gap-1 md:gap-2 text-sv-text hover:text-sv-primary transition-colors"
      >
        <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="text-sm md:text-lg">Volver</span>
      </button>
      
      <div class="flex-1 text-center">
        <span class="text-sv-text text-sm md:text-lg font-medium">{{ contentId() }}</span>
      </div>
      
      <div class="text-sv-text text-xs md:text-sm w-16 md:w-24">
        @if (episodeId()) {
          <span>Episodio: {{ episodeId() }}</span>
        }
      </div>
    </div>
  `
})
export class PlayerTopBarComponent {
  contentId = input.required<string>();
  episodeId = input.required<string>();
  @Output() backClick = new EventEmitter<void>();
}