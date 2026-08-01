export interface UserProfile {
  id: number;
  dni: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}
