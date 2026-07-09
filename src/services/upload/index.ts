import Upload, { UploadOptions } from 'react-native-background-upload';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';

const UPLOAD_CHANNEL_ID = 'crickroo_clip_uploads_silent';
let uploadChannelEnsured = false;

async function ensureUploadChannel() {
  if (uploadChannelEnsured || Platform.OS !== 'android') return;
  await notifee.createChannel({
    id: UPLOAD_CHANNEL_ID,
    name: 'Clip uploads',
    importance: AndroidImportance.MIN,
  });
  uploadChannelEnsured = true;
}

export interface UploadChunk {
  filePath: string;
  presignedUrl: string;
  clipNumber: number;
  fileKey: string;
  sessionId: string;
  retryCount: number;
}

export interface SessionStats {
  uploaded: number;
  total: number;
}

type ProgressListener = (stats: SessionStats) => void;

class UploadManager {
  private static instance: UploadManager;
  private queue: UploadChunk[] = [];
  private retryQueue: UploadChunk[] = [];
  private activeUploads: number = 0;
  private readonly MAX_PARALLEL = 7;
  private readonly MAX_RETRIES = 3;
  private isProcessing: boolean = false;

  private sessionStats: Map<string, SessionStats> = new Map();
  private listeners: Map<string, ProgressListener[]> = new Map();

  private constructor() {
    // Throttled queue processing every 500ms
    setInterval(() => this.processQueue(), 500);
  }

  public static getInstance(): UploadManager {
    if (!UploadManager.instance) {
      UploadManager.instance = new UploadManager();
    }
    return UploadManager.instance;
  }

  public enqueue(chunk: Omit<UploadChunk, 'retryCount'>) {
    console.log(`[UploadManager] Enqueuing clip #${chunk.clipNumber}`);

    // Update session stats
    const stats = this.sessionStats.get(chunk.sessionId) || {
      uploaded: 0,
      total: 0,
    };
    stats.total++;
    this.sessionStats.set(chunk.sessionId, stats);
    this.notify(chunk.sessionId);

    // Delay upload slightly as requested
    setTimeout(() => {
      this.queue.push({ ...chunk, retryCount: 0 });
    }, 1000);
  }

  public onSessionProgress(sessionId: string, callback: ProgressListener) {
    const sessionListeners = this.listeners.get(sessionId) || [];
    sessionListeners.push(callback);
    this.listeners.set(sessionId, sessionListeners);

    // Immediate update if stats exist (send a clone)
    const stats = this.sessionStats.get(sessionId);
    if (stats) callback({ ...stats });

    return () => {
      const filtered = (this.listeners.get(sessionId) || []).filter(
        l => l !== callback,
      );
      this.listeners.set(sessionId, filtered);
    };
  }

  private notify(sessionId: string) {
    const stats = this.sessionStats.get(sessionId);
    if (!stats) return;
    const sessionListeners = this.listeners.get(sessionId) || [];
    // MUST pass a new object reference to trigger React re-renders
    const statsClone = { ...stats };
    sessionListeners.forEach(l => l(statsClone));
  }

  private async processQueue() {
    if (this.isProcessing) return;
    if (this.activeUploads >= this.MAX_PARALLEL) return;
    if (this.queue.length === 0 && this.retryQueue.length === 0) return;

    this.isProcessing = true;

    try {
      // Prioritize main queue
      const chunk = this.queue.shift() || this.retryQueue.shift();
      if (chunk) {
        await this.startUpload(chunk);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async startUpload(chunk: UploadChunk) {
    this.activeUploads++;
    const startTime = Date.now();
    let fileSize = '0 KB';

    try {
      const stats = await RNFS.stat(chunk.filePath);
      const bytes = parseInt(String(stats.size), 10);
      fileSize =
        bytes > 1024 * 1024
          ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
          : `${(bytes / 1024).toFixed(2)} KB`;
    } catch {
      console.warn(
        `[UploadManager] Could not get file size for chunk #${chunk.clipNumber}`,
      );
    }

    console.log(
      `[UploadManager] Starting upload for Clip #${chunk.clipNumber} (${fileSize}). Active: ${this.activeUploads}`,
    );

    await ensureUploadChannel();

    // iOS needs file:// scheme; Android needs a bare path
    const filePath =
      Platform.OS === 'ios'
        ? chunk.filePath.startsWith('file://')
          ? chunk.filePath
          : `file://${chunk.filePath}`
        : chunk.filePath.replace(/^file:\/\//, '');

    const options: UploadOptions = {
      url: chunk.presignedUrl,
      path: filePath,
      method: 'PUT',
      type: 'raw',
      headers: {
        'Content-Type': 'video/mp4',
      },
      // Android 8+ forces FG-service notification regardless of `enabled`. Route it
      // to a MIN-importance channel and disable ringtone so it stays silent.
      notification: {
        enabled: true,
        notificationChannel: UPLOAD_CHANNEL_ID,
        enableRingTone: false,
        autoClear: true,
        onProgressTitle: 'Uploading clips',
        onProgressMessage: '',
        onCompleteTitle: '',
        onCompleteMessage: '',
        onErrorTitle: '',
        onErrorMessage: '',
        onCancelledTitle: '',
        onCancelledMessage: '',
      },
      // Android specific
      maxRetries: 2,
    } as any;

    Upload.startUpload(options)
      .then(uploadId => {
        // react-native-background-upload can emit terminal events more than once
        // (foreground service + JS bridge). Settle exactly once and tear down listeners.
        let settled = false;
        const subs: { remove: () => void }[] = [];
        const cleanup = () => subs.forEach(s => s.remove());

        subs.push(
          Upload.addListener('completed', uploadId, async () => {
            if (settled) return;
            settled = true;
            cleanup();

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(
              `[UploadManager] Chunk #${chunk.clipNumber} of ${fileSize} uploaded in ${duration}s. URL: ${chunk.presignedUrl}`,
            );

            const stats = this.sessionStats.get(chunk.sessionId);
            if (stats) {
              stats.uploaded++;
              this.notify(chunk.sessionId);
            }

            this.activeUploads--;
            await this.cleanupFile(chunk.filePath);
            this.processQueue();
          }),
        );

        subs.push(
          Upload.addListener('error', uploadId, data => {
            if (settled) return;
            settled = true;
            cleanup();

            console.error(
              `[UploadManager] Clip #${chunk.clipNumber} upload error:`,
              data.error,
            );
            this.activeUploads--;
            this.handleFailure(chunk);
          }),
        );

        subs.push(
          Upload.addListener('cancelled', uploadId, () => {
            if (settled) return;
            settled = true;
            cleanup();

            this.activeUploads--;
            this.handleFailure(chunk);
          }),
        );
      })
      .catch(err => {
        console.error(
          `[UploadManager] Failed to initiate upload for clip #${chunk.clipNumber}:`,
          err,
        );
        this.activeUploads--;
        this.handleFailure(chunk);
      });
  }

  private async handleFailure(chunk: UploadChunk) {
    if (chunk.retryCount < this.MAX_RETRIES) {
      console.log(
        `[UploadManager] Retrying clip #${chunk.clipNumber} (${
          chunk.retryCount + 1
        }/${this.MAX_RETRIES})`,
      );
      this.retryQueue.push({ ...chunk, retryCount: chunk.retryCount + 1 });
    } else {
      console.error(
        `[UploadManager] Max retries reached for clip #${chunk.clipNumber}. Cleaning up.`,
      );
      await this.cleanupFile(chunk.filePath);
    }
  }

  private async cleanupFile(path: string) {
    try {
      const exists = await RNFS.exists(path);
      if (exists) {
        await RNFS.unlink(path);
        console.log(`[UploadManager] Cleaned up file: ${path}`);
      }
    } catch (err) {
      console.error(`[UploadManager] Failed to cleanup file: ${path}`, err);
    }
  }
}

export default UploadManager.getInstance();
