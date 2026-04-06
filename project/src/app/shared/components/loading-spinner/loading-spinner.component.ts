import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent {
  size = input<'small' | 'medium' | 'large'>('medium');
  color = input<'primary' | 'white' | 'gray'>('primary');
  showLabel = input<boolean>(false);
  label = input<string>('Cargando...');
  
  get sizeValue(): number {
    switch (this.size()) {
      case 'small': return 20;
      case 'large': return 48;
      default: return 32;
    }
  }
}