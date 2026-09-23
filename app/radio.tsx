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
import { useAppTheme } from '../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../src/theme/tokens';

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
  const { colors } = useAppTheme();
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
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: colors.burgundy }]}
    >
      <View style={styles.topBar}>
        <IconButton
          accessibilityLabel="Volver"
          backgroundColor="transparent"
          iconColor={colors.white}
          iconSize={28}
          name="chevron-back"
          onPress={() => router.back()}
          size={40}
        />

        <View style={styles.stationHeader}>
          <Text style={[styles.station, { color: colors.white }]}>
            LA Z 1310 AM
          </Text>
          <Text style={[styles.city, { color: colors.gray }]}>
            DETROIT, MI
          </Text>
        </View>

        <IconButton
          accessibilityLabel="Más opciones"
          backgroundColor="transparent"
          iconColor={colors.white}
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
          <Text style={[styles.title, { color: colors.white }]}>
            LA Z DETROIT
          </Text>
          <Text style={[styles.slogan, { color: colors.muted }]}>
            Marcando territorio
          </Text>
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
        <Text style={[styles.time, { color: colors.gray }]}>
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

      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.eyebrow, { color: colors.red }]}>
          AHORA AL AIRE
        </Text>
        <Text style={[styles.nowTitle, { color: colors.white }]}>
          {state === 'error'
            ? 'TRANSMISIÓN NO DISPONIBLE'
            : state === 'reconnecting'
              ? 'RECONECTANDO TRANSMISIÓN'
              : 'MÚSICA QUE TE MUEVE'}
        </Text>
        <Text
          numberOfLines={2}
          style={[styles.infoSubtitle, { color: colors.muted }]}
        >
          {error ?? 'LA Z 1310 · Transmisión en vivo'}
        </Text>
      </View>

      <Pressable
        style={[
          styles.programCard,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.programTitle, { color: colors.white }]}>
            PROGRAMACIÓN
          </Text>
          <Text style={[styles.infoSubtitle, { color: colors.muted }]}>
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
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  city: {
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
    fontFamily: fonts.displayExtraBold,
    fontSize: 34,
    lineHeight: 34,
  },
  slogan: {
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
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 2,
    padding: 14,
    width: '100%',
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  nowTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 22,
    lineHeight: 24,
    marginTop: 2,
  },
  infoSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
  },
  programCard: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: 14,
    width: '100%',
  },
  programTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
});
