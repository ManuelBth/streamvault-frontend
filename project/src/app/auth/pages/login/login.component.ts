import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { isLoading, setLoading } from '../../../shared/store/app.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-sv-black">
      <div class="w-full max-w-md p-8 bg-sv-dark rounded-lg shadow-lg">
        <h1 class="text-2xl font-bold text-sv-text mb-6 text-center">Iniciar Sesión</h1>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
          @if (errorMessage()) {
            <div class="p-3 bg-red-900/50 border border-sv-red rounded text-sv-text text-sm">
              {{ errorMessage() }}
            </div>
          }
          
          <div>
            <label for="username" class="block text-sm font-medium text-sv-muted mb-1">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              formControlName="username"
              class="w-full px-4 py-2 bg-sv-card border border-sv-border rounded text-sv-text focus:outline-none focus:border-sv-red"
              [class.border-red-500]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
            />
            @if (loginForm.get('username')?.invalid && loginForm.get('username')?.touched) {
              <p class="text-sv-red text-sm mt-1">El usuario es requerido</p>
            }
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-sv-muted mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="w-full px-4 py-2 bg-sv-card border border-sv-border rounded text-sv-text focus:outline-none focus:border-sv-red"
              [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <p class="text-sv-red text-sm mt-1">La contraseña es requerida</p>
            }
          </div>
          
          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading()"
            class="w-full py-3 bg-sv-red hover:bg-sv-red-hover text-white font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (isLoading()) {
              <span class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Iniciando sesión...
              </span>
            } @else {
              Iniciar Sesión
            }
          </button>
        </form>
        
        <p class="mt-6 text-center text-sv-muted text-sm">
          ¿No tienes cuenta? 
          <a routerLink="/register" class="text-sv-red hover:underline">Regístrate</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isLoading = isLoading;

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.errorMessage.set(null);
    setLoading(true);

    this.authService.login(this.loginForm.value as { username: string; password: string }).subscribe({
      next: () => {
        setLoading(false);
        this.router.navigate(['/catalog']);
      },
      error: (err) => {
        setLoading(false);
        this.errorMessage.set(err.error?.message || 'Error al iniciar sesión');
      }
    });
  }
}
