import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/profile.model';

@Component({
  selector: 'app-profile-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-select.component.html',
  styleUrl: './profile-select.component.scss'
})
export class ProfileSelectPageComponent implements OnInit {
  private profileService = inject(ProfileService);
  private router = inject(Router);

  profiles = this.profileService.profiles;
  selectedProfile = this.profileService.selectedProfile;

  ngOnInit(): void {
    this.profileService.loadProfiles();
  }

  onSelectProfile(profile: Profile): void {
    this.profileService.selectProfile(profile);
  }

  onContinue(): void {
    if (this.selectedProfile()) {
      this.router.navigate(['/catalog']);
    }
  }

  getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
