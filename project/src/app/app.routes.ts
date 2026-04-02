import { Routes } from '@angular/router';
import { guestGuard } from './shared/guards/guest.guard';
import { authGuard } from './shared/guards/auth.guard';
import { adminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [guestGuard]
  },
  {
    path: 'catalog',
    loadChildren: () => import('./catalog/catalog.routes').then(m => m.CATALOG_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'player',
    loadChildren: () => import('./player/player.routes').then(m => m.PLAYER_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.routes').then(m => m.PROFILE_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'contact',
    loadChildren: () => import('./contact/contact.routes').then(m => m.CONTACT_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [adminGuard]
  },
  {
    path: '**',
    redirectTo: 'catalog'
  }
];
