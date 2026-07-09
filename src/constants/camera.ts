import { colors } from '../theme/colors';

export const CAMERA_CONFIG = {
  CONF_THRESHOLD: 0.5,
  IOU_THRESHOLD: 0.45,
  MODEL_SIZE: 960,
  NUM_ANCHORS: 18900,
  NUM_COORDS: 4,
  NUM_CLASSES: 2,
};

export const CLASS_LABELS: Record<number, string> = {
  0: 'stump',
  1: 'stump_single',
};

export const CLASS_COLORS: Record<number, string> = {
  0: colors.success.main,
  1: colors.semantic.blue50,
};
