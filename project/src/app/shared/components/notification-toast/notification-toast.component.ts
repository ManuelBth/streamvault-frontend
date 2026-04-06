import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
}

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-toast.component.html',
  styleUrl: './notification-toast.component.scss'
})
export class NotificationToastComponent {
  message = input.required<string>();
  type = input<ToastType>('info');
  duration = input<number>(3000);
  dismissible = input<boolean>(true);
  
  onDismiss = output<void>();
  
  visible = signal(true);
  
  get icon(): string {
    switch (this.type()) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  }
  
  constructor() {
    // Auto-dismiss after duration
    if (this.duration() > 0) {
      setTimeout(() => this.dismiss(), this.duration());
    }
  }
  
  dismiss(): void {
    this.visible.set(false);
    this.onDismiss.emit();
  }
}