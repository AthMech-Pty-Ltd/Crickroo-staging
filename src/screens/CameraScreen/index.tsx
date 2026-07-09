import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  NativeEventEmitter,
  NativeModules,
  Platform,
  StyleSheet,
} from 'react-native';
import { Camera2View } from '../../native/Camera2View';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
  VisionCameraProxy,
} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import {
  request,
  check,
  PERMISSIONS,
  RESULTS,
  PermissionStatus,
} from 'react-native-permissions';
import { PermissionModal } from '../../components/common/PermissionModal';
import { useAuthContext } from '../../store/AuthContext';
import { XIcon } from 'phosphor-react-native';
import { styles } from './styles';
import { colors } from '../../theme/colors';
import { Button } from '../../components/common/Button';
import { ASSETS } from '../../constants/assets';
import { uploadService } from '../../services/upload.service';
import { sessionService } from '../../services/session.service';
import UploadManager from '../../services/upload';
import { ClipUrl } from '../../types/upload';
import { CLASS_COLORS } from '../../constants/camera';
import {
  SegmentedRecorder,
  addChunkReadyListener,
} from '../../native/SegmentedRecorder';
import { BBox } from '../../utils/stumpGeometry';
import {
  runStumpPhotoInference,
  initPhotoModel,
} from '../../utils/photoInference';

interface CameraScreenProps {
  sessionId: string;
  users?: string[];
  mode: 'group' | 'solo';
  playMode?: 'batting' | 'bowling';
  pitchLength: number;
  userType?: 'coach' | 'player';
  onClose?: () => void;
  onFinish?: (finalTime: number) => void;
}

// Removed old Detection interface as we use StumpDetection from stumpGeometry.ts

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Fixed pixel dimensions — scaled while keeping center positions.
// Striker base bumped 14 → 28 so the back-stump box is visually much closer
// in size to the front box (matches the reference layout). Gap is enlarged
// to keep the two boxes from overlapping at the new sizes.
const SCALE_FACTOR = 2.5;
const WIDTH_EXPANSION = 1.5;

const STRIKER_W = 28 * SCALE_FACTOR * WIDTH_EXPANSION;
const STRIKER_H = 28 * SCALE_FACTOR * 2.0;

const NON_STRIKER_W = 46 * SCALE_FACTOR * WIDTH_EXPANSION;
const NON_STRIKER_H = 46 * SCALE_FACTOR * 2.0;

// Original Y-centers to keep boxes from shifting up or down
const ORIG_STRIKER_YMIN = SCREEN_HEIGHT * 0.429;
const ORIG_STRIKER_CY = ORIG_STRIKER_YMIN + 27 / 2;
const ORIG_NON_STRIKER_YMIN = ORIG_STRIKER_YMIN + 27 + 130; // orig striker_h (27) + gap (130)
const ORIG_NON_STRIKER_CY = ORIG_NON_STRIKER_YMIN + 115 / 2;

const STRIKER_YMIN = ORIG_STRIKER_CY - STRIKER_H / 2;
const NON_STRIKER_YMIN = ORIG_NON_STRIKER_CY - NON_STRIKER_H / 2;

const GUIDE_BOXES = [
  {
    label: 'Striker Stumps',
    id: 'striker_guide',
    xmin: (SCREEN_WIDTH - STRIKER_W) / 2,
    ymin: STRIKER_YMIN,
    xmax: (SCREEN_WIDTH + STRIKER_W) / 2,
    ymax: STRIKER_YMIN + STRIKER_H,
  },
  {
    label: 'Non-striker Stumps',
    id: 'non_striker_guide',
    xmin: (SCREEN_WIDTH - NON_STRIKER_W) / 2,
    ymin: NON_STRIKER_YMIN,
    xmax: (SCREEN_WIDTH + NON_STRIKER_W) / 2,
    ymax: NON_STRIKER_YMIN + NON_STRIKER_H,
  },
];

// Convert a bounding box from screen-pixel space to photo-pixel space.
// The camera preview uses cover scaling (fill screen, center-crop excess),
// so we invert that transform using the actual photo dimensions.
//
// On Android, takePhoto() returns the raw sensor buffer (landscape) with an
// EXIF rotation tag — photo.width > photo.height even when the displayed image
// is portrait. We swap the dimensions to match the displayed orientation.
function screenBoxToImageCoords(
  box: { xmin: number; ymin: number; xmax: number; ymax: number },
  rawPhotoWidth: number,
  rawPhotoHeight: number,
) {
  const isDevicePortrait = SCREEN_HEIGHT > SCREEN_WIDTH;
  const isPhotoLandscape = rawPhotoWidth > rawPhotoHeight;
  // Use portrait (displayed) dimensions for the transform
  const photoWidth =
    isDevicePortrait && isPhotoLandscape ? rawPhotoHeight : rawPhotoWidth;
  const photoHeight =
    isDevicePortrait && isPhotoLandscape ? rawPhotoWidth : rawPhotoHeight;

  const s = Math.max(SCREEN_WIDTH / photoWidth, SCREEN_HEIGHT / photoHeight);
  const ox = (photoWidth - SCREEN_WIDTH / s) / 2;
  const oy = (photoHeight - SCREEN_HEIGHT / s) / 2;

  console.log(
    `[StumpCoords] raw=${rawPhotoWidth}x${rawPhotoHeight} ` +
      `→ used=${photoWidth}x${photoHeight} | ` +
      `screen=${SCREEN_WIDTH}x${SCREEN_HEIGHT} | ` +
      `s=${s.toFixed(4)} ox=${ox.toFixed(1)} oy=${oy.toFixed(1)}`,
  );

  return {
    x1: Math.round(ox + box.xmin / s),
    y1: Math.round(oy + box.ymin / s),
    x2: Math.round(ox + box.xmax / s),
    y2: Math.round(oy + box.ymax / s),
  };
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;
};

// Generates a local temp path for a recording chunk
function chunkPath(sessionId: string, clipNumber: number): string {
  const cacheDir =
    Platform.OS === 'ios' ? RNFS.CachesDirectoryPath : RNFS.CachesDirectoryPath;
  return `${cacheDir}/seg_${sessionId}_${clipNumber}.mp4`;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  sessionId,
  users,
  mode,
  playMode = 'batting',
  pitchLength,
  userType,
  onClose,
  onFinish,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [timer, setTimer] = useState(0);
  const [strikerResult, setStrikerResult] = useState<BBox | null>(null);
  const [nonStrikerResult, setNonStrikerResult] = useState<BBox | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isUIPaused, setIsUIPaused] = useState(false);
  const [urlPool, setUrlPool] = useState<ClipUrl[]>([]);
  const [, setCurrentClipNumber] = useState(1);
  const [isFetchingPool, setIsFetchingPool] = useState(false);
  const isFetchingPoolRef = useRef<boolean>(false);
  const finalTimeRef = useRef<number>(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerValRef = useRef<number>(0);
  const lastProcessedTimer = useRef<number>(-1);
  const isRecordingRef = useRef<boolean>(false);
  const urlPoolRef = useRef<ClipUrl[]>([]);
  const pendingChunksRef = useRef<{ path: string; clipNumber: number }[]>([]);
  const currentClipNumberRef = useRef<number>(1);
  const cameraRef = useRef<Camera>(null);
  const hasFinalizedRef = useRef<boolean>(false);

  const snapshotDimsRef = useRef<{ width: number; height: number } | null>(
    null,
  );

  const [photoModelReady, setPhotoModelReady] = useState(false);
  const [androidCapable, setAndroidCapable] = useState<boolean | null>(null);

  const { permissions, refreshPermissions } = useAuthContext();

  // Pre-load the dedicated JS-thread TFLite model used for stump inference.
  useEffect(() => {
    initPhotoModel(ASSETS.MODELS.STUMP_DETECTION)
      .then(() => setPhotoModelReady(true))
      .catch(e =>
        console.error('[PhotoInference] Failed to init photo model:', e),
      );
  }, []);

  // Subscribe to Camera2 module-level event that fires when the capture session is ready.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const emitter = new NativeEventEmitter(NativeModules.Camera2);
    const sub = emitter.addListener(
      'onCamera2Ready',
      (e: { capable: boolean; fps: number }) => {
        console.log('[Camera2] Ready — capable:', e.capable, 'fps:', e.fps);
        setAndroidCapable(e.capable);
      },
    );
    return () => sub.remove();
  }, []);
  const hasPermission = permissions.camera && permissions.microphone;
  const insets = useSafeAreaInsets();

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>(
    RESULTS.DENIED,
  );
  const [micStatus, setMicStatus] = useState<PermissionStatus>(RESULTS.DENIED);

  useEffect(() => {
    if (hasPermission) {
      setShowPermissionModal(false);
      return;
    }
    const CAMERA_PERM = Platform.select({
      android: PERMISSIONS.ANDROID.CAMERA,
      ios: PERMISSIONS.IOS.CAMERA,
    });
    const MIC_PERM = Platform.select({
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      ios: PERMISSIONS.IOS.MICROPHONE,
    });
    Promise.all([
      CAMERA_PERM ? check(CAMERA_PERM) : Promise.resolve(RESULTS.UNAVAILABLE),
      MIC_PERM ? check(MIC_PERM) : Promise.resolve(RESULTS.UNAVAILABLE),
    ]).then(([cam, mic]) => {
      setCameraStatus(cam);
      setMicStatus(mic);
      if (cam !== RESULTS.GRANTED || mic !== RESULTS.GRANTED) {
        setShowPermissionModal(true);
      }
    });
  }, []);

  const handleRequestPermissions = async () => {
    const CAMERA_PERMISSION = Platform.select({
      android: PERMISSIONS.ANDROID.CAMERA,
      ios: PERMISSIONS.IOS.CAMERA,
    });
    const MICROPHONE_PERMISSION = Platform.select({
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      ios: PERMISSIONS.IOS.MICROPHONE,
    });
    const cam = CAMERA_PERMISSION
      ? await request(CAMERA_PERMISSION)
      : RESULTS.UNAVAILABLE;
    setCameraStatus(cam);
    const mic = MICROPHONE_PERMISSION
      ? await request(MICROPHONE_PERMISSION)
      : RESULTS.UNAVAILABLE;
    setMicStatus(mic);
    await refreshPermissions();
    if (cam === RESULTS.GRANTED && mic === RESULTS.GRANTED) {
      setShowPermissionModal(false);
    }
  };

  const device = useCameraDevice('back');

  const PHOTO_TARGET = 1920 * 1080;

  // iOS fallback when no 1080p@60fps format is available
  const absoluteMaxFormat = useMemo(() => {
    if (Platform.OS !== 'ios' || !device?.formats?.length) return undefined;
    return [...device.formats].sort((a, b) => {
      const resA = a.videoWidth * a.videoHeight;
      const resB = b.videoWidth * b.videoHeight;
      if (resB !== resA) return resB - resA;
      const diffA = Math.abs(a.photoWidth * a.photoHeight - PHOTO_TARGET);
      const diffB = Math.abs(b.photoWidth * b.photoHeight - PHOTO_TARGET);
      if (diffA !== diffB) return diffA - diffB;
      return b.maxFps - a.maxFps;
    })[0];
  }, [device, PHOTO_TARGET]);

  // iOS: 1080p@60fps for VisionCamera recording
  const specific1080p60Format = useMemo(() => {
    if (Platform.OS !== 'ios' || !device?.formats?.length) return undefined;
    const candidates = device.formats.filter(
      f => f.videoWidth === 1920 && f.videoHeight === 1080 && f.maxFps >= 60,
    );
    if (!candidates.length) return undefined;
    return candidates.sort(
      (a, b) =>
        Math.abs(a.photoWidth * a.photoHeight - PHOTO_TARGET) -
        Math.abs(b.photoWidth * b.photoHeight - PHOTO_TARGET),
    )[0];
  }, [device, PHOTO_TARGET]);

  const is1080p60Capable = !!specific1080p60Format;
  // iOS: determined by VisionCamera format detection above.
  // Android: Camera2Manager checks hardware min-frame-duration at 1920×1080; emits onCamera2Ready.
  //   null = camera still opening (button disabled), true/false = result from Camera2.
  const isCapable =
    Platform.OS === 'android' ? androidCapable === true : is1080p60Capable;

  // iOS only — used by the <Camera> component in the render branch below.
  const activeFormat = specific1080p60Format ?? absoluteMaxFormat;

  // VisionCamera frame processor plugin — iOS only. On Android we use Camera2 directly.
  const segmentedRecorderPlugin = useMemo(
    () =>
      Platform.OS === 'ios'
        ? VisionCameraProxy.initFrameProcessorPlugin('segmentedRecorder', {})
        : null,
    [],
  );

  const fetchUrlPool = useCallback(async () => {
    if (isFetchingPoolRef.current || urlPoolRef.current.length > 20) return;
    const startNum = currentClipNumberRef.current + urlPoolRef.current.length;
    isFetchingPoolRef.current = true;
    setIsFetchingPool(true);
    try {
      const res = await uploadService.getClipUrls({
        count: 10,
        isLastBatch: false,
        sessionId,
        startClipNumber: startNum,
      });
      setUrlPool(prev => {
        const newPool = [...prev, ...res.urls];
        urlPoolRef.current = newPool;
        return newPool;
      });
    } catch (err) {
      console.error('[Camera] Failed to fetch URL pool:', err);
    } finally {
      isFetchingPoolRef.current = false;
      setIsFetchingPool(false);
    }
  }, [sessionId]);

  // ─── Listen for chunk-ready events from the native encoder ────────────────

  useEffect(() => {
    if (!isRecording) return;

    const unsubscribe = addChunkReadyListener(({ path }) => {
      const clipNum = currentClipNumberRef.current;
      pendingChunksRef.current.push({ path, clipNumber: clipNum });
      currentClipNumberRef.current++;
      setCurrentClipNumber(currentClipNumberRef.current);

      // Drain pending chunks against available URLs
      while (
        pendingChunksRef.current.length > 0 &&
        urlPoolRef.current.length > 0
      ) {
        const chunk = pendingChunksRef.current.shift()!;
        const clipUrl = urlPoolRef.current.shift()!;
        UploadManager.enqueue({
          filePath: chunk.path,
          presignedUrl: clipUrl.url,
          clipNumber: chunk.clipNumber,
          fileKey: clipUrl.fileKey,
          sessionId,
        });
      }
      setUrlPool([...urlPoolRef.current]);

      // Check if we should finalize the session after stop
      if (!isRecordingRef.current && !hasFinalizedRef.current) {
        hasFinalizedRef.current = true;
        setIsRecording(false);
        setIsStopping(false);
        if (onFinish) onFinish(finalTimeRef.current);
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, sessionId]);

  // ─── Timer ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer(p => {
          const next = p + 1;
          timerValRef.current = next;
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // ─── Initial URL fetch ────────────────────────────────────────────────────

  useEffect(() => {
    if (isRecording && timer === 0 && urlPoolRef.current.length === 0) {
      fetchUrlPool();
    }
  }, [timer, isRecording, fetchUrlPool]);

  // ─── Chunk rotation every 5 seconds ──────────────────────────────────────

  useEffect(() => {
    const chunkInterval = 5;
    if (
      isRecording &&
      isRecordingRef.current &&
      timer > 0 &&
      timer % chunkInterval === 0 &&
      lastProcessedTimer.current !== timer
    ) {
      lastProcessedTimer.current = timer;
      const nextClip = currentClipNumberRef.current + 1;
      const nextPath = chunkPath(sessionId, nextClip);
      SegmentedRecorder.rotate(nextPath).catch(e =>
        console.error('[Camera] rotate failed:', e),
      );
    }
  }, [timer, isRecording, sessionId]);

  // ─── Top-up URL pool ─────────────────────────────────────────────────────

  useEffect(() => {
    if (isRecording && !isStopping && urlPool.length < 3 && !isFetchingPool) {
      fetchUrlPool();
    }
  }, [urlPool.length, isRecording, isStopping, isFetchingPool, fetchUrlPool]);

  // ─── Detection callbacks ──────────────────────────────────────────────────

  // Both striker and non-striker now run on the captured JPEG (see onSnapshot).
  // The frame processor no longer performs TFLite inference — it only pipes
  // frames into the segmented recorder.

  // ─── Frame processor ─────────────────────────────────────────────────────

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      // Pipe every frame into the native encoder. TFLite inference now runs on
      // the captured photo (see onSnapshot), so the frame processor's sole job
      // here is recording.
      segmentedRecorderPlugin?.call(frame);
    },
    [segmentedRecorderPlugin],
  );

  // ─── Bounding box helpers ─────────────────────────────────────────────────

  const getMatchedBoxes = () => {
    const strikerGuide = GUIDE_BOXES[0];
    const nonStrikerGuide = GUIDE_BOXES[1];

    const b1 = strikerResult || strikerGuide;
    const b2 = nonStrikerResult || nonStrikerGuide;

    return {
      b1,
      b2,
      strikerDetected: !!strikerResult,
      nonStrikerDetected: !!nonStrikerResult,
    };
  };

  const { b1, b2 } = getMatchedBoxes();
  const p1 = { x: (b1.xmin + b1.xmax) / 2, y: b1.ymax };
  const p2 = { x: (b2.xmin + b2.xmax) / 2, y: b2.ymax };

  const guideWidth = Math.abs(p2.x - p1.x);
  const guideHeight = Math.abs(p2.y - p1.y);

  // ─── Upload helpers ───────────────────────────────────────────────────────

  const handleImageUpload = async (imagePath: string) => {
    try {
      const { url } = await uploadService.getStumpDetectionUploadUrl({
        sessionId,
      });
      await uploadService.uploadFileToS3(url, imagePath, 'image/jpeg');
    } catch (error) {
      console.error('[Camera] Failed to upload stump detection image:', error);
    }
  };

  const onSnapshot = async () => {
    if (isCalibrating) return;
    setIsCalibrating(true);
    SegmentedRecorder.prepare(1920, 1080, 60).catch(() => {
      // Non-critical — start() will fall back to full init if prepare fails
    });

    try {
      let photo: { path: string; width: number; height: number } | null = null;

      if (Platform.OS === 'android') {
        photo = await NativeModules.Camera2.takePhoto();
      } else {
        const vcPhoto = await cameraRef.current?.takePhoto({
          flash: 'off',
          enableShutterSound: false,
        });
        if (vcPhoto) {
          photo = {
            path: vcPhoto.path,
            width: vcPhoto.width,
            height: vcPhoto.height,
          };
        }
      }

      if (!photo) {
        setIsCalibrating(false);
        return;
      }

      snapshotDimsRef.current = { width: photo.width, height: photo.height };
      console.log(
        `[StumpCoords] Photo taken: ${photo.width}x${photo.height} | ` +
          `Screen: ${SCREEN_WIDTH}x${SCREEN_HEIGHT}`,
      );
      handleImageUpload(photo.path);

      // Run both stump detections on the same captured JPEG. Sequential because
      // both share the single _photoModel TFLite interpreter.
      const runOne = async (
        label: 'STRIKER' | 'NON-STRIKER',
        guideBox: BBox,
      ): Promise<BBox | null> => {
        console.log(`\n=== STUMP DETECTION (${label}) [photo-based] ===`);
        try {
          const { detections, result } = await runStumpPhotoInference(
            photo.path,
            photo.width,
            photo.height,
            guideBox,
            SCREEN_WIDTH,
            SCREEN_HEIGHT,
          );
          console.log(`Total Detections: ${detections.length}`);
          detections.forEach((d, idx) => {
            const type = d.class_id === 0 ? 'stump' : 'stump_single';
            console.log(
              `  [${idx + 1}] ${type} (${Math.round(
                d.score * 100,
              )}%) at [w: ${Math.round(d.xmax - d.xmin)}, h: ${Math.round(
                d.ymax - d.ymin,
              )}]`,
            );
          });
          console.log(
            result
              ? `  -> FINAL: Match Found (Conf: ${Math.round(
                  result.confidence * 100,
                )}%, Source: ${result.source})`
              : `  -> FINAL: No Match`,
          );
          return result ? result.bbox : null;
        } catch (err) {
          console.error(`[PhotoInference] ${label} failed:`, err);
          return null;
        }
      };

      const strikerBox = await runOne('STRIKER', GUIDE_BOXES[0]);
      const nonStrikerBox = await runOne('NON-STRIKER', GUIDE_BOXES[1]);

      setStrikerResult(strikerBox);
      setNonStrikerResult(nonStrikerBox);
      setIsUIPaused(true);
    } catch (e) {
      console.error('[Camera] Failed to take photo:', e);
    } finally {
      setIsCalibrating(false);
    }
  };

  const onResume = () => {
    setIsUIPaused(false);
    setStrikerResult(null);
    setNonStrikerResult(null);
  };

  // ─── Loading states ───────────────────────────────────────────────────────

  // On Android we use Camera2View (not VisionCamera Camera), so device is irrelevant.
  const isDeviceReady = Platform.OS === 'ios' ? !!device : true;
  if (!isDeviceReady || !photoModelReady) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <ActivityIndicator size="large" color={CLASS_COLORS[2]} />
        </View>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <PermissionModal
          isVisible={showPermissionModal}
          cameraStatus={cameraStatus}
          microphoneStatus={micStatus}
          onRequestPermissions={handleRequestPermissions}
          onClose={() => {
            setShowPermissionModal(false);
            onClose?.();
          }}
        />
      </View>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {Platform.OS === 'android' ? (
        <Camera2View style={StyleSheet.absoluteFill} />
      ) : (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device!}
          isActive={true}
          photo={true}
          video={true}
          audio={true}
          format={activeFormat}
          fps={is1080p60Capable ? 60 : activeFormat?.maxFps}
          frameProcessor={frameProcessor}
          pixelFormat="yuv"
        />
      )}

      {!isRecording &&
        GUIDE_BOXES.map(box => {
          const isNonStriker = box.id === 'non_striker_guide';
          const hasResult = isNonStriker ? !!nonStrikerResult : !!strikerResult;
          const showStatus = isUIPaused;
          const statusBoxStyle = showStatus
            ? hasResult
              ? styles.boundingBoxDetected
              : styles.boundingBoxMissing
            : undefined;
          const statusLabelStyle = showStatus
            ? hasResult
              ? styles.labelContainerDetected
              : styles.labelContainerMissing
            : undefined;
          const statusTextStyle = showStatus
            ? hasResult
              ? styles.labelTextDetected
              : styles.labelTextMissing
            : undefined;

          return (
            <View
              key={box.id}
              style={[
                styles.boundingBox,
                statusBoxStyle,
                {
                  left: box.xmin,
                  top: box.ymin,
                  width: box.xmax - box.xmin,
                  height: box.ymax - box.ymin,
                  borderColor: showStatus ? undefined : colors.neutrals.white,
                },
              ]}
            >
              <View
                style={[
                  styles.labelContainer,
                  statusLabelStyle,
                  isNonStriker && {
                    top: undefined,
                    bottom: -22,
                  },
                ]}
              >
                <Text style={[styles.labelText, statusTextStyle]}>
                  {showStatus
                    ? `${box.id === 'non_striker_guide' ? 'Non-striker' : 'Striker'} · ${hasResult ? 'Detected' : 'Missing'}`
                    : box.label}
                </Text>
              </View>
            </View>
          );
        })}

      {(isUIPaused || isRecording) && (
        <View
          style={[
            styles.pitchGuide,
            {
              left: Math.min(p1.x, p2.x) - 20,
              width: guideWidth + 40,
              top: p1.y,
              height: guideHeight,
            },
          ]}
        />
      )}

      {isCalibrating && (
        <View pointerEvents="none" style={styles.calibratingOverlay}>
          <View style={styles.calibratingBadge}>
            <ActivityIndicator size="small" color={colors.neutrals.white} />
            <Text style={styles.calibratingText}>Calibrating…</Text>
          </View>
        </View>
      )}

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          {isRecording ? (
            <View style={styles.timerBadge}>
              <View style={styles.timerDot} />
              <Text style={styles.timerText}>{formatTime(timer)}</Text>
            </View>
          ) : isUIPaused ? (
            <TouchableOpacity
              style={styles.redetectButton}
              onPress={onResume}
              activeOpacity={0.7}
            >
              <Text style={styles.redetectText}>REDETECT</Text>
            </TouchableOpacity>
          ) : null}

          {!isRecording && !isStopping && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <XIcon size={24} color={colors.neutrals.white} />
            </TouchableOpacity>
          )}
        </View>

        {!isUIPaused && !isRecording && !isStopping && !isCalibrating && (
          <View style={styles.instructionContainer}>
            <View style={styles.instructionBanner}>
              <Text style={styles.instructionText}>
                Fill the stumps in boxes then press Next to detect stumps.
              </Text>
            </View>
          </View>
        )}

        {isUIPaused &&
          !isRecording &&
          !isStopping &&
          (() => {
            return (
              <View style={styles.instructionContainer}>
                <View style={styles.instructionBanner}>
                  <Text style={styles.instructionText}>
                    Tap Start Session to begin recording.{'\n'}
                    Press Redetect to adjust stump boxes.
                  </Text>
                </View>
              </View>
            );
          })()}

        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.controlBar}>
            {(isUIPaused || isRecording || isStopping) && (
              <View style={styles.tapLabelContainer}>
                <Text style={styles.tapLabelText}>
                  {isRecording || isStopping ? 'End Session' : 'Start Session'}
                </Text>
              </View>
            )}

            {(isUIPaused || isRecording || isStopping) && (
              <TouchableOpacity
                style={styles.recordButtonContainer}
                disabled={isStopping}
                onPress={async () => {
                  if (isRecording) {
                    // ── Stop recording ──────────────────────────────────────
                    isRecordingRef.current = false;
                    finalTimeRef.current = timerValRef.current;
                    setIsStopping(true);

                    // Clear URL pool; fetch final batch URL
                    urlPoolRef.current = [];
                    setUrlPool([]);

                    try {
                      const res = await uploadService.getClipUrls({
                        count: 1,
                        isLastBatch: true,
                        sessionId,
                        startClipNumber: currentClipNumberRef.current,
                      });
                      urlPoolRef.current = [...res.urls];
                      setUrlPool([...res.urls]);
                    } catch (err) {
                      console.error(
                        '[Camera] Failed to fetch final URL batch:',
                        err,
                      );
                    }

                    // Stop the native encoder; the final chunk fires onChunkReady
                    SegmentedRecorder.stop().catch(e =>
                      console.error('[Camera] stop failed:', e),
                    );

                    // Notify backend the session has ended
                    sessionService
                      .endSession(sessionId)
                      .catch(e =>
                        console.error('[Camera] endSession failed:', e),
                      );
                  } else {
                    // ── Start recording ─────────────────────────────────────
                    try {
                      const {
                        b1: strikerBox,
                        b2: nonStrikerBox,
                        strikerDetected,
                        nonStrikerDetected,
                      } = getMatchedBoxes();
                      const configMode:
                        | 'group'
                        | 'solo_batting'
                        | 'solo_bowling' =
                        mode === 'group'
                          ? 'group'
                          : playMode === 'bowling'
                          ? 'solo_bowling'
                          : 'solo_batting';
                      const dims = snapshotDimsRef.current;
                      console.log(
                        `[StumpCoords] Screen boxes — striker screen: ` +
                          `[${Math.round(strikerBox.xmin)},${Math.round(
                            strikerBox.ymin,
                          )},${Math.round(strikerBox.xmax)},${Math.round(
                            strikerBox.ymax,
                          )}] | ` +
                          `non-striker screen: [${Math.round(
                            nonStrikerBox.xmin,
                          )},${Math.round(nonStrikerBox.ymin)},${Math.round(
                            nonStrikerBox.xmax,
                          )},${Math.round(nonStrikerBox.ymax)}]`,
                      );
                      const sCoords = dims
                        ? screenBoxToImageCoords(
                            strikerBox,
                            dims.width,
                            dims.height,
                          )
                        : {
                            x1: Math.round(strikerBox.xmin),
                            y1: Math.round(strikerBox.ymin),
                            x2: Math.round(strikerBox.xmax),
                            y2: Math.round(strikerBox.ymax),
                          };
                      const nsCoords = dims
                        ? screenBoxToImageCoords(
                            nonStrikerBox,
                            dims.width,
                            dims.height,
                          )
                        : {
                            x1: Math.round(nonStrikerBox.xmin),
                            y1: Math.round(nonStrikerBox.ymin),
                            x2: Math.round(nonStrikerBox.xmax),
                            y2: Math.round(nonStrikerBox.ymax),
                          };
                      console.log(
                        `[StumpCoords] Image coords — striker: [${sCoords.x1},${sCoords.y1},${sCoords.x2},${sCoords.y2}] | ` +
                          `non-striker: [${nsCoords.x1},${nsCoords.y1},${nsCoords.x2},${nsCoords.y2}]`,
                      );
                      const sessionConfig = {
                        meta: { mode: configMode },
                        stump: [
                          {
                            box_id: 0,
                            label: 'stump_front',
                            x1: nsCoords.x1,
                            x2: nsCoords.x2,
                            y1: nsCoords.y1,
                            y2: nsCoords.y2,
                            detected: nonStrikerDetected,
                          },
                          {
                            box_id: 1,
                            label: 'stump_back',
                            x1: sCoords.x1,
                            x2: sCoords.x2,
                            y1: sCoords.y1,
                            y2: sCoords.y2,
                            detected: strikerDetected,
                          },
                        ],
                        users: users ?? [],
                        platform: (Platform.OS === 'ios'
                          ? 'ios'
                          : 'android') as 'ios' | 'android',
                        pitch_length: pitchLength,
                        ...(userType ? { user_type: userType } : {}),
                      };
                      await uploadService.configSession(
                        sessionId,
                        sessionConfig,
                      );
                    } catch (configError) {
                      console.error(
                        '[Camera] Session config failed:',
                        configError,
                      );
                    }

                    // Reset state
                    setTimer(0);
                    timerValRef.current = 0;
                    lastProcessedTimer.current = -1;
                    hasFinalizedRef.current = false;
                    setUrlPool([]);
                    urlPoolRef.current = [];
                    pendingChunksRef.current = [];
                    setCurrentClipNumber(1);
                    currentClipNumberRef.current = 1;

                    const firstPath = chunkPath(sessionId, 1);
                    await SegmentedRecorder.start(firstPath, 1920, 1080, 60);
                    setIsRecording(true);
                    isRecordingRef.current = true;
                  }
                }}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.recordButton,
                    isRecording && styles.recordingActive,
                  ]}
                />
              </TouchableOpacity>
            )}

            {!isRecording && !isUIPaused && !isStopping && (
              <>
                {!isCapable && (
                  <Text style={styles.notCapableText}>
                    {Platform.OS === 'android' && androidCapable === null
                      ? 'Checking camera compatibility…'
                      : 'This device does not support the recording capability required by CrickRoo. Please try again on another device.'}
                  </Text>
                )}
                <Button
                  label="NEXT"
                  onPress={onSnapshot}
                  variant="primary"
                  disabled={!isCapable || isCalibrating}
                  style={styles.nextButton}
                  textStyle={styles.nextButtonText}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
