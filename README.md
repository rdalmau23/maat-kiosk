# Gym Kiosk - Rafel Dalmau

> **Zero Setup Required:**
> The Supabase database is already seeded, and the API keys (Anon Key & URL) are securely hardcoded as fallbacks for the demo environments. You do not need a `.env` file to run this project. Just `npm install` and start
>
> **Note on Security:** The `SUPABASE_SERVICE_ROLE_KEY` used for initial Database seeding is purposefully omitted from this repository for security reasons. It is not required to run the App.

## Architecture

File-based routing with Expo Router (v3), a thin Supabase API layer (`lib/api.ts`) for all data access, and React's built-in `Animated` API for UI transitions. Each screen is self-contained: it fetches its own data on mount and writes directly to Supabase on user action.

![DB Diagram](image.png)

## Tech Stack

- **Platform**: React Native (Expo SDK 54)
- **Navigation**: Expo Router v3 (file-based)
- **Backend**: Supabase (PostgreSQL + PostgREST API)
- **State Management**: React `useState` / `useCallback` — no global store needed once check-ins are persisted in Supabase
- **Additional libraries**: `@supabase/supabase-js`, `react-native-safe-area-context`, `@expo/vector-icons`, `expo-camera`, `expo-localization`

## Design Decisions

- **Supabase over local JSON**: started with local JSON for speed, then migrated to Supabase so check-ins persist across sessions and multiple kiosk devices see the same state.
- **Offline-First Caching**: `Zustand` and `AsyncStorage` provide a Stale-While-Revalidate pattern. The app reads from cache instantly so it never shows a white screen, even without internet, while syncing with Supabase in the background.
- **Single Day View**: The home screen queries Supabase strictly for "today's" classes (`gte`/`lt` on `start_time`), ensuring the kiosk is always relevant to the current day.
- **QR Code Engine:** Members generate unique encrypted QR Passes expiring in 5 minutes. Coaches natively scan these with their device Camera (`expo-camera`) to grant instant class access via the automated validator `scan.tsx`.
- **Global i18n Support:** Application automatically detects device locale and falls back effectively to English. Translates seamlessly into ES, CA, DE, FR, and IT natively.
- **Role-Based Access Control (RBAC):** Three distinct tiers: Admin, Coach, and Member enforcing specific UX elements strictly at the view layer.
- **`CommonActions.reset` for navigation**: after a check-in, the entire stack is cleared and reset to Home. Using `router.replace('/')` only replaced the top screen, leaving class/search screens stacked underneath — not right for a kiosk.
- **`Animated` over Moti**: Moti was incompatible with the target SDK version. The built-in `Animated` API covers the use case (spring scale + fade) with zero extra dependencies.

## Trade-offs

- **RLS policies are permissive (dev mode)**: all tables allow public reads and check-in inserts via the anon key. For production, policies should be scoped to authenticated users or a service-level API.

## Future Improvements

- Background sync for check-ins submitted while offline
- Real-time attendee list updates with Supabase Realtime subscriptions

## Running the App

```bash
# 1. Install dependencies
npm install

# 2. Start the app
npx expo start --clear
```

Scan the QR with **Expo Go** (iOS Camera app or Android Expo Go).

**⚠️ Important:** You must have the **Expo Go app downloaded on a physical mobile device** in order to test native hardware features like the QR Code Camera Scanner completely. A standard desktop simulator cannot mock camera barcode data streams in full.

## Tests

Unit tests are included for key utilities and components:

- `formatTime` — converts ISO timestamps and short time strings to HH:MM
- `MemberRow` — renders name, status badges, and time correctly

```bash
npm test
```
