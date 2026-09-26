export function authErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return error instanceof Error
      ? error.message
      : 'No pudimos completar la autenticación.';
  }

  const code = String(error.code);

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
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera un momento e inténtalo nuevamente.';
    case 'auth/network-request-failed':
      return 'No pudimos comunicarnos con Firebase. Revisa tu conexión.';
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada.';
    default:
      return 'No pudimos completar la autenticación.';
  }
}
