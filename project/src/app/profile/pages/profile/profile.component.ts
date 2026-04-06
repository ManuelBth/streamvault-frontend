import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { UserService } from '../../services/user.service';
import { SubscriptionService } from '../../services/subscription.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private subscriptionService = inject(SubscriptionService);
  private notificationService = inject(NotificationService);

  readonly userState = this.userService.currentUser;
  readonly userLoading = this.userService.isLoading;
  readonly userError = this.userService.errorMessage;

  readonly subState = this.subscriptionService.subscription;
  readonly subLoading = this.subscriptionService.isLoading;

  readonly unreadCount = this.notificationService.unreadCount;

  ngOnInit(): void {
    this.userService.loadMe();
    this.subscriptionService.loadMySubscription();
    this.notificationService.loadUnreadCount();
  }

  readonly user = computed(() => this.userState().data);
  readonly subscription = computed(() => this.subState().data);

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
