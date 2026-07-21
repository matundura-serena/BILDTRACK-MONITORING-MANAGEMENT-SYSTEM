# BuildTrack Authentication Navigation Root Cause + Permanent Fix

## Symptom
Login succeeds (backend connected; login request returns success; token/user stored; AuthContext logs show authenticated becomes true), but the app remains on **Sign In** instead of navigating to the authenticated main app.

## Root cause (exact failure point)
**`BUILDTRACK/src/screens/SplashScreen.js`**

SplashScreen owns auth-based navigation via a **fixed 2-second timer**:
- it schedules `setTimeout(..., 2000)`
- after the timer fires, it performs `navigation.reset(...)` based on the **`authenticated` value captured for that effect execution**.

When the timer fires, `authenticated` is often still `false` (because AuthContext initially boots with `authenticated=false` and restoration hasn’t completed / or login happens after the redirect fired). SplashScreen then resets navigation to `SignIn`.

After login, AuthContext correctly updates `authenticated=true`, but:
- **`SignInScreen` does not navigate to `MainTabs`**
- **`AppNavigator` does not implement an auth guard**
- therefore there is **no deterministic navigation transition** to `MainTabs` after the timer-based reset already occurred.

### Why the navigator never changes
- The only auth→navigation switch existed in SplashScreen’s timer.
- Once SplashScreen reset the stack to `SignIn`, later auth state changes did not trigger a new reset.

## Contributing architectural issue
Navigation decisions were tied to a Splash timer rather than to an auth state machine.

## Permanent fix applied
### 1) Make SplashScreen not own auth redirects
**`BUILDTRACK/src/screens/SplashScreen.js`**
- Removed the fixed-timer `navigation.reset(...)` logic.
- Kept Splash as a passive screen (optionally preloading dashboard when already authenticated) but **never navigating based on a delayed/stale auth value**.

### 2) Add auth-aware root routing
**`BUILDTRACK/src/navigation/AppNavigator.js`**
- Added `useAuth()` and compute `initialRouteName` based on:
  - `loading`: show `Splash`
  - otherwise: `authenticated ? 'MainTabs' : 'SignIn'`
- This removes the race condition between:
  - SplashScreen’s initial auth value (false)
  - and login-driven auth state updates.

## Result
After these changes:
- Splash is shown while AuthContext initializes (`loading=true`).
- Once AuthContext is done:
  - If already authenticated (restored session): app starts at `MainTabs`.
  - If not authenticated: app starts at `SignIn`.
- Critically, login-driven `authenticated=true` now deterministically leads the root navigator to `MainTabs` without relying on a timer.

## Additional diagnostic improvements recommended (optional)
For future regression prevention, keep logs consistent at:
- `AuthContext.restoreSession()` entry/exit
- `AuthContext.login()` success/failure and final `authenticated/loading`
- root routing decision in `AppNavigator`.

## Files changed
- `BUILDTRACK/src/screens/SplashScreen.js`
- `BUILDTRACK/src/navigation/AppNavigator.js`

