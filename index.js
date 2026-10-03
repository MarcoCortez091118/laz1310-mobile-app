const {
  getMessaging,
  setBackgroundMessageHandler,
} = require('@react-native-firebase/messaging');
const { Platform } = require('react-native');

if (Platform.OS !== 'web') {
  setBackgroundMessageHandler(getMessaging(), async () => {
    // The OS displays server-owned notification payloads. Navigation is handled
    // only after an explicit user tap through the allowlisted route mapper.
  });
}

require('expo-router/entry');
