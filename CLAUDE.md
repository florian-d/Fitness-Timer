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
- CSS styling

---

## Key Implementation Details

### Phase Type (Enum)
- Location: `src/utils/timerReducer.ts`
- Values: Ready, Prepare, Exercise, Rest, Complete

### Test Preset
- Location: `src/utils/presetStorage.ts` as `TEST_PRESET_SETTINGS`
- Intervals: 1s prepare, 5s exercise, 2s rest — speeds up E2E testing 20x

### Wake Lock
- Active during Exercise AND Rest phases
- Gracefully handles unsupported browsers

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
