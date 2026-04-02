import { Routes } from '@angular/router';

export const CONTACT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  }
];
