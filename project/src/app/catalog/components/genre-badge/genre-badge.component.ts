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
  templateUrl: './genre-badge.component.html'
})
export class GenreBadgeComponent {
  genre = input.required<string>();
  color = input<string>('red');

  dotColor = () => COLOR_MAP[this.color()] || COLOR_MAP['red'];
}