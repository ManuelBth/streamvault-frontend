import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { currentUser, isAuthenticated, isAdmin } from '../store/app.store';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-sv-dark border-b border-sv-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <a routerLink="/catalog" class="text-xl font-bold text-sv-red">StreamVault</a>
            
            @if (isAuthenticated()) {
              <div class="hidden md:flex ml-10 space-x-4">
                <a routerLink="/catalog" routerLinkActive="text-sv-red" class="text-sv-muted hover:text-sv-text px-3 py-2 rounded-md text-sm">Catálogo</a>
                <a routerLink="/search" routerLinkActive="text-sv-red" class="text-sv-muted hover:text-sv-text px-3 py-2 rounded-md text-sm">Buscar</a>
              </div>
            }
          </div>
          
          <div class="flex items-center space-x-4">
            @if (isAuthenticated()) {
              @if (isAdmin()) {
                <a routerLink="/admin" class="text-sv-muted hover:text-sv-text text-sm">Admin</a>
              }
              <a routerLink="/profile" class="text-sv-muted hover:text-sv-text text-sm">
                {{ currentUser()?.username }}
              </a>
              <button (click)="logout()" class="text-sv-muted hover:text-sv-text text-sm">Cerrar Sesión</button>
            } @else {
              <a routerLink="/auth/login" class="text-sv-muted hover:text-sv-text text-sm">Iniciar Sesión</a>
            }
          </div>
        </div>
      </div>
    </nav>
  `
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
