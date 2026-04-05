import { Routes } from '@angular/router';
import { NotificationPageComponent } from './pages/notification-page/notification-page.component';

export const NOTIFICATION_ROUTES: Routes = [
  {
    path: '',
    component: NotificationPageComponent,
    title: 'Notificaciones | StreamVault'
  }
];
