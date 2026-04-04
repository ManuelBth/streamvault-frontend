import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../services/user.service';
import { SubscriptionService } from '../../services/subscription.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { User } from '../../../shared/models';
import { Subscription } from '../../models/subscription.model';
import { Notification } from '../../../shared/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  private userService = inject(UserService);
  private subscriptionService = inject(SubscriptionService);
  private notificationService = inject(NotificationService);

  readonly userState = this.userService.currentUser;
  readonly userLoading = this.userService.isLoading;
  readonly userError = this.userService.errorMessage;

  readonly subState = this.subscriptionService.subscription;
  readonly subLoading = this.subscriptionService.isLoading;
  readonly subError = this.subscriptionService.errorMessage;

  readonly notifState = this.notificationService.notifications;
  readonly notifLoading = this.notificationService.isLoading;
  readonly notifError = this.notificationService.errorMessage;
  readonly unreadCount = this.notificationService.unreadCount;

  editName = signal('');
  editEmail = signal('');
  updating = signal(false);
  purchaseLoading = signal(false);
  markReadLoading = signal<string | null>(null);

  ngOnInit(): void {
    this.userService.loadMe();
    this.subscriptionService.loadMySubscription();
    this.notificationService.loadAll();
    this.notificationService.loadUnreadCount();
  }

  readonly user = computed(() => this.userState().data);
  readonly subscription = computed(() => this.subState().data);
  readonly notifications = computed(() => this.notifState().data ?? []);

  startEdit(): void {
    const u = this.user();
    if (u) {
      this.editName.set(u.name);
      this.editEmail.set(u.email);
    }
  }

  cancelEdit(): void {
    this.editName.set('');
    this.editEmail.set('');
  }

  saveProfile(): void {
    const name = this.editName().trim();
    const email = this.editEmail().trim();

    if (!name && !email) return;

    this.updating.set(true);
    this.userService.updateMe({ name: name || undefined, email: email || undefined }).subscribe({
      next: () => {
        this.updating.set(false);
        this.cancelEdit();
        this.userService.loadMe();
      },
      error: () => this.updating.set(false)
    });
  }

  purchaseSubscription(): void {
    this.purchaseLoading.set(true);
    this.subscriptionService.purchase().subscribe({
      next: () => {
        this.purchaseLoading.set(false);
        this.subscriptionService.loadMySubscription();
      },
      error: () => this.purchaseLoading.set(false)
    });
  }

  markAsRead(id: string): void {
    this.markReadLoading.set(id);
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.markReadLoading.set(null);
        this.notificationService.loadAll();
        this.notificationService.loadUnreadCount();
      },
      error: () => this.markReadLoading.set(null)
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

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPlanColor(plan: string): string {
    switch (plan) {
      case 'PREMIUM': return 'text-yellow-400';
      case 'BASIC': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  }

  getNotifIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      default: return 'ℹ';
    }
  }
}
