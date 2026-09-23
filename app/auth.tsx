import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '../src/components/BrandLogo';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { useAuth } from '../src/features/auth/AuthProvider';
import { useAppTheme } from '../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../src/theme/tokens';

type Step =
  | 'welcome'
  | 'email'
  | 'password'
  | 'name'
  | 'preferences'
  | 'notifications';

const preferences = ['Radio', 'Noticias', 'Eventos', 'Shows', 'Comunidad'];

export default function AuthScreen() {
  const router = useRouter();
  const { signInDemo } = useAuth();
  const { colors } = useAppTheme();

  const [step, setStep] = useState<Step>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>(['Radio']);

  const copy = useMemo(() => {
    if (step === 'email') {
      return ['¿Cuál es tu correo?', 'Lo usaremos para identificar tu cuenta.'];
    }

    if (step === 'password') {
      return ['Crea una contraseña', 'Usa al menos 10 caracteres.'];
    }

    if (step === 'name') {
      return ['¿Cómo te llamas?', 'Este nombre aparecerá en tu perfil.'];
    }

    if (step === 'preferences') {
      return ['¿Qué te interesa?', 'Elige tus temas para personalizar LA Z.'];
    }

    if (step === 'notifications') {
      return [
        'Activa las notificaciones',
        'Recibe avisos de programas, noticias, eventos y dinámicas.',
      ];
    }

    return ['', ''];
  }, [step]);

  const finish = () => {
    signInDemo();
    router.replace('/profile');
  };

  if (step === 'welcome') {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={[styles.safe, { backgroundColor: colors.black }]}
      >
        <Pressable
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={styles.back}
        >
          <Ionicons color={colors.white} name="chevron-back" size={26} />
        </Pressable>

        <View style={styles.welcome}>
          <BrandLogo width={118} />
          <Text style={[styles.welcomeTitle, { color: colors.white }]}>
            Únete a LA Z Detroit
          </Text>
          <Text style={[styles.welcomeBody, { color: colors.muted }]}>
            Escucha en vivo, guarda tus programas favoritos y participa en
            dinámicas.
          </Text>

          <View style={styles.actions}>
            <PrimaryButton
              label="Continuar con email"
              onPress={() => setStep('email')}
            />
            <PrimaryButton
              label="Continuar con Google"
              onPress={finish}
              secondary
            />
            <PrimaryButton
              label="Continuar con Apple"
              onPress={finish}
              secondary
            />
          </View>

          <Text style={[styles.demoNote, { color: colors.muted }]}>
            Firebase Auth todavía no está integrado en esta rama. Los botones
            sociales solo avanzan el prototipo local.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <Pressable
        accessibilityLabel="Volver"
        onPress={() => {
          const previous: Record<Exclude<Step, 'welcome'>, Step> = {
            email: 'welcome',
            password: 'email',
            name: 'password',
            preferences: 'name',
            notifications: 'preferences',
          };
          setStep(previous[step]);
        }}
        style={styles.back}
      >
        <Ionicons color={colors.white} name="chevron-back" size={26} />
      </Pressable>

      <View style={styles.step}>
        <Text style={[styles.stepTitle, { color: colors.white }]}>
          {copy[0]}
        </Text>
        <Text style={[styles.stepBody, { color: colors.muted }]}>
          {copy[1]}
        </Text>

        {step === 'email' ? (
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="tu@correo.com"
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                color: colors.white,
              },
            ]}
            value={email}
          />
        ) : null}

        {step === 'password' ? (
          <TextInput
            onChangeText={setPassword}
            placeholder="••••••••••"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                color: colors.white,
              },
            ]}
            value={password}
          />
        ) : null}

        {step === 'name' ? (
          <TextInput
            onChangeText={setName}
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
            value={name}
          />
        ) : null}

        {step === 'preferences' ? (
          <View style={styles.chips}>
            {preferences.map((item) => {
              const active = selected.includes(item);

              return (
                <Pressable
                  key={item}
                  onPress={() =>
                    setSelected((current) =>
                      active
                        ? current.filter((value) => value !== item)
                        : [...current, item],
                    )
                  }
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active
                        ? colors.red
                        : colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? '#FEFEFE' : colors.white },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {step === 'notifications' ? (
          <View
            style={[
              styles.notificationArt,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              color={colors.red}
              name="notifications-outline"
              size={52}
            />
          </View>
        ) : null}

        <View style={styles.next}>
          {step === 'email' ? (
            <PrimaryButton
              disabled={!email.includes('@')}
              label="Siguiente"
              onPress={() => setStep('password')}
            />
          ) : null}
          {step === 'password' ? (
            <PrimaryButton
              disabled={password.length < 10}
              label="Siguiente"
              onPress={() => setStep('name')}
            />
          ) : null}
          {step === 'name' ? (
            <PrimaryButton
              disabled={name.trim().length < 2}
              label="Siguiente"
              onPress={() => setStep('preferences')}
            />
          ) : null}
          {step === 'preferences' ? (
            <PrimaryButton
              label="Continuar"
              onPress={() => setStep('notifications')}
            />
          ) : null}
          {step === 'notifications' ? (
            <>
              <PrimaryButton
                label="Activar notificaciones"
                onPress={finish}
              />
              <PrimaryButton
                label="Ahora no"
                onPress={finish}
                secondary
              />
            </>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  back: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    marginLeft: 8,
    marginTop: 4,
    width: 48,
  },
  welcome: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  welcomeTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 34,
    marginTop: 24,
    textAlign: 'center',
  },
  welcomeBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  actions: {
    gap: 10,
    marginTop: 34,
    width: '100%',
  },
  demoNote: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 20,
    textAlign: 'center',
  },
  step: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  stepTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 34,
  },
  stepBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    marginTop: 18,
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 22,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  chipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  notificationArt: {
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    height: 150,
    justifyContent: 'center',
    marginTop: 30,
  },
  next: {
    gap: 10,
    marginTop: 34,
  },
});
