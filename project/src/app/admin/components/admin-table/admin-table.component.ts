import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-table.component.html',
  styleUrl: './admin-table.component.scss'
})
export class AdminTableComponent {
  columns = input<string[]>([]);
  rows = input<any[]>([]);
  loading = input<boolean>(false);
  
  onEdit = output<any>();
  onDelete = output<any>();
}