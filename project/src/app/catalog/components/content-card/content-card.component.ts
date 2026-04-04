import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Content } from '../../models/content.model';
import { getThumbnailUrl } from '../../../shared/utils/minio-url';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-card.component.html'
})
export class ContentCardComponent {
  content = input.required<Content>();

  onSelect = output<Content>();
  onPlay = output<Content>();

  thumbnailUrl = () => getThumbnailUrl(this.content().thumbnailKey);
}