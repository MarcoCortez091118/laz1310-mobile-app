import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { LazInterest } from '../../src/features/auth/api';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

const interestOptions: Array<{ key: LazInterest; label: string }> = [
  { key: 'radio', label: 'Radio' },
  { key: 'news', label: 'Noticias' },
  { key: 'events', label: 'Eventos' },
  { key: 'shows', label: 'Shows' },
  { key: 'community', label: 'Comunidad' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { status, profile, updateDisplayName, updateInterests } = useAuth();
  const { colors } = useAppTheme();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [interests, setInterests] = useState<LazInterest[]>(profile?.interests ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'signedOut') {
      router.replace('/auth');
    }
  }, [router, status]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? '');
      setInterests(profile.interests ?? []);
    }
  }, [profile]);

  const interestsChanged = useMemo(
    () => JSON.stringify(interests) !== JSON.stringify(profile?.interests ?? []),
    [interests, profile?.interests],
  );

  const toggleInterest = (interest: LazInterest) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
    setError(null);
  };

  const save = async () => {
    const normalized = displayName.trim();

    if (normalized.length < 2 || saving || !profile) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (normalized !== (profile.displayName ?? '')) {
        await updateDisplayName(normalized);
      }

      if (interestsChanged) {
        await updateInterests(interests);
      }

      router.back();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'No pudimos guardar el perfil.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Editar perfil" />

        <Text style={[styles.title, { color: colors.white }]}>Tu información</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}> 
          Tu perfil e intereses se guardan en LA Z. El nombre también se sincroniza con Firebase.
        </Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.muted }]}>NOMBRE</Text>
          <TextInput
            autoCapitalize="words"
            autoComplete="name"
            maxLength={160}
            onChangeText={(value) => {
              setDisplayName(value);
              setError(null);
            }}
            placeholder="Tu nombre"
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                color: colors.white,
              },
            ]}
            value={displayName}
          />
        </View>

        <View
          style={[
            styles.readonlyCard,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.label, { color: colors.muted }]}>CORREO</Text>
          <Text style={[styles.value, { color: colors.white }]}>
            {profile.email || 'Sin correo'}
          </Text>
          <Text style={[styles.readonlyNote, { color: colors.muted }]}> 
            El cambio de correo requiere un flujo de reautenticación separado.
          </Text>
        </View>

        <View style={styles.interestsSection}>
          <Text style={[styles.label, { color: colors.muted }]}>INTERESES</Text>
          <Text style={[styles.interestsHelp, { color: colors.muted }]}> 
            Elige el contenido que te interesa. Esto no activa ni desactiva notificaciones.
          </Text>
          <View style={styles.chips}>
            {interestOptions.map((option) => {
              const selected = interests.includes(option.key);
              return (
                <Pressable
                  key={option.key}
                  onPress={() => toggleInterest(option.key)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.red : colors.surfaceElevated,
                      borderColor: selected ? colors.red : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selected ? '#FEFEFE' : colors.white },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error ? <Text style={[styles.error, { color: colors.red }]}>{error}</Text> : null}

        <View style={styles.actions}>
          <PrimaryButton
            disabled={displayName.trim().length < 2 || saving}
            label={saving ? 'Guardando…' : 'Guardar cambios'}
            onPress={() => void save()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: 60, paddingHorizontal: spacing.md },
  title: { fontFamily: fonts.displayExtraBold, fontSize: 30, marginTop: spacing.lg },
  subtitle: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 4 },
  field: { marginTop: spacing.lg },
  label: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 0.9 },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    marginTop: 7,
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  readonlyCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: 16,
    padding: spacing.md,
  },
  value: { fontFamily: fonts.bodySemiBold, fontSize: 14, marginTop: 8 },
  readonlyNote: { fontFamily: fonts.body, fontSize: 9, lineHeight: 14, marginTop: 9 },
  interestsSection: { marginTop: 22 },
  interestsHelp: { fontFamily: fonts.body, fontSize: 10, lineHeight: 15, marginTop: 5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipText: { fontFamily: fonts.bodySemiBold, fontSize: 11 },
  error: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 16, marginTop: 14 },
  actions: { marginTop: spacing.lg },
});
