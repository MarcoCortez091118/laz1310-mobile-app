import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '../src/components/IconButton';
import { LiveBadge } from '../src/components/LiveBadge';
import { PlayPauseButton } from '../src/components/PlayPauseButton';
import { VinylArtwork } from '../src/components/VinylArtwork';
import { RADIO_CONFIG } from '../src/config/radio';
import { useRadio } from '../src/features/radio/useRadio';
import { colors, fonts, radii, spacing } from '../src/theme/tokens';

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
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <View style={styles.topBar}>
        <IconButton
          accessibilityLabel="Volver"
          backgroundColor="transparent"
          iconSize={28}
          name="chevron-back"
          onPress={() => router.back()}
          size={40}
        />

        <View style={styles.stationHeader}>
          <Text style={styles.station}>LA Z 1310 AM</Text>
          <Text style={styles.city}>DETROIT, MI</Text>
        </View>

        <IconButton
          accessibilityLabel="Más opciones"
          backgroundColor="transparent"
          iconSize={24}
          name="ellipsis-horizontal"
          size={40}
        />
      </View>

      <View style={styles.vinylStage}>
        <VinylArtwork size={272} playing={state === 'playing'} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaCopy}>
          <Text style={styles.title}>LA Z DETROIT</Text>
          <Text style={styles.slogan}>Marcando territorio</Text>
        </View>

        <View style={styles.actions}>
          <IconButton
            accessibilityLabel="Agregar a favoritos"
            name="heart-outline"
          />
          <IconButton
            accessibilityLabel="Compartir"
            name="share-outline"
          />
        </View>
      </View>

      <View style={styles.liveRow}>
        <LiveBadge live={state !== 'error'} />
        <Text style={styles.time}>
          HORA DETROIT · {detroitTime}
        </Text>
      </View>

      <View style={styles.controls}>
        <IconButton
          accessibilityLabel="Temporizador"
          iconColor={colors.muted}
          name="timer-outline"
          size={46}
        />

        <PlayPauseButton
          onPress={state === 'error' ? retry : toggle}
          state={buttonState}
        />

        <IconButton
          accessibilityLabel="Volumen"
          iconColor={colors.muted}
          name="volume-medium-outline"
          size={46}
        />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.eyebrow}>AHORA AL AIRE</Text>
        <Text style={styles.nowTitle}>
          {state === 'error'
            ? 'TRANSMISIÓN NO DISPONIBLE'
            : state === 'reconnecting'
              ? 'RECONECTANDO TRANSMISIÓN'
              : 'MÚSICA QUE TE MUEVE'}
        </Text>
        <Text numberOfLines={2} style={styles.infoSubtitle}>
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
        <Ionicons
          color={colors.gray}
          name="chevron-forward"
          size={22}
        />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    alignItems: 'center',
    backgroundColor: colors.burgundy,
    flex: 1,
    gap: 13,
    paddingHorizontal: 20,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 48,
    justifyContent: 'space-between',
    width: '100%',
  },
  stationHeader: {
    alignItems: 'center',
  },
  station: {
    color: colors.white,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  city: {
    color: colors.gray,
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1.1,
    marginTop: 2,
  },
  vinylStage: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 288,
    width: '100%',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  metaCopy: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.displayExtraBold,
    fontSize: 34,
    lineHeight: 34,
  },
  slogan: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 15,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  liveRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  time: {
    color: colors.gray,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
    width: 300,
  },
  infoCard: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 2,
    padding: 14,
    width: '100%',
  },
  eyebrow: {
    color: colors.red,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  nowTitle: {
    color: colors.white,
    fontFamily: fonts.displayExtraBold,
    fontSize: 22,
    lineHeight: 24,
    marginTop: 2,
  },
  infoSubtitle: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 11,
  },
  programCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: 14,
    width: '100%',
  },
  programTitle: {
    color: colors.white,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
});
