// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  picture?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}
