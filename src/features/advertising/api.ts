import { apiRequestWithMeta } from '../../api/client';
import { getFirebaseSecurityTokens } from '../auth/firebase';

export interface AdvertisingLead {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  message: string;
}

export interface AdvertisingReceipt {
  id: string;
  status: 'queued';
}

export async function submitAdvertisingLead(
  values: AdvertisingLead,
  requestId: string,
): Promise<AdvertisingReceipt> {
  // Guests may submit, but native Firebase App Check still proves the caller is the app.
  const security = await getFirebaseSecurityTokens(false);
  if (!security.appCheckToken) {
    throw new Error('App verification unavailable');
  }
  const response = await apiRequestWithMeta<AdvertisingReceipt>(
    '/api/v1/advertising/leads',
    {
      method: 'POST',
      headers: {
        'Idempotency-Key': requestId,
        'X-Firebase-AppCheck': security.appCheckToken,
        ...(security.idToken ? { Authorization: 'Bearer ' + security.idToken } : {}),
      },
      body: JSON.stringify({
        ...values,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        company: values.company.trim(),
        phone: values.phone.trim(),
        email: values.email.trim().toLowerCase(),
        message: values.message.trim(),
        termsAccepted: true,
        privacyAccepted: true,
        consentVersion: 'advertising-v1',
      }),
    },
  );
  if (response.status !== 202 || response.data.status !== 'queued') {
    throw new Error('Advertising request acknowledgement unavailable');
  }
  return response.data;
}
