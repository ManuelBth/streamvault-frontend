import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../auth/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'pi pi-chart-bar', route: '/admin' },
    { label: 'Gestión de Contenido', icon: 'pi pi-video', route: '/admin/content' },
    { label: 'Gestión de Usuarios', icon: 'pi pi-users', route: '/admin/users' }
  ];

  onLogout(): void {
    // Redirect to catalog instead of logging out
    this.router.navigate(['/catalog']);
  }
}