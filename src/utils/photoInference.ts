import RNFS from 'react-native-fs';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import { processStumpBox, type BBox, type Detection } from './stumpGeometry';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const jpeg = require('jpeg-js') as {
  decode: (
    data: ArrayBuffer,
    opts?: { useTArray?: boolean },
  ) => { width: number; height: number; data: Uint8Array };
};

// ─── Dedicated JS-thread TFLite interpreter ───────────────────────────────────
let _photoModel: Awaited<ReturnType<typeof loadTensorflowModel>> | null = null;

export async function initPhotoModel(
  asset: Parameters<typeof loadTensorflowModel>[0],
): Promise<void> {
  if (_photoModel) return;
  console.log('[PhotoInference] Loading dedicated JS-thread model...');
  _photoModel = await loadTensorflowModel(asset);
  console.log('[PhotoInference] JS-thread model ready.');
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MODEL_SIZE = 960;
const NUM_ANCHORS = 18900;
const NUM_COORDS = 4;
const NUM_CLASSES = 2;
const CONF_THRESHOLD = 0.5;
const IOU_THRESHOLD = 0.45;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function iou(a: Detection, b: Detection): number {
  const x1 = Math.max(a.xmin, b.xmin);
  const y1 = Math.max(a.ymin, b.ymin);
  const x2 = Math.min(a.xmax, b.xmax);
  const y2 = Math.min(a.ymax, b.ymax);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const areaA = (a.xmax - a.xmin) * (a.ymax - a.ymin);
  const areaB = (b.xmax - b.xmin) * (b.ymax - b.ymin);
  return inter / (areaA + areaB - inter + 1e-6);
}

function applyNMS(dets: Detection[]): Detection[] {
  const result: Detection[] = [];
  const classes = [...new Set(dets.map(d => d.class_id))];
  for (const cls of classes) {
    let pool = dets
      .filter(d => d.class_id === cls)
      .sort((a, b) => b.score - a.score);
    while (pool.length > 0) {
      const best = pool.shift()!;
      result.push(best);
      pool = pool.filter(d => iou(best, d) < IOU_THRESHOLD);
    }
  }
  return result;
}

function base64ToBytes(base64: string): ArrayBuffer {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
  const b64 = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const byteLen = Math.floor((b64.length * 3) / 4);
  const bytes = new Uint8Array(byteLen);
  let p = 0;
  for (let i = 0; i < b64.length; i += 4) {
    const a = lookup[b64.charCodeAt(i)];
    const b = lookup[b64.charCodeAt(i + 1)];
    const c = lookup[b64.charCodeAt(i + 2)];
    const d = lookup[b64.charCodeAt(i + 3)];
    bytes[p++] = (a << 2) | (b >> 4);
    if (b64[i + 2] !== '=') bytes[p++] = ((b & 0xf) << 4) | (c >> 2);
    if (b64[i + 3] !== '=') bytes[p++] = ((c & 0x3) << 6) | d;
  }
  return bytes.buffer.slice(0, p) as ArrayBuffer;
}

// Bilinear interpolation for smooth upscaling (matches cv2.INTER_LINEAR)
function getPixelBilinear(
  data: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
): [number, number, number] {
  const x1 = Math.floor(x);
  const y1 = Math.floor(y);
  const x2 = Math.min(width - 1, x1 + 1);
  const y2 = Math.min(height - 1, y1 + 1);

  const dx = x - x1;
  const dy = y - y1;

  const idx11 = (y1 * width + x1) * 4;
  const idx21 = (y1 * width + x2) * 4;
  const idx12 = (y2 * width + x1) * 4;
  const idx22 = (y2 * width + x2) * 4;

  const r =
    (data[idx11] * (1 - dx) + data[idx21] * dx) * (1 - dy) +
    (data[idx12] * (1 - dx) + data[idx22] * dx) * dy;
  const g =
    (data[idx11 + 1] * (1 - dx) + data[idx21 + 1] * dx) * (1 - dy) +
    (data[idx12 + 1] * (1 - dx) + data[idx22 + 1] * dx) * dy;
  const b =
    (data[idx11 + 2] * (1 - dx) + data[idx21 + 2] * dx) * (1 - dy) +
    (data[idx12 + 2] * (1 - dx) + data[idx22 + 2] * dx) * dy;

  return [r, g, b];
}

export interface PhotoInferenceResult {
  detections: Detection[];
  result: ReturnType<typeof processStumpBox>;
  cropBoxScreen: BBox;
}

// ─── Main inference function ──────────────────────────────────────────────────
// Generic photo-based stump inference. Caller passes the guide box of whichever
// stump (striker / non-striker) they want detected.
export async function runStumpPhotoInference(
  photoPath: string,
  photoWidth: number,
  photoHeight: number,
  guideBox: BBox,
  screenWidth: number,
  screenHeight: number,
): Promise<PhotoInferenceResult> {
  if (!_photoModel) throw new Error('[PhotoInference] Model not initialised.');
  const model = _photoModel;

  // 1. Handle EXIF Rotation dimensions
  const isDevicePortrait = screenHeight > screenWidth;
  const isPhotoLandscape = photoWidth > photoHeight;

  // The logically upright dimensions as displayed on the screen
  const displayW =
    isDevicePortrait && isPhotoLandscape ? photoHeight : photoWidth;
  const displayH =
    isDevicePortrait && isPhotoLandscape ? photoWidth : photoHeight;
  const needsRotation = isDevicePortrait && isPhotoLandscape;

  // 2. Map Screen bounds -> Display Photo bounds
  const sar = screenWidth / screenHeight;
  const dar = displayW / displayH;
  let visibleW = displayW;
  let visibleH = displayH;
  if (dar > sar) visibleW = displayH * sar;
  else visibleH = displayW / sar;
  const screenOffsetX = (displayW - visibleW) / 2;
  const screenOffsetY = (displayH - visibleH) / 2;
  const screenScaleX = visibleW / screenWidth;
  const screenScaleY = visibleH / screenHeight;

  // 3. Guide Box -> Display Photo Pixels
  const frameX1 = screenOffsetX + guideBox.xmin * screenScaleX;
  const frameY1 = screenOffsetY + guideBox.ymin * screenScaleY;
  const frameX2 = screenOffsetX + guideBox.xmax * screenScaleX;
  const frameY2 = screenOffsetY + guideBox.ymax * screenScaleY;

  // 4. Crop padding. Horizontal only — vertical padding would pull the
  // neighbouring stump's guide box into this crop because the striker and
  // non-striker boxes are stacked close together on screen.
  const boxW = frameX2 - frameX1;
  const pad_x = boxW * 0.2;
  const pad_y = 0;

  const cropX1 = Math.max(0, Math.round(frameX1 - pad_x));
  const cropY1 = Math.max(0, Math.round(frameY1 - pad_y));
  const cropX2 = Math.min(displayW, Math.round(frameX2 + pad_x));
  const cropY2 = Math.min(displayH, Math.round(frameY2 + pad_y));

  const cropW = cropX2 - cropX1;
  const cropH = cropY2 - cropY1;

  // Screen Crop Box for UI overlay
  const screenCropX1 = (cropX1 - screenOffsetX) / screenScaleX;
  const screenCropY1 = (cropY1 - screenOffsetY) / screenScaleY;
  const screenCropX2 = (cropX2 - screenOffsetX) / screenScaleX;
  const screenCropY2 = (cropY2 - screenOffsetY) / screenScaleY;

  const cropBoxScreen: BBox = {
    xmin: screenCropX1,
    ymin: screenCropY1,
    xmax: screenCropX2,
    ymax: screenCropY2,
  };

  console.log(
    `[PhotoInference] Crop (Upright): X[${cropX1}-${cropX2}] Y[${cropY1}-${cropY2}] (${cropW}x${cropH})`,
  );

  // 5. Read and decode the raw JPEG. We completely bypass ImageEditor to avoid all bugs.
  // jpeg-js ignores EXIF, so decoded dimensions will be raw (e.g. 1920x1080 sideways)
  const photoUri = photoPath.startsWith('file://')
    ? photoPath
    : `file://${photoPath}`;
  const base64 = await RNFS.readFile(photoUri, 'base64');
  const jpegBuffer = base64ToBytes(base64);
  const decoded = jpeg.decode(jpegBuffer, { useTArray: true });

  // 6. Letterbox sampling with Bilinear Interpolation & manual EXIF rotation
  const float32 = new Float32Array(MODEL_SIZE * MODEL_SIZE * 3);
  float32.fill(114 / 255); // YOLO gray padding (114, 114, 114)

  const scale = Math.min(MODEL_SIZE / cropW, MODEL_SIZE / cropH);
  const destW = Math.round(cropW * scale);
  const destH = Math.round(cropH * scale);

  const lbPadX = Math.max(0, Math.round((MODEL_SIZE - destW) / 2));
  const lbPadY = Math.max(0, Math.round((MODEL_SIZE - destH) / 2));

  for (let y = 0; y < destH; y++) {
    const destY = y + lbPadY;
    if (destY >= MODEL_SIZE) break;

    const cropY = y / scale;
    const upright_Y = cropY1 + cropY;

    for (let x = 0; x < destW; x++) {
      const destX = x + lbPadX;
      if (destX >= MODEL_SIZE) break;

      const cropX = x / scale;
      const upright_X = cropX1 + cropX;

      let raw_X = upright_X;
      let raw_Y = upright_Y;

      // Reverse EXIF 90 CW Rotation (raw sideways -> upright display)
      if (needsRotation) {
        raw_X = upright_Y;
        raw_Y = decoded.height - upright_X - 1;
      }

      raw_X = Math.max(0, Math.min(decoded.width - 1, raw_X));
      raw_Y = Math.max(0, Math.min(decoded.height - 1, raw_Y));

      const [r, g, b] = getPixelBilinear(
        decoded.data,
        decoded.width,
        decoded.height,
        raw_X,
        raw_Y,
      );

      const destIdx = (destY * MODEL_SIZE + destX) * 3;
      float32[destIdx] = r / 255.0;
      float32[destIdx + 1] = g / 255.0;
      float32[destIdx + 2] = b / 255.0;
    }
  }

  // 7. Run Model
  console.log('[PhotoInference] Running TFLite Model...');
  const outputs = model.runSync([float32]);
  const rawOutput = outputs[0] as Float32Array;

  // 8. Map coordinates back
  const candidates: Detection[] = [];
  for (let i = 0; i < NUM_ANCHORS; i++) {
    let bestScore = 0;
    let bestClass = -1;
    for (let c = 0; c < NUM_CLASSES; c++) {
      const s = rawOutput[(NUM_COORDS + c) * NUM_ANCHORS + i];
      if (s > bestScore) {
        bestScore = s;
        bestClass = c;
      }
    }
    if (bestScore < CONF_THRESHOLD) continue;

    // Model space -> Cropped Upright image space
    const cx = (rawOutput[0 * NUM_ANCHORS + i] - lbPadX) / scale;
    const cy = (rawOutput[1 * NUM_ANCHORS + i] - lbPadY) / scale;
    const w = rawOutput[2 * NUM_ANCHORS + i] / scale;
    const h = rawOutput[3 * NUM_ANCHORS + i] / scale;

    // Cropped Upright space -> Full Upright Photo space
    const photoCx = cx + cropX1;
    const photoCy = cy + cropY1;

    // Full Upright Photo space -> Screen space
    const xmin = (photoCx - w / 2 - screenOffsetX) / screenScaleX;
    const ymin = (photoCy - h / 2 - screenOffsetY) / screenScaleY;
    const xmax = (photoCx + w / 2 - screenOffsetX) / screenScaleX;
    const ymax = (photoCy + h / 2 - screenOffsetY) / screenScaleY;

    candidates.push({
      xmin: Math.max(0, xmin),
      ymin: Math.max(0, ymin),
      xmax: Math.min(screenWidth, xmax),
      ymax: Math.min(screenHeight, ymax),
      score: bestScore,
      class_id: bestClass,
    });
  }

  const detections = applyNMS(candidates);

  console.log(`[PhotoInference] Detections in crop: ${detections.length}`);
  detections.forEach((d, idx) => {
    const type = d.class_id === 0 ? 'stump' : 'stump_single';
    console.log(
      `  [${idx + 1}] ${type} (${Math.round(d.score * 100)}%) w:${Math.round(
        d.xmax - d.xmin,
      )} h:${Math.round(d.ymax - d.ymin)}`,
    );
  });

  const result = processStumpBox(detections, guideBox);
  return { detections, result, cropBoxScreen };
}
