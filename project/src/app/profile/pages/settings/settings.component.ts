import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../services/user.service';
import { SubscriptionService } from '../../services/subscription.service';
import { PlanSelectorComponent } from '../../components/plan-selector/plan-selector.component';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';
import { Plan, Subscription } from '../../models/subscription.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, PlanSelectorComponent, PaymentModalComponent],
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  private userService = inject(UserService);
  private subscriptionService = inject(SubscriptionService);

  readonly userState = this.userService.currentUser;
  readonly userLoading = this.userService.isLoading;
  readonly userError = this.userService.errorMessage;

  readonly subState = this.subscriptionService.subscription;
  readonly subLoading = this.subscriptionService.isLoading;
  readonly subError = this.subscriptionService.errorMessage;

  // Plans available
  readonly plans = this.subscriptionService.getPlans();

  // Modal state
  showPaymentModal = signal(false);
  selectedPlan = signal<Plan | null>(null);

  editName = signal('');
  editEmail = signal('');
  updating = signal(false);
  // Track which plan is being loaded for UI feedback
  loadingPlanId = signal<string | null>(null);

  ngOnInit(): void {
    this.userService.loadMe();
    this.subscriptionService.loadMySubscription();
  }

  readonly user = computed(() => this.userState().data);
  readonly subscription = computed(() => this.subState().data);

  // Handle plan selection
  onSelectPlan(plan: Plan): void {
    if (plan.id === 'FREE') {
      // FREE plan - set locally without calling backend (backend always creates PREMIUM)
      this.setFreePlanLocally();
    } else {
      this.selectedPlan.set(plan);
      this.showPaymentModal.set(true);
    }
  }

  private setFreePlanLocally(): void {
    // Create a local "free" subscription state (no backend call needed)
    // The backend always creates DEFAULT plan, so we handle FREE locally
    this.loadingPlanId.set('FREE');
    this.subscriptionService.setFreePlanLocally();
    this.loadingPlanId.set(null);
  }

  onPaymentSuccess(subscription: Subscription): void {
    this.showPaymentModal.set(false);
    this.selectedPlan.set(null);
    this.subscriptionService.loadMySubscription();
  }

  closePaymentModal(): void {
    this.showPaymentModal.set(false);
    this.selectedPlan.set(null);
  }

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
    // Open plan selector - navigate or show inline
    // For now, just trigger the plan selector flow
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPlanColor(plan: string): string {
    switch (plan) {
      case 'DEFAULT': return 'text-yellow-400';
      case 'BASIC': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  }

  getPlanName(plan: string): string {
    switch (plan) {
      case 'DEFAULT': return 'Premium';
      case 'BASIC': return 'Básico';
      default: return 'Gratis';
    }
  }
}
