# Customizable Phase Colors - Design Document

**Date:** 2026-02-16
**Status:** Approved
**Issue:** [#31](https://github.com/florian-d/Fitness-Timer/issues/31)

## Overview

Add customizable background colors for training phases (Ready, Prepare, Exercise, Rest) that can be configured individually per workout preset.

## Requirements

- Users can set custom colors for 4 phases: Ready, Prepare, Exercise, Rest
- Colors are configured per preset (each workout type has individual colors)
- Complete phase remains fixed (blue #3B82F6)
- Native HTML color picker for mobile-friendly UX
- Existing presets automatically migrated with default colors

## Design Decisions

### Approach: Colors in WorkoutSettings

**Selected:** Ansatz 1 - Farben direkt in WorkoutSettings
**Reason:** Logical grouping with preset configuration, simple migration, consistent data model

### Default Colors

| Phase    | Color   | Hex Code  |
|----------|---------|-----------|
| Ready    | Gray    | #6B7280   |
| Prepare  | Yellow  | #F59E0B   |
| Exercise | Red     | #EF4444   |
| Rest     | Green   | #10B981   |
| Complete | Blue    | #3B82F6   |

## Data Model Changes

### WorkoutSettings Interface

```typescript
export interface WorkoutSettings {
  rounds: number;
  exerciseTime: number;
  restTime: number;
  prepTime: number;
  // NEW:
  phaseColors: {
    ready: string;      // Hex color
    prepare: string;    // Hex color
    exercise: string;   // Hex color
    rest: string;       // Hex color
  };
}
```

### Constants

```typescript
// src/utils/constants.ts (new file)
export const DEFAULT_PHASE_COLORS = {
  ready: '#6B7280',
  prepare: '#F59E0B',
  exercise: '#EF4444',
  rest: '#10B981',
  complete: '#3B82F6'
} as const;
```

## UI Changes

### Settings Component

- Add 4 color pickers (one per phase)
- Use `<input type="color">` native HTML element
- Display below existing time inputs
- Labels: "Ready Color", "Prepare Color", "Exercise Color", "Rest Color"

**Layout:**
```
┌─────────────────────────┐
│ Rounds: [8]             │
│ Prepare: [10s]          │
│ Exercise: [20s]         │
│ Rest: [10s]             │
│                         │
│ Ready Color: [🎨]       │
│ Prepare Color: [🎨]     │
│ Exercise Color: [🎨]    │
│ Rest Color: [🎨]        │
└─────────────────────────┘
```

## Timer Integration

### Modified Function: getPhaseColor()

**Before:**
```typescript
const getPhaseColor = (): string => {
  switch (state.phase) {
    case Phase.Prepare: return '#F59E0B';
    case Phase.Exercise: return '#EF4444';
    // ...
  }
};
```

**After:**
```typescript
const getPhaseColor = (): string => {
  switch (state.phase) {
    case Phase.Ready: return settings.phaseColors.ready;
    case Phase.Prepare: return settings.phaseColors.prepare;
    case Phase.Exercise: return settings.phaseColors.exercise;
    case Phase.Rest: return settings.phaseColors.rest;
    case Phase.Complete: return DEFAULT_PHASE_COLORS.complete;
    default: return DEFAULT_PHASE_COLORS.ready;
  }
};
```

## Migration Strategy

### localStorage Migration

**Location:** `src/utils/localStorage.ts`

**Logic:**
1. Load existing PresetStore from localStorage
2. For each preset:
   - Check if `settings.phaseColors` exists
   - If missing: add `phaseColors` with `DEFAULT_PHASE_COLORS`
3. Increment `PresetStore.version` to track migration
4. Save updated store

**Code:**
```typescript
function migratePresetColors(preset: WorkoutPreset): WorkoutPreset {
  if (!preset.settings.phaseColors) {
    return {
      ...preset,
      settings: {
        ...preset.settings,
        phaseColors: {
          ready: DEFAULT_PHASE_COLORS.ready,
          prepare: DEFAULT_PHASE_COLORS.prepare,
          exercise: DEFAULT_PHASE_COLORS.exercise,
          rest: DEFAULT_PHASE_COLORS.rest,
        }
      }
    };
  }
  return preset;
}
```

## Testing Strategy

### Unit Tests (Jest)

1. **Data Model Tests**
   - Test default colors are applied to new presets
   - Test migration adds colors to old presets
   - Test phaseColors validation

2. **UI Tests (Settings)**
   - Color pickers render correctly
   - Color changes update settings
   - Color values persist

3. **Timer Tests**
   - `getPhaseColor()` returns correct color from settings
   - Complete phase always returns fixed blue

### E2E Tests (Playwright)

- Create preset with custom colors
- Verify colors display correctly during workout
- Verify colors persist after reload

### Migration Tests

- Test old preset (no phaseColors) loads with defaults
- Test new preset (with phaseColors) loads unchanged

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Update `WorkoutSettings` interface |
| `src/utils/constants.ts` | **NEW** - Add `DEFAULT_PHASE_COLORS` |
| `src/utils/localStorage.ts` | Add migration logic for phaseColors |
| `src/components/Settings.tsx` | Add 4 color pickers |
| `src/components/Settings.css` | Style color pickers |
| `src/components/Timer.tsx` | Update `getPhaseColor()` to use settings |
| `src/components/Timer.test.tsx` | Update mocks with phaseColors |
| `src/utils/localStorage.test.ts` | Add migration tests |
| `src/components/Settings.test.tsx` | Add color picker tests |

## Acceptance Criteria

- [ ] Color pickers visible in Settings for each phase
- [ ] Colors persist per preset in localStorage
- [ ] Existing presets migrated with default colors
- [ ] Timer displays selected colors during workout
- [ ] All 149 unit tests still pass
- [ ] Build succeeds (`npm run build`)
- [ ] E2E tests pass (optional)

## Future Enhancements (Out of Scope)

- Color themes (predefined palettes)
- Color validation (contrast, accessibility)
- Hex input field (advanced users)
- Confetti animation on Complete ([#30](https://github.com/florian-d/Fitness-Timer/issues/30))

---

**Reviewed by:** User (approved all sections)
**Ready for implementation:** Yes
