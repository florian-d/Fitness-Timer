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
- `feat/` - Features
- `fix/` - Bug fixes
- `refactor/` - Refactoring
- `test/` - Tests
- `docs/` - Documentation

---

## ✅ Validation Checklist (Before Every Commit)

```bash
npm run build                    # Must compile
npm test -- --watchAll=false    # 149 tests must pass
npm run e2e                      # (Optional, slow)
npm start                        # Verify app loads (for UI changes)
```

---

## Project Setup

```bash
npm install
npm test -- --watchAll=false
npm run build
```

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
- Type-safe comparisons via enum

### Test Preset
- Location: `src/utils/presetStorage.ts` as `TEST_PRESET_SETTINGS`
- Intervals: 1s prepare, 5s exercise, 2s rest
- Used in Playwright tests for ~14s complete cycles
- Speeds up testing 20x

### Wake Lock
- Active during Exercise AND Rest phases
- Keeps screen awake on mobile
- Gracefully handles unsupported browsers

---

## Testing

### Unit Tests (Jest)
```bash
npm test              # Watch mode
npm test -- --watchAll=false  # Run once
```
Tests: 149 passing | Location: `src/**/*.test.ts(x)`

### E2E Tests (Playwright)
```bash
npm run e2e          # Headless
npm run e2e:ui       # Interactive UI
npm run e2e:debug    # Debug mode
```
- **Viewport:** iPhone 12 (390x844) - Mobile-first
- **Browsers:** Chromium, Firefox, WebKit (all mobile)
- **Config:** `playwright.config.ts`
- **Tests:** `e2e/fitness-timer.spec.ts`

---

## Commands

```bash
npm start                  # Dev server
npm run build             # Production build
npm test                  # Jest watch
npm test -- --watchAll=false  # Jest once
npm run e2e              # Playwright
npm run e2e:ui           # Playwright UI
```

---

## Recent Changes

| PR | Change | Impact |
|----|--------|--------|
| #26 | Phase: Union Type → Enum | Better type safety |
| #24 | Wake Lock on Rest phase | Better UX |
| #27 | Playwright + Dev Rules | Mobile-first testing |

---

## Known Issues

- [ ] Audio in test environment (browser sandbox)
- [ ] Wake lock API mock coverage
- [ ] Visual regression tests needed

---

## Git Quick Start

```bash
# NEW FEATURE
git checkout main && git pull
git checkout -b feat/my-feature
# ... code ...
npm run build && npm test -- --watchAll=false
git add . && git commit -m "feat: description"
git push -u origin feat/my-feature

# Create PR on GitHub UI, then:
git checkout main && git branch -d feat/my-feature
```
