import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { V3_COLORS, V3Page } from '../src/components/v3/V3Layout';
import { ADVERTISING_EMAIL } from '../src/config/contact';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { fonts } from '../src/theme/tokens';

type ContactField = 'first' | 'last' | 'company' | 'phone' | 'email' | 'message';
type ContactValues = Record<ContactField, string>;

export default function ContactV3() {
  const router = useRouter();
  const { language } = useLanguage();
  const en = language === 'en';
  const [form, setForm] = useState<ContactValues>({ first: '', last: '', company: '', phone: '', email: '', message: '' });
  const [consent, setConsent] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [opening, setOpening] = useState(false);
  const update = (field: ContactField, value: string) => setForm(current => ({ ...current, [field]: value }));

  const valid = !!form.first.trim() && !!form.last.trim()
    && form.phone.replace(/\D/g, '').length >= 7
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    && !!form.message.trim() && consent;

  async function continueToMail() {
    setAttempted(true);
    if (!valid || opening) return;
    setOpening(true);
    try {
      const subject = en ? 'Advertising inquiry - LA Z Detroit' : 'Solicitud de publicidad - LA Z Detroit';
      const body = [
        `${en ? 'First name' : 'Nombre'}: ${form.first.trim()}`,
        `${en ? 'Last name' : 'Apellido'}: ${form.last.trim()}`,
        `${en ? 'Company' : 'Compañía'}: ${form.company.trim() || '-'}`,
        `${en ? 'Phone' : 'Teléfono'}: ${form.phone.trim()}`,
        `${en ? 'Email' : 'Correo'}: ${form.email.trim()}`,
        '',
        `${en ? 'Message' : 'Mensaje'}:`,
        form.message.trim(),
      ].join('\n');
      const uri = `mailto:${ADVERTISING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      await Linking.openURL(uri);
      // The user reviews/sends the email in their own mail app.
    } catch {
      Alert.alert(en ? 'No email app available' : 'No hay aplicación de correo', ADVERTISING_EMAIL);
    } finally {
      setOpening(false);
    }
  }

  function field(name: ContactField, placeholder: string, opts?: { half?: boolean; multiline?: boolean; email?: boolean; phone?: boolean }) {
    return (
      <TextInput
        key={name}
        accessibilityLabel={placeholder}
        value={form[name]}
        onChangeText={text => update(name, text)}
        placeholder={placeholder}
        placeholderTextColor="#737373"
        autoCapitalize={opts?.email ? 'none' : name === 'first' || name === 'last' ? 'words' : 'sentences'}
        autoCorrect={!opts?.email}
        keyboardType={opts?.email ? 'email-address' : opts?.phone ? 'phone-pad' : 'default'}
        multiline={opts?.multiline}
        textAlignVertical={opts?.multiline ? 'top' : 'center'}
        style={[styles.field, opts?.half && styles.half, opts?.multiline && styles.message]}
      />
    );
  }

  return (
    <V3Page title={en ? 'CONTACT' : 'CONTACTO'}>
      <Pressable accessibilityRole="button" accessibilityLabel={en ? 'Back to advertising' : 'Regresar a Anúnciate'} onPress={() => router.replace('/advertise')} style={styles.back}>
        <Ionicons name="chevron-back" color="#454545" size={26} />
      </Pressable>
      <View style={styles.paper}>
        <Text style={styles.title}>{en ? 'REGISTER' : 'REGÍSTRATE'}</Text>
        <Text style={styles.redTitle}>{en ? 'And we will contact you' : 'Y nos comunicaremos contigo'}</Text>
        <Text style={styles.small}>{en ? 'Sales and information' : 'Ventas e información'}</Text>
        <View style={styles.inputs}>
          <View style={styles.pair}>
            {field('first', en ? 'First name' : 'Nombre', { half: true })}
            {field('last', en ? 'Last name' : 'Apellido', { half: true })}
          </View>
          {field('company', en ? 'Company' : 'Compañía')}
          {field('phone', en ? 'Phone' : 'Teléfono', { phone: true })}
          {field('email', en ? 'Email' : 'Correo', { email: true })}
          {field('message', en ? 'How can we help you?' : '¿Cómo te podemos ayudar?', { multiline: true })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={en ? 'Continue to your email app' : 'Continuar a la aplicación de correo'}
          disabled={opening}
          onPress={() => void continueToMail()}
          style={[styles.cta, { opacity: opening ? 0.6 : 1 }]}
        >
          <Text style={styles.ctaText}>{en ? 'Continue' : 'Continuar'}</Text>
          <Ionicons name="chevron-forward" size={29} color={V3_COLORS.white} />
        </Pressable>
        <View style={styles.consent}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consent }}
            accessibilityLabel={en ? 'I have read the privacy policy' : 'He leído el aviso de privacidad'}
            onPress={() => setConsent(!consent)}
            style={styles.check}
          >
            <Ionicons name={consent ? 'radio-button-on' : 'radio-button-off'} size={22} color={consent ? V3_COLORS.red : '#666'} />
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => router.push('/privacy')} style={styles.termsLink}>
            <Text style={styles.terms}>{en ? 'Privacy policy' : 'Términos y privacidad'}</Text>
          </Pressable>
        </View>
        {attempted && !valid && <Text accessibilityRole="alert" style={styles.error}>{en ? 'Complete required fields and the privacy checkbox.' : 'Completa los campos requeridos y marca el aviso de privacidad.'}</Text>}
        <Text style={styles.disclaimer}>{en ? 'Continue opens your email app. No message is sent automatically.' : 'Continuar abre tu correo. El mensaje no se envía automáticamente.'}</Text>
      </View>
    </V3Page>
  );
}

const styles = StyleSheet.create({
  back: { height: 45, width: 55, borderRadius: 9, backgroundColor: 'rgba(240,240,240,0.9)', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  paper: { padding: 19, backgroundColor: V3_COLORS.panel, borderRadius: 25, marginBottom: 20 },
  title: { fontFamily: fonts.displayBlack, fontSize: 31, letterSpacing: 0.6, color: '#181818' },
  redTitle: { fontFamily: fonts.displayExtraBold, color: V3_COLORS.red, fontSize: 22 },
  small: { fontFamily: fonts.body, color: '#575757', fontSize: 14, marginTop: 1 },
  inputs: { gap: 12, marginTop: 25 },
  pair: { flexDirection: 'row', gap: 11 },
  field: { backgroundColor: 'rgba(254,254,254,0.80)', color: '#303030', borderRadius: 27, paddingHorizontal: 18, height: 49, fontFamily: fonts.body, fontSize: 14, minWidth: 0 },
  half: { flex: 1 },
  message: { height: 170, borderRadius: 23, paddingTop: 15 },
  cta: { marginTop: 22, backgroundColor: V3_COLORS.red, borderRadius: 30, minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  ctaText: { fontFamily: fonts.displayBlack, color: V3_COLORS.white, fontSize: 26 },
  consent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 11 },
  check: { height: 48, width: 48, alignItems: 'center', justifyContent: 'center' },
  termsLink: { minHeight: 48, justifyContent: 'center' },
  terms: { fontFamily: fonts.bodyMedium, color: '#333', fontSize: 14 },
  error: { marginTop: 8, color: '#B60914', fontFamily: fonts.bodySemiBold, fontSize: 12, textAlign: 'center' },
  disclaimer: { fontFamily: fonts.body, color: '#4D4D4D', fontSize: 11, marginTop: 8, textAlign: 'center' },
});
