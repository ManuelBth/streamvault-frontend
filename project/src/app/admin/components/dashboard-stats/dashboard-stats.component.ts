import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DashboardStats {
  totalUsers: number;
  totalContent: number;
  activeSubscriptions: number;
}

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-stats.component.html',
  styleUrl: './dashboard-stats.component.scss'
})
export class DashboardStatsComponent {
  stats = input.required<DashboardStats>();
}