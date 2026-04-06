import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'content',
    loadComponent: () => import('./pages/content-list/content-list.component').then(m => m.ContentListComponent)
  },
  {
    path: 'content/new',
    loadComponent: () => import('./pages/content-form/content-form.component').then(m => m.ContentFormComponent)
  },
  {
    path: 'content/:id/edit',
    loadComponent: () => import('./pages/content-form/content-form.component').then(m => m.ContentFormComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/user-list/user-list.component').then(m => m.UserListComponent)
  }
];
