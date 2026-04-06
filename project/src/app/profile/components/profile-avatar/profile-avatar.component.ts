import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-avatar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-avatar.component.html',
  styleUrl: './profile-avatar.component.scss'
})
export class ProfileAvatarComponent {
  avatarUrl = input<string>('');
  size = input<'small' | 'medium' | 'large'>('medium');

  avatarChange = output<string>();

  isEditing = signal(false);
  editingUrl = signal('');

  getInitials(): string {
    // Placeholder - no name provided in this component
    return '?';
  }

  startEditing(): void {
    this.editingUrl.set(this.avatarUrl());
    this.isEditing.set(true);
  }

  saveEdit(): void {
    const url = this.editingUrl().trim();
    if (url) {
      this.avatarChange.emit(url);
    }
    this.isEditing.set(false);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  useDefault(): void {
    this.avatarChange.emit('');
    this.isEditing.set(false);
  }
}