// Per-graph viewport offsets (fractions of the 402×402 background image)
// defining the "live coordinate zone" where ball dots can actually appear.
// Outside this zone is dead area (sky, grass, decorative borders).
//
// Values come from the dashboard frontend integration doc. Update ONLY if
// the background images themselves are recropped/replaced.

export interface Viewport {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export const VIEWPORTS: Record<
  'pitchMap' | 'beehive' | 'releasePoints',
  Viewport
> = {
  pitchMap: {
    left: 0.0, // 0px   / 402
    right: 1.0, // 402px / 402
    top: 0.2786, // 112px / 402  (102 + 10)
    bottom: 1.0, // 402px / 402
  },
  beehive: {
    left: 0.1343, // 54px  / 402
    right: 0.8657, // 348px / 402
    top: 0.2836, // 114px / 402
    bottom: 0.8806, // 354px / 402
  },
  releasePoints: {
    left: 0.1194, // 48px  / 402
    right: 0.8806, // 354px / 402
    top: 0.0597, // 24px  / 402
    bottom: 0.9005, // 362px / 402
  },
};

export function placeDot(
  norm: { x: number; y: number },
  viewport: Viewport,
): { left: `${number}%`; top: `${number}%` } {
  const liveWidth = viewport.right - viewport.left;
  const liveHeight = viewport.bottom - viewport.top;
  return {
    left: `${(viewport.left + norm.x * liveWidth) * 100}%`,
    top: `${(viewport.top + (1 - norm.y) * liveHeight) * 100}%`,
  };
}
