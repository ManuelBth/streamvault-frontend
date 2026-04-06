import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../../admin/components/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar class="sidebar" />
      <main class="admin-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background-color: #141414;
    }
    
    .sidebar {
      width: 260px;
      flex-shrink: 0;
    }
    
    .admin-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        display: none;
      }
      
      .admin-content {
        padding: 16px;
      }
    }
  `]
})
export class AdminLayoutComponent {}
