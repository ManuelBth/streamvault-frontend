import { Component, inject, signal, computed, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { WebSocketNotificationService } from '../../notifications/services/websocket-notification.service';
import { SendMessageModalComponent } from '../../mail/components/send-message-modal/send-message-modal.component';
import { currentUser, isAuthenticated, isAdmin } from '../../shared/store/app.store';
import { Notification } from '../../notifications/models/notification.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink, 
    RouterLinkActive, 
    CommonModule, 
    SendMessageModalComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private webSocketService = inject(WebSocketNotificationService);
  private router = inject(Router);
  
  @ViewChild(SendMessageModalComponent) sendMessageModal!: SendMessageModalComponent;

  currentUser = currentUser;
  isAuthenticated = isAuthenticated;
  isAdmin = isAdmin;

  showNotifications = signal(false);

  constructor() {
    this.notificationService.loadAll();
    this.notificationService.loadUnreadCount();
  }

  ngOnDestroy(): void {}

  readonly notifications = computed(() => {
    const all = this.notificationService.notifications();
    return all.data ?? [];
  });

  readonly unreadCount = this.notificationService.unreadCount;
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
  }

  closeNotifications(): void {
    this.showNotifications.set(false);
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

  logout(): void {
    this.authService.logout();
  }

  openSendMessageModal(): void {
    this.sendMessageModal.open();
  }

  goToNotifications(): void {
    this.closeNotifications();
    this.router.navigate(['/notifications']);
  }

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
