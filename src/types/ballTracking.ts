export interface TrajectoryPoint {
  frame: number;
  t_ms: number;
  image_norm: { x: number | null; y: number | null } | null;
  world: { x: number; y: number; z: number };
  ball_detected: boolean;
  phase: string;
}

export interface BallTrajectoryResponse {
  ball_id: string;
  ball_number: number;
  video: {
    fps: number;
    display_w: number;
    display_h: number;
  };
  key_frames: {
    release_frame: number;
    bounce_frame: number;
    stumps_frame: number;
  };
  display_stats: {
    speed_kmph: number;
    deviation_degrees: number;
  };
  trajectory: TrajectoryPoint[];
}

export interface BallNote {
  id: string;
  note: string;
  coach_id: string;
  coach_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface BallNoteResponse {
  ball_id: string;
  note: BallNote;
  updated: boolean;
}

export interface BallDetail {
  ball_id: string;
  ball_number: number;
  session_id: string;
  mode: string;
  pitch_map: { outcome: string | null } | null;
  metrics: {
    speed_at_bounce_kmph: number | null;
    speed_after_bounce_kmph: number | null;
    release_to_bounce_distance_m: number | null;
    deviation_degrees: number | null;
  } | null;
  outcome: { hit: string | null; wagonwheel: string | null } | null;
  batter_id: string | null;
  bowler_id: string | null;
  notes?: BallNote[];
}

export function buildBallId(
  cricId: string,
  sessionNumber: number,
  ballNumber: number,
): string {
  return `${cricId}_session_${sessionNumber}_ball_${ballNumber}`;
}
