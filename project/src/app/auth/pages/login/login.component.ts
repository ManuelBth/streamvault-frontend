import { Component, inject, signal, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { isLoading, setLoading } from '../../../shared/store/app.store';
import { ProfileService } from '../../../profile/services/profile.service';

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
  private profileService = inject(ProfileService);

  errorMessage = signal<string | null>(null);
  private loginCompleted = signal(false);
  private navigationHandled = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = isLoading;

  constructor() {
    effect(() => {
      if (!this.loginCompleted() || this.navigationHandled()) return;
      
      const profilesState = this.profileService.profiles();
      if (profilesState.state !== 'success' || !profilesState.data) return;
      
      const count = profilesState.data.length;
      this.navigationHandled.set(true);
      
      if (count === 0) {
        this.router.navigate(['/profile/manage']);
      } else if (count === 1) {
        this.profileService.selectProfile(profilesState.data[0]);
        this.router.navigate(['/catalog']);
      } else {
        this.router.navigate(['/profile/select']);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.errorMessage.set(null);
    setLoading(true);

    const credentials = this.loginForm.value as { email: string; password: string };

    this.authService.login(credentials).subscribe({
      next: () => {
        setLoading(false);
        this.loginCompleted.set(true);
        this.profileService.loadProfiles();
      },
      error: (err) => {
        setLoading(false);
        this.errorMessage.set(err.error?.message || 'Error al iniciar sesión');
      }
    });
  }
}
