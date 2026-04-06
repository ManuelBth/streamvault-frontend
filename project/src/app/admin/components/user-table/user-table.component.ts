import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUser } from '../../models/admin-user.model';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss'
})
export class UserTableComponent {
  users = input<AdminUser[]>([]);
  loading = input<boolean>(false);
  
  onView = output<AdminUser>();
  onNotify = output<AdminUser>();
}