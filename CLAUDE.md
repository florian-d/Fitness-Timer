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

### Test Preset for Quick Testing
For efficient testing and Playwright E2E tests, use the **Test Preset** with short intervals:

```typescript
TEST_PRESET_SETTINGS = {
  rounds: 2,
  exerciseTime: 5 seconds,
  restTime: 2 seconds,
  prepTime: 1 second,
}
```

**Benefits:**
- ✅ Complete timer cycle in ~14 seconds (vs ~5 minutes with default)
- ✅ Allows testing all phase transitions quickly
- ✅ Perfect for E2E tests and manual validation
- ✅ Defined in `src/utils/presetStorage.ts` as `TEST_PRESET_SETTINGS`

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
   - **For timer changes:** Use the **Test Preset** (if available in UI) for quick testing:
     - Prepare: 1 second
     - Exercise: 5 seconds
     - Rest: 2 seconds
     - Complete cycle: ~14 seconds total
   - Test all phase transitions quickly (Ready → Prepare → Exercise → Rest → Complete)
   - For UI changes: Verify visual correctness

**Pro Tip:** The Test Preset is automatically used in Playwright E2E tests for fast validation.

---

## Workflow for Making Changes

### ⚠️ CRITICAL: Never commit directly to Main!

**NEVER commit to the `main` branch directly!**

Always follow this workflow:
1. ✅ Create a new branch from `main`
2. ✅ Make code changes on the feature branch
3. ✅ Validate all changes (build, tests, runtime)
4. ✅ Commit to your feature branch
5. ✅ Create a Pull Request to `main`
6. ✅ Merge PR to `main` via GitHub

**Why?**
- Maintains clean history
- Enables code review (via PR)
- Allows easy rollback if needed
- Prevents accidental breaking changes

### Before Committing:
1. ✅ Verify you're on a feature branch: `git branch`
2. ✅ Make code changes
3. ✅ Run: `npm run build`
4. ✅ Run: `npm test -- --watchAll=false`
5. ✅ For UI/timer changes: Start app and test with Playwright
6. ✅ Commit with clear message
7. ✅ Create/link issue and PR

### Branch Naming Convention
- `feat/` - New features (e.g., `feat/keep-screen-active-during-rest`)
- `fix/` - Bug fixes (e.g., `fix/timer-reset-bug`)
- `refactor/` - Code refactoring (e.g., `refactor/phase-enum`)
- `test/` - Test improvements (e.g., `test/add-e2e-tests`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)

### Creating a New Branch

```bash
# Create and switch to a new branch from main
git checkout -b feat/my-feature

# Or using modern git syntax
git switch -c feat/my-feature
```

**Always start from `main`:**
```bash
git checkout main
git pull origin main
git checkout -b feat/my-feature
```

### Commit Message Format
```
<type>: <description>

<detailed explanation>

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

### Example Workflow

```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feat/my-new-feature

# 3. Make changes and commit
echo "new feature code" > src/newFeature.ts
npm run build
npm test -- --watchAll=false
git add src/newFeature.ts
git commit -m "feat: add my new feature"

# 4. Push to remote
git push -u origin feat/my-new-feature

# 5. Create PR on GitHub (not via git, but via GitHub UI)
# Visit: https://github.com/florian-d/Fitness-Timer/pulls

# 6. After PR is merged, delete the local branch
git checkout main
git branch -d feat/my-new-feature
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
