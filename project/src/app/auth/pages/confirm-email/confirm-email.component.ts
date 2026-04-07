import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

type ConfirmEmailState = 
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss'
})
export class ConfirmEmailPageComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // State signal
  state = signal<ConfirmEmailState>({ status: 'loading' });
  
  // Computed state helpers
  isLoading = signal<boolean>(true);
  isSuccess = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    // Extract token from query params
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      
      if (!token) {
        this.state.set({ 
          status: 'error', 
          message: 'Token de confirmación no proporcionado. Por favor, verifica el enlace en tu correo electrónico.' 
        });
        this.isLoading.set(false);
        this.isSuccess.set(false);
        this.errorMessage.set('Token de confirmación no proporcionado');
        return;
      }

      this.confirmEmail(token);
    });
  }

  private confirmEmail(token: string): void {
    this.state.set({ status: 'loading' });
    this.isLoading.set(true);
    this.isSuccess.set(false);
    this.errorMessage.set(null);

    this.authService.confirmEmail(token).subscribe({
      next: () => {
        this.state.set({ status: 'success' });
        this.isLoading.set(false);
        this.isSuccess.set(true);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Error al confirmar el correo electrónico. por favor, intentalo más tarde.';
        this.state.set({ status: 'error', message: errorMsg });
        this.isLoading.set(false);
        this.isSuccess.set(false);
        this.errorMessage.set(errorMsg);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}