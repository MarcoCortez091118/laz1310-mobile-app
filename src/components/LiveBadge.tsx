import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../theme/tokens';

interface LiveBadgeProps {
  live?: boolean;
}

export function LiveBadge({ live = true }: LiveBadgeProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dot,
          { backgroundColor: live ? colors.red : colors.gray },
        ]}
      />
      <Text
        style={[
          styles.label,
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
  dot: {
    borderRadius: radii.round,
    height: 8,
    width: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
