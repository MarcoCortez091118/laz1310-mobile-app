import type { AppLanguage } from '../../i18n/LanguageProvider';

export function authErrorMessage(error: unknown, language: AppLanguage = 'es') {
  const english = language === 'en';
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return error instanceof Error
      ? error.message
      : english
        ? 'We could not complete authentication.'
        : 'No pudimos completar la autenticación.';
  }

  const code = String(error.code);

  switch (code) {
    case 'auth/google-native-required':
      return english
        ? 'Google sign-in requires an installed Android or iOS app.'
        : 'El acceso con Google requiere la aplicación instalada en Android o iOS.';
    case 'auth/google-configuration-required':
      return english
        ? 'Google sign-in is not configured for this build. Contact support.'
        : 'El acceso con Google no está configurado en esta versión. Contacta a soporte.';
    case 'auth/google-id-token-missing':
      return english
        ? 'Google could not verify this app. Check the Google sign-in configuration.'
        : 'Google no pudo verificar esta app. Revisa la configuración del inicio de sesión.';
    case 'auth/operation-not-allowed':
      return english
        ? 'Google sign-in is not enabled for this app in Firebase.'
        : 'El acceso con Google todavía no está habilitado para esta app en Firebase.';
    case 'auth/account-exists-with-different-credential':
      return english
        ? 'This email uses another sign-in method. Sign in with your existing method before linking accounts.'
        : 'Este correo utiliza otro método de acceso. Ingresa con tu método anterior antes de vincular cuentas.';
    case '12501':
    case 'SIGN_IN_CANCELLED':
      return english ? 'Google sign-in cancelled.' : 'Se canceló el acceso con Google.';
    case '12500':
    case 'DEVELOPER_ERROR':
      return english
        ? 'Google rejected this build. Check the Android OAuth SHA fingerprints and web client ID.'
        : 'Google rechazó esta compilación. Revisa las huellas SHA de Android y el cliente OAuth web.';
    case 'PLAY_SERVICES_NOT_AVAILABLE':
      return english
        ? 'Update or enable Google Play Services and try again.'
        : 'Actualiza o habilita Google Play Services e inténtalo de nuevo.';
    case 'auth/email-already-in-use':
      return english
        ? 'An account already exists with this email.'
        : 'Ya existe una cuenta con este correo.';
    case 'auth/invalid-email':
      return english ? 'Enter a valid email.' : 'Ingresa un correo válido.';
    case 'auth/weak-password':
      return english
        ? 'The password does not meet the security policy.'
        : 'La contraseña no cumple la política de seguridad.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return english ? 'Incorrect email or password.' : 'Correo o contraseña incorrectos.';
    case 'auth/too-many-requests':
      return english
        ? 'Too many attempts. Wait a moment and try again.'
        : 'Demasiados intentos. Espera un momento e inténtalo nuevamente.';
    case 'auth/network-request-failed':
      return english
        ? 'We could not reach Firebase. Check your connection.'
        : 'No pudimos comunicarnos con Firebase. Revisa tu conexión.';
    case 'auth/user-disabled':
      return english ? 'This account is disabled.' : 'Esta cuenta está deshabilitada.';
    default:
      return english
        ? 'We could not complete authentication.'
        : 'No pudimos completar la autenticación.';
  }
}
