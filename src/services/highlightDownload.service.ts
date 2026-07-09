import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import notifee, { AndroidImportance } from '@notifee/react-native';

const HIGHLIGHTS_DIR = `${RNFS.DocumentDirectoryPath}/generated_highlights`;
const ANDROID_CHANNEL_ID = 'crickroo_highlights';

async function ensureAndroidChannel() {
  await notifee.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: 'Highlights',
    importance: AndroidImportance.HIGH,
  });
}

async function showHighlightNotification() {
  if (Platform.OS === 'android') {
    await ensureAndroidChannel();
    await notifee.displayNotification({
      title: 'Your highlight is ready!',
      body: 'Your generated highlight video has been saved to your device.',
      android: {
        channelId: ANDROID_CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default' },
      },
    });
  } else {
    await notifee.displayNotification({
      title: 'Your highlight is ready!',
      body: 'Your generated highlight video has been saved to your device.',
      ios: {
        sound: 'default',
        // iOS suppresses banner/sound in foreground without these opt-ins.
        foregroundPresentationOptions: {
          banner: true,
          list: true,
          sound: true,
        },
      },
    });
  }
}

export async function downloadAndSaveHighlight(
  downloadUrl: string,
  s3Key: string,
): Promise<void> {
  console.log(
    '[Highlight] Download started — s3_key:',
    s3Key,
    'url:',
    downloadUrl,
  );
  await RNFS.mkdir(HIGHLIGHTS_DIR);
  // S3 keys can contain "/" (path prefix) and an extension — derive a safe basename.
  const baseName =
    s3Key
      .split('/')
      .pop()
      ?.replace(/\.[^/.]+$/, '') || 'video';
  const filename = `highlight_${baseName}_${Date.now()}.mp4`;
  const localPath = `${HIGHLIGHTS_DIR}/${filename}`;

  await RNFS.downloadFile({ fromUrl: downloadUrl, toFile: localPath }).promise;

  if (Platform.OS === 'android') {
    const destDir = `${RNFS.DownloadDirectoryPath}/Crickroo`;
    await RNFS.mkdir(destDir);
    const dest = `${destDir}/${filename}`;
    await RNFS.copyFile(localPath, dest);
    await RNFS.scanFile(dest);
  } else {
    await CameraRoll.save(`file://${localPath}`, { type: 'video' });
  }

  console.log('[Highlight] Saved to gallery, showing notification');
  await showHighlightNotification();
}
