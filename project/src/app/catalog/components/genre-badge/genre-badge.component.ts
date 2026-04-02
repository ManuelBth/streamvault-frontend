import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

const COLOR_MAP: Record<string, string> = {
  red: '#E50914',
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#EAB308',
  purple: '#A855F7',
};

@Component({
  selector: 'app-genre-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
             bg-sv-dark border border-sv-border text-xs text-sv-muted
             transition-colors duration-200 hover:border-sv-text hover:text-sv-text"
    >
      <span
        class="w-2 h-2 rounded-full"
        [style.background-color]="dotColor()"
      ></span>
      {{ genre() }}
    </span>
  `
})
export class GenreBadgeComponent {
  genre = input.required<string>();
  color = input<string>('red');

  dotColor = () => COLOR_MAP[this.color()] || COLOR_MAP['red'];
}