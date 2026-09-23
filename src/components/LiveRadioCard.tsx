import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRadio } from '../features/radio/useRadio';
import { colors, fonts, radii, spacing } from '../theme/tokens';
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
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir radio en vivo"
        onPress={() => router.push('/radio')}
        style={styles.content}
      >
        <View style={styles.accent} />
        <VinylArtwork size={58} playing={state === 'playing'} />

        <View style={styles.copy}>
          <LiveBadge compact live={!error} />
          <Text style={styles.title}>
            {error ? 'RADIO NO DISPONIBLE' : 'ESCUCHA EN VIVO'}
          </Text>
          <Text style={styles.subtitle}>
            {error ? 'Toca para reintentar' : 'LA Z 1310 · Detroit'}
          </Text>
        </View>
      </Pressable>

      <PlayPauseButton
        onPress={handlePrimaryPress}
        size="compact"
        state={loading ? 'loading' : state === 'playing' ? 'pause' : 'play'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.burgundy,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 96,
    padding: spacing.md,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
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
    fontFamily: fonts.displayExtraBold,
    fontSize: 21,
    lineHeight: 22,
    marginTop: 2,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 11,
  },
});
