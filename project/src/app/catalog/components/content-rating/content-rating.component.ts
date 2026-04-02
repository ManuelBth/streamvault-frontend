import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

const RATING_CONFIG: Record<string, { color: string; bgColor: string; borderColor: string }> = {
  G: { color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/40' },
  PG: { color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/40' },
  'PG-13': { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/40' },
  R: { color: 'text-red-500', bgColor: 'bg-red-600/20', borderColor: 'border-red-600/40' },
  'TV-MA': { color: 'text-red-500', bgColor: 'bg-red-600/20', borderColor: 'border-red-600/40' },
  'TV-PG': { color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/40' },
  'TV-14': { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/40' },
};

const SIZE_CONFIG: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

@Component({
  selector: 'app-content-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center font-semibold rounded border"
      [ngClass]="[sizeClasses(), colorClasses()]"
    >
      {{ rating() }}
    </span>
  `
})
export class ContentRatingComponent {
  rating = input.required<string>();
  size = input<string>('md');

  colorClasses = computed(() => {
    const config = RATING_CONFIG[this.rating()];
    if (config) {
      return `${config.color} ${config.bgColor} ${config.borderColor}`;
    }
    return 'text-sv-muted bg-sv-dark border-sv-border';
  });

  sizeClasses = computed(() => {
    return SIZE_CONFIG[this.size()] || SIZE_CONFIG['md'];
  });
}