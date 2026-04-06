import { Component, output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Content } from '../../models/content.model';
import { getThumbnailUrl, getBackdropUrl } from '../../../shared/utils/minio-url';
import { ContentTooltipComponent } from '../../../shared/components/content-tooltip/content-tooltip.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ContentTooltipComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  content = input.required<Content>();
  showTooltip = signal(false);

  onPlay = output<Content>();
  onSelect = output<Content>();

  backdropUrl = () => {
    return getBackdropUrl(this.content()?.thumbnailKey);
  };

  toggleTooltip(event: Event): void {
    event.stopPropagation();
    this.showTooltip.update(v => !v);
  }

  closeTooltip(): void {
    this.showTooltip.set(false);
  }

  handleSelectFromTooltip(contentItem: Content): void {
    this.showTooltip.set(false);
    this.onSelect.emit(contentItem);
  }
}
