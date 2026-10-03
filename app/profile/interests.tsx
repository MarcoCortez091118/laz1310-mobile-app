import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InterestSelector } from '../../src/components/InterestSelector';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { UserInterest } from '../../src/features/auth/api';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, spacing } from '../../src/theme/tokens';

export default function InterestsScreen() {
  const router = useRouter();
  const { status, profile, updateInterests } = useAuth();
  const { colors } = useAppTheme();
  const [selected, setSelected] = useState<UserInterest[]>(profile?.interests ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'signedOut') {
      router.replace('/auth');
    }
  }, [router, status]);

  useEffect(() => {
    setSelected(profile?.interests ?? []);
  }, [profile?.interests]);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await updateInterests(selected);
      router.back();
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

  if (!profile) return null;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.black }]}>
      <View style={styles.content}>
        <ScreenHeader title="Intereses" />
        <Text style={[styles.title, { color: colors.white }]}>Lo que quieres ver</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Son preferencias de contenido. No activan ni desactivan notificaciones push.
        </Text>

        <InterestSelector selected={selected} onChange={setSelected} />

        {error ? <Text style={[styles.error, { color: colors.red }]}>{error}</Text> : null}

        <View style={styles.actions}>
          <PrimaryButton
            disabled={saving}
            label={saving ? 'Guardando…' : 'Guardar intereses'}
            onPress={() => void save()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: spacing.md },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 30,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    marginTop: 14,
  },
  actions: { marginTop: spacing.lg },
});
