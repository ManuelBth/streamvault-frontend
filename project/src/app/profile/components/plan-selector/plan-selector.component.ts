import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Plan, Subscription } from '../../models/subscription.model';

@Component({
  selector: 'app-plan-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="plan-selector">
      <div class="plans-grid">
        @for (plan of plans(); track plan.id) {
          <div 
            class="plan-card"
            [class.popular]="plan.isPopular"
            [class.current]="isCurrentPlan(plan)"
          >
            @if (plan.isPopular) {
              <div class="popular-badge">Más popular</div>
            }
            
            @if (isCurrentPlan(plan)) {
              <div class="current-badge">Plan actual</div>
            }
            
            <h3 class="plan-name">{{ plan.name }}</h3>
            <p class="plan-price">{{ plan.priceDisplay }}</p>
            
            <ul class="plan-features">
              @for (feature of plan.features; track feature) {
                <li>
                  <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  {{ feature }}
                </li>
              }
            </ul>
            
            <button 
              class="select-btn"
              [class.btn-primary]="plan.isPopular && !isCurrentPlan(plan)"
              [disabled]="isCurrentPlan(plan)"
              (click)="onSelectPlan(plan)"
            >
              {{ isCurrentPlan(plan) ? 'Plan actual' : (plan.id === 'FREE' ? 'Comenzar gratis' : 'Elegir Plan') }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .plan-selector {
      width: 100%;
    }
    
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    .plan-card {
      position: relative;
      background: linear-gradient(145deg, #1f1f1f 0%, #252525 100%);
      border: 1px solid #333;
      border-radius: 16px;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      min-height: 380px;
      transition: all 0.3s ease;
    }
    
    .plan-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    }
    
    .plan-card.popular {
      border-color: #e50914;
      background: linear-gradient(145deg, #251515 0%, #2a1a1a 100%);
    }
    
    .plan-card.current {
      border-color: #22c55e;
      opacity: 0.8;
    }
    
    .popular-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #e50914;
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    
    .current-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #22c55e;
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
      white-space: nowrap;
    }
    
    .plan-name {
      color: white;
      font-size: 22px;
      font-weight: 700;
      margin: 12px 0 8px;
      text-align: center;
    }
    
    .plan-price {
      color: #e50914;
      font-size: 28px;
      font-weight: 800;
      text-align: center;
      margin-bottom: 20px;
    }
    
    .plan-card.popular .plan-price {
      color: #fff;
    }
    
    .plan-features {
      list-style: none;
      padding: 0;
      margin: 0 0 20px 0;
      flex: 1;
    }
    
    .plan-features li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      color: #9ca3af;
      font-size: 13px;
      margin-bottom: 10px;
      line-height: 1.4;
    }
    
    .check-icon {
      width: 16px;
      height: 16px;
      color: #22c55e;
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    .select-btn {
      width: 100%;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid #4b5563;
      background: transparent;
      color: white;
      margin-top: auto;
    }
    
    .select-btn:hover:not(:disabled) {
      background: #4b5563;
    }
    
    .select-btn.btn-primary {
      background: #e50914;
      border-color: #e50914;
    }
    
    .select-btn.btn-primary:hover:not(:disabled) {
      background: #b2070f;
      border-color: #b2070f;
    }
    
    .select-btn:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `]
})
export class PlanSelectorComponent {
  plans = input.required<Plan[]>();
  currentSubscription = input<Subscription | null | undefined>(null);
  
  selectPlan = output<Plan>();

  isCurrentPlan(plan: Plan): boolean {
    const current = this.currentSubscription();
    return current != null && current.active && current.plan === plan.id;
  }

  onSelectPlan(plan: Plan): void {
    if (!this.isCurrentPlan(plan)) {
      this.selectPlan.emit(plan);
    }
  }
}
