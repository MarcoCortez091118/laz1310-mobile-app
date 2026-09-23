import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BrandLogo } from '../src/components/BrandLogo';
import { colors } from '../src/theme/tokens';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/home');
    }, 1_100);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={[styles.ring, styles.ringLarge]} />
      <View style={[styles.ring, styles.ringMedium]} />
      <View style={[styles.ring, styles.ringSmall]} />
      <View style={styles.center}>
        <BrandLogo width={170} />
        <Text style={styles.city}>DETROIT, MI</Text>
        <Text style={styles.slogan}>MARCANDO TERRITORIO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.black,
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  center: {
    alignItems: 'center',
    zIndex: 2,
  },
  city: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.6,
    marginTop: 20,
    opacity: 0.78,
  },
  slogan: {
    color: colors.red,
    fontSize: 10,
    letterSpacing: 2.1,
    marginTop: 12,
    opacity: 0.72,
  },
  ring: {
    backgroundColor: colors.burgundy,
    borderRadius: 999,
    position: 'absolute',
  },
  ringLarge: {
    height: 760,
    opacity: 0.18,
    width: 760,
  },
  ringMedium: {
    height: 560,
    opacity: 0.28,
    width: 560,
  },
  ringSmall: {
    height: 360,
    opacity: 0.46,
    width: 360,
  },
});
