import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-dropzone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-dropzone.component.html',
  styleUrl: './upload-dropzone.component.scss'
})
export class UploadDropzoneComponent {
  fileSelected = output<File>();
  
  private readonly acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly maxSize = 5 * 1024 * 1024;
  
  isDragOver = false;
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }
  
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
      input.value = '';
    }
  }
  
  private processFile(file: File): void {
    if (!this.acceptedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo se aceptan: JPEG, PNG, WebP, GIF');
      return;
    }
    
    if (file.size > this.maxSize) {
      alert('El archivo excede el tamaño máximo de 5MB');
      return;
    }
    
    this.fileSelected.emit(file);
  }
}