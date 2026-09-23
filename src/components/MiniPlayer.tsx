import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRadio } from '../features/radio/useRadio';
import { colors, fonts, radii, spacing } from '../theme/tokens';
import { PlayPauseButton } from './PlayPauseButton';
import { VinylArtwork } from './VinylArtwork';

interface MiniPlayerProps {
  visible: boolean;
}

export function MiniPlayer({ visible }: MiniPlayerProps) {
  const router = useRouter();
  const { state, toggle } = useRadio();

  if (!visible) {
    return null;
  }

  const playbackState =
    state === 'connecting' || state === 'reconnecting'
      ? 'loading'
      : state === 'playing'
        ? 'pause'
        : 'play';

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir reproductor de LA Z 1310"
        onPress={() => router.push('/radio')}
        style={styles.content}
      >
        <View style={styles.accent} />
        <VinylArtwork size={48} playing={state === 'playing'} />
        <View style={styles.copy}>
          <Text style={styles.title}>LA Z 1310</Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {state === 'reconnecting'
              ? 'Reconectando transmisión…'
              : 'LA Z Detroit · EN VIVO'}
          </Text>
        </View>
      </Pressable>

      <PlayPauseButton
        onPress={toggle}
        size="compact"
        state={playbackState}
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
    bottom: 88,
    flexDirection: 'row',
    gap: spacing.sm,
    left: 8,
    minHeight: 72,
    paddingHorizontal: spacing.sm,
    position: 'absolute',
    right: 8,
    zIndex: 20,
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
    height: 48,
    width: 3,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  subtitle: {
    color: colors.red,
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 2,
  },
});
