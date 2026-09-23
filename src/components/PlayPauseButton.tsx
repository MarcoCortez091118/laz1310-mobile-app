import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';

import { colors } from '../theme/tokens';

interface PlayPauseButtonProps {
  state: 'play' | 'pause' | 'loading';
  size?: 'compact' | 'large';
  onPress: () => void;
}

export function PlayPauseButton({
  state,
  size = 'large',
  onPress,
}: PlayPauseButtonProps) {
  const dimension = size === 'large' ? 72 : 44;
  const iconSize = size === 'large' ? 31 : 21;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        state === 'pause' ? 'Pausar radio' : 'Reproducir radio'
      }
      disabled={state === 'loading'}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          height: dimension,
          width: dimension,
          borderRadius: dimension / 2,
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      {state === 'loading' ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Ionicons
          color={colors.white}
          name={state === 'pause' ? 'pause' : 'play'}
          size={iconSize}
          style={state === 'play' ? styles.playOffset : undefined}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.red,
    justifyContent: 'center',
  },
  playOffset: {
    marginLeft: 3,
  },
});
