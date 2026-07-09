import { UserRole, MessageResponse } from './auth';

export type { MessageResponse };

export type OnboardingStep = 'personal_profile' | 'face_recognition';

export interface OnboardingStatusResponse {
  onboarding_completed: boolean;
  current_step: OnboardingStep | null;
}

export interface PersonalProfileRequest {
  name: string;
  dob: string; // YYYY-MM-DD
  academy_name?: string;
  phone?: string;
  height_cm?: number;
  weight_kg?: number;
}

export interface CricketProfileRequest {
  role: string;
}

export interface PlayingStyleRequest {
  batting_hand: string;
  batting_position: string;
  bowling_arm: string;
  bowling_style: string;
}

export interface AcademyDetailsRequest {
  coach_license_code: string;
  academy_name: string;
}

export interface OnboardingUserResponse {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  username: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  phone?: string;
  location?: string;
  profile_image_url?: string;
  cricket_profile?: string;
  batting_hand?: string;
  batting_position?: string;
  bowling_arm?: string;
  bowling_style?: string;
  academy_name?: string;
  coach_license_code?: string;
  onboarding_completed: boolean;
  onboarding_step: OnboardingStep;
  created_at: string;
  updated_at: string;
}

export interface LinkedCoach {
  coach_profile_id: string;
  coach_user_id: string;
  name: string;
  coach_code: string;
  academy_id: string;
  academy_name: string;
  batch_name: string | null;
}

export interface OnboardingSummaryResponse {
  personalProfile?: {
    name: string;
    dob: string; // YYYY-MM-DD
    height_cm: number;
    weight_kg: number;
  } | null;
  cricketProfile?: {
    role: string;
    batting_hand: string;
    batting_position: string;
    bowling_arm: string;
    bowling_style: string;
  } | null;
  academyDetails?: {
    coach_license_code: string;
    academy_name: string;
  } | null;
  linkedCoach?: LinkedCoach | null;
  profileImageUrl?: string;
  faceImageFrontview?: string;
  faceImageSideview1?: string;
  faceImageSideview2?: string;
}
