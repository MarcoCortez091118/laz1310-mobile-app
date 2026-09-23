import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
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
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      {state === 'loading' ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text
          style={[
            styles.icon,
            { fontSize: size === 'large' ? 30 : 20 },
          ]}
        >
          {state === 'pause' ? 'Ⅱ' : '▶'}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.red,
    borderRadius: 999,
    justifyContent: 'center',
  },
  icon: {
    color: colors.white,
    fontWeight: '900',
  },
});
