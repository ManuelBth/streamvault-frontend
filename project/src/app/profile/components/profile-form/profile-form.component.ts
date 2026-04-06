import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Profile, CreateProfileRequest, UpdateProfileRequest } from '../../models/profile.model';
import { ProfileAvatarComponent } from '../profile-avatar/profile-avatar.component';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ProfileAvatarComponent],
  templateUrl: './profile-form.component.html',
  styleUrl: './profile-form.component.scss'
})
export class ProfileFormComponent {
  profile = input<Profile | null>(null);
  isEditing = input<boolean>(false);
  isLoading = input<boolean>(false);

  formSubmit = output<CreateProfileRequest | UpdateProfileRequest>();
  formCancel = output<void>();

  isSaving = signal(false);

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      avatarUrl: ['']
    });
  }

  ngOnInit(): void {
    const existingProfile = this.profile();
    if (existingProfile) {
      this.form.patchValue({
        name: existingProfile.name,
        avatarUrl: existingProfile.avatarUrl || ''
      });
    }
  }

  onAvatarChange(url: string): void {
    this.form.patchValue({ avatarUrl: url });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.form.value;

    const request: CreateProfileRequest | UpdateProfileRequest = {
      name: formValue.name,
      ...(formValue.avatarUrl && { avatarUrl: formValue.avatarUrl })
    };

    this.formSubmit.emit(request);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  get nameControl() {
    return this.form.get('name');
  }

  get nameError(): string {
    const control = this.nameControl;
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'El nombre es requerido';
      if (control.errors['maxlength']) return 'Máximo 50 caracteres';
    }
    return '';
  }
}