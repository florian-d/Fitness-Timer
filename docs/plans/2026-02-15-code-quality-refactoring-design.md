# Code Quality & Maintainability Refactoring Design

**Date:** 2026-02-15
**Focus:** Reduce code duplication, improve separation of concerns
**Scope:** Moderate Refactoring
**Testing:** Full approach (Unit + Integration + E2E)

## Problem Statement

The codebase has three main areas with quality issues:

1. **Settings.tsx** - 4 identical input groups (Rounds, ExerciseTime, RestTime, PrepTime) with duplicated HTML & validation logic
2. **Timer.tsx** - Large reducer (~85 LOC) mixed with component logic, difficult to test in isolation
3. **localStorage.ts** - Mixed concerns: legacy settings support + preset management (~385 LOC)

## Solution Overview

### 1. Extract NumericInput Component

**File:** `src/components/NumericInput.tsx`

**Props:**
```typescript
interface NumericInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  decrementLabel?: string;
  incrementLabel?: string;
  inputId?: string;
}
```

**Benefits:**
- Eliminates duplicate code in Settings.tsx
- Consistent validation and behavior across all numeric inputs
- Reusable for future settings expansions
- Easier to test independently

**Impact:** Settings.tsx reduced from ~280 LOC to ~150 LOC

### 2. Extract Timer Reducer to Utilities

**File:** `src/utils/timerReducer.ts`

**Exports:**
```typescript
export type Phase = 'ready' | 'prepare' | 'exercise' | 'rest' | 'complete';
export type TimerState = { phase: Phase; currentRound: number; timeRemaining: number; isRunning: boolean };
export type TimerEvent = { type: 'START' | 'PAUSE' | 'RESUME' | 'RESET' | 'TICK' | 'SYNC_SETTINGS' };

export const timerReducer = (state: TimerState, event: TimerEvent, settings: WorkoutSettings): TimerState => { ... }
export const getInitialTimerState = (prepTime: number): TimerState => { ... }
```

**Benefits:**
- Pure reducer function, testable without React
- Clear state machine logic
- Easier debugging and reasoning about state transitions
- Enables reducer testing with Jest

**Impact:** Timer.tsx reduced from ~250 to ~200 LOC

### 3. Modularize localStorage

**Split into two files:**

**src/utils/localStorage.ts** (~120 LOC)
- Legacy settings support only
- `loadSettings()`, `saveSettings()`, `clearSettings()`
- Migration logic from old format

**src/utils/presetStorage.ts** (~265 LOC)
- New preset management
- `loadPresetStore()`, `savePresetStore()`
- CRUD: `createPreset()`, `updatePreset()`, `deletePreset()`, `setActivePreset()`
- Validation: `isPresetNameUnique()`

**Benefits:**
- Clear separation of concerns
- Legacy support isolated from new features
- Easier to extend preset functionality
- Each file has single responsibility

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

**NumericInput Component:**
- Increment/decrement buttons work correctly
- Value validation (min/max constraints)
- onChange callback fires with correct values
- Input accepts direct number entry

**timerReducer:**
- All state transitions work correctly
- TICK updates time remaining
- Phase transitions (prepare → exercise → rest)
- RESET returns to initial state
- SYNC_SETTINGS updates prepTime when settings change

**localStorage & presetStorage:**
- Save/load operations work
- Migration from legacy format succeeds
- Preset CRUD operations validate correctly
- Preset name uniqueness enforced

### Integration Tests (React Testing Library)

**Settings Component:**
- NumericInput components render correctly
- Settings are saved when form submitted
- Language switching works
- Preset management UI functions

**Timer Component:**
- Timer displays correctly with current settings
- State transitions trigger appropriately
- Preset switching works in ready state

### E2E Tests (Playwright)

**User Workflows:**
1. Start app → Timer displays with Default preset
2. Open Settings → Modify exercise time → Save → Timer updates
3. Create new preset → Switch to it → Timer uses new settings
4. Start timer → Cannot switch presets (button disabled)
5. Timer completes → Can switch presets again

## Backwards Compatibility

✅ **No Breaking Changes:**
- Existing localStorage data migrated automatically
- Public API unchanged (App.tsx component interface stays same)
- All new code is internal refactoring
- Users see no UI/UX changes

## Files to Modify

| File | Type | Changes |
|------|------|---------|
| src/components/NumericInput.tsx | New | Extract input component |
| src/components/Settings.tsx | Modified | Use NumericInput component |
| src/utils/timerReducer.ts | New | Extract reducer logic |
| src/components/Timer.tsx | Modified | Import reducer from utils |
| src/utils/localStorage.ts | Modified | Remove preset logic, keep legacy |
| src/utils/presetStorage.ts | New | New preset management module |
| src/App.tsx | Modified | Import from presetStorage |
| src/utils/localStorage.test.ts | Modified | Test legacy settings only |
| src/utils/presetStorage.test.ts | New | Test preset CRUD |
| src/components/NumericInput.test.tsx | New | Test NumericInput component |
| src/utils/timerReducer.test.ts | New | Test reducer logic |
| e2e/playwright.spec.ts | New | E2E workflow tests |

## Success Criteria

✅ All existing tests pass
✅ New tests added for extracted components/functions
✅ Code duplication reduced by ~30%
✅ Components have single responsibility
✅ Playwright E2E tests pass for key workflows
✅ No breaking changes to user-facing API
✅ PR approved with clean test coverage

## Timeline

1. Create Issue & Branch
2. Extract NumericInput component + tests
3. Extract timerReducer + tests
4. Split localStorage modules + tests
5. Add/update integration tests
6. Add Playwright E2E tests
7. Create PR with all tests passing

