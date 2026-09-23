import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing } from '../theme/tokens';

export function PromoHero() {
  return (
    <Pressable style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.diagonal} />
      <Text style={styles.eyebrow}>★ EVENTO DESTACADO</Text>
      <Text style={styles.title}>TARDEADA{String.fromCharCode(10)}BAILE</Text>
      <View style={styles.cta}>
        <Text style={styles.ctaText}>MÁS INFORMACIÓN</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>CAMPAÑA</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 224,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  glow: {
    backgroundColor: colors.red,
    borderRadius: 180,
    height: 280,
    opacity: 0.18,
    position: 'absolute',
    right: -80,
    top: -80,
    width: 280,
  },
  diagonal: {
    backgroundColor: colors.red,
    height: 360,
    opacity: 0.82,
    position: 'absolute',
    right: -42,
    top: -74,
    transform: [{ rotate: '25deg' }],
    width: 78,
  },
  eyebrow: {
    color: colors.red,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.displayBlack,
    fontSize: 40,
    lineHeight: 39,
    marginTop: 14,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.red,
    borderRadius: 10,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ctaText: {
    color: colors.white,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  badge: {
    backgroundColor: colors.red,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'absolute',
    right: 14,
    top: 14,
  },
  badgeText: {
    color: colors.white,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
});
