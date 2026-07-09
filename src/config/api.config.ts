import Config from 'react-native-config';

const BASE_URL = Config.API_BASE_URL;
console.log('BASE_URL FROM CONFIG:', Config.API_BASE_URL);
console.log('FINAL BASE_URL:', BASE_URL);
const TIMEOUT = Number(Config.API_TIMEOUT) || 10000;

export const API_CONFIG = {
  BASE_URL: BASE_URL,
  TIMEOUT: TIMEOUT,
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      SOCIAL_LOGIN: '/auth/social-login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      SEND_OTP: '/auth/send-otp',
      VERIFY_OTP: '/auth/verify-otp',
      VERIFY_RESET_OTP: '/auth/verify-reset-otp',
    },
    SESSIONS: '/sessions',
    SESSIONS_LATEST_DATE: '/sessions/latest-date',
    SESSIONS_RECENT_BY_USER: (userId: string) =>
      `/sessions/recent-by-user/${userId}`,
    SESSIONS_DATES_BY_USER: (userId: string) =>
      `/sessions/dates-by-user/${userId}`,
    SESSION_CONFIG: (id: string) => `/sessions/${id}/config`,
    SESSION_END: (id: string) => `/sessions/${id}/end`,
    SESSION_HIGHLIGHTS: (id: string) => `/sessions/${id}/highlights`,
    SESSION_PLAYERS: (id: string) => `/sessions/${id}/players`,
    UPLOAD_CLIP_URLS: '/upload/clip-urls',
    UPLOAD_FACE_URLS: '/upload/face-urls',
    UPLOAD_PROFILE_IMAGE_URL: '/upload/profile-image-url',
    UPLOAD_STUMP_DETECTION_URL: '/upload/stump-detection-url',
    FAVOURITES: '/favourites',
    DEVICE_TOKEN: '/user/device-token',
    USER_PROFILE: '/user/profile',
    USER_PLAN: '/user/me/plan',
    PAYMENTS_PURCHASE_PLAN: '/payments/purchase-plan',
    PAYMENTS_PORTAL_SESSION: '/payments/portal-session',
    PAYMENTS_SUBSCRIPTION: '/payments/subscription',
    NOTIFICATIONS: '/notifications',
    HIGHLIGHTS_GENERATE: '/highlights/generate',
    BALL_TRAJECTORY: (ballId: string) => `/balls/${ballId}/trajectory`,
    BALL_OUTCOME: (ballId: string) => `/balls/${ballId}/outcome`,
    BALL_DETAIL: (ballId: string) => `/balls/${ballId}`,
    BALL_PLAYERS: (ballId: string) => `/balls/${ballId}/players`,
    BALL_NOTES: (ballId: string) => `/balls/${ballId}/notes`,
    SEARCH_PLAYERS: '/search',
    PLAYER_LINK_COACH: '/player/link-coach',
    PLAYER_UNLINK_COACH: '/player/unlink-coach',
    COACH_BATCHES: '/coach/batches',
    USER_DASHBOARD: '/users/me/dashboard',
    POLICY: {
      STATUS: '/policy/status',
      ACCEPT: '/policy/accept',
    },
    USER_PITCH_MAP: '/users/me/pitch-map',
    USER_BEEHIVE: '/users/me/beehive',
    USER_RELEASE_POINTS: '/users/me/release-points',
    USER_SPEED_DISTRIBUTION: '/users/me/speed-distribution',
    ONBOARDING: {
      STATUS: '/onboarding/status',
      SUMMARY: '/onboarding/summary',
      PERSONAL_PROFILE: '/onboarding/personal-profile',
      CRICKET_PROFILE: '/onboarding/cricket-profile',
      PLAYING_STYLE: '/onboarding/playing-style',
      ACADEMY_DETAILS: '/onboarding/academy-details',
      COMPLETE: '/onboarding/complete',
    },
    ACADEMY: {
      BATCHES: (academyId: string) => `/admin/academies/${academyId}/batches`,
      BATCH: (academyId: string, batchId: string) =>
        `/admin/academies/${academyId}/batches/${batchId}`,
      PLAYERS: (academyId: string) => `/admin/academies/${academyId}/players`,
      BATCH_PLAYERS: (academyId: string, batchId: string) =>
        `/admin/academies/${academyId}/batches/${batchId}/players`,
      BATCH_PLAYER: (academyId: string, batchId: string, linkId: string) =>
        `/admin/academies/${academyId}/batches/${batchId}/players/${linkId}`,
      PLAYER: (academyId: string, playerUserId: string) =>
        `/admin/academies/${academyId}/players/${playerUserId}`,
      PLAYER_MOVE_BATCH: (academyId: string, playerUserId: string) =>
        `/admin/academies/${academyId}/players/${playerUserId}/move-batch`,
      JOIN_REQUESTS: '/coach/join-requests',
      JOIN_REQUEST_APPROVE: (requestId: string) =>
        `/coach/join-requests/${requestId}/approve`,
      JOIN_REQUEST_REJECT: (requestId: string) =>
        `/coach/join-requests/${requestId}/reject`,
    },
  },
};
