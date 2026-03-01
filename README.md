# Gym Kiosk - Rafel Dalmau

> **Demo credentials** — copy this into your `.env` to run the project:
> ```
> EXPO_PUBLIC_SUPABASE_URL=https://nxnkniyzteqwmdpqiovz.supabase.co
> EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bmtuaXl6dGVxd21kcHFpb3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTEyMzcsImV4cCI6MjA4Nzg2NzIzN30.l_7sd_QfxiSuh-aEUxJzO--0MsfidlmpTww7iWS3-8I
> ```
> The Supabase database is already seeded — no extra setup required.

## Architecture

File-based routing with Expo Router (v3), a thin Supabase API layer (`lib/api.ts`) for all data access, and React's built-in `Animated` API for UI transitions. Each screen is self-contained: it fetches its own data on mount and writes directly to Supabase on user action.

![DB Diagram](image.png)

## Tech Stack

- **Platform**: React Native (Expo SDK 54)
- **Navigation**: Expo Router v3 (file-based)
- **Backend**: Supabase (PostgreSQL + PostgREST API)
- **State Management**: React `useState` / `useCallback` — no global store needed once check-ins are persisted in Supabase
- **Additional libraries**: `@supabase/supabase-js`, `react-native-safe-area-context`, `@expo/vector-icons`

## Design Decisions

- **Supabase over local JSON**: started with local JSON for speed, then migrated to Supabase so check-ins persist across sessions and multiple kiosk devices see the same state.
- **Offline-First Caching**: `Zustand` and `AsyncStorage` provide a Stale-While-Revalidate pattern. The app reads from cache instantly so it never shows a white screen, even without internet, while syncing with Supabase in the background.
- **Single Day View**: The home screen queries Supabase strictly for "today's" classes (`gte`/`lt` on `start_time`), ensuring the kiosk is always relevant to the current day.
- **`CommonActions.reset` for navigation**: after a check-in, the entire stack is cleared and reset to Home. Using `router.replace('/')` only replaced the top screen, leaving class/search screens stacked underneath — not right for a kiosk.
- **`Animated` over Moti**: Moti was incompatible with the target SDK version. The built-in `Animated` API covers the use case (spring scale + fade) with zero extra dependencies.

## Trade-offs

- **RLS policies are permissive (dev mode)**: all tables allow public reads and check-in inserts via the anon key. For production, policies should be scoped to authenticated users or a service-level API.

## Future Improvements

- Role-based auth for instructors (manage classes, view history)
- Real-time attendee list updates with Supabase Realtime subscriptions
- QR code scan for member check-in
- Background sync for check-ins submitted while offline

## Running the App

```bash
# 1. Install dependencies
npm install

# 2. Create .env (copy the demo credentials above)
cp .env.example .env

# 3. Start the app
npx expo start
```

Scan the QR with **Expo Go** (iOS Camera app or Android Expo Go).

## Tests

Unit tests are included for key utilities and components:

- `formatTime` — converts ISO timestamps and short time strings to HH:MM
- `MemberRow` — renders name, status badges, and time correctly

```bash
npm test
```
