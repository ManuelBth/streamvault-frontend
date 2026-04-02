import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { isLoading, setLoading } from '../../../shared/store/app.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = isLoading;

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.errorMessage.set(null);
    setLoading(true);

    const credentials = this.loginForm.value as { email: string; password: string };

    this.authService.login(credentials).subscribe({
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
