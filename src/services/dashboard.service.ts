import apiClient from './api/apiClient';
import { API_CONFIG } from '../config/api.config';

export type DashboardMode = 'batting' | 'bowling';

export interface DashboardLengthCounts {
  short: number;
  good_length: number;
  full: number;
  yorker: number;
}

export interface DashboardOutcomeCounts {
  played: number;
  missed: number;
  left: number;
  bowled: number;
}

export interface DashboardResponse {
  user_id: string;
  mode: string;
  sessions_included: number;
  total_balls: number;
  total_time_minutes: number;
  avg_speed_kmph: number;
  peak_speed_kmph: number;
  length_counts: DashboardLengthCounts;
  outcome_counts: DashboardOutcomeCounts;
}

export type BallLengthFilter =
  | 'short'
  | 'good_length'
  | 'full'
  | 'yorker'
  | 'full_toss';
export type HitFilter = 'played' | 'missed' | 'left' | 'bowled';

export const ALL_LENGTH_FILTERS: BallLengthFilter[] = [
  'short',
  'good_length',
  'full',
  'yorker',
  'full_toss',
];

export const resolveLengthFilterValues = (
  value: BallLengthFilter,
): BallLengthFilter[] =>
  value === 'yorker' ? ['yorker', 'full_toss'] : [value];

export const isAllLengthFiltersActive = (
  lengthFilter: readonly BallLengthFilter[],
): boolean =>
  ALL_LENGTH_FILTERS.every(filterValue => lengthFilter.includes(filterValue));

export const getEffectiveLengthFilter = (
  lengthFilter: BallLengthFilter[],
): BallLengthFilter[] | undefined =>
  lengthFilter.length > 0 && !isAllLengthFiltersActive(lengthFilter)
    ? lengthFilter
    : undefined;

export const toggleLengthFilterValue = (
  previous: BallLengthFilter[],
  value: BallLengthFilter,
): BallLengthFilter[] => {
  const values = resolveLengthFilterValues(value);
  if (previous.length === 0 || isAllLengthFiltersActive(previous)) {
    return values;
  }

  const next = new Set(previous);
  const isSelected = values.every(filterValue => next.has(filterValue));

  values.forEach(filterValue => {
    if (isSelected) {
      next.delete(filterValue);
    } else {
      next.add(filterValue);
    }
  });

  return ALL_LENGTH_FILTERS.filter(filterValue => next.has(filterValue));
};

export interface GetDashboardParams {
  sessions?: number;
  mode: DashboardMode;
  length?: BallLengthFilter[] | null;
  hit?: HitFilter[] | null;
  cric_id?: string | null;
}

const buildStatsParams = ({
  sessions,
  mode,
  length,
  hit,
  cric_id,
}: GetDashboardParams): Record<string, string | number> => {
  const params: Record<string, string | number> = { mode };
  if (sessions != null) params.sessions = sessions;
  if (length && length.length > 0) params.length = length.join(',');
  if (hit && hit.length > 0) params.hit = hit.join(',');
  if (cric_id) params.cric_id = cric_id;
  return params;
};

export interface VizPoint {
  x: number;
  y: number;
}

export interface PitchMapBall {
  ball_id: string;
  outcome: string;
  norm: VizPoint;
}

export interface PitchMapResponse {
  user_id: string;
  sessions_included: number;
  total_balls: number;
  balls: PitchMapBall[];
}

export interface BeehiveBall {
  ball_id: string;
  image: VizPoint;
  world: VizPoint;
  norm: VizPoint;
}

export interface BeehiveResponse {
  user_id: string;
  sessions_included: number;
  total_balls: number;
  balls: BeehiveBall[];
}

export interface ReleasePointBall {
  ball_id: string;
  image: VizPoint;
  world: VizPoint;
  release_height_m: number;
  norm: VizPoint;
}

export interface ReleasePointsResponse {
  user_id: string;
  sessions_included: number;
  total_balls: number;
  avg_release_height_m: number;
  balls: ReleasePointBall[];
}

export interface SpeedBuckets {
  under_80: number;
  kmph_80_100: number;
  kmph_100_120: number;
  kmph_120_140: number;
  over_140: number;
}

export interface SpeedDistributionResponse {
  user_id: string;
  sessions_included: number;
  total_balls: number;
  avg_speed_kmph: number;
  peak_speed_kmph: number;
  buckets: SpeedBuckets;
}

export const dashboardService = {
  getDashboard: async (
    args: GetDashboardParams,
  ): Promise<DashboardResponse> => {
    const response = await apiClient.get<DashboardResponse>(
      API_CONFIG.ENDPOINTS.USER_DASHBOARD,
      { params: buildStatsParams(args) },
    );
    return response.data;
  },

  getPitchMap: async (args: GetDashboardParams): Promise<PitchMapResponse> => {
    const response = await apiClient.get<PitchMapResponse>(
      API_CONFIG.ENDPOINTS.USER_PITCH_MAP,
      { params: buildStatsParams(args) },
    );
    return response.data;
  },

  getBeehive: async (args: GetDashboardParams): Promise<BeehiveResponse> => {
    const response = await apiClient.get<BeehiveResponse>(
      API_CONFIG.ENDPOINTS.USER_BEEHIVE,
      { params: buildStatsParams(args) },
    );
    return response.data;
  },

  getReleasePoints: async (
    args: GetDashboardParams,
  ): Promise<ReleasePointsResponse> => {
    const response = await apiClient.get<ReleasePointsResponse>(
      API_CONFIG.ENDPOINTS.USER_RELEASE_POINTS,
      { params: buildStatsParams(args) },
    );
    return response.data;
  },

  getSpeedDistribution: async (
    args: GetDashboardParams,
  ): Promise<SpeedDistributionResponse> => {
    const response = await apiClient.get<SpeedDistributionResponse>(
      API_CONFIG.ENDPOINTS.USER_SPEED_DISTRIBUTION,
      { params: buildStatsParams(args) },
    );
    return response.data;
  },
};
