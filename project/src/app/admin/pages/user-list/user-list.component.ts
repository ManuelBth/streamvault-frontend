import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AdminUserService } from '../../services/admin-user.service';
import { AdminNotificationService } from '../../services/admin-notification.service';
import { AdminUser } from '../../models/admin-user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    InputTextModule,
    FormsModule,
    DialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  private adminUserService = inject(AdminUserService);
  private notificationService = inject(AdminNotificationService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  users = signal<AdminUser[]>([]);
  currentPage = signal<number>(0);
  totalElements = signal<number>(0);
  pageSize = signal<number>(20);
  isLoading = signal<boolean>(true);

  first = signal<number>(0);

  // Dialog for sending notification
  showNotificationDialog = false;
  notificationTitle = '';
  notificationMessage = '';
  selectedUser: AdminUser | null = null;
  isSendingNotification = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page: number = 0): void {
    this.isLoading.set(true);
    this.adminUserService.loadUsers(page, this.pageSize());

    const checkData = () => {
      const state = this.adminUserService.users();
      if (state.state === 'success') {
        this.users.set(this.adminUserService.usersList());
        const data = state.data;
        this.currentPage.set(data?.page ?? 0);
        this.totalElements.set(data?.total ?? 0);
        this.isLoading.set(false);
      } else if (state.state === 'error') {
        this.isLoading.set(false);
      } else {
        setTimeout(checkData, 100);
      }
    };

    setTimeout(checkData, 100);
  }

  onPageChange(event: any): void {
    const page = event.first / event.rows;
    this.loadUsers(page);
  }

  onViewUser(user: AdminUser): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Detalles del Usuario',
      detail: `${user.name} (${user.email})`,
      life: 3000
    });
  }

  onNotifyUser(user: AdminUser): void {
    this.selectedUser = user;
    this.notificationTitle = '';
    this.notificationMessage = '';
    this.showNotificationDialog = true;
  }

  sendNotification(): void {
    const user = this.selectedUser;
    if (!user) return;

    const title = this.notificationTitle.trim();
    const message = this.notificationMessage.trim();

    if (!title || !message) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El título y el mensaje son obligatorios',
        life: 3000
      });
      return;
    }

    this.isSendingNotification = true;
    this.notificationService.sendToUser({ 
      userId: user.id, 
      type: 'USER_NOTIFICATION' as const,
      title: title,
      message: message
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Notificación enviada a ${user.name}`,
          life: 3000
        });
        this.showNotificationDialog = false;
        this.isSendingNotification = false;
      },
      error: (err: Error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al enviar: ${err.message}`,
          life: 5000
        });
        this.isSendingNotification = false;
      }
    });
  }

  cancelNotification(): void {
    this.showNotificationDialog = false;
    this.selectedUser = null;
  }
}