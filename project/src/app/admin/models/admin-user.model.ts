export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  isVerified: boolean;
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  size: number;
}