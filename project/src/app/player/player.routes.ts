import { Routes } from '@angular/router';

export const PLAYER_ROUTES: Routes = [
  {
    path: ':id',
    loadComponent: () => import('./pages/player/player.component').then(m => m.PlayerComponent)
  },
  {
    path: ':id/episode/:episodeId',
    loadComponent: () => import('./pages/player/player.component').then(m => m.PlayerComponent)
  }
];
