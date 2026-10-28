import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '../src/api/client';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { submitAdvertisingLead, type AdvertisingLead } from '../src/features/advertising/api';
import {
  EMPTY_ADVERTISING_LEAD,
  newAdvertisingRequestId,
  validateAdvertisingLead,
  type AdvertisingFormError,
} from '../src/features/advertising/model';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { useAppTheme } from '../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../src/theme/tokens';

type FieldName = keyof AdvertisingLead;

function LeadInput({
  label, value, onChangeText, multiline, keyboardType, autoComplete, disabled,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoComplete?: TextInputProps['autoComplete'];
  disabled: boolean;
}) {
  return (
    <TextInput
      accessibilityLabel={label}
      autoCapitalize={autoComplete === 'email' ? 'none' : 'sentences'}
      autoComplete={autoComplete}
      editable={!disabled}
      keyboardType={keyboardType}
      maxLength={multiline ? 2000 : 254}
      multiline={multiline}
      onChangeText={onChangeText}
      placeholder={label}
      placeholderTextColor="#656366"
      selectionColor="#D30A12"
      style={[styles.field, multiline ? styles.message : null]}
      textAlignVertical={multiline ? 'top' : 'center'}
      value={value}
    />
  );
}

export default function AdvertiseScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useAppTheme();
  const english = language === 'en';

  const [form, setForm] = useState<AdvertisingLead>({ ...EMPTY_ADVERTISING_LEAD });
  const [consent, setConsent] = useState(false);
  const [requestId, setRequestId] = useState(newAdvertisingRequestId);
  const [sending, setSending] = useState(false);
  const [received, setReceived] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labels: Record<FieldName, string> = {
    firstName: english ? 'First name' : 'Nombre',
    lastName: english ? 'Last name' : 'Apellido',
    company: english ? 'Company (optional)' : 'Compañía (opcional)',
    phone: english ? 'Phone' : 'Teléfono',
    email: english ? 'Email' : 'Correo',
    message: english ? 'How can we help you?' : '¿Cómo te podemos ayudar?',
  };

  function update(field: FieldName, value: string) {
    setForm(current => ({ ...current, [field]: value }));
    setRequestId(newAdvertisingRequestId());
    setError(null);
  }

  function issueMessage(issue: AdvertisingFormError): string {
    if (issue === 'consent') return english
      ? 'Please accept the terms and privacy notice to continue.'
      : 'Acepta los términos y el aviso de privacidad para continuar.';
    const name = issue === 'name' ? labels.firstName
      : issue === 'lastName' ? labels.lastName
      : issue === 'phone' ? labels.phone
      : issue === 'email' ? labels.email
      : labels.message;
    return english ? 'Please check: ' + name : 'Verifica el campo: ' + name;
  }

  async function submit() {
    if (sending || received) return;
    const invalid = validateAdvertisingLead(form, consent);
    if (invalid) {
      setError(issueMessage(invalid));
      return;
    }
    setSending(true);
    setError(null);
    try {
      await submitAdvertisingLead(form, requestId);
      setReceived(true);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 429) {
        setError(english
          ? 'Too many requests. Please try later.'
          : 'Demasiados intentos. Inténtalo más tarde.');
      } else if (cause instanceof ApiError && cause.status === 409) {
        setError(english
          ? 'This request may already be processing. Contact sales before resending.'
          : 'Esta solicitud podría estar procesándose. Contacta a ventas antes de reenviarla.');
      } else {
        setError(english
          ? 'We could not confirm receipt. Please contact sales before trying again.'
          : 'No pudimos confirmar la recepción. Contacta a ventas antes de volver a enviarla.');
      }
    } finally {
      setSending(false);
    }
  }

  function showTerms() {
    Alert.alert(
      english ? 'Advertising registration terms' : 'Términos del registro publicitario',
      english
        ? 'LA Z 1310 will use the contact information you submit to respond to your advertising inquiry. Submission does not constitute an advertising purchase. Read the privacy notice before accepting.'
        : 'LA Z 1310 utilizará los datos proporcionados para responder a tu solicitud de publicidad. Enviar este formulario no constituye una contratación de servicios. Consulta el aviso de privacidad antes de aceptar.',
      [
        { text: english ? 'Close' : 'Cerrar' },
        {
          text: english ? 'Privacy notice' : 'Aviso de privacidad',
          onPress: () => router.push('/profile/settings/privacy-policy'),
        },
      ],
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.black }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader title={english ? 'Advertise with us' : 'Promociónate con nosotros'} />

          <View style={styles.panel}>
            <Image
              accessibilityIgnoresInvertColors
              source={require('../assets/brand/detroit-background.webp')}
              style={styles.city}
              resizeMode="cover"
            />
            <View style={styles.artTop} />
            <View style={styles.artBottom} />

            {received ? (
              <View accessibilityRole="alert" style={styles.confirmation}>
                <Ionicons color="#D30A12" name="checkmark-circle" size={62} />
                <Text style={styles.heading}>
                  {english ? 'REQUEST RECEIVED' : 'SOLICITUD RECIBIDA'}
                </Text>
                <Text style={styles.subheading}>
                  {english
                    ? 'Thank you. Your registration has been sent for review.'
                    : 'Gracias. Tu registro fue enviado para su atención.'}
                </Text>
                <Text style={styles.confirmationCopy}>
                  {english
                    ? 'Our team will contact you using the information provided.'
                    : 'Nuestro equipo se comunicará contigo utilizando los datos proporcionados.'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.back()}
                  style={styles.cta}
                >
                  <Text style={styles.ctaText}>
                    {english ? 'DONE' : 'FINALIZAR'}
                  </Text>
                  <Ionicons name="arrow-forward" size={25} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : (
              <View style={styles.form}>
                <Text style={styles.heading}>
                  {english ? 'SIGN UP' : 'REGÍSTRATE'}
                </Text>
                <Text style={styles.redTitle}>
                  {english ? "And we'll get in touch with you" : 'Y nos comunicaremos contigo'}
                </Text>
                <Text style={styles.subtitle}>
                  {english ? 'Advertising sales and information' : 'Ventas e información'}
                </Text>

                <View style={styles.fields}>
                  <View style={styles.nameRow}>
                    <View style={styles.half}>
                      <LeadInput
                        label={labels.firstName}
                        value={form.firstName}
                        onChangeText={value => update('firstName', value)}
                        autoComplete="given-name"
                        disabled={sending}
                      />
                    </View>
                    <View style={styles.half}>
                      <LeadInput
                        label={labels.lastName}
                        value={form.lastName}
                        onChangeText={value => update('lastName', value)}
                        autoComplete="family-name"
                        disabled={sending}
                      />
                    </View>
                  </View>
                  <LeadInput
                    label={labels.company}
                    value={form.company}
                    onChangeText={value => update('company', value)}
                    autoComplete="organization"
                    disabled={sending}
                  />
                  <LeadInput
                    label={labels.phone}
                    value={form.phone}
                    onChangeText={value => update('phone', value)}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    disabled={sending}
                  />
                  <LeadInput
                    label={labels.email}
                    value={form.email}
                    onChangeText={value => update('email', value)}
                    keyboardType="email-address"
                    autoComplete="email"
                    disabled={sending}
                  />
                  <LeadInput
                    label={labels.message}
                    value={form.message}
                    onChangeText={value => update('message', value)}
                    multiline
                    disabled={sending}
                  />
                </View>

                {error ? (
                  <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={english ? 'Submit advertising registration' : 'Enviar registro publicitario'}
                  disabled={sending}
                  onPress={() => void submit()}
                  style={({ pressed }) => [
                    styles.cta,
                    { opacity: sending ? 0.55 : pressed ? 0.8 : 1 },
                  ]}
                >
                  {sending ? <ActivityIndicator color="#FFFFFF" /> : (
                    <>
                      <Text style={styles.ctaText}>
                        {english ? 'CONTINUE' : 'CONTINUAR'}
                      </Text>
                      <Ionicons name="chevron-forward" size={30} color="#FFFFFF" />
                    </>
                  )}
                </Pressable>

                <View style={styles.terms}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityLabel={english ? 'Accept terms and privacy notice' : 'Aceptar términos y aviso de privacidad'}
                    accessibilityState={{ checked: consent, disabled: sending }}
                    disabled={sending}
                    onPress={() => { setConsent(v => !v); setError(null); }}
                    style={styles.checkboxHitbox}
                  >
                    <View style={[styles.checkbox, consent ? styles.checked : null]}>
                      {consent ? <Ionicons name="checkmark" color="#FFFFFF" size={17} /> : null}
                    </View>
                  </Pressable>
                  <Pressable accessibilityRole="link" onPress={showTerms} disabled={sending}>
                    <Text style={styles.termsText}>
                      {english ? 'Terms and conditions' : 'Términos y condiciones'}
                    </Text>
                    <Text style={styles.privacyLink}>
                      {english ? 'Privacy notice' : 'Aviso de privacidad'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  keyboard: { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: 160 },
  panel: {
    backgroundColor: '#D1CED0',
    borderRadius: radii.lg,
    marginTop: spacing.lg,
    overflow: 'hidden',
    minHeight: 700,
  },
  city: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '52%',
    opacity: 0.12,
  },
  artTop: {
    position: 'absolute',
    right: -40,
    top: -38,
    width: 145,
    height: 75,
    backgroundColor: '#E6A1A5',
    opacity: 0.45,
    transform: [{ rotate: '-28deg' }],
  },
  artBottom: {
    position: 'absolute',
    left: -38,
    bottom: 110,
    width: 95,
    height: 60,
    backgroundColor: '#E6A1A5',
    opacity: 0.32,
    transform: [{ rotate: '18deg' }],
  },
  form: { paddingVertical: 30, paddingHorizontal: spacing.md },
  heading: {
    color: '#171717',
    fontFamily: fonts.displayBlack,
    fontSize: 42,
    lineHeight: 48,
  },
  redTitle: {
    color: '#D30A12',
    fontFamily: fonts.displayExtraBold,
    fontSize: 26,
    lineHeight: 32,
    marginTop: -1,
  },
  subtitle: {
    color: '#525252',
    fontFamily: fonts.body,
    fontSize: 18,
    marginTop: 4,
  },
  fields: { gap: 13, marginTop: 30 },
  nameRow: { flexDirection: 'row', gap: 12 },
  half: { flex: 1, minWidth: 0 },
  field: {
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.65)',
    color: '#252525',
    fontFamily: fonts.body,
    fontSize: 17,
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  message: { minHeight: 180, paddingTop: 18 },
  cta: {
    alignItems: 'center',
    backgroundColor: '#D30A12',
    borderRadius: 36,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    minHeight: 60,
    marginHorizontal: 24,
    marginTop: 24,
    paddingHorizontal: 22,
  },
  ctaText: {
    color: '#FFFFFF',
    fontFamily: fonts.displayBlack,
    fontSize: 28,
    lineHeight: 34,
  },
  checkboxHitbox: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  checkbox: {
    width: 25, height: 25, borderRadius: 14, borderWidth: 2,
    borderColor: '#777', backgroundColor: '#FFFFFF',
  },
  checked: { backgroundColor: '#D30A12', borderColor: '#D30A12', alignItems: 'center', justifyContent: 'center' },
  terms: { alignItems: 'center', alignSelf: 'center', flexDirection: 'row', gap: 5, marginTop: 20 },
  termsText: { color: '#505050', fontFamily: fonts.bodyMedium, fontSize: 15 },
  privacyLink: { color: '#D30A12', fontFamily: fonts.bodySemiBold, fontSize: 12, marginTop: 2 },
  error: { marginTop: 14, color: '#8B0B13', fontFamily: fonts.bodySemiBold, fontSize: 14, textAlign: 'center' },
  confirmation: { paddingHorizontal: spacing.lg, paddingVertical: 80, alignItems: 'center', gap: 16 },
  subheading: { color: '#D30A12', fontFamily: fonts.displayBold, fontSize: 25, textAlign: 'center' },
  confirmationCopy: { color: '#505050', fontFamily: fonts.body, textAlign: 'center', fontSize: 15 },
});
