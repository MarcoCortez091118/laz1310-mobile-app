import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../theme/tokens';

interface ProgramCardProps {
  title: string;
  schedule: string;
}

export function ProgramCard({
  title,
  schedule,
}: ProgramCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.artwork}>
        <View style={styles.diagonal} />
        <Text style={styles.mark}>LA Z</Text>
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        <Text style={styles.schedule}>{schedule}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.burgundy,
    borderRadius: radii.md,
    flex: 1,
    minHeight: 230,
    overflow: 'hidden',
  },
  artwork: {
    backgroundColor: colors.black,
    height: 132,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    padding: spacing.md,
  },
  diagonal: {
    backgroundColor: colors.red,
    height: 220,
    position: 'absolute',
    right: -18,
    top: -48,
    transform: [{ rotate: '28deg' }],
    width: 80,
  },
  mark: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '900',
  },
  copy: {
    gap: 5,
    padding: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
    minHeight: 38,
  },
  schedule: {
    color: colors.red,
    fontSize: 10,
  },
});
