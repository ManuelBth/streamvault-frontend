import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Content } from '../../../catalog/models/content.model';

@Component({
  selector: 'app-content-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-tooltip.component.html',
  styleUrl: './content-tooltip.component.css'
})
export class ContentTooltipComponent {
  content = input.required<Content>();
  onSelect = output<Content>();

  get typeIcon(): string {
    return this.content().type === 'MOVIE' ? '🎬' : '📺';
  }

  get typeLabel(): string {
    return this.content().type === 'MOVIE' ? 'Película' : 'Serie';
  }

  get firstGenre(): string {
    return this.content().genres?.[0]?.name || 'Sin género';
  }

  handleSelect(): void {
    this.onSelect.emit(this.content());
  }
}
