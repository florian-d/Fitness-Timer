# Customizable Phase Colors Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to customize background colors for each training phase (Ready, Prepare, Exercise, Rest) per workout preset.

**Architecture:** Extend WorkoutSettings with phaseColors object, migrate existing presets with defaults, add native color pickers in Settings UI, update Timer to consume colors from settings.

**Tech Stack:** React 18, TypeScript, Jest, React Testing Library

---

## Task 1: Create Constants File

**Files:**
- Create: `src/utils/constants.ts`

**Step 1: Write the failing test**

Create test file `src/utils/constants.test.ts`:

```typescript
import { DEFAULT_PHASE_COLORS } from './constants';

describe('DEFAULT_PHASE_COLORS', () => {
  it('should export default phase colors', () => {
    expect(DEFAULT_PHASE_COLORS).toBeDefined();
  });

  it('should have all required phase colors', () => {
    expect(DEFAULT_PHASE_COLORS.ready).toBe('#6B7280');
    expect(DEFAULT_PHASE_COLORS.prepare).toBe('#F59E0B');
    expect(DEFAULT_PHASE_COLORS.exercise).toBe('#EF4444');
    expect(DEFAULT_PHASE_COLORS.rest).toBe('#10B981');
    expect(DEFAULT_PHASE_COLORS.complete).toBe('#3B82F6');
  });

  it('should be immutable', () => {
    expect(() => {
      // @ts-expect-error Testing immutability
      DEFAULT_PHASE_COLORS.ready = '#000000';
    }).toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- constants.test.ts --watchAll=false`

Expected: FAIL with "Cannot find module './constants'"

**Step 3: Write minimal implementation**

Create `src/utils/constants.ts`:

```typescript
/**
 * Default phase colors used throughout the app
 * These match the original hardcoded values in Timer.tsx
 */
export const DEFAULT_PHASE_COLORS = {
  ready: '#6B7280',     // Gray
  prepare: '#F59E0B',   // Yellow
  exercise: '#EF4444',  // Red
  rest: '#10B981',      // Green
  complete: '#3B82F6',  // Blue (not configurable)
} as const;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- constants.test.ts --watchAll=false`

Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add src/utils/constants.ts src/utils/constants.test.ts
git commit -m "feat: add DEFAULT_PHASE_COLORS constants"
```

---

## Task 2: Update WorkoutSettings Interface

**Files:**
- Modify: `src/App.tsx:16-21`

**Step 1: Write the failing test**

Create test file `src/App.test.tsx`:

```typescript
import { WorkoutSettings } from './App';
import { DEFAULT_PHASE_COLORS } from './utils/constants';

describe('WorkoutSettings', () => {
  it('should support phaseColors property', () => {
    const settings: WorkoutSettings = {
      rounds: 8,
      exerciseTime: 30,
      restTime: 10,
      prepTime: 10,
      phaseColors: {
        ready: DEFAULT_PHASE_COLORS.ready,
        prepare: DEFAULT_PHASE_COLORS.prepare,
        exercise: DEFAULT_PHASE_COLORS.exercise,
        rest: DEFAULT_PHASE_COLORS.rest,
      }
    };

    expect(settings.phaseColors.ready).toBe('#6B7280');
    expect(settings.phaseColors.prepare).toBe('#F59E0B');
    expect(settings.phaseColors.exercise).toBe('#EF4444');
    expect(settings.phaseColors.rest).toBe('#10B981');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- App.test.tsx --watchAll=false`

Expected: FAIL with "Property 'phaseColors' does not exist on type 'WorkoutSettings'"

**Step 3: Write minimal implementation**

Update `src/App.tsx`:

```typescript
export interface WorkoutSettings {
  rounds: number;
  exerciseTime: number; // in seconds
  restTime: number; // in seconds
  prepTime: number; // in seconds
  phaseColors: {
    ready: string;      // Hex color
    prepare: string;    // Hex color
    exercise: string;   // Hex color
    rest: string;       // Hex color
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- App.test.tsx --watchAll=false`

Expected: PASS

**Step 5: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: add phaseColors to WorkoutSettings interface"
```

---

## Task 3: Update DEFAULT_SETTINGS and TEST_PRESET_SETTINGS

**Files:**
- Modify: `src/utils/presetStorage.ts:6-22`

**Step 1: Write the failing test**

Add to `src/utils/presetStorage.test.ts` (or create if missing):

```typescript
import { DEFAULT_SETTINGS, TEST_PRESET_SETTINGS } from './presetStorage';
import { DEFAULT_PHASE_COLORS } from './constants';

describe('Preset Settings with Phase Colors', () => {
  it('DEFAULT_SETTINGS should have default phase colors', () => {
    expect(DEFAULT_SETTINGS.phaseColors).toEqual({
      ready: DEFAULT_PHASE_COLORS.ready,
      prepare: DEFAULT_PHASE_COLORS.prepare,
      exercise: DEFAULT_PHASE_COLORS.exercise,
      rest: DEFAULT_PHASE_COLORS.rest,
    });
  });

  it('TEST_PRESET_SETTINGS should have default phase colors', () => {
    expect(TEST_PRESET_SETTINGS.phaseColors).toEqual({
      ready: DEFAULT_PHASE_COLORS.ready,
      prepare: DEFAULT_PHASE_COLORS.prepare,
      exercise: DEFAULT_PHASE_COLORS.exercise,
      rest: DEFAULT_PHASE_COLORS.rest,
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- presetStorage.test.ts --watchAll=false`

Expected: FAIL with "Property 'phaseColors' does not exist"

**Step 3: Write minimal implementation**

Update `src/utils/presetStorage.ts`:

```typescript
import { DEFAULT_PHASE_COLORS } from './constants';

export const DEFAULT_SETTINGS: WorkoutSettings = {
  rounds: 8,
  exerciseTime: 30,
  restTime: 10,
  prepTime: 10,
  phaseColors: {
    ready: DEFAULT_PHASE_COLORS.ready,
    prepare: DEFAULT_PHASE_COLORS.prepare,
    exercise: DEFAULT_PHASE_COLORS.exercise,
    rest: DEFAULT_PHASE_COLORS.rest,
  },
};

export const TEST_PRESET_SETTINGS: WorkoutSettings = {
  rounds: 2,
  exerciseTime: 5,
  restTime: 2,
  prepTime: 1,
  phaseColors: {
    ready: DEFAULT_PHASE_COLORS.ready,
    prepare: DEFAULT_PHASE_COLORS.prepare,
    exercise: DEFAULT_PHASE_COLORS.exercise,
    rest: DEFAULT_PHASE_COLORS.rest,
  },
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- presetStorage.test.ts --watchAll=false`

Expected: PASS

**Step 5: Commit**

```bash
git add src/utils/presetStorage.ts src/utils/presetStorage.test.ts
git commit -m "feat: add phaseColors to DEFAULT_SETTINGS and TEST_PRESET_SETTINGS"
```

---

## Task 4: Add Migration Logic to localStorage

**Files:**
- Modify: `src/utils/localStorage.ts:95-178`
- Modify: `src/utils/presetStorage.ts:61-101`

**Step 1: Write the failing test**

Add to `src/utils/localStorage.test.ts`:

```typescript
import { loadPresetStore } from './localStorage';
import { DEFAULT_PHASE_COLORS } from './constants';

describe('loadPresetStore with phaseColors migration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should migrate presets without phaseColors to include default colors', () => {
    // Simulate old preset format (no phaseColors)
    const oldPreset = {
      id: 'preset_old',
      name: 'Old Preset',
      settings: {
        rounds: 5,
        exerciseTime: 20,
        restTime: 10,
        prepTime: 10,
        // No phaseColors
      },
      createdAt: 1234567890,
    };

    const oldStore = {
      activePresetId: 'preset_old',
      presets: [oldPreset],
      version: 1,
    };

    localStorage.setItem('fitnessTimerPresets', JSON.stringify(oldStore));

    const store = loadPresetStore();

    expect(store.presets[0].settings.phaseColors).toEqual({
      ready: DEFAULT_PHASE_COLORS.ready,
      prepare: DEFAULT_PHASE_COLORS.prepare,
      exercise: DEFAULT_PHASE_COLORS.exercise,
      rest: DEFAULT_PHASE_COLORS.rest,
    });
  });

  it('should not modify presets that already have phaseColors', () => {
    const newPreset = {
      id: 'preset_new',
      name: 'New Preset',
      settings: {
        rounds: 5,
        exerciseTime: 20,
        restTime: 10,
        prepTime: 10,
        phaseColors: {
          ready: '#FF0000',
          prepare: '#00FF00',
          exercise: '#0000FF',
          rest: '#FFFF00',
        },
      },
      createdAt: 1234567890,
    };

    const newStore = {
      activePresetId: 'preset_new',
      presets: [newPreset],
      version: 1,
    };

    localStorage.setItem('fitnessTimerPresets', JSON.stringify(newStore));

    const store = loadPresetStore();

    expect(store.presets[0].settings.phaseColors).toEqual({
      ready: '#FF0000',
      prepare: '#00FF00',
      exercise: '#0000FF',
      rest: '#FFFF00',
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- localStorage.test.ts --watchAll=false`

Expected: FAIL with "Expected phaseColors but got undefined"

**Step 3: Write minimal implementation**

Update `src/utils/presetStorage.ts` - Add migration helper:

```typescript
import { DEFAULT_PHASE_COLORS } from './constants';

/**
 * Migrate a preset to include phaseColors if missing
 */
const migratePresetColors = (preset: WorkoutPreset): WorkoutPreset => {
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
        },
      },
    };
  }
  return preset;
};

export const loadPresetStore = (): PresetStore => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available. Using default preset.');
    const defaultPreset = createDefaultPreset();
    return {
      activePresetId: defaultPreset.id,
      presets: [defaultPreset],
      version: 1,
    };
  }

  try {
    const presetsJson = localStorage.getItem(PRESETS_KEY);

    if (presetsJson) {
      const store: PresetStore = JSON.parse(presetsJson);
      if (store.presets && Array.isArray(store.presets) && store.presets.length > 0) {
        // Migrate all presets to include phaseColors
        const migratedPresets = store.presets.map(migratePresetColors);

        if (!store.presets.find(p => p.id === store.activePresetId)) {
          store.activePresetId = migratedPresets[0].id;
        }

        return {
          ...store,
          presets: migratedPresets,
        };
      }
    }

    const defaultPreset = createDefaultPreset();
    const newStore: PresetStore = {
      activePresetId: defaultPreset.id,
      presets: [defaultPreset],
      version: 1,
    };
    savePresetStore(newStore);
    return newStore;
  } catch (error) {
    console.error('Failed to load preset store:', error);
    const defaultPreset = createDefaultPreset();
    return {
      activePresetId: defaultPreset.id,
      presets: [defaultPreset],
      version: 1,
    };
  }
};
```

Also update `src/utils/localStorage.ts` - Update loadPresetStore (line 95-178):

```typescript
export const loadPresetStore = (): PresetStore => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available. Using default preset.');
    const defaultPreset: WorkoutPreset = {
      id: `preset_${Date.now()}`,
      name: DEFAULT_PRESET_NAME,
      settings: DEFAULT_SETTINGS,
      createdAt: Date.now(),
    };
    return {
      activePresetId: defaultPreset.id,
      presets: [defaultPreset],
      version: 1,
    };
  }

  try {
    // Try to load new preset format first
    const presetsJson = localStorage.getItem('fitnessTimerPresets');
    if (presetsJson) {
      return loadPresetsFromStorage();
    }

    // Migration: Check for legacy format
    const legacyJson = localStorage.getItem(SETTINGS_KEY);
    if (legacyJson) {
      const legacySettings = JSON.parse(legacyJson);
      const mergedSettings: Partial<WorkoutSettings> = {
        ...DEFAULT_SETTINGS,
        ...legacySettings,
      };

      const validatedSettings: WorkoutSettings = {
        rounds: typeof mergedSettings.rounds === 'number' && mergedSettings.rounds > 0
          ? mergedSettings.rounds
          : DEFAULT_SETTINGS.rounds,
        exerciseTime: typeof mergedSettings.exerciseTime === 'number' && mergedSettings.exerciseTime > 0
          ? mergedSettings.exerciseTime
          : DEFAULT_SETTINGS.exerciseTime,
        restTime: typeof mergedSettings.restTime === 'number' && mergedSettings.restTime > 0
          ? mergedSettings.restTime
          : DEFAULT_SETTINGS.restTime,
        prepTime: typeof mergedSettings.prepTime === 'number' && mergedSettings.prepTime > 0
          ? mergedSettings.prepTime
          : DEFAULT_SETTINGS.prepTime,
        // Add phaseColors from defaults (legacy settings won't have this)
        phaseColors: mergedSettings.phaseColors || DEFAULT_SETTINGS.phaseColors,
      };

      const defaultPreset: WorkoutPreset = {
        id: `preset_${Date.now()}`,
        name: DEFAULT_PRESET_NAME,
        settings: validatedSettings,
        createdAt: Date.now(),
      };

      const newStore: PresetStore = {
        activePresetId: defaultPreset.id,
        presets: [defaultPreset],
        version: 1,
      };

      savePresetStore(newStore);
      localStorage.removeItem(SETTINGS_KEY);

      console.log('Migrated settings from legacy format to presets');
      return newStore;
    }

    // First-time user: load from presetStorage
    return loadPresetsFromStorage();
  } catch (error) {
    console.error('Failed to load preset store:', error);
    const defaultPreset: WorkoutPreset = {
      id: `preset_${Date.now()}`,
      name: DEFAULT_PRESET_NAME,
      settings: DEFAULT_SETTINGS,
      createdAt: Date.now(),
    };
    return {
      activePresetId: defaultPreset.id,
      presets: [defaultPreset],
      version: 1,
    };
  }
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- localStorage.test.ts --watchAll=false`

Expected: PASS

**Step 5: Commit**

```bash
git add src/utils/localStorage.ts src/utils/presetStorage.ts src/utils/localStorage.test.ts
git commit -m "feat: add migration logic for phaseColors in presets"
```

---

## Task 5: Update Timer getPhaseColor()

**Files:**
- Modify: `src/components/Timer.tsx:218-231`
- Modify: `src/components/Timer.test.tsx` (update mocks)

**Step 1: Write the failing test**

Add to `src/components/Timer.test.tsx`:

```typescript
import { DEFAULT_PHASE_COLORS } from '../utils/constants';

describe('Timer with custom phase colors', () => {
  const customSettings = {
    rounds: 3,
    exerciseTime: 20,
    restTime: 10,
    prepTime: 5,
    phaseColors: {
      ready: '#FF0000',
      prepare: '#00FF00',
      exercise: '#0000FF',
      rest: '#FFFF00',
    },
  };

  it('should use custom colors from settings', () => {
    const { container } = render(
      <Timer
        settings={customSettings}
        activePresetName="Custom"
        presets={[]}
        activePresetId="custom_1"
        onRunningChange={() => {}}
        onPresetChange={() => {}}
      />
    );

    const timerContainer = container.querySelector('.timer-container');
    expect(timerContainer).toHaveStyle({ backgroundColor: '#FF0000' });
  });

  it('should use default color for Complete phase', () => {
    // Complete phase should always use DEFAULT_PHASE_COLORS.complete
    // regardless of custom colors
    // Test this by advancing timer to complete phase and checking color
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- Timer.test.tsx --watchAll=false`

Expected: FAIL (may have compilation errors due to missing phaseColors in mocks)

**Step 3: Write minimal implementation**

First, update all existing mocks in `src/components/Timer.test.tsx` to include phaseColors:

```typescript
const mockSettings = {
  rounds: 3,
  exerciseTime: 20,
  restTime: 10,
  prepTime: 5,
  phaseColors: {
    ready: DEFAULT_PHASE_COLORS.ready,
    prepare: DEFAULT_PHASE_COLORS.prepare,
    exercise: DEFAULT_PHASE_COLORS.exercise,
    rest: DEFAULT_PHASE_COLORS.rest,
  },
};
```

Then update `src/components/Timer.tsx` - Modify getPhaseColor function:

```typescript
import { DEFAULT_PHASE_COLORS } from '../utils/constants';

const getPhaseColor = (): string => {
  switch (state.phase) {
    case Phase.Ready:
      return settings.phaseColors.ready;
    case Phase.Prepare:
      return settings.phaseColors.prepare;
    case Phase.Exercise:
      return settings.phaseColors.exercise;
    case Phase.Rest:
      return settings.phaseColors.rest;
    case Phase.Complete:
      return DEFAULT_PHASE_COLORS.complete;
    default:
      return DEFAULT_PHASE_COLORS.ready;
  }
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- Timer.test.tsx --watchAll=false`

Expected: PASS

**Step 5: Run all tests to ensure nothing broke**

Run: `npm test -- --watchAll=false`

Expected: All 149+ tests PASS

**Step 6: Commit**

```bash
git add src/components/Timer.tsx src/components/Timer.test.tsx
git commit -m "feat: update Timer to use phaseColors from settings"
```

---

## Task 6: Add Color Pickers to Settings UI

**Files:**
- Modify: `src/components/Settings.tsx:37-40` (add color state)
- Modify: `src/components/Settings.tsx:62-74` (load colors when opening preset)
- Modify: `src/components/Settings.tsx:76-85` (save colors)
- Modify: `src/components/Settings.tsx:140-201` (add color pickers to UI)
- Modify: `src/components/Settings.css` (add color picker styles)

**Step 1: Write the failing test**

Add to `src/components/Settings.test.tsx`:

```typescript
import { DEFAULT_PHASE_COLORS } from '../utils/constants';

describe('Settings with Phase Colors', () => {
  const mockSettings = {
    rounds: 8,
    exerciseTime: 30,
    restTime: 10,
    prepTime: 10,
    phaseColors: {
      ready: DEFAULT_PHASE_COLORS.ready,
      prepare: DEFAULT_PHASE_COLORS.prepare,
      exercise: DEFAULT_PHASE_COLORS.exercise,
      rest: DEFAULT_PHASE_COLORS.rest,
    },
  };

  const mockPresetStore = {
    activePresetId: 'preset_1',
    presets: [
      {
        id: 'preset_1',
        name: 'Test Preset',
        settings: mockSettings,
        createdAt: Date.now(),
      },
    ],
    version: 1,
  };

  it('should render color pickers for each phase', () => {
    const { getByLabelText } = render(
      <Settings
        settings={mockSettings}
        presetStore={mockPresetStore}
        activePresetId="preset_1"
        onSave={jest.fn()}
        onClose={jest.fn()}
        onPresetCreate={jest.fn()}
        onPresetRename={jest.fn()}
        onPresetDelete={jest.fn()}
        onPresetSwitch={jest.fn()}
      />
    );

    // Click preset to open sub-page
    fireEvent.click(screen.getByText('Test Preset'));

    // Check for color pickers
    expect(getByLabelText(/ready color/i)).toBeInTheDocument();
    expect(getByLabelText(/prepare color/i)).toBeInTheDocument();
    expect(getByLabelText(/exercise color/i)).toBeInTheDocument();
    expect(getByLabelText(/rest color/i)).toBeInTheDocument();
  });

  it('should update phaseColors when color picker changes', () => {
    const mockOnSave = jest.fn();

    const { getByLabelText } = render(
      <Settings
        settings={mockSettings}
        presetStore={mockPresetStore}
        activePresetId="preset_1"
        onSave={mockOnSave}
        onClose={jest.fn()}
        onPresetCreate={jest.fn()}
        onPresetRename={jest.fn()}
        onPresetDelete={jest.fn()}
        onPresetSwitch={jest.fn()}
      />
    );

    // Click preset to open sub-page
    fireEvent.click(screen.getByText('Test Preset'));

    // Change ready color
    const readyColorInput = getByLabelText(/ready color/i) as HTMLInputElement;
    fireEvent.change(readyColorInput, { target: { value: '#FF0000' } });

    // Save
    fireEvent.click(screen.getByText(/save/i));

    // Verify onSave was called with updated colors
    expect(mockOnSave).toHaveBeenCalledWith('preset_1', expect.objectContaining({
      phaseColors: expect.objectContaining({
        ready: '#FF0000',
      }),
    }));
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- Settings.test.tsx --watchAll=false`

Expected: FAIL with "Unable to find element with label /ready color/i"

**Step 3: Write minimal implementation**

Update `src/components/Settings.tsx`:

```typescript
// Add color state (after line 40)
const [readyColor, setReadyColor] = useState(settings.phaseColors.ready);
const [prepareColor, setPrepareColor] = useState(settings.phaseColors.prepare);
const [exerciseColor, setExerciseColor] = useState(settings.phaseColors.exercise);
const [restColor, setRestColor] = useState(settings.phaseColors.rest);

// Update openPresetSettings function (line 62-74)
const openPresetSettings = (presetId: string) => {
  const preset = presetStore.presets.find(p => p.id === presetId);
  if (!preset) return;
  onPresetSwitch(presetId);
  setRounds(preset.settings.rounds);
  setExerciseTime(preset.settings.exerciseTime);
  setRestTime(preset.settings.restTime);
  setPrepTime(preset.settings.prepTime);
  // Load colors
  setReadyColor(preset.settings.phaseColors.ready);
  setPrepareColor(preset.settings.phaseColors.prepare);
  setExerciseColor(preset.settings.phaseColors.exercise);
  setRestColor(preset.settings.phaseColors.rest);
  setEditingPresetSettings(presetId);
};

// Update handleSavePresetSettings function (line 76-85)
const handleSavePresetSettings = () => {
  if (!editingPresetSettings) return;
  onSave(editingPresetSettings, {
    rounds,
    exerciseTime,
    restTime,
    prepTime,
    phaseColors: {
      ready: readyColor,
      prepare: prepareColor,
      exercise: exerciseColor,
      rest: restColor,
    },
  });
  setEditingPresetSettings(null);
};

// Add color pickers to UI (after line 189, before settings-summary)
<div className="color-pickers-section">
  <h3>{t('settings.phaseColors')}</h3>

  <div className="color-picker-item">
    <label htmlFor="ready-color">{t('settings.readyColor')}</label>
    <input
      type="color"
      id="ready-color"
      value={readyColor}
      onChange={(e) => setReadyColor(e.target.value)}
      aria-label="Ready Color"
    />
  </div>

  <div className="color-picker-item">
    <label htmlFor="prepare-color">{t('settings.prepareColor')}</label>
    <input
      type="color"
      id="prepare-color"
      value={prepareColor}
      onChange={(e) => setPrepareColor(e.target.value)}
      aria-label="Prepare Color"
    />
  </div>

  <div className="color-picker-item">
    <label htmlFor="exercise-color">{t('settings.exerciseColor')}</label>
    <input
      type="color"
      id="exercise-color"
      value={exerciseColor}
      onChange={(e) => setExerciseColor(e.target.value)}
      aria-label="Exercise Color"
    />
  </div>

  <div className="color-picker-item">
    <label htmlFor="rest-color">{t('settings.restColor')}</label>
    <input
      type="color"
      id="rest-color"
      value={restColor}
      onChange={(e) => setRestColor(e.target.value)}
      aria-label="Rest Color"
    />
  </div>
</div>
```

Add translations to `public/locales/en/translation.json`:

```json
{
  "settings": {
    "phaseColors": "Phase Colors",
    "readyColor": "Ready Color",
    "prepareColor": "Prepare Color",
    "exerciseColor": "Exercise Color",
    "restColor": "Rest Color"
  }
}
```

Add translations to `public/locales/de/translation.json`:

```json
{
  "settings": {
    "phaseColors": "Phasenfarben",
    "readyColor": "Bereit-Farbe",
    "prepareColor": "Vorbereitung-Farbe",
    "exerciseColor": "Training-Farbe",
    "restColor": "Pause-Farbe"
  }
}
```

Add CSS to `src/components/Settings.css`:

```css
.color-pickers-section {
  margin-top: 30px;
  margin-bottom: 20px;
}

.color-pickers-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #374151;
}

.color-picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.color-picker-item label {
  font-size: 14px;
  font-weight: 500;
  color: #4B5563;
}

.color-picker-item input[type="color"] {
  width: 60px;
  height: 40px;
  border: 2px solid #D1D5DB;
  border-radius: 8px;
  cursor: pointer;
  padding: 2px;
  background: white;
}

.color-picker-item input[type="color"]:hover {
  border-color: #9CA3AF;
}

.color-picker-item input[type="color"]:focus {
  outline: none;
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- Settings.test.tsx --watchAll=false`

Expected: PASS

**Step 5: Run all tests**

Run: `npm test -- --watchAll=false`

Expected: All tests PASS

**Step 6: Commit**

```bash
git add src/components/Settings.tsx src/components/Settings.css src/components/Settings.test.tsx public/locales/en/translation.json public/locales/de/translation.json
git commit -m "feat: add color pickers to Settings UI for phase customization"
```

---

## Task 7: Final Verification & Build

**Files:**
- All modified files

**Step 1: Run all unit tests**

Run: `npm test -- --watchAll=false`

Expected: All 149+ tests PASS

**Step 2: Build the project**

Run: `npm run build`

Expected: Build succeeds without errors

**Step 3: Manual smoke test (optional)**

Run: `npm start`

1. Open app in browser
2. Click Settings (menu icon)
3. Click a preset to open settings
4. Verify color pickers are visible
5. Change a phase color
6. Save settings
7. Start timer
8. Verify background color uses custom color
9. Verify color persists after page reload

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify all tests pass and build succeeds"
```

---

## Completion Checklist

- [ ] Task 1: Constants file created with DEFAULT_PHASE_COLORS
- [ ] Task 2: WorkoutSettings interface updated with phaseColors
- [ ] Task 3: DEFAULT_SETTINGS and TEST_PRESET_SETTINGS updated
- [ ] Task 4: Migration logic added to loadPresetStore
- [ ] Task 5: Timer getPhaseColor() updated to use settings
- [ ] Task 6: Color pickers added to Settings UI
- [ ] Task 7: All tests pass and build succeeds

## Success Criteria

✅ Color pickers visible in Settings for each phase
✅ Colors persist per preset in localStorage
✅ Existing presets migrated with default colors
✅ Timer displays selected colors during workout
✅ All 149+ unit tests pass
✅ Build succeeds (`npm run build`)

---

**Related Issues:**
- #31 - Add customizable phase colors per preset
- #30 - Add confetti animation on workout completion (future)

**Design Document:** `docs/plans/2026-02-16-phase-colors-design.md`
