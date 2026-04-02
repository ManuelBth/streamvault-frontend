import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
  },
  {
    path: 'content',
    loadComponent: () => import('./pages/admin-content/admin-content.component').then(m => m.AdminContentComponent)
  }
];
