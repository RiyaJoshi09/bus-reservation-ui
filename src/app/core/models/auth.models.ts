export type Role =
  | 'USER'
  | 'TRIP_MANAGER'
  | 'BUS_MANAGER'
  | 'SUPER_MANAGER'
  | 'SUPER_ADMIN';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  username: string;
  oldPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: Role;
  passwordChangeRequired: boolean;
}

export interface ErrorResponse {
  timestamp: string;
  httpStatus: number;
  error: string;
  message: string;
}