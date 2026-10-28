# LA Z 1310 App — Public contact and Advertising V2

## Contact

The existing public contact channels are not changed in this PR. Station sales email
remains `sales@laz1310.com`; technical help remains separate.

## Promociónate con nosotros (/advertise)

The former `mailto:` CTA is replaced by a brand-aligned mobile form based on the
approved October 27, 2026 screenshot. Fields: Nombre, Apellido, Compañía
(optional), Teléfono, Correo, ¿Cómo te podemos ayudar? The user must explicitly
accept the terms and read the privacy notice; consent is never pre-selected.
The terms explanation is accessible and links to the in-app privacy notice.

### Submission flow

1. Local validation enforces required fields, phone/email format, message length
   and consent. Invalid forms cannot submit.
2. Acquire Firebase App Check from the native app (sign-in optional).
3. Send to FastAPI POST `/api/v1/advertising/leads`, with `Idempotency-Key`,
   `X-Firebase-AppCheck`, and Authorization if the user is signed in.
4. FastAPI validates the data again, rate limits and forwards server-to-server
   to the configured n8n production webhook (secret Azure setting).
5. Only a confirmed 202 response (n8n accepted request) shows success. A failed
   or ambiguous response keeps all fields and does not silently re-send.

No mobile code includes the n8n webhook URL. App never writes a lead to
Firestore. The backend stores only transient idempotency metadata (not the form
values). No additional Android/iOS native permissions or third-party SDKs.

### Important operational semantics

The n8n webhook currently acknowledges that the workflow started, not that
the Gmail send finished. The UI confirms **request receipt**, never final
email delivery. A workflow failure after acknowledgment needs n8n monitoring.

### QA

- Spanish/English, large fonts, 320dp+ displays, safe-area and MiniPlayer
- Dark/light contexts, guest and signed-in users, valid App Check token
- Empty/invalid fields, unchecked consent, double tap, timeout/409/429/503
- Appetize and sideload preview may need App Check debug enrollment; do not
  disable production App Check
- n8n workflow execution audit: verify all six fields, terms and destination,
  without posting real customer data in automated tests
- CI: Expo Doctor, TypeScript, check:contact-v1, check:advertising-form
- No merge or deployment until manual QA and reviewer approval
