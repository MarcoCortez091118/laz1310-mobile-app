import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRadio } from '../features/radio/useRadio';
import { colors, radii, spacing } from '../theme/tokens';
import { LiveBadge } from './LiveBadge';
import { PlayPauseButton } from './PlayPauseButton';
import { VinylArtwork } from './VinylArtwork';

export function LiveRadioCard() {
  const router = useRouter();
  const { state, play, pause, retry } = useRadio();

  const loading = state === 'connecting' || state === 'reconnecting';
  const error = state === 'error';

  const handlePrimaryPress = () => {
    if (error) {
      retry();
      return;
    }

    if (state === 'playing') {
      pause();
      return;
    }

    play();
  };

  return (
    <Pressable
      onPress={() => router.push('/radio')}
      style={styles.container}
    >
      <View style={styles.accent} />
      <VinylArtwork size={58} playing={state === 'playing'} />

      <View style={styles.copy}>
        <LiveBadge live={!error} />
        <Text style={styles.title}>
          {error ? 'RADIO NO DISPONIBLE' : 'ESCUCHA EN VIVO'}
        </Text>
        <Text style={styles.subtitle}>
          {error ? 'Toca para reintentar' : 'LA Z 1310 · Detroit'}
        </Text>
      </View>

      <View onStartShouldSetResponder={() => true}>
        <PlayPauseButton
          onPress={handlePrimaryPress}
          size="compact"
          state={loading ? 'loading' : state === 'playing' ? 'pause' : 'play'}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.burgundy,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 96,
    padding: spacing.md,
  },
  accent: {
    backgroundColor: colors.red,
    borderRadius: radii.round,
    height: 64,
    width: 4,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 11,
  },
});
