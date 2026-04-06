import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminContentService } from '../../services/admin-content.service';
import { UploadDropzoneComponent } from '../../components/upload-dropzone/upload-dropzone.component';
import { UploadProgressComponent } from '../../components/upload-progress/upload-progress.component';
import { ContentType, ContentStatus } from '../../../catalog/models/catalog.enums';

@Component({
  selector: 'app-content-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UploadDropzoneComponent, UploadProgressComponent],
  templateUrl: './content-form.component.html',
  styleUrl: './content-form.component.scss'
})
export class ContentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private adminContentService = inject(AdminContentService);

  isEditMode = signal<boolean>(false);
  contentId = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  uploadProgress = signal<number>(0);
  isUploading = signal<boolean>(false);
  uploadFilename = signal<string>('');
  uploadError = signal<string | null>(null);

  contentTypes = [
    { value: ContentType.MOVIE, label: 'Película' },
    { value: ContentType.SERIES, label: 'Serie' }
  ];

  contentStatuses = [
    { value: ContentStatus.DRAFT, label: 'Borrador' },
    { value: ContentStatus.PUBLISHED, label: 'Publicado' },
    { value: ContentStatus.UNPUBLISHED, label: 'Despublicado' }
  ];

  genreOptions = [
    { id: '1', name: 'Acción' },
    { id: '2', name: 'Comedia' },
    { id: '3', name: 'Drama' },
    { id: '4', name: 'Terror' },
    { id: '5', name: 'Ciencia Ficción' },
    { id: '6', name: 'Romance' },
    { id: '7', name: 'Thriller' },
    { id: '8', name: 'Animación' }
  ];

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    type: [ContentType.MOVIE, Validators.required],
    releaseYear: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2100)]],
    rating: [''],
    status: [ContentStatus.DRAFT, Validators.required],
    genreIds: [[]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.contentId.set(id);
      this.loadContent(id);
    }
  }

  private loadContent(id: string): void {
    this.isLoading.set(true);
    this.adminContentService.loadContentById(id);

    const checkContent = () => {
      const state = this.adminContentService.currentContent();
      if (state.state === 'success' && state.data) {
        const content = state.data;
        this.form.patchValue({
          title: content.title,
          description: content.description,
          type: content.type,
          releaseYear: content.releaseYear,
          rating: content.rating,
          status: content.status,
          genreIds: content.genres.map(g => g.id)
        });
        this.isLoading.set(false);
      } else if (state.state === 'error') {
        this.isLoading.set(false);
        alert('Error al cargar contenido');
      } else {
        setTimeout(checkContent, 100);
      }
    };

    setTimeout(checkContent, 100);
  }

  onFileSelected(file: File): void {
    this.uploadFilename.set(file.name);
    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.uploadError.set(null);

    this.adminContentService.uploadThumbnail(file).subscribe({
      next: (response) => {
        this.form.patchValue({ thumbnailKey: response.key });
        this.uploadProgress.set(100);
        this.isUploading.set(false);
      },
      error: (err) => {
        this.uploadError.set(err.message);
        this.isUploading.set(false);
      }
    });

    const interval = setInterval(() => {
      this.uploadProgress.update(p => {
        if (p >= 90) {
          clearInterval(interval);
          return p;
        }
        return p + 10;
      });
    }, 200);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.form.value;

    const request = {
      ...formValue,
      genreIds: formValue.genreIds || []
    };

    if (this.isEditMode() && this.contentId()) {
      this.adminContentService.updateExistingContent(this.contentId()!, request).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admin/content']);
        },
        error: (err) => {
          this.isSaving.set(false);
          alert(`Error al actualizar: ${err.message}`);
        }
      });
    } else {
      this.adminContentService.createNewContent(request).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admin/content']);
        },
        error: (err) => {
          this.isSaving.set(false);
          alert(`Error al crear: ${err.message}`);
        }
      });
    }
  }

  onGenreChange(genreId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentGenres = this.form.get('genreIds')?.value || [];
    
    if (checkbox.checked) {
      this.form.patchValue({ genreIds: [...currentGenres, genreId] });
    } else {
      this.form.patchValue({ genreIds: currentGenres.filter((id: string) => id !== genreId) });
    }
  }

  isGenreSelected(genreId: string): boolean {
    const currentGenres = this.form.get('genreIds')?.value || [];
    return currentGenres.includes(genreId);
  }

  cancel(): void {
    this.router.navigate(['/admin/content']);
  }
}