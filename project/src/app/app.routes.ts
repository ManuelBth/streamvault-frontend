import { Routes } from '@angular/router';
import { guestGuard } from './shared/guards/guest.guard';
import { authGuard } from './shared/guards/auth.guard';
import { adminGuard } from './shared/guards/admin.guard';
import { AuthLayoutComponent } from './shared/layout/auth-layout.component';
import { MainLayoutComponent } from './shared/layout/main-layout.component';

export const routes: Routes = [
  // ── Públicas (Guest only) - with auth prefix ────────────────
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
      },
      {
        path: 'login',
        loadComponent: () => import('./auth/pages/login/login.component').then(m => m.LoginComponent),
        title: 'Iniciar Sesión | StreamVault'
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/pages/register/register.component').then(m => m.RegisterComponent),
        title: 'Registrarse | StreamVault'
      }
    ]
  },

  // ── Raíz: redirect to catalog (authenticated) ───────────────
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'catalog'
  },

  // ── Usuario autenticado (MainLayout) ───────────────────────
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'catalog',
        loadChildren: () => import('./catalog/catalog.routes').then(m => m.CATALOG_ROUTES)
      },
      {
        path: 'player',
        loadChildren: () => import('./player/player.routes').then(m => m.PLAYER_ROUTES)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.routes').then(m => m.PROFILE_ROUTES)
      },
      {
        path: 'contact',
        loadChildren: () => import('./contact/contact.routes').then(m => m.CONTACT_ROUTES)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./notifications/notifications.routes').then(m => m.NOTIFICATION_ROUTES)
      }
    ]
  },

  // ── Admin ─────────────────────────────────────────────────
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [adminGuard],
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // ── Fallback ───────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'catalog'
  }
];
