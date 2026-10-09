# LA Z 1310 — UX/UI V1 Usability Acceptance

Issue: #47

## Decision

LA Z is radio-first. The four principal destinations are Inicio, Radio,
Explorar and Perfil. News and Events are out of V1 until publishing contracts
and working journeys exist. Do not show a fake selected filter or disabled
product controls.

The native audio stream remains device -> RadioOnlineHD; mobile authentication,
notifications, published Program/Dynamics/Weather contracts and backend release
semantics remain unchanged.

## Navigation and home hierarchy

- Replace top-level destinations rather than pushing them into an unbounded stack.
- Top-level destination switches have no transition; detail routes use a
  horizontal push; browser/system share handles its own native presentation.
- Radio remains accessible from Home and the MiniPlayer while the stream
  continues across navigation.
- Product-approved Home order (top to bottom): header with logo, weather and
  notifications; horizontally scrollable shortcut buttons (Todos, Dinámicas,
  Clima, Programas, Notificaciones); published banners; live radio card;
  published Dynamics carousel; Programs with actionable cards; Spotify playlist;
  persistent bottom navigation.
- Shortcut buttons are navigation, **not content filters**. `Todos` means all
  Home modules are visible and scrolls Home to the top when pressed. Other
  buttons open their existing published module routes; no fake filtering state.
- Published promotional/dynamic content disappears naturally when not available.
  Home Banners are user-swiped, Dynamics retains its intentionally approved
  auto-advance (PR #34); never show two competing automatically moving banners.
- Programs open `/programs/{programId}`. The detail route/parameters remain
  unchanged and publication is controlled by FastAPI.

## Sharing

- Radio Share is the native React Native `Share.share({ message })`; this
  invokes Android's Sharesheet or the system sharing UI on iOS.
- Spanish Android text (product-provided):
  `Estoy escuchando LA Z Detroit. Descarga la app en tu teléfono Android https://play.google.com/store/apps/details?id=com.lazradio.hdamfm`
- The Android URL points to the **legacy RadioOnlineHD app package**. Our new
  Expo app uses `com.neuromarket.laz1310`. Product/Play Store ownership must
  confirm whether to migrate the existing listing or replace this URL with the
  new public store URL before launch. Copy and destinations live in
  `src/config/share.ts`. No fictitious iOS App Store link: iOS shares LA Z's
  public website until its verified store page exists.
- Sharesheet options such as WhatsApp, Gmail and Facebook are supplied by
  the OS and installed applications, not a custom hardcoded share menu.

## Accessibility and scope

- The bottom bar displays only actionable destinations and exposes
  `accessibilityState.selected`.
- The primary notification bell and Radio share affordance have 48dp targets.
- The Radio screen scrolls on small devices, with the vinyl size constrained
  by viewport width/height.
- Guest Profile exposes Sign In/Register, Appearance, Language and public
  Privacy Policy without forcing authentication. Auth-dependent features stay
  behind existing token checks.
- The UI does not expose unavailable Sleep Timer, Favorite, Volume, Events,
  unsupported Terms or Support routes, or empty News navigation.
- Account deletion is a **separate hard launch gate** in Issue #48; hiding a
  dummy disabled control is not compliance.

## Manual device acceptance (required before merge/release)

1. Android small and normal-size devices: Home loads in the specified order
   (Header -> horizontal shortcuts -> Banners -> Radio -> Dynamics -> Programs
   -> Spotify -> bottom navigation); swipe the shortcuts and check all five
   labels/buttons work. `Todos` returns to the complete Home feed. Verify
   mini player does not cover an actionable button. Test light/dark appearance.
2. Change all four tabs repeatedly: no growing back history, no unreachable
   routes, and the radio stream keeps playing.
3. Tap Radio Share: Android system Sharesheet opens with the exact Spanish
   link and copy; copy text; verify WhatsApp/Gmail targets when installed.
   Canceling the share must not stop live radio.
4. iOS: system share sheet with website fallback (no unverified App Store ID);
   same navigation and background playback invariants.
5. Check English and Spanish copy in Radio/Profile/Notifications/Weather and
   on the share sheet.
6. Open Home program card and verify it resolves an existing published Program.
7. Confirm Dynamics auto-advance remains deliberate; banners no longer compete;
   gestures still work and first visible content remains accessible.
8. Logged out: navigate Profile -> Appearance/Language/Privacy; sign in to
   participate or manage the account. Logged in: Profile and Preferences work.
9. Loading/empty/errors for Weather, Programs, Dynamics, inbox; keyboard,
   narrow-width, large text, TalkBack/VoiceOver and reduced motion.
10. Check legal policy/current version and confirm Issue #48 is resolved before
    production store submission.

## Gates / rollback

GitHub PR CI: Expo compatibility, Expo Doctor, TypeScript,
web export smoke test and dependency audit. Manual QA must be recorded as
evidence. No FastAPI, Firestore, API schema, store release or EAS build changes
are in scope. Roll back by reverting this PR and rebuilding the APK if required.
