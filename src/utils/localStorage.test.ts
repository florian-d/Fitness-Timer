import { WorkoutSettings, WorkoutPreset, PresetStore } from '../App';
import {
  DEFAULT_SETTINGS,
  DEFAULT_PRESET_NAME,
  isLocalStorageAvailable,
  saveSettings,
  loadSettings,
  clearSettings,
  loadPresetStore,
  savePresetStore,
  isPresetNameUnique,
  createPreset,
  updatePreset,
  deletePreset,
  setActivePreset,
} from './localStorage';
import { DEFAULT_PHASE_COLORS } from './constants';

describe('localStorage utilities', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    // Clear storage before each test
    store = {};

    // Mock localStorage methods
    Storage.prototype.getItem = jest.fn((key: string) => store[key] || null);
    Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      store[key] = value;
    });
    Storage.prototype.removeItem = jest.fn((key: string) => {
      delete store[key];
    });
    Storage.prototype.clear = jest.fn(() => {
      store = {};
    });
  });

  describe('isLocalStorageAvailable', () => {
    test('returns true when localStorage is available', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    test('returns false when localStorage throws an error', () => {
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      expect(isLocalStorageAvailable()).toBe(false);
    });
  });

  describe('saveSettings', () => {
    test('saves settings to localStorage', () => {
      const settings: WorkoutSettings = {
        rounds: 10,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10,
      };

      const result = saveSettings(settings);

      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'fitnessTimerSettings',
        JSON.stringify(settings)
      );
    });

    test('returns false and logs warning when localStorage is not available', () => {
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const settings: WorkoutSettings = {
        rounds: 10,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10,
      };

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = saveSettings(settings);

      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith('localStorage is not available. Settings will not be persisted.');

      consoleWarnSpy.mockRestore();
    });

    test('handles save errors gracefully', () => {
      // Set up setItem to work for the availability check but fail for actual save
      let callCount = 0;
      Storage.prototype.setItem = jest.fn((key: string) => {
        callCount++;
        if (key === '__localStorage_test__') {
          // Allow the test key
          return;
        }
        throw new Error('Save error');
      });

      const settings: WorkoutSettings = {
        rounds: 10,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10,
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = saveSettings(settings);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('loadSettings', () => {
    test('returns default settings when no settings are stored', () => {
      const settings = loadSettings();

      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    test('loads stored settings from localStorage', () => {
      const storedSettings: WorkoutSettings = {
        rounds: 12,
        exerciseTime: 60,
        restTime: 20,
        prepTime: 15,
      };

      store['fitnessTimerSettings'] = JSON.stringify(storedSettings);

      const settings = loadSettings();

      expect(settings).toEqual(storedSettings);
    });

    test('merges stored settings with defaults for backwards compatibility', () => {
      // Simulate old version with missing field
      const partialSettings = {
        rounds: 15,
        exerciseTime: 40,
        // missing restTime and prepTime
      };

      store['fitnessTimerSettings'] = JSON.stringify(partialSettings);

      const settings = loadSettings();

      expect(settings).toEqual({
        rounds: 15,
        exerciseTime: 40,
        restTime: DEFAULT_SETTINGS.restTime, // Should use default
        prepTime: DEFAULT_SETTINGS.prepTime, // Should use default
      });
    });

    test('validates stored values are numbers', () => {
      const invalidSettings = {
        rounds: 'invalid',
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10,
      };

      store['fitnessTimerSettings'] = JSON.stringify(invalidSettings);

      const settings = loadSettings();

      expect(settings.rounds).toBe(DEFAULT_SETTINGS.rounds); // Should fallback to default
      expect(settings.exerciseTime).toBe(45);
      expect(settings.restTime).toBe(15);
      expect(settings.prepTime).toBe(10);
    });

    test('validates stored values are positive', () => {
      const invalidSettings = {
        rounds: -5,
        exerciseTime: 45,
        restTime: 0,
        prepTime: 10,
      };

      store['fitnessTimerSettings'] = JSON.stringify(invalidSettings);

      const settings = loadSettings();

      expect(settings.rounds).toBe(DEFAULT_SETTINGS.rounds); // Should fallback to default
      expect(settings.exerciseTime).toBe(45);
      expect(settings.restTime).toBe(DEFAULT_SETTINGS.restTime); // Should fallback to default
      expect(settings.prepTime).toBe(10);
    });

    test('returns default settings when localStorage has invalid JSON', () => {
      store['fitnessTimerSettings'] = 'invalid json';

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const settings = loadSettings();

      expect(settings).toEqual(DEFAULT_SETTINGS);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('returns default settings when localStorage is not available', () => {
      // Mock both getItem and setItem to throw errors
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('localStorage error');
      });
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error('localStorage error');
      });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const settings = loadSettings();

      expect(settings).toEqual(DEFAULT_SETTINGS);
      expect(consoleWarnSpy).toHaveBeenCalledWith('localStorage is not available. Using default settings.');

      consoleWarnSpy.mockRestore();
    });
  });

  describe('clearSettings', () => {
    test('removes settings from localStorage', () => {
      const settings: WorkoutSettings = {
        rounds: 10,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10,
      };

      store['fitnessTimerSettings'] = JSON.stringify(settings);

      const result = clearSettings();

      expect(result).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith('fitnessTimerSettings');
    });

    test('returns false when localStorage is not available', () => {
      Storage.prototype.removeItem = jest.fn(() => {
        throw new Error('localStorage error');
      });

      const result = clearSettings();

      expect(result).toBe(false);
    });
  });

  describe('Preset Store Management', () => {
    describe('loadPresetStore', () => {
      test('creates default preset on first launch', () => {
        const presetStore = loadPresetStore();

        expect(presetStore.presets).toHaveLength(1);
        expect(presetStore.presets[0].name).toBe(DEFAULT_PRESET_NAME);
        expect(presetStore.presets[0].settings).toEqual(DEFAULT_SETTINGS);
        expect(presetStore.activePresetId).toBe(presetStore.presets[0].id);
        expect(presetStore.version).toBe(1);
      });

      test('migrates legacy settings to default preset', () => {
        const legacySettings = {
          rounds: 12,
          exerciseTime: 45,
          restTime: 15,
          prepTime: 10,
        };
        store['fitnessTimerSettings'] = JSON.stringify(legacySettings);

        const presetStore = loadPresetStore();

        expect(presetStore.presets).toHaveLength(1);
        expect(presetStore.presets[0].name).toBe(DEFAULT_PRESET_NAME);
        // Legacy settings should be migrated with phaseColors added
        expect(presetStore.presets[0].settings).toEqual({
          ...legacySettings,
          phaseColors: DEFAULT_SETTINGS.phaseColors,
        });
        expect(store['fitnessTimerSettings']).toBeUndefined(); // Legacy key removed
        expect(store['fitnessTimerPresets']).toBeDefined(); // New format saved
      });

      test('validates legacy settings during migration', () => {
        const invalidLegacySettings = {
          rounds: -5,
          exerciseTime: 45,
          restTime: 'invalid',
          prepTime: 10,
        };
        store['fitnessTimerSettings'] = JSON.stringify(invalidLegacySettings);

        const presetStore = loadPresetStore();

        expect(presetStore.presets[0].settings.rounds).toBe(DEFAULT_SETTINGS.rounds);
        expect(presetStore.presets[0].settings.exerciseTime).toBe(45);
        expect(presetStore.presets[0].settings.restTime).toBe(DEFAULT_SETTINGS.restTime);
        expect(presetStore.presets[0].settings.prepTime).toBe(10);
      });

      test('loads existing preset store without migration', () => {
        const existingStore: PresetStore = {
          activePresetId: 'preset-1',
          presets: [
            {
              id: 'preset-1',
              name: 'HIIT',
              settings: {
                rounds: 10,
                exerciseTime: 20,
                restTime: 10,
                prepTime: 5,
                phaseColors: DEFAULT_SETTINGS.phaseColors,
              },
              createdAt: Date.now(),
            },
          ],
          version: 1,
        };
        store['fitnessTimerPresets'] = JSON.stringify(existingStore);

        const loaded = loadPresetStore();

        expect(loaded).toEqual(existingStore);
      });

      test('fixes invalid activePresetId to first preset', () => {
        const invalidStore: PresetStore = {
          activePresetId: 'nonexistent-id',
          presets: [
            {
              id: 'preset-1',
              name: 'HIIT',
              settings: DEFAULT_SETTINGS,
              createdAt: Date.now(),
            },
          ],
          version: 1,
        };
        store['fitnessTimerPresets'] = JSON.stringify(invalidStore);

        const loaded = loadPresetStore();

        expect(loaded.activePresetId).toBe('preset-1');
      });

      test('returns default preset when localStorage is not available', () => {
        Storage.prototype.setItem = jest.fn(() => {
          throw new Error('localStorage error');
        });
        Storage.prototype.getItem = jest.fn(() => {
          throw new Error('localStorage error');
        });

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const presetStore = loadPresetStore();

        expect(presetStore.presets).toHaveLength(1);
        expect(presetStore.presets[0].name).toBe(DEFAULT_PRESET_NAME);
        expect(consoleWarnSpy).toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
      });

      test('handles corrupt preset store gracefully', () => {
        store['fitnessTimerPresets'] = 'invalid json';

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const presetStore = loadPresetStore();

        expect(presetStore.presets).toHaveLength(1);
        expect(presetStore.presets[0].name).toBe(DEFAULT_PRESET_NAME);
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });
    });

    describe('savePresetStore', () => {
      test('saves preset store to localStorage', () => {
        const presetStore: PresetStore = {
          activePresetId: 'preset-1',
          presets: [
            {
              id: 'preset-1',
              name: 'HIIT',
              settings: DEFAULT_SETTINGS,
              createdAt: Date.now(),
            },
          ],
          version: 1,
        };

        const result = savePresetStore(presetStore);

        expect(result).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'fitnessTimerPresets',
          JSON.stringify(presetStore)
        );
      });

      test('returns false when localStorage is not available', () => {
        Storage.prototype.setItem = jest.fn(() => {
          throw new Error('localStorage error');
        });

        const presetStore: PresetStore = {
          activePresetId: 'preset-1',
          presets: [
            {
              id: 'preset-1',
              name: 'HIIT',
              settings: DEFAULT_SETTINGS,
              createdAt: Date.now(),
            },
          ],
          version: 1,
        };

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const result = savePresetStore(presetStore);

        expect(result).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
      });
    });

    describe('isPresetNameUnique', () => {
      const presets: WorkoutPreset[] = [
        {
          id: 'preset-1',
          name: 'Default',
          settings: DEFAULT_SETTINGS,
          createdAt: Date.now(),
        },
        {
          id: 'preset-2',
          name: 'HIIT',
          settings: DEFAULT_SETTINGS,
          createdAt: Date.now(),
        },
      ];

      test('returns true for unique name', () => {
        expect(isPresetNameUnique('Cardio', presets)).toBe(true);
      });

      test('returns false for duplicate name (case-insensitive)', () => {
        expect(isPresetNameUnique('default', presets)).toBe(false);
        expect(isPresetNameUnique('HIIT', presets)).toBe(false);
        expect(isPresetNameUnique('hiit', presets)).toBe(false);
      });

      test('allows same name when excluding current preset', () => {
        expect(isPresetNameUnique('Default', presets, 'preset-1')).toBe(true);
        expect(isPresetNameUnique('default', presets, 'preset-1')).toBe(true);
      });

      test('handles whitespace in names', () => {
        expect(isPresetNameUnique('  Default  ', presets)).toBe(false);
      });
    });

    describe('createPreset', () => {
      let mockStore: PresetStore;

      beforeEach(() => {
        mockStore = {
          activePresetId: 'preset-1',
          presets: [
            {
              id: 'preset-1',
              name: 'Default',
              settings: DEFAULT_SETTINGS,
              createdAt: Date.now(),
            },
          ],
          version: 1,
        };
      });

      test('creates new preset with unique name', () => {
        const newSettings = { rounds: 5, exerciseTime: 40, restTime: 20, prepTime: 10 };
        const result = createPreset(mockStore, 'HIIT', newSettings);

        expect(result).not.toBeNull();
        expect(result!.presets).toHaveLength(2);
        expect(result!.presets[1].name).toBe('HIIT');
        expect(result!.presets[1].settings).toEqual(newSettings);
        expect(result!.presets[1].id).toBeDefined();
        expect(result!.presets[1].createdAt).toBeDefined();
      });

      test('rejects duplicate name (case-insensitive)', () => {
        const result = createPreset(mockStore, 'default', DEFAULT_SETTINGS);
        expect(result).toBeNull();
      });

      test('rejects empty name', () => {
        const result = createPreset(mockStore, '  ', DEFAULT_SETTINGS);
        expect(result).toBeNull();
      });

      test('trims whitespace from name', () => {
        const result = createPreset(mockStore, '  Cardio  ', DEFAULT_SETTINGS);
        expect(result!.presets[1].name).toBe('Cardio');
      });

      test('preserves existing presets and activePresetId', () => {
        const result = createPreset(mockStore, 'HIIT', DEFAULT_SETTINGS);
        expect(result!.presets[0]).toEqual(mockStore.presets[0]);
        expect(result!.activePresetId).toBe(mockStore.activePresetId);
      });
    });

    describe('updatePreset', () => {
      let mockStore: PresetStore;

      beforeEach(() => {
        mockStore = {
          activePresetId: 'preset-1',
          presets: [
            {
              id: 'preset-1',
              name: 'Default',
              settings: DEFAULT_SETTINGS,
              createdAt: Date.now(),
            },
            {
              id: 'preset-2',
              name: 'HIIT',
              settings: { rounds: 10, exerciseTime: 20, restTime: 10, prepTime: 5 },
              createdAt: Date.now() + 1000,
            },
          ],
          version: 1,
        };
      });

      test('updates preset settings', () => {
        const newSettings = { rounds: 15, exerciseTime: 30, restTime: 15, prepTime: 10 };
        const result = updatePreset(mockStore, 'preset-1', { settings: newSettings });

        expect(result!.presets[0].settings).toEqual(newSettings);
        expect(result!.presets[0].name).toBe('Default'); // Name unchanged
      });

      test('renames preset', () => {
        const result = updatePreset(mockStore, 'preset-1', { name: 'Custom' });

        expect(result!.presets[0].name).toBe('Custom');
        expect(result!.presets[0].settings).toEqual(DEFAULT_SETTINGS); // Settings unchanged
      });

      test('updates both name and settings', () => {
        const newSettings = { rounds: 15, exerciseTime: 30, restTime: 15, prepTime: 10 };
        const result = updatePreset(mockStore, 'preset-1', { name: 'Custom', settings: newSettings });

        expect(result!.presets[0].name).toBe('Custom');
        expect(result!.presets[0].settings).toEqual(newSettings);
      });

      test('rejects rename to duplicate name', () => {
        const result = updatePreset(mockStore, 'preset-1', { name: 'HIIT' });
        expect(result).toBeNull();
      });

      test('allows renaming to same name (case change)', () => {
        const result = updatePreset(mockStore, 'preset-1', { name: 'default' });
        expect(result).not.toBeNull();
        expect(result!.presets[0].name).toBe('default');
      });

      test('returns null for nonexistent preset', () => {
        const result = updatePreset(mockStore, 'nonexistent', { name: 'Test' });
        expect(result).toBeNull();
      });

      test('rejects empty name', () => {
        const result = updatePreset(mockStore, 'preset-1', { name: '  ' });
        expect(result).toBeNull();
      });

      test('trims whitespace from name', () => {
        const result = updatePreset(mockStore, 'preset-1', { name: '  Custom  ' });
        expect(result!.presets[0].name).toBe('Custom');
      });
    });

    describe('deletePreset', () => {
      let mockStore: PresetStore;

      beforeEach(() => {
        mockStore = {
          activePresetId: 'preset-1',
          presets: [
            {
              id: 'preset-1',
              name: 'Default',
              settings: DEFAULT_SETTINGS,
              createdAt: Date.now(),
            },
            {
              id: 'preset-2',
              name: 'HIIT',
              settings: { rounds: 10, exerciseTime: 20, restTime: 10, prepTime: 5 },
              createdAt: Date.now() + 1000,
            },
          ],
          version: 1,
        };
      });

      test('deletes preset', () => {
        const result = deletePreset(mockStore, 'preset-2');

        expect(result).not.toBeNull();
        expect(result!.presets).toHaveLength(1);
        expect(result!.presets[0].id).toBe('preset-1');
      });

      test('switches active preset if deleted', () => {
        const result = deletePreset(mockStore, 'preset-1');

        expect(result!.activePresetId).toBe('preset-2');
        expect(result!.presets).toHaveLength(1);
      });

      test('rejects deleting last preset', () => {
        const singlePresetStore: PresetStore = {
          ...mockStore,
          presets: [mockStore.presets[0]],
        };

        const result = deletePreset(singlePresetStore, 'preset-1');
        expect(result).toBeNull();
      });

      test('maintains active preset if non-active preset deleted', () => {
        const result = deletePreset(mockStore, 'preset-2');

        expect(result!.activePresetId).toBe('preset-1');
      });
    });

    describe('setActivePreset', () => {
      let mockStore: PresetStore;

      beforeEach(() => {
        mockStore = {
          activePresetId: 'preset-1',
          presets: [
            {
              id: 'preset-1',
              name: 'Default',
              settings: DEFAULT_SETTINGS,
              createdAt: Date.now(),
            },
            {
              id: 'preset-2',
              name: 'HIIT',
              settings: { rounds: 10, exerciseTime: 20, restTime: 10, prepTime: 5 },
              createdAt: Date.now() + 1000,
            },
          ],
          version: 1,
        };
      });

      test('switches active preset', () => {
        const result = setActivePreset(mockStore, 'preset-2');

        expect(result!.activePresetId).toBe('preset-2');
      });

      test('rejects switching to nonexistent preset', () => {
        const result = setActivePreset(mockStore, 'nonexistent');
        expect(result).toBeNull();
      });

      test('allows setting to already active preset', () => {
        const result = setActivePreset(mockStore, 'preset-1');

        expect(result).not.toBeNull();
        expect(result!.activePresetId).toBe('preset-1');
      });
    });

    describe('loadPresetStore with phaseColors migration', () => {
      beforeEach(() => {
        store = {};
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

        store['fitnessTimerPresets'] = JSON.stringify(oldStore);

        const result = loadPresetStore();

        expect(result.presets[0].settings.phaseColors).toEqual({
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

        store['fitnessTimerPresets'] = JSON.stringify(newStore);

        const result = loadPresetStore();

        expect(result.presets[0].settings.phaseColors).toEqual({
          ready: '#FF0000',
          prepare: '#00FF00',
          exercise: '#0000FF',
          rest: '#FFFF00',
        });
      });
    });
  });
});
