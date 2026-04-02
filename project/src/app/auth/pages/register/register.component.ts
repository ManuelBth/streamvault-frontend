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
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
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

    const { name, email, password } = this.registerForm.value;
    
    this.authService.register({ name: name!, email: email!, password: password! }).subscribe({
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