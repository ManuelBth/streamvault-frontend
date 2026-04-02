import { Routes } from '@angular/router';

export const PLAYER_ROUTES: Routes = [
  {
    path: 'watch/:id',
    loadComponent: () => import('./pages/player/player.component').then(m => m.PlayerComponent)
  }
];
