import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme/tokens';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface IconButtonProps {
  name: IoniconName;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  backgroundColor?: string;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
}

export function IconButton({
  name,
  onPress,
  size = 42,
  iconSize = 21,
  backgroundColor = colors.surfaceElevated,
  iconColor = colors.white,
  style,
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          opacity: pressed ? 0.72 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={name} color={iconColor} size={iconSize} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
