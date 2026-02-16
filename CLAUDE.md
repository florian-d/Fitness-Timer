# Fitness-Timer - Development Guide

## Project Overview
HIIT workout timer web application built with React, featuring customizable exercise/rest intervals, wake lock support, and multi-language support.

## Tech Stack
- **Frontend:** React 18 with TypeScript
- **Testing:** Jest + React Testing Library + Playwright
- **State Management:** useReducer
- **Styling:** CSS
- **Internationalization:** react-i18next

## Code Quality & Type Safety

### Phase Type
- **Status:** Converted to TypeScript Enum (as of Feb 2026)
- **Implementation:** `src/utils/timerReducer.ts`
- **Benefits:** Type-safe phase comparisons, better IDE support
- **Enum Values:** Ready, Prepare, Exercise, Rest, Complete

## Validation Process for All Changes

**⚠️ CRITICAL: Every code change must pass ALL validation steps before committing.**

### Step 1: Build Check
```bash
npm run build
```
- **What it does:** Compiles TypeScript and checks for compilation errors
- **Success criteria:** "Compiled successfully" message
- **If fails:** Fix TypeScript errors immediately

### Step 2: Unit Tests
```bash
npm test -- --watchAll=false
```
- **What it does:** Runs all Jest tests
- **Success criteria:** All tests pass (currently 149 tests)
- **Critical test files:**
  - `src/utils/timerReducer.test.ts` - Core timer logic
  - `src/components/Timer.test.tsx` - UI behavior
  - `src/hooks/useWakeLock.test.ts` - Screen wake lock

### Step 3: E2E Tests (Playwright)
```bash
npm run e2e
```
- **What it does:** Runs end-to-end tests
- **Currently:** E2E tests in `e2e/` directory
- **Test file:** `e2e/fitness-timer.spec.ts`

### Step 4: Runtime Validation
For UI-critical changes, validate the app runs correctly:

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Test with Playwright:**
   - Navigate to `http://localhost:3000`
   - Verify app loads without errors
   - For timer changes: Test phase transitions (Ready → Prepare → Exercise → Rest → Complete)
   - For UI changes: Verify visual correctness

---

## Workflow for Making Changes

### Before Committing:
1. ✅ Make code changes
2. ✅ Run: `npm run build`
3. ✅ Run: `npm test -- --watchAll=false`
4. ✅ For UI/timer changes: Start app and test with Playwright
5. ✅ Commit with clear message
6. ✅ Create/link issue and PR

### Branch Naming Convention
- `feat/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `test/` - Test improvements

### Commit Message Format
```
<type>: <description>

<detailed explanation>

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

---

## Recent Refactorings

### Phase Type → Enum (PR #26)
- **Date:** Feb 2026
- **Change:** Converted union type to TypeScript enum
- **Files:** `src/utils/timerReducer.ts`, `src/components/Timer.tsx`
- **Impact:** Improved type safety, no breaking changes

### Wake Lock During Rest (PR #24)
- **Date:** Feb 2026
- **Change:** Keep screen active during rest phase
- **Files:** `src/components/Timer.tsx`, `src/components/Timer.test.tsx`
- **Impact:** Better UX during recovery periods

---

## Testing Strategy

### Unit Tests
- Pure function tests for `timerReducer`
- React component tests with Testing Library
- Mock hooks (useWakeLock, etc.)

### E2E Tests
- User workflow tests with Playwright
- Multi-browser support
- Real app behavior validation

### Coverage Areas
- ✅ Timer state transitions
- ✅ Phase progression
- ✅ Wake lock activation/deactivation
- ✅ Settings sync
- ✅ Preset management
- ✅ Multi-language support

---

## Known Limitations & TODO

- [ ] Audio playback in test environment (browser sandbox limitation)
- [ ] Wake lock API mock needs improvement for test coverage
- [ ] Consider adding visual regression tests

---

## Useful Commands

```bash
npm start              # Start dev server
npm test              # Run tests in watch mode
npm test -- --watchAll=false  # Run all tests once
npm run build         # Production build
npm run eject         # Eject from Create React App (irreversible!)
```

---

## Environment Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Modern browser with Wake Lock API support (for full functionality)

### First Time Setup
```bash
npm install
npm test -- --watchAll=false
npm run build
```

---

## Contact & Notes
- This is a personal project for fitness training timing
- Supports HIIT workouts with customizable intervals
- Mobile-first design considerations
