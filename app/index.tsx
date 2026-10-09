import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

/** PDF page 1: the approved brand cover transitions to Radio. */
export default function V3Splash() {
  const router = useRouter();
  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/radio'), 1200);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={styles.screen}>
      <Image
        accessible
        accessibilityLabel="LA Z Detroit, 107.9 FM, 1310 AM, Marcando Territorio"
        source={require('../assets/brand/La Z Icon.webp')}
        resizeMode="contain"
        style={styles.cover}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#060505' },
  cover: { height: '100%', width: '100%' },
});
