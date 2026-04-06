import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss'
})
export class ErrorPageComponent {
  title = input<string>('Algo salió mal');
  message = input<string>('Ha ocurrido un error inesperado. Por favor, intenta nuevamente.');
  showRetryButton = input<boolean>(true);
  showHomeButton = input<boolean>(true);
  
  onRetry = output<void>();
  onHome = output<void>();
}