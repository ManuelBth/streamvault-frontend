import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AdminContentService } from '../../services/admin-content.service';
import { ContentResponse } from '../../models/content.model';

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TableModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    InputTextModule,
    TagModule,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './content-list.component.html',
  styleUrl: './content-list.component.scss'
})
export class ContentListComponent implements OnInit {
  private adminContentService = inject(AdminContentService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  contents = signal<ContentResponse[]>([]);
  currentPage = signal<number>(0);
  totalElements = signal<number>(0);
  pageSize = signal<number>(20);
  isLoading = signal<boolean>(true);

  first = signal<number>(0);

  ngOnInit(): void {
    this.loadContents();
  }

  loadContents(page: number = 0): void {
    this.isLoading.set(true);
    this.adminContentService.loadAllContents(page, this.pageSize());

    const checkData = () => {
      if (this.adminContentService.contents().state === 'success') {
        this.contents.set(this.adminContentService.contentsList());
        const data = this.adminContentService.contents();
        this.currentPage.set(data.data?.page ?? 0);
        this.totalElements.set(data.data?.totalElements ?? 0);
        this.isLoading.set(false);
      } else if (this.adminContentService.contents().state === 'error') {
        this.isLoading.set(false);
      } else {
        setTimeout(checkData, 100);
      }
    };

    setTimeout(checkData, 100);
  }

  onPageChange(event: any): void {
    const page = event.first / event.rows;
    this.loadContents(page);
  }

  onEdit(content: ContentResponse): void {
    window.location.href = `/admin/content/${content.id}/edit`;
  }

  onDelete(content: ContentResponse): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar "${content.title}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminContentService.removeContent(content.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Contenido eliminado correctamente',
              life: 3000
            });
            this.loadContents(this.currentPage());
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al eliminar: ${err.message}`,
              life: 5000
            });
          }
        });
      }
    });
  }

  getGenreNames(genres: { name: string }[]): string {
    return genres.map(g => g.name).join(', ');
  }
}