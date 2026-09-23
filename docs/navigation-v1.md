# LA Z 1310 Mobile — Navigation Contract V1

Issue: #16

## Goal

Integrate the approved Figma V1 modules into one Expo Router application shell
without creating backend endpoints before the UI/data contracts are stable.

## Provider hierarchy

```text
SafeAreaProvider
└── ThemeProvider
    └── AuthProvider
        └── RadioProvider
            └── AppNavigator
                ├── Expo Router Stack
                └── MiniPlayer
```

The radio provider stays above route transitions so playback is not owned by any
single screen.

## Routes

```text
/
├── /home
├── /radio
├── /weather
│   └── /weather/[city]
├── /dynamics
│   ├── /dynamics/[id]
│   ├── /dynamics/[id]/participate
│   └── /dynamics/confirmation
├── /explore
├── /auth
└── /profile
    └── /profile/settings
        ├── /profile/settings/appearance
        ├── /profile/settings/account
        └── /profile/settings/privacy
```

## Global responsibilities

### Theme

V1 stores the user preference locally on the device:

- `dark`
- `light`

No FastAPI call is required. The preference can be synchronized with an account
in a later contract if product requirements justify it.

### Authentication

This branch provides a UI/navigation shell only. It intentionally does **not**
implement Firebase Auth yet. Demo authentication is in-memory and no password,
email, or form data is sent over the network.

### Radio

The existing direct-stream architecture remains unchanged:

```text
Device -> RadioOnlineHD
```

FastAPI must not proxy, retransmit, cache, or store the audio stream.

## Local typed fixtures

Weather and Dynamics use typed local fixtures so UI behavior can be tested
before their backend contracts are frozen.

### Weather

Current V1 screens:

- city list
- city detail
- current conditions
- hourly forecast
- five-day forecast
- humidity / wind / precipitation
- local °F / °C switch

Current locations are Detroit, New York, Chicago, and Washington.

### Dynamics

Current V1 screens:

- list
- detail
- in-app form participation
- external URL participation state
- local confirmation

Supported participation types:

```ts
type DynamicsParticipationType =
  | 'form'
  | 'external_url';
```

External URLs are never fabricated. A disabled CTA is rendered until a real
`participationUrl` is supplied by the eventual backend contract.

## Deferred backend work

Not part of Issue #16:

- weather endpoints/provider integration
- dynamics catalog/detail endpoints
- dynamics participation persistence
- Firebase Auth integration
- account deletion
- favorites/saved content
- notification preference synchronization

## Figma source

Design file:
`gIoWq3zh2op0lVSxqr4fvv`

Primary pages:

- 03 Prototype
- 04 Auth & Profile
- 05 Weather
- 06 Dynamics
- 00 References — Weather
- 00 References - Dynamics

## Physical acceptance flow

1. Open the Development Build.
2. Splash routes to Home.
3. Start the radio and confirm MiniPlayer persists across routes.
4. Open Weather, select Detroit, return.
5. Open Dynamics from the Home campaign or Explore.
6. Open a form-based dynamic, complete the local form, reach confirmation.
7. Open Profile/Auth and complete the demo auth flow.
8. Open Settings -> Appearance and select Light.
9. Navigate across Home, Weather, Dynamics and Profile and confirm the global
   theme stays selected.
10. Reopen the app and confirm the theme preference persists.
11. Confirm background radio behavior remains unchanged from the previously
   accepted Development Build.

A new Development Build may be required because this branch adds the native
AsyncStorage dependency used for persisted theme preference.
