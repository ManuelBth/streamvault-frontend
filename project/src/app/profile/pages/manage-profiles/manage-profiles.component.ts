import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { Profile, CreateProfileRequest, UpdateProfileRequest } from '../../models/profile.model';
import { ProfileFormComponent } from '../../components/profile-form/profile-form.component';

@Component({
  selector: 'app-manage-profiles',
  standalone: true,
  imports: [CommonModule, ProfileFormComponent],
  templateUrl: './manage-profiles.component.html',
  styleUrl: './manage-profiles.component.scss'
})
export class ManageProfilesComponent implements OnInit {
  private profileService = inject(ProfileService);

  profiles = this.profileService.profiles;
  selectedProfile = this.profileService.selectedProfile;
  isLoading = this.profileService.isLoading;
  canAddProfile = this.profileService.canAddProfile;

  showCreateForm = signal(false);
  editingProfile = signal<Profile | null>(null);
  showDeleteConfirm = signal<Profile | null>(null);

  ngOnInit(): void {
    this.profileService.loadProfiles();
  }

  onSelectProfile(profile: Profile): void {
    this.profileService.selectProfile(profile);
  }

  onEditProfile(profile: Profile): void {
    this.editingProfile.set(profile);
    this.showCreateForm.set(true);
  }

  onDeleteProfile(profile: Profile): void {
    this.showDeleteConfirm.set(profile);
  }

  confirmDelete(): void {
    const profile = this.showDeleteConfirm();
    if (profile) {
      this.profileService.deleteProfile(profile.id).subscribe({
        next: () => this.showDeleteConfirm.set(null),
        error: (err) => console.error('Error deleting profile:', err)
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(null);
  }

  onCreateProfile(request: CreateProfileRequest): void {
    this.profileService.createProfile(request).subscribe({
      next: (newProfile) => {
        this.showCreateForm.set(false);
        this.profileService.selectProfile(newProfile);
      },
      error: (err) => console.error('Error creating profile:', err)
    });
  }

  onFormSubmit(request: CreateProfileRequest | UpdateProfileRequest): void {
    if (this.editingProfile()) {
      const updateRequest: UpdateProfileRequest = {
        name: request.name,
        avatarUrl: request.avatarUrl
      };
      this.profileService.updateProfile(this.editingProfile()!.id, updateRequest).subscribe({
        next: () => {
          this.showCreateForm.set(false);
          this.editingProfile.set(null);
        },
        error: (err) => console.error('Error updating profile:', err)
      });
    } else {
      const name = request.name ?? '';
      const createRequest: CreateProfileRequest = {
        name,
        avatarUrl: request.avatarUrl
      };
      this.onCreateProfile(createRequest);
    }
  }

  openCreateForm(): void {
    this.editingProfile.set(null);
    this.showCreateForm.set(true);
  }

  closeForm(): void {
    this.showCreateForm.set(false);
    this.editingProfile.set(null);
  }

  get limitMessage(): string {
    return this.profileService.getProfileLimitMessage();
  }

  getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
