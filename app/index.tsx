import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function SplashRoute() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/radio'), 1400);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={styles.container} accessibilityLabel="LA Z 1310 · Marcando Territorio">
      <Image
        accessible
        accessibilityLabel="La Z Detroit · 107.9 FM · 1310 AM"
        source={require('../assets/brand/La Z Icon.webp')}
        resizeMode="contain"
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050101', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%' },
});
