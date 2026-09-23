import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiveBadge } from '../src/components/LiveBadge';
import { PlayPauseButton } from '../src/components/PlayPauseButton';
import { VinylArtwork } from '../src/components/VinylArtwork';
import { RADIO_CONFIG } from '../src/config/radio';
import { useRadio } from '../src/features/radio/useRadio';
import { colors, radii, spacing } from '../src/theme/tokens';

function formatDetroitTime(date: Date) {
  return new Intl.DateTimeFormat('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: RADIO_CONFIG.timeZone,
  }).format(date);
}

export default function RadioScreen() {
  const router = useRouter();
  const { state, error, toggle, retry } = useRadio();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const detroitTime = useMemo(() => formatDetroitTime(now), [now]);

  const loading = state === 'connecting' || state === 'reconnecting';
  const buttonState =
    loading ? 'loading' : state === 'playing' ? 'pause' : 'play';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Text style={styles.icon}>‹</Text>
        </Pressable>

        <View style={styles.stationHeader}>
          <Text style={styles.station}>LA Z 1310 AM</Text>
          <Text style={styles.city}>DETROIT, MI</Text>
        </View>

        <View style={styles.iconButton}>
          <Text style={styles.more}>•••</Text>
        </View>
      </View>

      <VinylArtwork size={270} playing={state === 'playing'} />

      <View style={styles.metaRow}>
        <View>
          <Text style={styles.title}>LA Z DETROIT</Text>
          <Text style={styles.slogan}>Marcando territorio</Text>
        </View>
        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <Text style={styles.actionIcon}>♡</Text>
          </View>
          <View style={styles.actionButton}>
            <Text style={styles.actionIcon}>↗</Text>
          </View>
        </View>
      </View>

      <View style={styles.liveRow}>
        <LiveBadge live={state !== 'error'} />
        <Text style={styles.time}>
          HORA DETROIT · {detroitTime}
        </Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.secondaryControl}>
          <Text style={styles.secondaryIcon}>◷</Text>
        </View>

        <PlayPauseButton
          onPress={state === 'error' ? retry : toggle}
          state={buttonState}
        />

        <View style={styles.secondaryControl}>
          <Text style={styles.secondaryIcon}>◖</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.eyebrow}>AHORA AL AIRE</Text>
        <Text style={styles.nowTitle}>
          {state === 'error'
            ? 'TRANSMISIÓN NO DISPONIBLE'
            : 'MÚSICA QUE TE MUEVE'}
        </Text>
        <Text style={styles.infoSubtitle}>
          {error ?? 'LA Z 1310 · Transmisión en vivo'}
        </Text>
      </View>

      <Pressable style={styles.programCard}>
        <View>
          <Text style={styles.programTitle}>PROGRAMACIÓN</Text>
          <Text style={styles.infoSubtitle}>
            Consulta lo que sigue al aire
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    alignItems: 'center',
    backgroundColor: colors.burgundy,
    flex: 1,
    gap: 14,
    paddingHorizontal: 20,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 48,
    justifyContent: 'space-between',
    width: '100%',
  },
  iconButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  icon: {
    color: colors.white,
    fontSize: 38,
    fontWeight: '200',
    marginTop: -8,
  },
  more: {
    color: colors.white,
    fontSize: 15,
    letterSpacing: 2,
  },
  stationHeader: {
    alignItems: 'center',
  },
  station: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  city: {
    color: colors.gray,
    fontSize: 10,
    letterSpacing: 1.1,
    marginTop: 2,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  title: {
    color: colors.white,
    fontSize: 31,
    fontWeight: '900',
  },
  slogan: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.round,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  actionIcon: {
    color: colors.white,
    fontSize: 24,
  },
  liveRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  time: {
    color: colors.gray,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
    width: 300,
  },
  secondaryControl: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.round,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  secondaryIcon: {
    color: colors.white,
    fontSize: 22,
  },
  infoCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    gap: 2,
    padding: 14,
    width: '100%',
  },
  eyebrow: {
    color: colors.red,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  nowTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  infoSubtitle: {
    color: colors.muted,
    fontSize: 11,
  },
  programCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: 14,
    width: '100%',
  },
  programTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  chevron: {
    color: colors.gray,
    fontSize: 30,
  },
});
