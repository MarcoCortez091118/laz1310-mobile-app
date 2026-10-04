export function authErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    if (error instanceof Error) {
      if (error.message.includes('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID')) {
        return 'El acceso con Google todavía no está configurado para esta compilación.';
      }

      if (error.message.includes('Google Sign-In did not return an ID token')) {
        return 'Google no pudo validar esta compilación. Revisa la configuración OAuth.';
      }

      if (error.message.includes('Invalid Firebase App Check token')) {
        return 'Firebase autenticó tu cuenta, pero App Check rechazó esta compilación. Registra el debug token del dispositivo en Firebase App Check.';
      }

      if (error.message.includes('Missing Firebase App Check token')) {
        return 'La app no pudo enviar el token de App Check requerido por LA Z API.';
      }

      if (error.message.includes('Authentication temporarily unavailable')) {
        return 'La autenticación de LA Z está temporalmente no disponible. Intenta nuevamente.';
      }

      return error.message;
    }

    return 'No pudimos completar la autenticación.';
  }

  const code = String(error.code);

  if (code.startsWith('app-check/')) {
    return 'Firebase autenticó tu cuenta, pero App Check no pudo validar esta compilación. Revisa el debug token de App Check en Firebase.';
  }

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con este correo.';
    case 'auth/invalid-email':
      return 'Ingresa un correo válido.';
    case 'auth/weak-password':
      return 'La contraseña no cumple la política de seguridad.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos.';
    case 'auth/account-exists-with-different-credential':
      return 'Este correo ya está registrado con otro método de acceso.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera un momento e inténtalo nuevamente.';
    case 'auth/network-request-failed':
      return 'No pudimos comunicarnos con Firebase. Revisa tu conexión.';
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada.';
    case 'IN_PROGRESS':
      return 'Ya hay un inicio de sesión con Google en curso.';
    case 'PLAY_SERVICES_NOT_AVAILABLE':
      return 'Google Play Services no está disponible o necesita actualizarse.';
    case 'DEVELOPER_ERROR':
      return 'Google rechazó la configuración de esta compilación. Revisa SHA-1, package name y OAuth.';
    default:
      return 'No pudimos completar la autenticación.';
  }
}
