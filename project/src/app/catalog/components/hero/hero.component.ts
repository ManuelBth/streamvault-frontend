import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Content } from '../../models/content.model';
import { getThumbnailUrl, getBackdropUrl } from '../../../shared/utils/minio-url';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
  content = input.required<Content>();

  onPlay = output<Content>();
  onSelect = output<Content>();

  backdropUrl = () => {
    return getBackdropUrl(this.content()?.thumbnailKey);
  };
}