import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Plan, Subscription } from '../../models/subscription.model';

export type PaymentState = 'idle' | 'processing' | 'success' | 'error';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="onClose()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          
          @switch (state()) {
            @case ('idle') {
              <!-- Formulario de pago -->
              <div class="modal-header">
                <h2>Completar pago</h2>
                <button class="close-btn" (click)="onClose()">✕</button>
              </div>
              
              <div class="order-summary">
                <p class="plan-name">Plan {{ selectedPlan().name }}</p>
                <p class="plan-price">{{ selectedPlan().priceDisplay }}</p>
              </div>
              
              <form class="payment-form" (ngSubmit)="onSubmit()">
                <div class="form-group">
                  <label for="cardNumber">Número de tarjeta</label>
                  <input 
                    type="text" 
                    id="cardNumber"
                    [(ngModel)]="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    maxlength="19"
                    required
                  />
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="expiry">Fecha de expiry</label>
                    <input 
                      type="text" 
                      id="expiry"
                      [(ngModel)]="expiry"
                      name="expiry"
                      placeholder="MM/AA"
                      maxlength="5"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label for="cvv">CVV</label>
                    <input 
                      type="text" 
                      id="cvv"
                      [(ngModel)]="cvv"
                      name="cvv"
                      placeholder="123"
                      maxlength="4"
                      required
                    />
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="cardName">Nombre en la tarjeta</label>
                  <input 
                    type="text" 
                    id="cardName"
                    [(ngModel)]="cardName"
                    name="cardName"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  class="pay-btn"
                  [disabled]="!isFormValid()"
                >
                  Pagar {{ selectedPlan().priceDisplay }}
                </button>
              </form>
            }
            
            @case ('processing') {
              <!-- Estado de procesamiento -->
              <div class="processing-state">
                <div class="spinner"></div>
                <p>Procesando pago...</p>
                <span class="processing-note">Esto tomará solo unos segundos</span>
              </div>
            }
            
            @case ('success') {
              <!-- Pago exitoso -->
              <div class="success-state">
                <div class="success-icon">✓</div>
                <h2>¡Pago exitoso!</h2>
                <p>Tu suscripción {{ selectedPlan().name }} está ahora activa</p>
                <div class="subscription-details">
                  <p><strong>Plan:</strong> {{ selectedPlan().name }}</p>
                  <p><strong>Desde:</strong> {{ today | date:'dd/MM/yyyy' }}</p>
                  <p><strong>Hasta:</strong> {{ nextMonth | date:'dd/MM/yyyy' }}</p>
                </div>
                <button class="continue-btn" (click)="onSuccess()">
                  Continuar
                </button>
              </div>
            }
            
            @case ('error') {
              <!-- Error en pago -->
              <div class="error-state">
                <div class="error-icon">✕</div>
                <h2>Error en el pago</h2>
                <p>Por favor intenta nuevamente</p>
                <button class="retry-btn" (click)="resetState()">
                  Intentar de nuevo
                </button>
              </div>
            }
          }
          
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .modal-content {
      background: #1f1f1f;
      border-radius: 16px;
      padding: 32px;
      max-width: 440px;
      width: 100%;
      animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .modal-header h2 {
      color: white;
      font-size: 24px;
      margin: 0;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: #9ca3af;
      font-size: 24px;
      cursor: pointer;
      padding: 4px;
    }
    
    .close-btn:hover {
      color: white;
    }
    
    .order-summary {
      background: #252525;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      text-align: center;
    }
    
    .order-summary .plan-name {
      color: white;
      font-size: 18px;
      margin: 0 0 4px 0;
    }
    
    .order-summary .plan-price {
      color: #e50914;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
    }
    
    .payment-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .form-group label {
      color: #9ca3af;
      font-size: 14px;
    }
    
    .form-group input {
      background: #2c2c2c;
      border: 1px solid #404040;
      border-radius: 8px;
      padding: 12px 16px;
      color: white;
      font-size: 16px;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #e50914;
    }
    
    .form-group input::placeholder {
      color: #6b7280;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .pay-btn {
      background: #e50914;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 16px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 8px;
    }
    
    .pay-btn:hover:not(:disabled) {
      background: #b2070f;
    }
    
    .pay-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .processing-state, .success-state, .error-state {
      text-align: center;
      padding: 32px 16px;
    }
    
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #333;
      border-top-color: #e50914;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 24px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .processing-state p, .success-state p, .error-state p {
      color: white;
      font-size: 18px;
      margin: 0 0 8px 0;
    }
    
    .processing-note {
      color: #6b7280;
      font-size: 14px;
    }
    
    .success-icon {
      width: 72px;
      height: 72px;
      background: #22c55e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 36px;
      color: white;
    }
    
    .subscription-details {
      background: #252525;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
      text-align: left;
    }
    
    .subscription-details p {
      color: #9ca3af;
      font-size: 14px;
      margin: 4px 0;
    }
    
    .subscription-details strong {
      color: white;
    }
    
    .continue-btn, .retry-btn {
      background: #e50914;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 14px 32px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .continue-btn:hover, .retry-btn:hover {
      background: #b2070f;
    }
    
    .error-icon {
      width: 72px;
      height: 72px;
      background: #ef4444;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 36px;
      color: white;
    }
    
    .error-state h2 {
      color: white;
      margin: 0 0 8px 0;
    }
  `]
})
export class PaymentModalComponent {
  isOpen = input.required<boolean>();
  selectedPlan = input.required<Plan>();
  
  close = output<void>();
  paymentSuccess = output<Subscription>();

  state = signal<PaymentState>('idle');
  
  // Form fields - hardcoded for simulation
  cardNumber = '4532 1234 5678 9012';
  expiry = '12/28';
  cvv = '123';
  cardName = 'Juan Pérez';

  get today(): Date {
    return new Date();
  }

  get nextMonth(): Date {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  isFormValid(): boolean {
    return this.cardNumber.length >= 16 && 
           this.expiry.length >= 4 && 
           this.cvv.length >= 3 && 
           this.cardName.length > 0;
  }

  onSubmit(): void {
    // Always valid since we have hardcoded test data
    const planType = this.selectedPlan().id;
    
    this.state.set('processing');
    
    // Emular procesamiento de pago (2 segundos)
    setTimeout(() => {
      const subscription: Subscription = {
        id: `sub-${Date.now()}`,
        plan: planType,
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        active: true
      };
      
      this.state.set('success');
      this.paymentSuccess.emit(subscription);
    }, 2000);
  }

  onSuccess(): void {
    this.close.emit();
    this.resetState();
  }

  onClose(): void {
    if (this.state() !== 'processing') {
      this.close.emit();
      this.resetState();
    }
  }

  resetState(): void {
    this.state.set('idle');
    this.cardNumber = '4532 1234 5678 9012';
    this.expiry = '12/28';
    this.cvv = '123';
    this.cardName = 'Juan Pérez';
  }
}
