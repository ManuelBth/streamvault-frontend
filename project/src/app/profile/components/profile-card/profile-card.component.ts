import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Profile } from '../../models/profile.model';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss'
})
export class ProfileCardComponent {
  profile = input.required<Profile>();
  isSelected = input<boolean>(false);
  size = input<'small' | 'medium' | 'large'>('medium');

  onSelect = output<Profile>();
  onEdit = output<Profile>();
  onDelete = output<Profile>();

  handleSelect(): void {
    this.onSelect.emit(this.profile());
  }

  handleEdit(event: Event): void {
    event.stopPropagation();
    this.onEdit.emit(this.profile());
  }

  handleDelete(event: Event): void {
    event.stopPropagation();
    this.onDelete.emit(this.profile());
  }

  getInitials(): string {
    return this.profile().name.charAt(0).toUpperCase();
  }

  getAvatarUrl(): string | null {
    return this.profile().avatarUrl;
  }
}