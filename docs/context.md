# Worklyn — engineering context

Single place for **project-specific wiring** and **where to look** for library best practices.  
**Agents:** read this before deep work on styling, native UI, or tests; **append** short bullets when you discover durable patterns (with source link).

---

## Official docs (bookmark)

| Area | Start here |
|------|----------------|
| React Native | [reactnative.dev/docs](https://reactnative.dev/docs/getting-started) |
| Unistyles v3 | [unistyl.es](https://unistyl.es/v3/start/introduction) — [getting started](https://unistyl.es/v3/start/getting-started), [configuration](https://unistyl.es/v3/start/configuration), [Babel plugin](https://unistyl.es/v3/other/babel-plugin), [StyleSheet API](https://unistyl.es/v3/references/stylesheet) |
| TypeScript (RN) | `@react-native/typescript-config` (extends in repo `tsconfig.json`) |
| React Native Reusables | [reactnativereusables.com/docs](https://reactnativereusables.com/docs) (if/when NativeWind stack is added) |

---

## Worklyn — Unistyles

- **Configure once:** [`src/theme/configure.ts`](../src/theme/configure.ts) — `StyleSheet.configure`, themes (`dark`), `declare module 'react-native-unistyles'` for `UnistylesThemes`.
- **App entry:** [`App.tsx`](../App.tsx) imports `./src/theme/configure` before other UI.
- **Babel:** [`babel.config.js`](../babel.config.js) — `['react-native-unistyles/plugin', { root: 'src' }]` so files under `src/` are transformed.
- **Styles per screen/component:** `styles.ts` next to the component; `StyleSheet` from `react-native-unistyles`, not `react-native`.
- **Theme in styles:** prefer `StyleSheet.create(theme => ({ ... }))` and `theme.colors.*`, `theme.spacing`, `theme.radius`, `theme.font`.
- **Jest:** [`jest.config.js`](../jest.config.js) — `setupFilesAfterEnv: ['react-native-unistyles/mocks']` so tests do not load Nitro native code.

---

## Worklyn — React Native

- **New Architecture:** RN 0.85+ / Fabric; align native deps with template ([`package.json`](../package.json)).
- **Safe area:** root uses `react-native-safe-area-context` (`SafeAreaProvider` in `App.tsx`); screens can use `useSafeAreaInsets`.
- **Reusable UI:** [`src/components/ui/`](../src/components/ui/) — `Button`, `Input`, `Card`, `Chip`; each folder has `styles.ts` + `index.tsx`; barrel [`index.ts`](../src/components/ui/index.ts).
- **App shell:** [`src/components/layout/`](../src/components/layout/) — `AppHeaderBar` (full-width bar + inner row using `theme.spacing[4]` to align with screen body padding).
- **Display name:** [`src/features/userProfile/`](../src/features/userProfile/) — `UserProfileProvider` + AsyncStorage key `worklyn:userDisplayName:v1`; first launch prompts via [`DisplayNameModal`](../src/components/ui/DisplayNameModal/index.tsx) (min 3 chars, no max); header uses `formatDisplayNameForHeader` (title case); long-press header avatar to edit. [AsyncStorage](https://github.com/react-native-async-storage/async-storage#readme).
- **Attendance session:** [`src/features/attendance/`](../src/features/attendance/) — `AttendanceSessionProvider` + [`session/`](../src/features/attendance/session/) pure helpers (`applyAttendanceAction`, `sessionDurations`, AsyncStorage via [`@react-native-async-storage/async-storage`](https://github.com/react-native-async-storage/async-storage)); Home + [`CheckInStatusCard`](../src/pages/Home/components/CheckInStatusCard/index.tsx) use live timers. **Jest:** in-memory mock in [`jest/setupAfterEnv.js`](../jest/setupAfterEnv.js) (package Jest build is ESM); run `pod install` in `ios/` after adding native deps.
- **Async Storage 3.x (Android):** root [`android/build.gradle`](../android/build.gradle) `allprojects.repositories` must include `maven { url → …/async-storage/android/local_repo }` so Gradle resolves `storage-android:1.0.0` ([library README](https://github.com/react-native-async-storage/async-storage#readme)).
- **Attendance modeling:** timeline, footer totals, and **`getShiftDurations`** / **`getActiveWorkedMs`** aggregate **all same-day** `clock_in`→`clock_out` segments (idle gaps excluded from span). **`getSortedEventsForCurrentShift`** is only for the **open segment** (e.g. **`getCurrentPauseElapsedMs`**). Persisted **`businessDayKey`** (`YYYY-MM-DD` local) plus **`resolveSnapshotForCalendarDay`** clear storage when the calendar day changes (`AppState` → `active`, **`reconcileCalendarDay`** on Home mount). **`hydratedRef`** blocks `apply` until AsyncStorage load finishes so an early tap cannot overwrite restored state. Storage **`worklyn:attendanceSession:v2`** keeps `businessDayKey`; v1 migrates on read.
- **Attendance day history:** [`src/features/attendance/history/attendanceHistoryStorage.ts`](src/features/attendance/history/attendanceHistoryStorage.ts) — AsyncStorage **`worklyn:attendanceHistory:v1`** (`days[YYYY-MM-DD]` → events + `updatedAt`); rolling **31** local days (`today` + 30 prior via **`oldestRetainedAttendanceHistoryDayKey`**). Before clearing stale live session, **`archiveStaleLiveSnapshotIfNeeded`** + **`resolveLiveSnapshotWithArchive`**; today’s session is mirrored with **`mirrorLiveSessionToHistoryIfToday`** after saves. History tab reads archive for past days and live context for today ([`useAttendanceHistoryForSelection`](src/pages/History/useAttendanceHistoryForSelection.ts)). On calendar rollover while a prior-day shift is still open, **`autoCloseOpenShiftForCalendarRollover`** ends an active break then **`clock_out`** (or **`clock_out`** only if working) at rollover time before archiving so History does not keep a “running” prior-day timer. History calendar strip: **30 prior + today + 5 future** cells; future days are **disabled** (not selectable); retention remains **31** stored days (`today` + 30 prior).
- **Durations UI:** [`formatDuration`](../src/features/attendance/formatAttendance.ts) includes **seconds** (e.g. `45s`, `8m 30s`) so sub-minute pauses are visible; live break time still uses **`formatElapsedAsHms`** on the card. Pause **ms** math is in [`sessionDurations.ts`](../src/features/attendance/session/sessionDurations.ts) (`getPauseTotalsMs` / `getShiftDurations`).
- **Icons:** [`lucide-react-native`](https://lucide.dev/guide/packages/lucide-react-native) + peer [`react-native-svg`](https://github.com/software-mansion/react-native-svg); after install run `pod install` in `ios/` for iOS builds.

### React Navigation

- **Entry:** import [`react-native-gesture-handler`](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation) first in [`index.js`](../index.js); [`NavigationContainer`](https://reactnavigation.org/docs/navigation-container) in [`src/navigation/RootNavigator.tsx`](../src/navigation/RootNavigator.tsx), mounted from [`App.tsx`](../App.tsx) inside providers.
- **Tabs + shared chrome:** [`src/navigation/MainShell.tsx`](../src/navigation/MainShell.tsx) — shared header ([`AppHeaderBar`](../src/components/layout/AppHeaderBar/index.tsx)) + display-name modal above a [`createBottomTabNavigator`](https://reactnavigation.org/docs/bottom-tab-navigator) (`Home`, `History`).
- **Jest:** [`jest.config.js`](../jest.config.js) — extend `transformIgnorePatterns` so `@react-navigation`, `react-native-screens`, and `react-native-gesture-handler` are transpiled ([testing notes](https://reactnavigation.org/docs/testing)).

---

## Worklyn — theme & design tokens

- Tokens: [`src/theme/tokens/`](../src/theme/tokens/) — primitives + semantic colors.
- Composed dark theme: [`src/theme/themes/dark.ts`](../src/theme/themes/dark.ts).
- Re-exports: [`src/theme/index.ts`](../src/theme/index.ts).

---

## Research habit (for agents)

1. **Check this file first** for Worklyn-specific decisions.
2. For API details / edge cases, **read official docs** (links above) rather than guessing.
3. After fixing a non-obvious issue (version quirk, babel order, mock setup), add a **one-line bullet** under the right section with a link to the doc or issue.

---

## Cursor rules (short pointers)

- [`.cursor/rules/react-native-styling.mdc`](../.cursor/rules/react-native-styling.mdc) — Unistyles + `styles.ts` + `src/theme` + `src/components/ui`.
- [`.cursor/rules/project-conventions.mdc`](../.cursor/rules/project-conventions.mdc) — how rules are stored and updated.
- [`.cursor/rules/react-native-reusables.mdc`](../.cursor/rules/react-native-reusables.mdc) — Reusables CLI when adding catalog UI.
