import { DynamicFormField } from './api';

export function dynamicDeadline(endsAt: string, timezone: string) {
  try {
    return (
      'Hasta ' +
      new Intl.DateTimeFormat('es-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: timezone,
      }).format(new Date(endsAt))
    );
  } catch {
    return 'Consulta la vigencia';
  }
}

export function validateDynamicField(field: DynamicFormField, value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return field.required ? 'Este campo es obligatorio.' : null;
  }

  if (
    field.type === 'email' &&
    (normalized.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
  ) {
    return 'Ingresa un correo válido.';
  }

  if (field.type === 'phone' && !/^\+[1-9]\d{6,14}$/.test(normalized)) {
    return 'Usa formato internacional, por ejemplo +13135550123.';
  }

  if (field.type === 'text' && normalized.length > 200) {
    return 'Máximo 200 caracteres.';
  }

  if (field.type === 'textarea' && normalized.length > 4000) {
    return 'Máximo 4000 caracteres.';
  }

  return null;
}

export function createIdempotencyKey() {
  const cryptoApi = globalThis.crypto as
    | (Crypto & { randomUUID?: () => string })
    | undefined;

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }

  let timestamp = Date.now();
  let highResolution =
    typeof performance !== 'undefined' ? performance.now() * 1000 : 0;

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    let random = Math.random() * 16;

    if (timestamp > 0) {
      random = (timestamp + random) % 16;
      timestamp = Math.floor(timestamp / 16);
    } else {
      random = (highResolution + random) % 16;
      highResolution = Math.floor(highResolution / 16);
    }

    const value = char === 'x' ? random : (random % 4) + 8;
    return Math.floor(value).toString(16);
  });
}
