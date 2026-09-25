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
import { AuthProvider } from '../src/features/auth/AuthProvider';
import { RadioProvider } from '../src/features/radio/RadioProvider';
import { useRadio } from '../src/features/radio/useRadio';
import { WeatherUnitProvider } from '../src/features/weather/WeatherUnitProvider';
import { ThemeProvider, useAppTheme } from '../src/theme/ThemeProvider';

void SplashScreen.preventAutoHideAsync();

function AppNavigator() {
  const pathname = usePathname();
  const { hasStarted } = useRadio();
  const { colors, preference } = useAppTheme();

  const showMiniPlayer =
    hasStarted && pathname !== '/' && pathname !== '/radio';

  return (
    <View style={[styles.app, { backgroundColor: colors.black }]}> 
      <StatusBar style={preference === 'dark' ? 'light' : 'dark'} />
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
      <ThemeProvider>
        <WeatherUnitProvider>
          <AuthProvider>
            <RadioProvider>
              <AppNavigator />
            </RadioProvider>
          </AuthProvider>
        </WeatherUnitProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
});
