import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-progress.component.html',
  styleUrl: './upload-progress.component.scss'
})
export class UploadProgressComponent {
  progress = input<number>(0);
  filename = input<string>('');
  uploading = input<boolean>(true);
}