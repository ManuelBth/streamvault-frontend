import { Component, output, input, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Content } from '../../models/content.model';
import { ContentCardComponent } from '../content-card/content-card.component';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, ContentCardComponent],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent {
  title = input.required<string>();
  items = input.required<Content[]>();

  onSelect = output<Content>();
  onPlay = output<Content>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  showArrows = input<boolean>(false);

  scroll(direction: 'left' | 'right'): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
}