module.exports = ({ config }) => ({
  ...config,
  name: 'LA Z 1310',
  slug: 'laz1310-mobile-app',
  scheme: 'laz1310',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.neuromarket.laz1310',
  },
  android: {
    package: 'com.neuromarket.laz1310',
  },
  plugins: [
    'expo-router',
    [
      'expo-audio',
      {
        enableBackgroundPlayback: true,
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#050101',
        image: './assets/brand/logo-negative.png',
        imageWidth: 220,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
