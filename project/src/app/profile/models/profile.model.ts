export interface Profile {
  id: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface CreateProfileRequest {
  name: string;
  avatarUrl?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string;
}