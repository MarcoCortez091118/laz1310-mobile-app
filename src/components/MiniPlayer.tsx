import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRadio } from '../features/radio/useRadio';
import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii, spacing } from '../theme/tokens';
import { PlayPauseButton } from './PlayPauseButton';
import { VinylArtwork } from './VinylArtwork';

interface MiniPlayerProps {
  visible: boolean;
}

export function MiniPlayer({ visible }: MiniPlayerProps) {
  const router = useRouter();
  const { state, toggle } = useRadio();
  const { colors } = useAppTheme();

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
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.burgundy,
          borderColor: colors.border,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir reproductor de LA Z 1310"
        onPress={() => router.push('/radio')}
        style={styles.content}
      >
        <View style={[styles.accent, { backgroundColor: colors.red }]} />
        <VinylArtwork size={48} playing={state === 'playing'} />
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.white }]}>
            LA Z 1310
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.subtitle, { color: colors.red }]}
          >
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
    borderRadius: radii.round,
    height: 48,
    width: 3,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 2,
  },
});
