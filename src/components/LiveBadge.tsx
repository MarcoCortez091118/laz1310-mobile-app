import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing } from '../theme/tokens';

interface LiveBadgeProps {
  live?: boolean;
  compact?: boolean;
}

export function LiveBadge({
  live = true,
  compact = false,
}: LiveBadgeProps) {
  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: live ? colors.red : colors.gray },
        ]}
      />
      <Text
        style={[
          styles.label,
          compact && styles.labelCompact,
          { color: live ? colors.red : colors.gray },
        ]}
      >
        {live ? 'EN VIVO' : 'FUERA DEL AIRE'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.round,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  containerCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dot: {
    borderRadius: radii.round,
    height: 8,
    width: 8,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.1,
  },
  labelCompact: {
    fontSize: 10,
  },
});
