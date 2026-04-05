import { Component, inject, signal, computed, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { NotificationService } from '../services/notification.service';
import { WebSocketService } from '../services/websocket.service';
import { SendMessageModalComponent } from '../../mail/components/send-message-modal/send-message-modal.component';
import { currentUser, isAuthenticated, isAdmin } from '../store/app.store';
import { Notification } from '../models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, SendMessageModalComponent],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private webSocketService = inject(WebSocketService);
  
  @ViewChild(SendMessageModalComponent) sendMessageModal!: SendMessageModalComponent;

  currentUser = currentUser;
  isAuthenticated = isAuthenticated;
  isAdmin = isAdmin;

  // Notification dropdown state
  showNotifications = signal(false);
  expanded = signal(false);

  // Load notifications on init
  constructor() {
    this.notificationService.loadAll();
    this.notificationService.loadUnreadCount();
    // WebSocket connection is now handled automatically by the service via effect
  }

  ngOnDestroy(): void {
    // WebSocket will auto-disconnect when user logs out via the effect
  }

  readonly notifications = computed(() => {
    const all = this.notificationService.notifications();
    const list = all.data ?? [];
    return this.expanded() ? list.slice(0, 5) : list.slice(0, 3);
  });

  readonly totalCount = computed(() => {
    const all = this.notificationService.notifications();
    return all.data?.length ?? 0;
  });

  readonly unreadCount = this.notificationService.unreadCount;
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
  }

  expandNotifications(): void {
    this.expanded.set(true);
  }

  collapseNotifications(): void {
    this.expanded.set(false);
  }

  markAsRead(id: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notificationService.loadAll();
        this.notificationService.loadUnreadCount();
      }
    });
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notificationService.loadAll();
        this.notificationService.loadUnreadCount();
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getNotifIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      default: return 'ℹ';
    }
  }

  logout(): void {
    this.authService.logout();
  }

  openSendMessageModal(): void {
    this.sendMessageModal.open();
  }
}
