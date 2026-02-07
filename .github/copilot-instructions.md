# HIIT Timer - AI Coding Agent Instructions

## Project Overview
React 18 + TypeScript PWA for High-Intensity Interval Training workouts. Mobile-first design (iPhone optimized), entirely AI-generated codebase as an exploration project. No React/TypeScript expert maintains this—rely on patterns already established.

## Core Architecture

### State Management Pattern
- **Timer Component**: Uses `useReducer` for complex state machine (ready → prepare → exercise → rest → complete)
- All timer events dispatched as actions: `START`, `PAUSE`, `RESUME`, `RESET`, `TICK`, `SYNC_SETTINGS`
- Phase transitions trigger audio bells: single bell for rest/prepare, double bell for exercise starts
- Example: `dispatch({ type: 'TICK' })` advances timer, handles phase transitions automatically

### Component Structure
- `App.tsx`: Root container managing settings modal and timer states
- `Timer.tsx`: Core workout timer with reducer-based state machine (300+ lines)
- `Settings.tsx`: Workout configuration with inline increment/decrement buttons
- Custom hook: `useWakeLock.ts` - Manages Screen Wake Lock API during exercise phases only

### Audio System
- Two bell sounds: `/bell.mp3` (single), `/bell_twice.mp3` (double)
- Requires user interaction to "unlock" on iOS - handled via `unlockAudio()` callback
- Audio refs stored at component level, cleanup on unmount critical
- Phase change detection via `previousPhaseRef` triggers appropriate bell

### PWA Implementation
- Service worker in `src/service-worker.ts` using Workbox for offline support
- Manifest: `public/manifest.json` - configured for standalone display mode
- Register service worker in `src/index.tsx` via `serviceWorkerRegistration.register()`
- Screen Wake Lock prevents dimming during exercise phase only (not rest)

## Key Development Patterns

### Testing Style
- Jest + React Testing Library in all `*.test.tsx` files
- Always use `jest.useFakeTimers()` for timer tests
- Wrap state changes in `act()` - see `clickWithAct`, `advanceTime`, `runPendingTimers` helpers in `Timer.test.tsx`
- Mock audio elements to avoid browser errors during tests

### TypeScript Conventions
- Strict mode enabled in `tsconfig.json`
- Custom types in `src/types/wake-lock.d.ts` for browser APIs not in @types
- Interface definitions colocated with components (e.g., `WorkoutSettings` in `App.tsx`)
- Global window extensions declared inline: `declare global { interface Window { _paq?: ... } }`

### Styling Approach
- Component-scoped CSS files (e.g., `Timer.css`, `Settings.css`)
- Background colors set inline via `style={{ backgroundColor: getPhaseColor() }}`
- Phase colors: Red (#EF4444) exercise, Green (#10B981) rest, Yellow (#F59E0B) prepare, Gray ready
- Mobile-first: large touch targets, high contrast, minimal UI during workouts

### Analytics Integration
- Matomo analytics via `src/utils/analytics.ts` - `trackEvent()` function
- Only tracks workout lifecycle: Started, Completed
- Checks for `window._paq` existence before pushing events

## Build & Test Commands

```bash
npm start          # Dev server on localhost:3000
npm test           # Interactive test runner
npm test -- --coverage --watchAll=false  # CI-style test run
npm run build      # Production build to build/
```

No explicit lint script - ESLint configured via `eslintConfig` in `package.json` (extends react-app)

## CI/CD Pipeline

### GitHub Actions Workflows
- `.github/workflows/ci-cd.yml`: Tests on Node 18.x + 20.x, builds, deploys to GitHub Pages on main
- `.github/workflows/release-ftp.yml`: FTP deployment on git tags (see `docs/FTP_DEPLOYMENT.md`)
- Build artifacts uploaded only from Node 20.x runs

### Environment Variables
- `REACT_APP_GIT_SHA`: Injected at build time, displayed in footer (format: first 7 chars)

## Common Pitfalls

### Audio on iOS/Mobile
- Never call `.play()` directly without user interaction context
- Always wrap audio operations in try-catch and check function existence
- Example: `if (typeof audioRef.current?.play === 'function')`

### Wake Lock API
- Only available in secure contexts (HTTPS or localhost)
- Can fail silently if tab not visible - always handle rejection
- Should be requested/released in useEffect cleanup

### Timer Precision
- Interval-based timer using `setInterval(dispatch, 1000)` - not high precision
- Phase transitions happen when `timeRemaining` reaches 0, then immediate next phase
- Settings changes synced via `SYNC_SETTINGS` action only when timer in ready/complete state

## Adding New Features

### New Timer Phase
1. Add to `Phase` union type in `Timer.tsx`
2. Update reducer `TICK` case for transition logic
3. Add color in `getPhaseColor()` and label in `getPhaseText()`
4. Consider audio cues in phase change `useEffect`

### New Settings Field
1. Add to `WorkoutSettings` interface in `App.tsx`
2. Add state + handlers in `Settings.tsx` (follow rounds/exerciseTime pattern)
3. Update `SYNC_SETTINGS` logic in Timer reducer if needed
4. Update total time calculation in settings summary
