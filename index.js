import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  setBackgroundMessageHandler(getMessaging(), async () => {
    // The OS displays server-owned notification payloads. Navigation is handled
    // only after an explicit user tap through the allowlisted route mapper.
  });
}

import 'expo-router/entry';
