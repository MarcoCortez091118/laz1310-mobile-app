import {
  BarlowCondensed_700Bold,
  BarlowCondensed_800ExtraBold,
  BarlowCondensed_900Black,
} from '@expo-google-fonts/barlow-condensed';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MiniPlayer } from '../src/components/MiniPlayer';
import { RadioProvider } from '../src/features/radio/RadioProvider';
import { useRadio } from '../src/features/radio/useRadio';
import { colors } from '../src/theme/tokens';

void SplashScreen.preventAutoHideAsync();

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
  const [fontsLoaded, fontError] = useFonts({
    BarlowCondensed_700Bold,
    BarlowCondensed_800ExtraBold,
    BarlowCondensed_900Black,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

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
