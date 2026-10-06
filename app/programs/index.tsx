import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '../../src/components/BottomNavigation';
import { ProgramCard } from '../../src/components/ProgramCard';
import {
  formatProgramTime,
  PROGRAM_WEEKDAYS,
  programScheduleLabel,
  weeklyProgramSlots,
} from '../../src/features/programs/presentation';
import { usePrograms } from '../../src/features/programs/usePrograms';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

export default function ProgramsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { programs, loading, error, refresh } = usePrograms();
  const schedule = weeklyProgramSlots(programs);

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.black }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading && programs.length > 0}
            onRefresh={() => void refresh()}
            tintColor={colors.red}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Regresar"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.back,
              { backgroundColor: colors.surfaceElevated, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons color={colors.white} name="chevron-back" size={22} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: colors.red }]}>LA Z 1310 · PROGRAMACIÓN</Text>
            <Text style={[styles.title, { color: colors.white }]}>Programas</Text>
          </View>
        </View>

        <Text style={[styles.subtitle, { color: colors.muted }]}>Shows, hosts y horarios publicados desde LA Z Digital Platform.</Text>

        {loading && !programs.length ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.red} size="large" />
            <Text style={[styles.stateText, { color: colors.muted }]}>Cargando programación…</Text>
          </View>
        ) : error && !programs.length ? (
          <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons color={colors.red} name="alert-circle-outline" size={26} />
            <Text style={[styles.errorTitle, { color: colors.white }]}>No pudimos cargar los programas</Text>
            <Text style={[styles.stateText, { color: colors.muted }]}>{error}</Text>
            <Pressable onPress={() => void refresh()} style={[styles.retry, { backgroundColor: colors.red }]}>
              <Text style={styles.retryText}>REINTENTAR</Text>
            </Pressable>
          </View>
        ) : programs.length ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.white }]}>TODOS LOS PROGRAMAS</Text>
              <Text style={[styles.count, { color: colors.red }]}>{programs.length}</Text>
            </View>

            <View style={styles.programList}>
              {programs.map((program) => (
                <ProgramCard
                  key={`${program.stationId}:${program.id}`}
                  hostName={program.hostName}
                  imageUrl={program.imageUrl}
                  schedule={programScheduleLabel(program)}
                  title={program.name}
                />
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.white }]}>HORARIO SEMANAL</Text>
            </View>

            <View style={styles.week}>
              {schedule.map((slots, weekday) => {
                const dayName = PROGRAM_WEEKDAYS[weekday] ?? `Día ${weekday + 1}`;
                return (
                  <View
                    key={dayName}
                    style={[styles.dayCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                  >
                    <Text style={[styles.dayName, { color: colors.white }]}>{dayName}</Text>
                    {slots.length ? (
                      <View style={styles.daySlots}>
                        {slots.map((slot) => (
                          <View key={`${slot.program.stationId}:${slot.id}`} style={styles.slot}>
                            <View style={[styles.slotRail, { backgroundColor: colors.red }]} />
                            <View style={styles.slotCopy}>
                              <Text style={[styles.slotTime, { color: colors.red }]}>
                                {formatProgramTime(slot.startsAt)} – {formatProgramTime(slot.endsAt)}
                              </Text>
                              <Text style={[styles.slotTitle, { color: colors.white }]}>{slot.program.name}</Text>
                              {slot.program.hostName ? (
                                <Text style={[styles.slotHost, { color: colors.muted }]}>{slot.program.hostName}</Text>
                              ) : null}
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={[styles.emptyDay, { color: colors.gray }]}>Sin programación publicada</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.state}>
            <Ionicons color={colors.gray} name="mic-outline" size={34} />
            <Text style={[styles.errorTitle, { color: colors.white }]}>Aún no hay programas publicados</Text>
            <Text style={[styles.stateText, { color: colors.muted }]}>Cuando el equipo publique Programs desde el WebAdmin aparecerán aquí automáticamente.</Text>
          </View>
        )}
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingBottom: 180,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  back: {
    alignItems: 'center',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.25,
  },
  title: {
    fontFamily: fonts.displayBlack,
    fontSize: 39,
    lineHeight: 41,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
    maxWidth: 340,
  },
  state: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 260,
    paddingHorizontal: spacing.lg,
  },
  stateText: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
  errorCard: {
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  errorTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 21,
    textAlign: 'center',
  },
  retry: {
    borderRadius: 10,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  retryText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 27,
  },
  count: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  programList: {
    gap: spacing.md,
  },
  week: {
    gap: spacing.sm,
  },
  dayCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  dayName: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  daySlots: {
    gap: spacing.sm,
  },
  slot: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  slotRail: {
    borderRadius: 99,
    width: 3,
  },
  slotCopy: {
    flex: 1,
    paddingVertical: 2,
  },
  slotTime: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
  },
  slotTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    marginTop: 2,
  },
  slotHost: {
    fontFamily: fonts.body,
    fontSize: 10,
    marginTop: 2,
  },
  emptyDay: {
    fontFamily: fonts.body,
    fontSize: 10,
  },
});
