import { Component, Output, EventEmitter, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-center-play',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <button
        (click)="playClick.emit()"
        class="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center bg-sv-primary/90 rounded-full hover:bg-sv-primary transition-transform hover:scale-110 pointer-events-auto shadow-xl drop-shadow-lg"
      >
        <svg class="w-8 h-8 md:w-10 md:h-10 text-sv-black ml-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
    </div>
  `
})
export class PlayerCenterPlayComponent {
  isPaused = input.required<boolean>();
  @Output() playClick = new EventEmitter<void>();
}