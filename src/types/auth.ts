export type UserRole = 'player' | 'coach' | 'head_coach' | 'academy_admin' | 'freelance_coach';
export type CricketProfile = 'all_rounder' | 'batsman' | 'bowler';
export type AppMode = 'coach' | 'player';

export const KNOWN_USER_ROLES: readonly UserRole[] = [
  'player',
  'coach',
  'head_coach',
  'academy_admin',
  'freelance_coach',
];

export const isKnownRole = (role: unknown): role is UserRole =>
  typeof role === 'string' &&
  (KNOWN_USER_ROLES as readonly string[]).includes(role);

export const isCoachRole = (role: UserRole | undefined | null): boolean =>
  role === 'coach' ||
  role === 'head_coach' ||
  role === 'academy_admin' ||
  role === 'freelance_coach';

export const canManageRoster = (role: UserRole | undefined | null): boolean =>
  role === 'head_coach' ||
  role === 'academy_admin' ||
  role === 'freelance_coach';

export interface Academy {
  id: string;
  name: string;
  is_freelance: boolean;
  is_active: boolean;
  billing_plan: string;
}

export interface User {
  id: string;
  cric_id?: string;
  coach_code?: string;
  academy_id?: string;
  academy?: Academy;
  email: string;
  role: UserRole;
  name: string;
  username: string | null;
  onboarding_completed: boolean;
  onboarding_step: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  is_new_user?: boolean;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SocialLoginRequest {
  id_token: string;
  role?: 'player' | 'coach';
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface ApiError {
  detail: {
    loc: (string | number)[];
    msg: string;
    type: string;
  }[];
}

export interface MessageResponse {
  message: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  new_password: string;
}

export interface RegistrationData {
  email: string;
  password?: string;
  otp?: string;
  role: 'player' | 'coach';
  alsoPlayer: boolean;
  name: string;
  username: string;
  dob: string; // YYYY-MM-DD
  countryCode: string;
  phoneNumber: string;
  height: string;
  heightUnit: 'ft/in' | 'cm';
  weight: string;
  weightUnit: 'kg' | 'lbs';
  facePhotos: string[];
  permissions: {
    camera: boolean;
    location: boolean;
  };
  cricketProfile: CricketProfile | string | null;
  battingHand: 'right' | 'left';
  battingPosition: string;
  bowlingArm: 'right' | 'left';
  bowlingStyle: string;
  academyName: string;
  academyCode: string;
  coachCode: string;
}
