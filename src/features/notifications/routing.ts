const DYNAMIC_ROUTE =
  /^\/dynamics\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;

export function safeNotificationRoute(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  if (value === '/home' || value === '/radio' || value === '/dynamics') {
    return value;
  }

  return DYNAMIC_ROUTE.test(value) ? value : null;
}

export interface PushData {
  schemaVersion?: string;
  notificationId?: string;
  category?: string;
  targetKind?: string;
  targetValue?: string;
}

export function parsePushData(data: Record<string, string | undefined> | undefined) {
  if (
    !data ||
    data.schemaVersion !== '1' ||
    typeof data.notificationId !== 'string' ||
    data.notificationId.length === 0 ||
    data.targetKind !== 'route'
  ) {
    return null;
  }

  const route = safeNotificationRoute(data.targetValue);
  if (!route) {
    return null;
  }

  return {
    notificationId: data.notificationId,
    route,
  };
}
