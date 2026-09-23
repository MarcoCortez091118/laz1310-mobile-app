import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { getDynamicCampaign } from '../../../src/features/dynamics/data';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

interface FormState {
  name: string;
  email: string;
  phone: string;
  answer: string;
}

const initialForm: FormState = {
  name: '',
  email: '',
  phone: '',
  answer: '',
};

export default function DynamicsParticipationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const campaign = getDynamicCampaign(id);
  const { colors } = useAppTheme();

  const [form, setForm] = useState(initialForm);

  const valid = useMemo(
    () =>
      form.name.trim().length >= 2 &&
      form.email.includes('@') &&
      form.answer.trim().length >= 2,
    [form],
  );

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = () => {
    if (!valid) {
      return;
    }

    router.replace({
      pathname: '/dynamics/confirmation',
      params: { title: campaign.title },
    });
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Formulario" />

        <Text style={[styles.title, { color: colors.white }]}>
          {campaign.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Completa los campos requeridos para simular tu participación.
        </Text>

        {[
          {
            key: 'name' as const,
            label: 'NOMBRE',
            placeholder: 'Tu nombre',
            keyboardType: 'default' as const,
          },
          {
            key: 'email' as const,
            label: 'CORREO',
            placeholder: 'tu@correo.com',
            keyboardType: 'email-address' as const,
          },
          {
            key: 'phone' as const,
            label: 'TELÉFONO',
            placeholder: '(000) 000-0000',
            keyboardType: 'phone-pad' as const,
          },
          {
            key: 'answer' as const,
            label: 'RESPUESTA / COMENTARIO',
            placeholder: 'Escribe tu respuesta',
            keyboardType: 'default' as const,
          },
        ].map((field) => (
          <View key={field.key} style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.muted }]}>
              {field.label}
            </Text>
            <TextInput
              autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
              keyboardType={field.keyboardType}
              onChangeText={(value) => update(field.key, value)}
              placeholder={field.placeholder}
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  color: colors.white,
                },
              ]}
              value={form[field.key]}
            />
          </View>
        ))}

        <Text style={[styles.terms, { color: colors.muted }]}>
          Al enviar aceptas las bases y condiciones de esta dinámica. En esta
          rama el formulario es local y no envía datos a ningún backend.
        </Text>

        <PrimaryButton
          disabled={!valid}
          label="Enviar participación"
          onPress={submit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 32,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.lg,
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  terms: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 18,
  },
});
