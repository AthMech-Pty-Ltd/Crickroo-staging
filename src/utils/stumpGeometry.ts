export interface BBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

export interface Detection {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  score: number;
  class_id: number;
}

const SINGLE_STUMP_WIDTH_CM = 22.86;
const FULL_STUMP_GROUP_WIDTH_CM = 71.12;
const CENTER_TOLERANCE_RATIO = 0.1;
const GOOD_GAP_RATIO = 0.6;

const WIDTH_RATIO = FULL_STUMP_GROUP_WIDTH_CM / SINGLE_STUMP_WIDTH_CM;

function getWidth(b: BBox) {
  return Math.max(0, b.xmax - b.xmin);
}

function getCenterX(b: BBox) {
  return (b.xmin + b.xmax) / 2;
}

export function isInside(inner: BBox, outer: BBox) {
  // Relaxed check: instead of requiring the entire AI box to be strictly inside
  // the guide box, we just require the center of the detection to be inside.
  // This prevents AI bounding box jitter (e.g. grabbing a bit of grass above the stump)
  // from falsely discarding perfectly valid detections.
  const cx = (inner.xmin + inner.xmax) / 2;
  const cy = (inner.ymin + inner.ymax) / 2;

  // Add a 10% padding margin so it's even more forgiving
  const marginX = (outer.xmax - outer.xmin) * 0.1;
  const marginY = (outer.ymax - outer.ymin) * 0.1;

  return (
    cx >= outer.xmin - marginX &&
    cx <= outer.xmax + marginX &&
    cy >= outer.ymin - marginY &&
    cy <= outer.ymax + marginY
  );
}

function expandFromWidth(singleBbox: BBox, guideBox: BBox): BBox {
  const finalWidth = getWidth(singleBbox) * WIDTH_RATIO;
  const singleCx = getCenterX(singleBbox);
  const guideCx = getCenterX(guideBox);
  const tolerance = getWidth(guideBox) * CENTER_TOLERANCE_RATIO;

  let finalX1, finalX2;
  if (singleCx < guideCx - tolerance) {
    finalX1 = singleBbox.xmin;
    finalX2 = singleBbox.xmin + finalWidth;
  } else if (singleCx > guideCx + tolerance) {
    finalX2 = singleBbox.xmax;
    finalX1 = singleBbox.xmax - finalWidth;
  } else {
    finalX1 = singleCx - finalWidth / 2;
    finalX2 = singleCx + finalWidth / 2;
  }

  return {
    xmin: finalX1,
    ymin: singleBbox.ymin,
    xmax: finalX2,
    ymax: singleBbox.ymax,
  };
}

function expandTwoFromWidth(singleBboxes: BBox[], guideBox: BBox): BBox {
  const sorted = [...singleBboxes].sort(
    (a, b) => getCenterX(a) - getCenterX(b),
  );
  const left = sorted[0];
  const right = sorted[1];

  const avgWidth = Math.max(1, (getWidth(left) + getWidth(right)) / 2);
  const gapPx = Math.max(0, right.xmin - left.xmax);
  const gapRatio = gapPx / avgWidth;

  const finalY1 = Math.min(left.ymin, right.ymin);
  const finalY2 = Math.max(left.ymax, right.ymax);

  if (gapRatio >= GOOD_GAP_RATIO) {
    return {
      xmin: left.xmin,
      ymin: finalY1,
      xmax: right.xmax,
      ymax: finalY2,
    };
  }

  const pairX1 = Math.min(left.xmin, right.xmin);
  const pairX2 = Math.max(left.xmax, right.xmax);
  const pairCx = (pairX1 + pairX2) / 2;

  const finalWidth = avgWidth * WIDTH_RATIO;
  const guideCx = getCenterX(guideBox);
  const tolerance = getWidth(guideBox) * CENTER_TOLERANCE_RATIO;

  let finalX1, finalX2;
  if (pairCx < guideCx - tolerance) {
    finalX1 = pairX1;
    finalX2 = pairX1 + finalWidth;
  } else if (pairCx > guideCx + tolerance) {
    finalX2 = pairX2;
    finalX1 = pairX2 - finalWidth;
  } else {
    finalX1 = pairCx - finalWidth / 2;
    finalX2 = pairCx + finalWidth / 2;
  }

  return {
    xmin: finalX1,
    ymin: finalY1,
    xmax: finalX2,
    ymax: finalY2,
  };
}

export function processStumpBox(
  detections: Detection[],
  guideBox: BBox,
): { bbox: BBox; confidence: number; source: string } | null {
  // NOTE: We do NOT filter by isInside here. The crop region fed to the model
  // is already centred on this guide box, so any detection is spatially relevant.
  // Applying isInside with screen-coordinate mapping on a large crop causes false
  // rejections because the mapped coordinates have precision errors relative to the
  // small guide box dimensions.

  const stumpDets = detections.filter(d => d.class_id === 0);
  const singleDets = detections.filter(d => d.class_id === 1);

  let finalBbox: BBox | null = null;
  let confidence = 0;
  let source = '';

  if (stumpDets.length >= 1 && singleDets.length === 0) {
    // Pick the highest-confidence full-stump detection
    const best = stumpDets.sort((a, b) => b.score - a.score)[0];
    finalBbox = {
      xmin: best.xmin,
      ymin: best.ymin,
      xmax: best.xmax,
      ymax: best.ymax,
    };
    confidence = best.score;
    source = 'detected_full_stump';
  } else if (stumpDets.length === 0 && singleDets.length === 1) {
    finalBbox = expandFromWidth(singleDets[0], guideBox);
    confidence = singleDets[0].score;
    source = 'expanded_from_single_stump';
  } else if (stumpDets.length === 0 && singleDets.length >= 2) {
    finalBbox = expandTwoFromWidth([singleDets[0], singleDets[1]], guideBox);
    confidence = Math.min(singleDets[0].score, singleDets[1].score);
    source = 'expanded_two_single_stumps';
  }

  if (!finalBbox) return null;

  return { bbox: finalBbox, confidence, source };
}
