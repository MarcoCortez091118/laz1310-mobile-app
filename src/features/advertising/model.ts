import type { AdvertisingLead } from './api';

export const EMPTY_ADVERTISING_LEAD: AdvertisingLead = {
  firstName: '', lastName: '', company: '', phone: '', email: '', message: '',
};

export type AdvertisingFormError =
  | 'name' | 'lastName' | 'phone' | 'email' | 'message' | 'consent' | null;

export function validateAdvertisingLead(
  form: AdvertisingLead,
  accepted: boolean,
): AdvertisingFormError {
  if (!form.firstName.trim() || form.firstName.trim().length > 80) return 'name';
  if (!form.lastName.trim() || form.lastName.trim().length > 80) return 'lastName';
  if (form.company.trim().length > 120) return 'message';
  const phone = form.phone.trim();
  if (!/^\+?[0-9() .-]+$/.test(phone)) return 'phone';
  const digits = phone.replace(/\D/g, '').length;
  if (digits < 7 || digits > 15 || phone.length > 25) return 'phone';
  const email = form.email.trim();
  if (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'email';
  const message = form.message.trim();
  if (message.length < 10 || message.length > 2000) return 'message';
  if (!accepted) return 'consent';
  return null;
}

// The ID only deduplicates a user submission; it is not an auth credential.
// Every form revision gets a new ID; retrying the same content reuses the ID.
export function newAdvertisingRequestId(): string {
  const part = (length: number) =>
    Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return part(8) + '-' + part(4) + '-4' + part(3) + '-8' + part(3) + '-' + part(12);
}
