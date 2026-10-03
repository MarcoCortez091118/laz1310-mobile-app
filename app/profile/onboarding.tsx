import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InterestSelector } from '../../src/components/InterestSelector';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { UserInterest } from '../../src/features/auth/api';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useNotifications } from '../../src/features/notifications/NotificationsProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, spacing } from '../../src/theme/tokens';

type Phase = 'interests' | 'notifications';

export default function ProfileOnboardingScreen() {
  const router = useRouter();
  const { status, profile, updateInterests } = useAuth();
  const { enablePush, loading: pushLoading } = useNotifications();
  const { colors } = useAppTheme();
  const [phase, setPhase] = useState<Phase>('interests');
  const [selected, setSelected] = useState<UserInterest[]>(
    profile?.interests ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'signedOut') {
      router.replace('/auth');
    }
  }, [router, status]);

  const saveInterests = async () => {
    if (saving) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateInterests(selected);
      setPhase('notifications');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'No pudimos guardar tus intereses.',
      );
    } finally {
      setSaving(false);
    }
  };

  const activatePush = async () => {
    setError(null);
    try {
      const enabled = await enablePush();
      if (enabled) {
        router.replace('/home');
      } else {
        setError(
          'El permiso no fue concedido. Puedes activarlo después desde Configuración.',
        );
      }
    } catch (pushError) {
      setError(
        pushError instanceof Error
          ? pushError.message
          : 'No pudimos activar las notificaciones.',
      );
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.red }]}>TU CUENTA LA Z</Text>

        {phase === 'interests' ? (
          <>
            <Text style={[styles.title, { color: colors.white }]}>Haz LA Z tuya</Text>
            <Text style={[styles.body, { color: colors.muted }]}>
              Elige lo que más te interesa. Esto personaliza tu perfil y es independiente de los avisos push.
            </Text>

            <InterestSelector selected={selected} onChange={setSelected} />

            <Text style={[styles.note, { color: colors.muted }]}>
              Puedes continuar sin elegir ninguno y cambiar esta selección después.
            </Text>

            {error ? <Text style={[styles.error, { color: colors.red }]}>{error}</Text> : null}

            <View style={styles.actions}>
              <PrimaryButton
                disabled={saving}
                label={saving ? 'Guardando…' : 'Guardar y continuar'}
                onPress={() => void saveInterests()}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: colors.white }]}>No te pierdas nada</Text>
            <Text style={[styles.body, { color: colors.muted }]}>
              Activa notificaciones para recibir avisos de LA Z. El permiso pertenece a este dispositivo y puedes cambiar las categorías cuando quieras.
            </Text>

            {error ? <Text style={[styles.error, { color: colors.red }]}>{error}</Text> : null}

            <View style={styles.actions}>
              <PrimaryButton
                disabled={pushLoading}
                label={pushLoading ? 'Activando…' : 'Activar notificaciones'}
                onPress={() => void activatePush()}
              />
              <PrimaryButton
                disabled={pushLoading}
                label="Ahora no"
                onPress={() => router.replace('/home')}
                secondary
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 40,
    marginTop: 8,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 14,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 14,
  },
  actions: {
    gap: 12,
    marginTop: spacing.lg,
  },
});
