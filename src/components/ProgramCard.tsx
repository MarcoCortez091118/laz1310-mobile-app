import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing } from '../theme/tokens';

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
        <View style={styles.glow} />
        <View style={styles.diagonal} />
        <Ionicons
          color={colors.white}
          name="mic"
          size={30}
          style={styles.mic}
        />
        <Text style={styles.mark}>LA Z</Text>
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={2} style={styles.schedule}>
          {schedule}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.burgundy,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 230,
    overflow: 'hidden',
  },
  artwork: {
    backgroundColor: colors.surface,
    height: 132,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    padding: spacing.md,
  },
  glow: {
    backgroundColor: colors.red,
    borderRadius: 90,
    height: 150,
    opacity: 0.13,
    position: 'absolute',
    right: -45,
    top: -40,
    width: 150,
  },
  diagonal: {
    backgroundColor: colors.red,
    height: 190,
    opacity: 0.88,
    position: 'absolute',
    right: 0,
    top: -62,
    transform: [{ rotate: '28deg' }],
    width: 24,
  },
  mic: {
    marginBottom: 8,
    opacity: 0.92,
  },
  mark: {
    color: colors.white,
    fontFamily: fonts.displayBold,
    fontSize: 24,
  },
  copy: {
    gap: 5,
    padding: spacing.sm,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.displayBold,
    fontSize: 17,
    lineHeight: 18,
    minHeight: 38,
  },
  schedule: {
    color: colors.red,
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
  },
});
