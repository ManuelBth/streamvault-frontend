import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Content } from '../../models/content.model';
import { ContentCardComponent } from '../content-card/content-card.component';

@Component({
  selector: 'app-content-grid',
  standalone: true,
  imports: [CommonModule, ContentCardComponent],
  templateUrl: './content-grid.component.html'
})
export class ContentGridComponent {
  contents = input.required<Content[]>();
  
  onSelect = output<Content>();
  onPlay = output<Content>();
}