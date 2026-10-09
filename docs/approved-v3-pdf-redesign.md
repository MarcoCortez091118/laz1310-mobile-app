# LA Z 1310 — V3 PDF-approved mobile redesign

Issue: #58. Reference: user-provided **La Z App V3.pdf**, 6 pages,
created in Adobe Illustrator. This PDF is the authoritative visual composition
for the redesign, not the former Home / Explore UI.

## Scope / screen correspondence

| Reference PDF | React Native route | Visual/functional mapping |
|---|---|---|
| p1 — splash | `/` | Existing approved LA Z logo and black/red Detroit artwork; routes to Radio |
| p2 — RADIO EN VIVO | `/radio` | Live title, ES/EN language chip, circular vinyl, animated playback, red play/pause, social row and five-destination bottom nav |
| p3 — PREMIOS | `/prizes` | Original PDF contest poster, red register CTA, active campaigns from FastAPI; actual registration is handled by existing `/dynamics/[id]/participate` contract |
| p4 — ANÚNCIATE | `/advertise` | Original extracted AM/FM coverage illustration, radio audience narrative, large quote and Contact CTA |
| p5 — CONTACTO | `/contact` | Name, surname, company, phone, email, message, privacy acknowledgement, red Continue button |
| p6 — PRIVACIDAD | `/privacy` | Translucent white/privacy text panel, scrollable **NeuroMarket** bilingual notice |

The five persistent bottom actions are exactly:
`Radio / Compartir / Premios / Anúnciate / Privacidad`.
Compartir opens the existing native system Share sheet (it is **not** an
extra tab). Interior pages have a working `RADIO EN VIVO` shortcut.
Language switching uses the existing language provider.

## Image asset provenance

- `assets/brand/v3-coverage-maps.webp` comes from the PDF's p4 coverage
  illustration; converted to a small, device-optimized WEBP.
- `assets/brand/v3-giveaway-banner.webp` comes from the PDF's p3 ticket
  giveaway artwork; converted to a small WEBP.
- `assets/brand/v3-detroit-skyline.webp` comes from the PDF's skyline
  texture used throughout p2–p6.
- Logo and vinyl reference existing official approved `assets/brand` artwork.
- New UI controls and text are **native components**, not inaccessible
  screenshots with invisible hotspots.

## Operational / business requirements

- **Radio** continues to use the existing `RadioProvider` and external media
  stream. No changes to radio/audio permissions or lifecycle.
- **Premios:** the PDF shows a static registration form, but campaigns have
  real, variable server-defined fields, consent and anti-duplicate checks.
  The visual preview is clickable through the REGISTER CTA; actual registration
  occurs in the established secure Dynamics form rather than inventing a
  parallel API contract. If no campaign is active, no fake form is submitted.
- **Contacto:** Continue checks required fields and accepted NeuroMarket
  privacy notice, then opens the device's email composer addressed to
  `sales@laz1310.com` with the submitted values. **The app never automatically
  sends the email and must never claim successful delivery**. Users can cancel,
  correct or send themselves.
- **Anúnciate:** audience/coverage prose follows the source PDF's framing,
  but the unrealistic `40,000-mile radius` and `10,000-mile radius`
  labels are not repeated as verified coverage claims. The map image itself
  is reference marketing artwork, not geospatial coverage validation.
- **Privacidad:** the reference PDF was supplied with legal language from an
  unrelated provider. The user specifically instructed NeuroMarket ownership.
  Therefore use the current versioned bilingual NeuroMarket draft, not the
  outdated third-party text. Legal approval is still a separate store-release
  gate.

## Important gaps before claiming pixel-perfect parity

- Existing native font family (Barlow Condensed / Outfit) approximates
  the vectorized display lettering; exact Illustrator font licenses and
  font identifiers were not provided.
- Paint treatment and overlays are implemented responsively, not copied
  by baking whole page screenshots into view backgrounds.
- Reference poster, coverage graphic and skyline were extracted; compare
  on real Android device to ensure aspect/crop/contrast after scaling.
- Use device screenshots at the approved phone aspect ratio to verify
  hierarchy, header ribbon, red areas, vinyl position, bottom bar, and
  contact-form keyboard. Minor tuning is expected before declaring exact
  visual sign-off.

## SDLC / QA

1. CI typecheck / Expo Doctor / dependency and web-export checks.
2. Android preview APK: inspect all six screens vs PDF, small/large phones,
   font scaling, keyboard, scroll, safe area and gestures.
3. Play/pause actual stream; navigate among all five footer actions without
   disrupting audio; verify Share sheet and language switching.
4. Test promotions with no campaigns, real active campaign, missing session,
   terms agreement and successful receipt via existing endpoint.
5. Contact invalid fields, no mail app, email client open, cancel, recipient,
   subject/body; never report submission until user sends.
6. Verify legal notice and Support@neuromarket.io product ownership;
   finalize entity/address/public URL before public store distribution.
7. Product approval and **manual merge**. No modification to
   `laz1310-mobile-app-approved` snapshot or FastAPI/Admin repositories.

## Rollback

Revert this PR and rebuild the APK. Changes here affect React Native UI
and bundled image assets, not API contracts, database schema or backend
releases.
