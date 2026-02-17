# Fitness-Timer - Development Guide

## Quick Overview
HIIT timer app (React 18 + TypeScript). Test with Jest/Playwright on iPhone 12 viewport. Mobile-first.

---

## 🚨 CRITICAL RULES

### ⚠️ NEVER commit to `main` directly!
1. Create feature branch: `git checkout -b feat/name`
2. Make changes, commit, push
3. Create PR on GitHub
4. Merge via GitHub UI

### Branch Names
- `feat/` - Features  |  `fix/` - Bug fixes  |  `refactor/` - Refactoring  |  `test/` - Tests  |  `docs/` - Documentation

---

## ✅ Validation Checklist (Before Every Commit)

```bash
npm run build                    # Must compile
npm test -- --watchAll=false    # All tests must pass
npm start                        # Verify app loads (for UI changes)
```

---

## Tech Stack
- React 18 + TypeScript
- Jest + React Testing Library + Playwright
- useReducer state management
- react-i18next (EN/DE)
- CSS styling (separate `.css` files per component)

---

## File Structure

```
src/
├── App.tsx                    # Preset state management + types (WorkoutSettings, WorkoutPreset, PresetStore)
├── components/
│   ├── Timer.tsx              # Timer state machine + display
│   └── Settings.tsx           # Settings UI + preset editor
├── hooks/useWakeLock.ts       # Screen wake lock during exercise
├── utils/
│   ├── icons.tsx              # SVG icon components (NEVER use emoji!)
│   ├── localStorage.ts        # Preset persistence + legacy migration
│   ├── presetStorage.ts       # Preset CRUD + defaults
│   ├── timerReducer.ts        # Timer state machine (Phase enum)
│   └── analytics.ts           # Matomo event tracking
└── locales/{en,de}.json       # Translations (ALWAYS update both!)
```

---

## Key Implementation Details

### Phase Type (Enum)
- Location: `src/utils/timerReducer.ts`
- Values: `Ready → Prepare → Exercise ↔ Rest → Complete`

### Phase Colors
- Gray `#6B7280` (ready) | Yellow `#F59E0B` (prepare) | Red `#EF4444` (exercise) | Green `#10B981` (rest) | Blue `#3B82F6` (complete)

### Test Preset
- Location: `src/utils/presetStorage.ts` as `TEST_PRESET_SETTINGS`
- Intervals: 1s prepare, 5s exercise, 2s rest — speeds up E2E testing 20x

### Wake Lock
- Active during Exercise AND Rest phases
- Gracefully handles unsupported browsers

---

## Key Conventions

### ✅ DO
- Use SVG icons from `utils/icons.tsx` (PlayIcon, PauseIcon, ResetIcon, MenuIcon, CloseIcon, BackIcon, EditIcon, TrashIcon, CheckIcon)
- Use `useTranslation()` for ALL user-facing text — no hardcoded strings
- Use `useCallback` for stable event handler references
- Update BOTH `en.json` and `de.json` together
- Test on mobile viewport (390x844)

### ❌ DON'T
- Use emoji icons — always use SVG
- Hardcode text strings — always use i18n keys (`feature.action` pattern)
- Modify localStorage directly — use utility functions from `utils/localStorage.ts`
- Commit to `main` directly

---

## Architecture Decisions (Summary)

| Decision | Choice | Rationale |
|---|---|---|
| State management | `useReducer` (timer) + local state (settings form) + App.tsx (presets) | Clear separation |
| Icons | SVG components in `utils/icons.tsx` | Consistent, scalable, styleable |
| i18n | i18next + JSON files | Industry standard, browser detection |
| Persistence | localStorage (key: `fitnessTimerPresets`) | Simple, offline-first |
| Styling | Separate `.css` files per component | Simple, no runtime overhead |
| Testing | React Testing Library — test behavior not internals | User-focused |
| Analytics | Matomo (privacy-first) | GDPR compliant, self-hostable |

---

## Testing

### Unit Tests (Jest)
```bash
npm test -- --watchAll=false    # Run once (all must pass)
```
Location: `src/**/*.test.ts(x)`

### E2E Tests (Playwright)
```bash
npm run e2e          # Headless (iPhone 12 viewport)
npm run e2e:ui       # Interactive UI mode
```
- Viewport: iPhone 12 (390x844) | Browsers: Chromium, Firefox, WebKit
- Manual: `npm start` → use Playwright MCP tools (browser_navigate, browser_click, browser_snapshot)

---

## Known Issues

- [ ] Audio in test environment (browser sandbox)
- [ ] Wake lock API mock coverage
- [ ] Visual regression tests needed
