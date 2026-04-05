import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="notification-badge-btn"
      (click)="click.emit()"
      [attr.title]="title()"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      @if (unreadCount() > 0) {
        <span class="badge">
          {{ unreadCount() > 9 ? '9+' : unreadCount() }}
        </span>
      }
    </button>
  `,
  styles: [`
    .notification-badge-btn {
      position: relative;
      background: none;
      border: none;
      color: #9ca3af;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .notification-badge-btn:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .icon {
      width: 24px;
      height: 24px;
    }
    
    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background-color: #e50914;
      color: white;
      font-size: 11px;
      font-weight: 600;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
  `]
})
export class NotificationBadgeComponent {
  unreadCount = input<number>(0);
  title = input<string>('Notificaciones');
  click = output<void>();
}
