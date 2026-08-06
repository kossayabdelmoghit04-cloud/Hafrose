import { User } from './models';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PasswordResetPayload {
  email: string;
}
