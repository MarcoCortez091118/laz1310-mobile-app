import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRadio } from '../features/radio/useRadio';
import { colors, radii, spacing } from '../theme/tokens';
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
        onPress={() => router.push('/radio')}
        style={styles.content}
      >
        <View style={styles.accent} />
        <VinylArtwork size={48} playing={state === 'playing'} />
        <View style={styles.copy}>
          <Text style={styles.title}>LA Z 1310</Text>
          <Text style={styles.subtitle}>
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
    borderRadius: radii.md,
    bottom: 88,
    flexDirection: 'row',
    gap: spacing.sm,
    left: 0,
    minHeight: 72,
    paddingHorizontal: spacing.sm,
    position: 'absolute',
    right: 0,
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
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.red,
    fontSize: 11,
    marginTop: 2,
  },
});
