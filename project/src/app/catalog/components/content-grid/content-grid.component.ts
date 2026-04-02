import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Content } from '../../models/content.model';
import { ContentCardComponent } from '../content-card/content-card.component';

@Component({
  selector: 'app-content-grid',
  standalone: true,
  imports: [CommonModule, ContentCardComponent],
  template: `
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
      @for (item of contents(); track item.id) {
        <app-content-card
          [content]="item"
          (onSelect)="onSelect.emit($event)"
          (onPlay)="onPlay.emit($event)"
        />
      }
    </div>
  `
})
export class ContentGridComponent {
  // Signal input (Angular 17.1+)
  contents = input.required<Content[]>();
  
  // Signal outputs (Angular 17.1+)
  onSelect = output<Content>();
  onPlay = output<Content>();
}