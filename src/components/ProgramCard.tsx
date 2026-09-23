import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii, spacing } from '../theme/tokens';

interface ProgramCardProps {
  title: string;
  schedule: string;
}

export function ProgramCard({
  title,
  schedule,
}: ProgramCardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.burgundy,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.artwork, { backgroundColor: colors.surface }]}>
        <View style={[styles.glow, { backgroundColor: colors.red }]} />
        <View style={[styles.diagonal, { backgroundColor: colors.red }]} />
        <Ionicons
          color={colors.white}
          name="mic"
          size={30}
          style={styles.mic}
        />
        <Text style={[styles.mark, { color: colors.white }]}>LA Z</Text>
      </View>
      <View style={styles.copy}>
        <Text
          numberOfLines={2}
          style={[styles.title, { color: colors.white }]}
        >
          {title}
        </Text>
        <Text
          numberOfLines={2}
          style={[styles.schedule, { color: colors.red }]}
        >
          {schedule}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 230,
    overflow: 'hidden',
  },
  artwork: {
    height: 132,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    padding: spacing.md,
  },
  glow: {
    borderRadius: 90,
    height: 150,
    opacity: 0.13,
    position: 'absolute',
    right: -45,
    top: -40,
    width: 150,
  },
  diagonal: {
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
    fontFamily: fonts.displayBold,
    fontSize: 24,
  },
  copy: {
    gap: 5,
    padding: spacing.sm,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    lineHeight: 18,
    minHeight: 38,
  },
  schedule: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
  },
});
