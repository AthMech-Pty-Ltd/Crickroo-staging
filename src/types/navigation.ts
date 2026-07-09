export type RootScreen =
  | 'splash'
  | 'onboarding'
  | 'signin'
  | 'social_role'
  | 'registration'
  | 'reset_email'
  | 'dashboard'
  | 'session_selection'
  | 'session_details'
  | 'camera'
  | 'session_summary'
  | 'profile'
  | 'profile_details'
  | 'personal_profile'
  | 'face_recognition'
  | 'app_permissions'
  | 'cricket_profile'
  | 'playing_style'
  | 'highlight_playback'
  | 'highlight_reel'
  | 'help_support'
  | 'notifications'
  | 'custom_sessions';

export interface NavigationProps {
  currentScreen: RootScreen;
  navigate: (screen: RootScreen, params?: Record<string, unknown>) => void;
}
