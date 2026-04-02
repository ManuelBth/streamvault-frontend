import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { currentUser, isAuthenticated, isAdmin } from '../store/app.store';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  private authService = inject(AuthService);
  
  currentUser = currentUser;
  isAuthenticated = isAuthenticated;
  isAdmin = isAdmin;

  logout(): void {
    this.authService.logout();
  }
}
