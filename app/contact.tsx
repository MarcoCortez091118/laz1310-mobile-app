import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { V3Screen, v3 } from '../src/components/v3/V3Shell';
import { ADVERTISING_EMAIL } from '../src/config/contact';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { fonts } from '../src/theme/tokens';

type ContactValues = {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  message: string;
};

const initial: ContactValues = {
  firstName: '',
  lastName: '',
  company: '',
  phone: '',
  email: '',
  message: '',
};

export default function ContactScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const english = language === 'en';
  const [values, setValues] = useState<ContactValues>(initial);
  const [accepted, setAccepted] = useState(false);
  const [sending, setSending] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const valid = useMemo(() => (
    values.firstName.trim().length > 0 &&
    values.lastName.trim().length > 0 &&
    values.phone.replace(/[^0-9]/g, '').length >= 7 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) &&
    values.message.trim().length > 0 && accepted
  ), [values, accepted]);

  function setField(key: keyof ContactValues, text: string) {
    setValues((before) => ({ ...before, [key]: text }));
  }

  async function continueEmail() {
    setAttempted(true);
    if (!valid || sending) return;
    setSending(true);
    try {
      const subject = encodeURIComponent(
        english ? 'Advertising inquiry — LA Z Detroit' : 'Solicitud de publicidad — LA Z Detroit',
      );
      const body = [
        `${english ? 'First name' : 'Nombre'}: ${values.firstName.trim()}`,
        `${english ? 'Last name' : 'Apellido'}: ${values.lastName.trim()}`,
        `${english ? 'Company' : 'Compañía'}: ${values.company.trim() || '-'}`,
        `${english ? 'Phone' : 'Teléfono'}: ${values.phone.trim()}`,
        `${english ? 'Email' : 'Correo'}: ${values.email.trim()}`,
        '',
        `${english ? 'Message' : 'Mensaje'}:\n${values.message.trim()}`,
      ].join('\n');
      await Linking.openURL(`mailto:${ADVERTISING_EMAIL}?subject=${subject}&body=${encodeURIComponent(body)}`);
      // No success state here: the user must actually send from the mail client.
    } catch {
      Alert.alert(
        english ? 'Email app unavailable' : 'No hay una aplicación de correo',
        english
          ? `Please email our sales team directly: ${ADVERTISING_EMAIL}`
          : `Puedes escribir a nuestro equipo de ventas: ${ADVERTISING_EMAIL}`,
      );
    } finally {
      setSending(false);
    }
  }

  const fields: Array<{
    key: keyof ContactValues;
    placeholder: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    multiline?: boolean;
  }> = [
    { key: 'firstName', placeholder: english ? 'First name' : 'Nombre' },
    { key: 'lastName', placeholder: english ? 'Last name' : 'Apellido' },
    { key: 'company', placeholder: english ? 'Company' : 'Compañía' },
    { key: 'phone', placeholder: english ? 'Phone number' : 'Teléfono', keyboardType: 'phone-pad' },
    { key: 'email', placeholder: english ? 'Email address' : 'Correo', keyboardType: 'email-address' },
    { key: 'message', placeholder: english ? 'How can we help you?' : '¿Cómo te podemos ayudar?', multiline: true },
  ];

  return (
    <V3Screen title={english ? 'CONTACT' : 'CONTACTO'}>
      <Pressable accessibilityLabel={english ? 'Back to advertising' : 'Volver a Anúnciate'} accessibilityRole="button" onPress={() => router.replace('/advertise')} style={styles.back}>
        <Ionicons name="chevron-back" size={28} color="#3B3B3B" />
      </Pressable>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{english ? 'REGISTER' : 'REGÍSTRATE'}</Text>
        <Text style={styles.cardRed}>{english ? 'And we will contact you' : 'Y nos comunicaremos contigo'}</Text>
        <Text style={styles.cardSubtitle}>{english ? 'Sales and information' : 'Ventas e información'}</Text>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            {fields.slice(0, 2).map((field) => (
              <TextInput
                key={field.key}
                accessibilityLabel={field.placeholder}
                autoCapitalize="words"
                placeholder={field.placeholder}
                placeholderTextColor="#616161"
                value={values[field.key]}
                onChangeText={(text) => setField(field.key, text)}
                style={[styles.input, styles.half]}
              />
            ))}
          </View>
          {fields.slice(2).map((field) => (
            <TextInput
              key={field.key}
              accessibilityLabel={field.placeholder}
              placeholder={field.placeholder}
              placeholderTextColor="#616161"
              keyboardType={field.keyboardType ?? 'default'}
              autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
              autoCorrect={field.key !== 'email'}
              multiline={field.multiline}
              value={values[field.key]}
              onChangeText={(text) => setField(field.key, text)}
              style={[styles.input, field.multiline && styles.messageInput]}
              textAlignVertical={field.multiline ? 'top' : 'center'}
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={english ? 'Continue to review and send sales email' : 'Continuar al correo de ventas'}
          onPress={() => void continueEmail()}
          disabled={sending}
          style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.78 : sending ? 0.6 : 1 }]}
        >
          <Text style={styles.ctaText}>{english ? 'CONTINUE' : 'CONTINUAR'}</Text>
          <Ionicons name="chevron-forward" size={28} color={v3.white} />
        </Pressable>

        <View style={styles.terms}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: accepted }}
            accessibilityLabel={english ? 'I have read the privacy notice' : 'He leído el aviso de privacidad'}
            onPress={() => setAccepted(!accepted)}
            style={styles.termsCheck}
          >
            <Ionicons color={accepted ? v3.red : '#666'} name={accepted ? 'radio-button-on' : 'radio-button-off'} size={23} />
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => router.push('/privacy')} style={styles.termsLink}>
            <Text style={styles.termsText}>{english ? 'I have read the privacy notice' : 'He leído el aviso de privacidad'}</Text>
          </Pressable>
        </View>

        {attempted && !valid ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {english ? 'Complete the required fields and accept the privacy notice.' : 'Completa los campos obligatorios y acepta el aviso de privacidad.'}
          </Text>
        ) : null}
        <Text selectable style={styles.email}>{ADVERTISING_EMAIL}</Text>
        <Text style={styles.note}>
          {english ? 'The Continue button opens your email app. No message is sent automatically.' : 'Continuar abre tu aplicación de correo. No se envía ningún mensaje automáticamente.'}
        </Text>
      </View>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  back: { marginTop: 7, marginBottom: 15, borderRadius: 8, backgroundColor: 'rgba(242,242,242,0.85)', width: 52, height: 43, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 18, backgroundColor: 'rgba(238,238,238,0.81)', borderRadius: 24, marginBottom: 15 },
  cardTitle: { fontFamily: fonts.displayBlack, fontSize: 30, color: '#111', letterSpacing: 1 },
  cardRed: { fontFamily: fonts.displayExtraBold, fontSize: 22, color: v3.red },
  cardSubtitle: { fontFamily: fonts.body, fontSize: 14, color: '#505050', marginTop: 2 },
  form: { gap: 12, marginTop: 25 },
  nameRow: { flexDirection: 'row', gap: 11 },
  input: { backgroundColor: 'rgba(250,250,250,0.83)', borderRadius: 26, minHeight: 48, paddingHorizontal: 18, fontFamily: fonts.body, fontSize: 14, color: '#292929', flexShrink: 1 },
  half: { flex: 1, minWidth: 0 },
  messageInput: { minHeight: 160, borderRadius: 24, paddingTop: 15 },
  cta: { marginTop: 23, backgroundColor: v3.red, borderRadius: 40, minHeight: 53, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  ctaText: { fontFamily: fonts.displayBlack, color: v3.white, fontSize: 28 },
  terms: { marginTop: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  termsCheck: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  termsLink: { minHeight: 48, justifyContent: 'center', flexShrink: 1 },
  termsText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: '#323232' },
  error: { fontFamily: fonts.bodySemiBold, fontSize: 12, textAlign: 'center', color: '#B90016', marginTop: 10 },
  email: { fontFamily: fonts.bodyMedium, fontSize: 13, color: '#333', marginTop: 12, textAlign: 'center' },
  note: { fontFamily: fonts.body, fontSize: 11, lineHeight: 16, color: '#5B5757', textAlign: 'center', marginTop: 7 },
});
