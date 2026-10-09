import { Platform, Share } from 'react-native';

import type { AppLanguage } from '../i18n/LanguageProvider';

/**
 * Product-approved legacy Android listing (RadioOnlineHD).
 * This is not the current app's package: com.neuromarket.laz1310.
 * Update after the new LA Z app is published and the release URL is verified.
 */
export const LEGACY_ANDROID_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.lazradio.hdamfm';
export const RADIO_WEBSITE_URL = 'https://www.laz1310.com/';

export function radioShareMessage(
  language: AppLanguage,
  platform: typeof Platform.OS = Platform.OS,
): string {
  const android = platform === 'android';
  const link = android ? LEGACY_ANDROID_STORE_URL : RADIO_WEBSITE_URL;

  if (language === 'en') {
    return android
      ? `I'm listening to LA Z Detroit. Download the Android app: ${link}`
      : `I'm listening to LA Z Detroit. Listen with me: ${link}`;
  }

  return android
    ? `Estoy escuchando LA Z Detroit. Descarga la app en tu teléfono Android ${link}`
    : `Estoy escuchando LA Z Detroit. Escúchanos aquí: ${link}`;
}

export async function shareLiveRadio(language: AppLanguage): Promise<void> {
  await Share.share({ message: radioShareMessage(language) });
}
