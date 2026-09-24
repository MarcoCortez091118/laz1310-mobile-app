import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  DynamicCampaign,
  getDynamics,
} from '../features/dynamics/api';
import { dynamicDeadline } from '../features/dynamics/presentation';
import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii, spacing } from '../theme/tokens';

export function PromoHero() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [campaign, setCampaign] = useState<DynamicCampaign | null>(null);

  useEffect(() => {
    let active = true;

    void getDynamics()
      .then((result) => {
        if (!active) {
          return;
        }

        const available = result.items.filter((item) => item.status === 'active');
        setCampaign(
          available.find((item) => item.featured) ?? available[0] ?? null,
        );
      })
      .catch(() => {
        if (active) {
          setCampaign(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!campaign) {
    return null;
  }

  return (
    <Pressable
      accessibilityLabel={'Abrir dinámica ' + campaign.title}
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: '/dynamics/[id]',
          params: { id: campaign.id },
        })
      }
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.84 : 1,
        },
      ]}
    >
      <Image source={{ uri: campaign.imageUrl }} style={styles.image} />
      <View style={styles.scrim} />
      <View style={[styles.glow, { backgroundColor: colors.red }]} />
      <Text style={[styles.eyebrow, { color: colors.red }]}>
        ★ {campaign.artworkLabel.toUpperCase()}
      </Text>
      <Text numberOfLines={2} style={[styles.title, { color: colors.white }]}>
        {campaign.title}
      </Text>
      <Text style={[styles.deadline, { color: colors.white }]}>
        {dynamicDeadline(campaign.endsAt, campaign.timezone)}
      </Text>
      <View style={[styles.cta, { backgroundColor: colors.red }]}>
        <Text style={styles.ctaText}>PARTICIPAR</Text>
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
  image: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,1,1,0.74)',
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
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: fonts.displayBlack,
    fontSize: 38,
    lineHeight: 38,
    marginTop: 12,
    maxWidth: '88%',
  },
  deadline: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    marginTop: 5,
  },
  cta: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ctaText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
});
