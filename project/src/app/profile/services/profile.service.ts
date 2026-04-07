import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ConfigService } from '../../shared/services/config.service';
import { Profile, CreateProfileRequest, UpdateProfileRequest } from '../models/profile.model';
import { setActiveProfile } from '../../shared/store/app.store';

export type LoadingState<T> = {
  state: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
};

const PROFILE_STORAGE_KEY = 'streamvault_active_profile';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiUrl = `${this.configService.apiUrl}/profiles`;

  // Estado de perfiles
  private _profiles = signal<LoadingState<Profile[]>>({ state: 'idle', data: undefined });
  private _selectedProfile = signal<Profile | null>(null);

  // Exposición readonly
  readonly profiles = this._profiles.asReadonly();
  readonly selectedProfile = this._selectedProfile.asReadonly();

  // Computed states
  private isErrorState<T>(state: LoadingState<T>): boolean {
    return state.state === 'error';
  }

  readonly isLoading = computed(() => this._profiles().state === 'loading');
  readonly hasError = computed(() => this.isErrorState(this._profiles()));
  readonly errorMessage = computed(() => 
    this._profiles().state === 'error' ? this._profiles().error ?? null : null
  );

  readonly profileCount = computed(() => this._profiles().data?.length ?? 0);
  readonly hasProfiles = computed(() => (this._profiles().data?.length ?? 0) > 0);
  readonly canAddProfile = computed(() => (this._profiles().data?.length ?? 0) < 3);

  constructor() {
    this.loadActiveProfileFromStorage();
  }

  // ==================== CRUD Operations ====================

  getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.apiUrl);
  }

  loadProfiles(): void {
    this._profiles.set({ state: 'loading', data: undefined });

    this.getProfiles().subscribe({
      next: (profiles) => {
        this._profiles.set({ state: 'success', data: profiles });
        
        // Validar que el perfil almacenado existe en la respuesta de la API
        const storedProfile = this._selectedProfile();
        if (storedProfile) {
          const profileExists = profiles.some(p => p.id === storedProfile.id);
          if (profileExists) {
            // El perfil almacenado existe, mantenerlo seleccionado
            const matchedProfile = profiles.find(p => p.id === storedProfile.id)!;
            this._selectedProfile.set(matchedProfile);
            setActiveProfile(matchedProfile);
          } else {
            // El perfil almacenado no existe más (otro usuario), limpiarlo
            this.selectProfile(null);
          }
        }
        
        // Si hay perfiles pero ninguno seleccionado, seleccionar el primero
        if (profiles.length > 0 && !this._selectedProfile()) {
          this.selectProfile(profiles[0]);
        }
      },
      error: (err) => this._profiles.set({ state: 'error', error: err.message })
    });
  }

  createProfile(request: CreateProfileRequest): Observable<Profile> {
    return this.http.post<Profile>(this.apiUrl, request).pipe(
      tap((newProfile) => {
        const currentProfiles = this._profiles().data ?? [];
        this._profiles.set({ 
          state: 'success', 
          data: [...currentProfiles, newProfile] 
        });
      })
    );
  }

  updateProfile(id: string, request: UpdateProfileRequest): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/${id}`, request).pipe(
      tap((updatedProfile) => {
        const currentProfiles = this._profiles().data ?? [];
        const updatedList = currentProfiles.map(p => 
          p.id === id ? updatedProfile : p
        );
        this._profiles.set({ state: 'success', data: updatedList });

        // Si es el perfil activo, actualizar también
        if (this._selectedProfile()?.id === id) {
          this._selectedProfile.set(updatedProfile);
          this.saveActiveProfileToStorage(updatedProfile);
        }
      })
    );
  }

  deleteProfile(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentProfiles = this._profiles().data ?? [];
        const filteredList = currentProfiles.filter(p => p.id !== id);
        this._profiles.set({ state: 'success', data: filteredList });

        // Si eliminamos el perfil activo, seleccionar el primero disponible
        if (this._selectedProfile()?.id === id) {
          const newSelected = filteredList.length > 0 ? filteredList[0] : null;
          this.selectProfile(newSelected);
        }
      })
    );
  }

  // ==================== Active Profile Management ====================

  selectProfile(profile: Profile | null): void {
    this._selectedProfile.set(profile);
    setActiveProfile(profile);
    
    if (profile) {
      this.saveActiveProfileToStorage(profile);
    } else {
      this.clearActiveProfileFromStorage();
    }
  }

  getProfileById(id: string): Profile | undefined {
    return this._profiles().data?.find(p => p.id === id);
  }

  // ==================== LocalStorage Persistence ====================

  private loadActiveProfileFromStorage(): void {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const profile = JSON.parse(stored) as Profile;
        this._selectedProfile.set(profile);
        setActiveProfile(profile);
      }
    } catch (error) {
      console.warn('Failed to load active profile from storage:', error);
      this.clearActiveProfileFromStorage();
    }
  }

  private saveActiveProfileToStorage(profile: Profile): void {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.warn('Failed to save active profile to storage:', error);
    }
  }

  private clearActiveProfileFromStorage(): void {
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear active profile from storage:', error);
    }
  }

  // ==================== Utility Methods ====================

  canDeleteProfile(): boolean {
    const profiles = this._profiles().data ?? [];
    return profiles.length > 1;
  }

  getProfileLimitMessage(): string {
    const count = this.profileCount();
    if (count >= 3) {
      return 'Máximo 3 perfiles permitidos';
    }
    return '';
  }
}