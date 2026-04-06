import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type UserRole = 'ADMIN' | 'USER' | 'GUEST';

@Component({
  selector: 'app-badge-role',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-role.component.html',
  styleUrl: './badge-role.component.scss'
})
export class BadgeRoleComponent {
  role = input.required<UserRole>();
  
  get label(): string {
    switch (this.role()) {
      case 'ADMIN': return 'Administrador';
      case 'USER': return 'Usuario';
      case 'GUEST': return 'Invitado';
      default: return this.role();
    }
  }
}