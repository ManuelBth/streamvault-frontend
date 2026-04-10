import { Component, output, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Content } from '../../models/content.model';
import { getThumbnailUrl, getBackdropUrl } from '../../../shared/utils/minio-url';
import { ContentTooltipComponent } from '../../../shared/components/content-tooltip/content-tooltip.component';
import { ConfigService } from '../../../shared/services/config.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ContentTooltipComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  private configService = inject(ConfigService);
  
  content = input.required<Content>();
  showTooltip = signal(false);

  onPlay = output<Content>();
  onSelect = output<Content>();

  backdropUrl = () => {
    return getBackdropUrl(this.content()?.thumbnailKey, this.configService.minioUrl);
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
