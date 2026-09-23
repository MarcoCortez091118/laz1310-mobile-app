import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../theme/tokens';

export function PromoHero() {
  return (
    <Pressable style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.diagonal} />
      <Text style={styles.eyebrow}>★ EVENTO DESTACADO</Text>
      <Text style={styles.title}>TARDEADA{String.fromCharCode(10)}BAILE</Text>
      <Pressable style={styles.cta}>
        <Text style={styles.ctaText}>MÁS INFORMACIÓN</Text>
      </Pressable>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>CAMPAÑA</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
    borderRadius: radii.md,
    height: 224,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  glow: {
    backgroundColor: colors.red,
    borderRadius: 180,
    height: 280,
    opacity: 0.2,
    position: 'absolute',
    right: -80,
    top: -80,
    width: 280,
  },
  diagonal: {
    backgroundColor: colors.red,
    height: 360,
    opacity: 0.9,
    position: 'absolute',
    right: -32,
    top: -70,
    transform: [{ rotate: '25deg' }],
    width: 90,
  },
  eyebrow: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    color: colors.white,
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 38,
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
    fontSize: 12,
    fontWeight: '800',
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
    fontSize: 10,
    fontWeight: '800',
  },
});
