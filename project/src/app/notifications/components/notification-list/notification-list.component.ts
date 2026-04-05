import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-list">
      @for (notification of notifications(); track notification.id) {
        <div 
          class="notification-item"
          [class.unread]="!notification.isRead"
          (click)="notificationClick.emit(notification)"
        >
          <div class="notification-icon" [ngClass]="notification.type">
            @switch (notification.type) {
              @case ('success') { ✓ }
              @case ('warning') { ⚠ }
              @case ('error') { ✕ }
              @default { ℹ }
            }
          </div>
          
          <div class="notification-content">
            <p class="notification-title">{{ notification.title }}</p>
            <p class="notification-message">{{ notification.message }}</p>
            <p class="notification-date">{{ formatDate(notification.createdAt) }}</p>
          </div>
          
          @if (!notification.isRead) {
            <button 
              class="mark-read-btn"
              (click)="markAsRead.emit(notification.id); $event.stopPropagation()"
              title="Marcar como leída"
            >
              ✓
            </button>
          }
        </div>
      } @empty {
        <div class="empty-state">
          <p>No hay notificaciones</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-list {
      display: flex;
      flex-direction: column;
    }
    
    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .notification-item:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
    
    .notification-item.unread {
      background-color: rgba(229, 9, 20, 0.1);
    }
    
    .notification-icon {
      font-size: 18px;
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .notification-icon.success { color: #4ade80; }
    .notification-icon.warning { color: #facc15; }
    .notification-icon.error { color: #f87171; }
    .notification-icon.info { color: #60a5fa; }
    
    .notification-content {
      flex: 1;
      min-width: 0;
    }
    
    .notification-title {
      color: white;
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .notification-message {
      color: #9ca3af;
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .notification-date {
      color: #6b7280;
      font-size: 12px;
    }
    
    .mark-read-btn {
      background: none;
      border: 1px solid #4b5563;
      color: #9ca3af;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }
    
    .mark-read-btn:hover {
      background-color: #e50914;
      border-color: #e50914;
      color: white;
    }
    
    .empty-state {
      padding: 32px;
      text-align: center;
      color: #6b7280;
    }
  `]
})
export class NotificationListComponent {
  notifications = input.required<Notification[]>();
  notificationClick = output<Notification>();
  markAsRead = output<string>();

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' });
  }
}
