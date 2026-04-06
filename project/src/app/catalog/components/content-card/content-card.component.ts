import { Component, output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Content } from '../../models/content.model';
import { getThumbnailUrl } from '../../../shared/utils/minio-url';
import { ContentTooltipComponent } from '../../../shared/components/content-tooltip/content-tooltip.component';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [CommonModule, ContentTooltipComponent],
  templateUrl: './content-card.component.html'
})
export class ContentCardComponent {
  content = input.required<Content>();
  showTooltip = signal(false);

  onSelect = output<Content>();
  onPlay = output<Content>();

  thumbnailUrl = () => getThumbnailUrl(this.content().thumbnailKey);

  toggleTooltip(event: Event): void {
    event.stopPropagation();
    this.showTooltip.update(v => !v);
  }

  closeTooltip(): void {
    this.showTooltip.set(false);
  }

  handleSelectFromTooltip(content: Content): void {
    this.showTooltip.set(false);
    this.onSelect.emit(content);
  }
}