import { NativeEventEmitter, NativeModules } from 'react-native';

const { SegmentedRecorder: NativeSegmentedRecorder } = NativeModules;

export interface ChunkReadyEvent {
  path: string;
}

function assertModule(): void {
  if (!NativeSegmentedRecorder) {
    throw new Error(
      '[SegmentedRecorder] Native module not found.\n' +
        'You need to do a full native rebuild:\n' +
        '  Android: npx react-native run-android\n' +
        '  iOS: cd ios && pod install && npx react-native run-ios',
    );
  }
}

export const SegmentedRecorder = {
  prepare(width: number, height: number, fps: number): Promise<void> {
    assertModule();
    return NativeSegmentedRecorder.prepare(width, height, fps);
  },

  start(
    path: string,
    width: number,
    height: number,
    fps: number,
  ): Promise<void> {
    assertModule();
    return NativeSegmentedRecorder.start(path, width, height, fps);
  },

  rotate(nextPath: string): Promise<void> {
    assertModule();
    return NativeSegmentedRecorder.rotate(nextPath);
  },

  stop(): Promise<void> {
    assertModule();
    return NativeSegmentedRecorder.stop();
  },

  isAvailable(): boolean {
    return !!NativeSegmentedRecorder;
  },
};

const emitter = NativeSegmentedRecorder
  ? new NativeEventEmitter(NativeSegmentedRecorder)
  : null;

export function addChunkReadyListener(
  callback: (event: ChunkReadyEvent) => void,
): () => void {
  if (!emitter) return () => {};
  const sub = emitter.addListener('onChunkReady', callback);
  return () => sub.remove();
}
