import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  isOpen = input.required<boolean>();
  title = input<string>('');
  size = input<ModalSize>('md');

  onClose = output<void>();
  onConfirm = output<void>();

  isVisible = signal(false);

  constructor() {
    // Watch for isOpen changes to trigger animations
  }

  ngOnChanges(): void {
    if (this.isOpen()) {
      setTimeout(() => this.isVisible.set(true), 10);
    } else {
      this.isVisible.set(false);
    }
  }

  onBackdropClick(): void {
    this.onClose.emit();
  }

  onContentClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  close(): void {
    this.onClose.emit();
  }

  confirm(): void {
    this.onConfirm.emit();
  }
}
