/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { downloadAndSaveHighlight } from './src/services/highlightDownload.service';

// Must be registered before AppRegistry — handles pushes when app is killed/background
messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (
    remoteMessage.data?.type === 'highlight_ready' &&
    remoteMessage.data?.download_url &&
    remoteMessage.data?.s3_key
  ) {
    await downloadAndSaveHighlight(
      String(remoteMessage.data.download_url),
      String(remoteMessage.data.s3_key),
    );
  }
});

AppRegistry.registerComponent(appName, () => App);
