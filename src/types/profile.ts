import { CricketProfile } from './auth';

export interface PlayingStyle {
  battingHand: 'right' | 'left';
  bowlingHand: 'right' | 'left';
  bowlingType: string;
}

export interface AcademyDetails {
  academyName: string;
  coachName: string;
  licenseNumber: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: CricketProfile;
  age?: number;
  height?: string;
  weight?: string;
  avatar?: string;
  playingStyle?: PlayingStyle;
  academy?: AcademyDetails;
}
