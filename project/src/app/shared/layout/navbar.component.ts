import { Component, inject, signal, computed, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { NotificationService } from '../services/notification.service';
import { WebSocketNotificationService } from '../../notifications/services/websocket-notification.service';
import { ProfileService } from '../../profile/services/profile.service';
import { SendMessageModalComponent } from '../../mail/components/send-message-modal/send-message-modal.component';
import { currentUser, isAuthenticated, isAdmin, activeProfile } from '../../shared/store/app.store';
import { Notification } from '../models';
import { Profile } from '../models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink, 
    RouterLinkActive, 
    CommonModule, 
    SendMessageModalComponent
  ],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private webSocketService = inject(WebSocketNotificationService);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  
  @ViewChild(SendMessageModalComponent) sendMessageModal!: SendMessageModalComponent;

  currentUser = currentUser;
  isAuthenticated = isAuthenticated;
  isAdmin = isAdmin;
  activeProfile = activeProfile;

  showNotifications = signal(false);
  showUserMenu = signal(false);
  showProfileMenu = signal(false);

  constructor() {
    const profilesState = this.profileService.profiles();
    if (profilesState.state === 'idle') {
      this.profileService.loadProfiles();
    }
    
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
  readonly profiles = computed(() => this.profileService.profiles());

  toggleNotifications(): void {
    this.showUserMenu.set(false);
    this.showNotifications.update(v => !v);
  }

  closeNotifications(): void {
    this.showNotifications.set(false);
  }

  toggleUserMenu(): void {
    this.showNotifications.set(false);
    this.showUserMenu.update(v => !v);
  }

  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  toggleProfileMenu(): void {
    this.showNotifications.set(false);
    this.showProfileMenu.update(v => !v);
  }

  closeProfileMenu(): void {
    this.showProfileMenu.set(false);
  }

  switchProfile(profile: Profile): void {
    this.profileService.selectProfile(profile);
    this.showProfileMenu.set(false);
  }

  goToManageProfiles(): void {
    this.showProfileMenu.set(false);
    this.router.navigate(['/profile/manage']);
  }

  goToProfileSelect(): void {
    this.showProfileMenu.set(false);
    this.router.navigate(['/profile/select']);
  }

  closeDropdowns(): void {
    this.showNotifications.set(false);
    this.showUserMenu.set(false);
    this.showProfileMenu.set(false);
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
    this.showUserMenu.set(false);
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
