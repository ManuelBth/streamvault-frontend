import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { isLoading, setLoading } from '../../../shared/store/app.store';

function emailStreamvaultValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const valid = control.value.endsWith('@streamvault.com');
  return valid ? null : { notStreamvault: { message: 'Debe usar un correo @streamvault.com' } };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-sv-black">
      <div class="w-full max-w-md p-8 bg-sv-dark rounded-lg shadow-lg">
        <h1 class="text-2xl font-bold text-sv-text mb-6 text-center">Crear Cuenta</h1>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
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
              [class.border-red-500]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched"
            />
            @if (registerForm.get('username')?.hasError('required') && registerForm.get('username')?.touched) {
              <p class="text-sv-red text-sm mt-1">El usuario es requerido</p>
            }
            @if (registerForm.get('username')?.hasError('minlength') && registerForm.get('username')?.touched) {
              <p class="text-sv-red text-sm mt-1">Mínimo 3 caracteres</p>
            }
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-sv-muted mb-1">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full px-4 py-2 bg-sv-card border border-sv-border rounded text-sv-text focus:outline-none focus:border-sv-red"
              [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            />
            @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
              <p class="text-sv-red text-sm mt-1">El correo es requerido</p>
            }
            @if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
              <p class="text-sv-red text-sm mt-1">Ingrese un correo válido</p>
            }
            @if (registerForm.get('email')?.hasError('notStreamvault') && registerForm.get('email')?.touched) {
              <p class="text-sv-red text-sm mt-1">Debe usar un correo @streamvault.com</p>
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
              [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
            />
            @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
              <p class="text-sv-red text-sm mt-1">La contraseña es requerida</p>
            }
            @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
              <p class="text-sv-red text-sm mt-1">Mínimo 6 caracteres</p>
            }
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-sv-muted mb-1">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              class="w-full px-4 py-2 bg-sv-card border border-sv-border rounded text-sv-text focus:outline-none focus:border-sv-red"
              [class.border-red-500]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
            />
            @if (registerForm.get('confirmPassword')?.hasError('required') && registerForm.get('confirmPassword')?.touched) {
              <p class="text-sv-red text-sm mt-1">Confirme su contraseña</p>
            }
            @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
              <p class="text-sv-red text-sm mt-1">Las contraseñas no coinciden</p>
            }
          </div>
          
          <button
            type="submit"
            [disabled]="registerForm.invalid || isLoading()"
            class="w-full py-3 bg-sv-red hover:bg-sv-red-hover text-white font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (isLoading()) {
              <span class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Creando cuenta...
              </span>
            } @else {
              Crear Cuenta
            }
          </button>
        </form>
        
        <p class="mt-6 text-center text-sv-muted text-sm">
          ¿Ya tienes cuenta? 
          <a routerLink="/auth/login" class="text-sv-red hover:underline">Inicia Sesión</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email, emailStreamvaultValidator]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  isLoading = isLoading;

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.errorMessage.set(null);
    setLoading(true);

    const { username, email, password } = this.registerForm.value;
    
    this.authService.register({ username: username!, email: email!, password: password! }).subscribe({
      next: () => {
        setLoading(false);
        this.router.navigate(['/catalog']);
      },
      error: (err) => {
        setLoading(false);
        this.errorMessage.set(err.error?.message || 'Error al crear la cuenta');
      }
    });
  }
}
