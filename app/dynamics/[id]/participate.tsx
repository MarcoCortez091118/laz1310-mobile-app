import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '../../../src/api/client';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import { getFirebaseSecurityTokens } from '../../../src/features/auth/firebase';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import {
  DynamicCampaign,
  DynamicFormField,
  getDynamic,
  submitParticipation,
} from '../../../src/features/dynamics/api';
import {
  createIdempotencyKey,
  validateDynamicField,
} from '../../../src/features/dynamics/presentation';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

function keyboardType(field: DynamicFormField) {
  if (field.type === 'email') {
    return 'email-address' as const;
  }

  if (field.type === 'phone') {
    return 'phone-pad' as const;
  }

  return 'default' as const;
}

function placeholder(field: DynamicFormField) {
  if (field.type === 'email') {
    return 'tu@correo.com';
  }

  if (field.type === 'phone') {
    return '+13135550123';
  }

  return field.label;
}

function submissionError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'No pudimos enviar tu participación. Revisa tu conexión.';
  }

  switch (error.status) {
    case 401:
      return 'Esta instalación todavía no tiene una verificación Firebase/App Check válida para participar.';
    case 404:
      return 'La dinámica ya no está disponible. Regresa y actualiza la lista.';
    case 409:
      return 'La dinámica cambió, cerró o ya existe una participación con estos datos. Actualiza antes de volver a intentar.';
    case 422:
      return 'Revisa los campos y el consentimiento. El servidor rechazó alguno de los valores.';
    case 429:
      return error.retryAfterSeconds
        ? 'Demasiados intentos. Intenta nuevamente en ' +
            error.retryAfterSeconds +
            ' segundos.'
        : 'Demasiados intentos. Espera un momento antes de volver a enviar.';
    case 503:
      return 'Las participaciones están temporalmente deshabilitadas o el servicio no está disponible.';
    default:
      return 'No pudimos registrar tu participación.';
  }
}

export default function DynamicsParticipationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const [campaign, setCampaign] = useState<DynamicCampaign | null>(null);
  const [releaseId, setReleaseId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setLoadError('Falta el identificador de la dinámica.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);

    try {
      const result = await getDynamic(id);
      setCampaign(result.item);
      setReleaseId(result.releaseId);
      setValues(
        Object.fromEntries(result.item.participation.fields.map((field) => [field.key, ''])),
      );
    } catch {
      setCampaign(null);
      setReleaseId(null);
      setLoadError('No pudimos cargar el formulario publicado.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const validation = useMemo(() => {
    if (!campaign || campaign.participation.type !== 'form') {
      return {};
    }

    return Object.fromEntries(
      campaign.participation.fields.map((field) => [
        field.key,
        validateDynamicField(field, values[field.key] ?? ''),
      ]),
    ) as Record<string, string | null>;
  }, [campaign, values]);

  const formValid =
    campaign?.participation.type === 'form' &&
    campaign.status === 'active' &&
    Boolean(releaseId) &&
    campaign.participation.fields.every((field) => !validation[field.key]) &&
    termsAccepted &&
    privacyAccepted &&
    (!campaign.participation.requiresAuth || isAuthenticated);

  const rotateIdempotencyIfNeeded = () => {
    if (attempted) {
      setIdempotencyKey(createIdempotencyKey());
      setAttempted(false);
    }
    setSubmitError(null);
  };

  const update = (field: string, value: string) => {
    rotateIdempotencyIfNeeded();
    setValues((current) => ({ ...current, [field]: value }));
  };

  const submit = async () => {
    if (!campaign || !releaseId || !formValid || submitting) {
      return;
    }

    setSubmitting(true);
    setAttempted(true);
    setSubmitError(null);

    try {
      const normalizedValues = Object.fromEntries(
        campaign.participation.fields
          .map((field) => [field.key, (values[field.key] ?? '').trim()] as const)
          .filter(([, value]) => value.length > 0),
      );

      const security = await getFirebaseSecurityTokens(
        campaign.participation.requiresAuth,
      );

      const receipt = await submitParticipation({
        dynamicId: campaign.id,
        releaseId,
        values: normalizedValues,
        consentVersion: campaign.consentVersion,
        idempotencyKey,
        security,
      });

      router.replace({
        pathname: '/dynamics/confirmation',
        params: {
          title: campaign.title,
          receiptId: receipt.id,
          submittedAt: receipt.submittedAt,
        },
      });
    } catch (error) {
      setSubmitError(submissionError(error));
    } finally {
      setSubmitting(false);
    }
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

        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.red} />
            <Text style={[styles.stateText, { color: colors.muted }]}>
              Cargando formulario…
            </Text>
          </View>
        ) : null}

        {!loading && loadError ? (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.errorText, { color: colors.white }]}>
              {loadError}
            </Text>
            <PrimaryButton label="Reintentar" onPress={() => void load()} secondary />
          </View>
        ) : null}

        {!loading && campaign?.participation.type === 'external_url' ? (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons color={colors.red} name="open-outline" size={28} />
            <Text style={[styles.errorText, { color: colors.white }]}>
              Esta dinámica utiliza participación externa.
            </Text>
            {campaign.participation.url ? (
              <PrimaryButton
                label="Abrir enlace"
                onPress={() => void Linking.openURL(campaign.participation.url!)}
              />
            ) : null}
          </View>
        ) : null}

        {!loading && campaign?.participation.type === 'form' ? (
          <>
            <Text style={[styles.title, { color: colors.white }]}>
              {campaign.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Completa únicamente los campos solicitados por esta dinámica.
            </Text>

            {campaign.participation.fields.map((field) => (
              <View key={field.key} style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.muted }]}>
                  {field.label.toUpperCase()}
                  {field.required ? ' *' : ''}
                </Text>
                <TextInput
                  autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
                  autoCorrect={field.type !== 'email'}
                  keyboardType={keyboardType(field)}
                  multiline={field.type === 'textarea'}
                  onChangeText={(value) => update(field.key, value)}
                  placeholder={placeholder(field)}
                  placeholderTextColor={colors.muted}
                  style={[
                    styles.input,
                    field.type === 'textarea' && styles.textarea,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor:
                        values[field.key] && validation[field.key]
                          ? colors.red
                          : colors.border,
                      color: colors.white,
                    },
                  ]}
                  value={values[field.key] ?? ''}
                />
                {values[field.key] && validation[field.key] ? (
                  <Text style={[styles.fieldError, { color: colors.red }]}>
                    {validation[field.key]}
                  </Text>
                ) : null}
              </View>
            ))}

            <View
              style={[
                styles.consentCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <Pressable
                onPress={() => {
                  rotateIdempotencyIfNeeded();
                  setTermsAccepted((value) => !value);
                }}
                style={styles.consentRow}
              >
                <Ionicons
                  color={termsAccepted ? colors.red : colors.muted}
                  name={termsAccepted ? 'checkbox' : 'square-outline'}
                  size={22}
                />
                <Text style={[styles.consentText, { color: colors.white }]}>
                  Acepto las bases y condiciones.
                </Text>
              </Pressable>
              <Pressable onPress={() => void Linking.openURL(campaign.termsUrl)}>
                <Text style={[styles.link, { color: colors.red }]}>Leer bases</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  rotateIdempotencyIfNeeded();
                  setPrivacyAccepted((value) => !value);
                }}
                style={styles.consentRow}
              >
                <Ionicons
                  color={privacyAccepted ? colors.red : colors.muted}
                  name={privacyAccepted ? 'checkbox' : 'square-outline'}
                  size={22}
                />
                <Text style={[styles.consentText, { color: colors.white }]}>
                  Acepto la política de privacidad.
                </Text>
              </Pressable>
              <Pressable onPress={() => void Linking.openURL(campaign.privacyUrl)}>
                <Text style={[styles.link, { color: colors.red }]}>Leer privacidad</Text>
              </Pressable>
            </View>

            {campaign.participation.requiresAuth ? (
              <View
                style={[
                  styles.warning,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons color={colors.red} name="lock-closed-outline" size={20} />
                <Text style={[styles.warningText, { color: colors.muted }]}>
                  {isAuthenticated
                    ? 'Tu sesión Firebase está lista para esta participación.'
                    : 'Esta dinámica requiere iniciar sesión antes de participar.'}
                </Text>
              </View>
            ) : null}

            {campaign.status !== 'active' ? (
              <Text style={[styles.warningText, { color: colors.red }]}>
                Esta dinámica no acepta participaciones en este momento.
              </Text>
            ) : null}

            {submitError ? (
              <Text style={[styles.submitError, { color: colors.red }]}>
                {submitError}
              </Text>
            ) : null}

            <PrimaryButton
              disabled={!formValid || submitting}
              label={submitting ? 'Enviando…' : 'Enviar participación'}
              onPress={() => void submit()}
            />

            <Text style={[styles.securityNote, { color: colors.muted }]}>
              El servidor valida nuevamente campos, vigencia, duplicados,
              consentimiento e idempotencia. Esta solicitud incluye Firebase App
              Check y, cuando corresponde, tu ID token.
            </Text>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingBottom: 120,
    paddingHorizontal: spacing.md,
  },
  state: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 100,
  },
  stateText: {
    fontFamily: fonts.body,
    fontSize: 12,
  },
  errorCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 14,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
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
  fieldGroup: { marginBottom: 14 },
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
  textarea: {
    minHeight: 120,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  fieldError: {
    fontFamily: fonts.body,
    fontSize: 10,
    marginTop: 5,
  },
  consentCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
    padding: spacing.md,
  },
  consentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 36,
  },
  consentText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  link: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    marginBottom: 4,
    marginLeft: 32,
  },
  warning: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    padding: spacing.md,
  },
  warningText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
  },
  submitError: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  securityNote: {
    fontFamily: fonts.body,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});
