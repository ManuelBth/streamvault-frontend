import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../shared/services/notification.service';
import { NotificationListComponent } from '../../components/notification-list/notification-list.component';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  imports: [CommonModule, NotificationListComponent],
  template: `
    <div class="notification-page">
      <div class="header">
        <h1>Notificaciones</h1>
        @if (hasUnread()) {
          <button class="mark-all-btn" (click)="markAllAsRead()">
            Marcar todas como leídas
          </button>
        }
      </div>

      @if (isLoading()) {
        <div class="loading">
          <p>Cargando...</p>
        </div>
      } @else if (hasError()) {
        <div class="error">
          <p>{{ errorMessage() }}</p>
          <button (click)="retry()">Reintentar</button>
        </div>
      } @else {
        <app-notification-list
          [notifications]="notificationList()"
          (markAsRead)="onMarkAsRead($event)"
        />
      }
    </div>
  `,
  styles: [`
    .notification-page {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    h1 {
      color: white;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }

    .mark-all-btn {
      background-color: #e50914;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .mark-all-btn:hover {
      background-color: #b2070f;
    }

    .loading, .error {
      padding: 48px;
      text-align: center;
      color: #9ca3af;
    }

    .error p {
      margin-bottom: 16px;
    }

    .error button {
      background-color: #374151;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
    }

    .error button:hover {
      background-color: #4b5563;
    }
  `]
})
export class NotificationPageComponent implements OnInit {
  private notificationService = inject(NotificationService);

  readonly notifications = this.notificationService.notifications;
  readonly isLoading = this.notificationService.isLoading;
  readonly hasError = this.notificationService.hasError;
  readonly errorMessage = this.notificationService.errorMessage;
  readonly unreadCount = this.notificationService.unreadCount;

  readonly notificationList = computed(() => this.notifications().data ?? []);
  readonly hasUnread = () => this.unreadCount() > 0;

  ngOnInit(): void {
    this.notificationService.loadAll();
  }

  onMarkAsRead(id: string): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notificationService.loadAll();
        this.notificationService.loadUnreadCount();
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notificationService.loadAll();
        this.notificationService.loadUnreadCount();
      }
    });
  }

  retry(): void {
    this.notificationService.loadAll();
  }
}
