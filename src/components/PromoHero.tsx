import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii, spacing } from '../theme/tokens';

interface PromoHeroProps {
  onPress?: () => void;
}

export function PromoHero({ onPress }: PromoHeroProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel="Abrir dinámicas"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed && onPress ? 0.84 : 1,
        },
      ]}
    >
      <View style={[styles.glow, { backgroundColor: colors.red }]} />
      <View style={[styles.diagonal, { backgroundColor: colors.red }]} />
      <Text style={[styles.eyebrow, { color: colors.red }]}>
        ★ DINÁMICA DESTACADA
      </Text>
      <Text style={[styles.title, { color: colors.white }]}>
        PARTICIPA{String.fromCharCode(10)}CON LA Z
      </Text>
      <View style={[styles.cta, { backgroundColor: colors.red }]}> 
        <Text style={styles.ctaText}>VER DINÁMICAS</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: colors.red }]}> 
        <Text style={styles.badgeText}>ACTIVA</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    borderWidth: 1,
    height: 224,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  glow: {
    borderRadius: 180,
    height: 280,
    opacity: 0.18,
    position: 'absolute',
    right: -80,
    top: -80,
    width: 280,
  },
  diagonal: {
    height: 360,
    opacity: 0.82,
    position: 'absolute',
    right: -42,
    top: -74,
    transform: [{ rotate: '25deg' }],
    width: 78,
  },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: fonts.displayBlack,
    fontSize: 40,
    lineHeight: 39,
    marginTop: 14,
  },
  cta: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ctaText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'absolute',
    right: 14,
    top: 14,
  },
  badgeText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
});
