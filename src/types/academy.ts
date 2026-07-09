export interface Batch {
  id: string;
  academy_id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  status: string;
  player_count: number;
  created_at: string;
  updated_at: string;
}

export interface BatchPlayer {
  id: string;
  batch_id: string;
  player_user_id: string;
  status: string;
  joined_at: string;
  email: string;
  name: string;
  cric_id: string;
  profile_image_url: string | null;
}

export interface CreateBatchRequest {
  name: string;
}

// A player within an academy. `is_assigned` distinguishes players placed in a
// batch from unassigned (coach-linked but not yet in a batch) players.
export interface AcademyPlayer {
  id: string;
  batch_id: string | null;
  is_assigned: boolean;
  player_user_id: string;
  status: string;
  joined_at: string;
  email: string;
  name: string;
  cric_id: string;
  profile_image_url: string | null;
}

// UI shape for an unassigned player shown on the Players screen.
export interface CoachPlayer {
  player_id: string;
  name: string;
  cric_id: string;
  profile_image_url: string | null;
}

export interface JoinRequestItem {
  id: string;
  academy_id: string;
  player_user_id: string;
  target_coach_id: string;
  status: string;
  requested_at: string;
  resolved_at: string | null;
  email: string;
  name: string;
  cric_id: string;
  coach_code: string;
  profile_image_url: string | null;
}
