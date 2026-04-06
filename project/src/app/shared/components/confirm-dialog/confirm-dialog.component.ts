import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  isOpen = input.required<boolean>();
  title = input<string>('Confirmar');
  message = input<string>('');
  confirmText = input<string>('Confirmar');
  cancelText = input<string>('Cancelar');

  onConfirm = output<void>();
  onCancel = output<void>();

  handleConfirm(): void {
    this.onConfirm.emit();
  }

  handleCancel(): void {
    this.onCancel.emit();
  }
}
