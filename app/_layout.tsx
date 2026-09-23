import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MiniPlayer } from '../src/components/MiniPlayer';
import { RadioProvider } from '../src/features/radio/RadioProvider';
import { useRadio } from '../src/features/radio/useRadio';
import { colors } from '../src/theme/tokens';

function AppNavigator() {
  const pathname = usePathname();
  const { hasStarted } = useRadio();

  const showMiniPlayer =
    hasStarted && pathname !== '/' && pathname !== '/radio';

  return (
    <View style={styles.app}>
      <Stack
        screenOptions={{
          animation: 'fade',
          contentStyle: { backgroundColor: colors.black },
          headerShown: false,
        }}
      />
      <MiniPlayer visible={showMiniPlayer} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RadioProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </RadioProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: colors.black,
    flex: 1,
  },
});
