import { WorkoutSettings, WorkoutPreset, PresetStore } from '../App';
import {
  loadPresetStore as loadPresetsFromStorage,
  savePresetStore,
  DEFAULT_PRESET_NAME,
  DEFAULT_SETTINGS,
  isLocalStorageAvailable,
} from './presetStorage';

const SETTINGS_KEY = 'fitnessTimerSettings';

/**
 * Save workout settings to localStorage (legacy, kept for backwards compatibility)
 */
export const saveSettings = (settings: WorkoutSettings): boolean => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available. Settings will not be persisted.');
    return false;
  }

  try {
    const settingsJson = JSON.stringify(settings);
    localStorage.setItem(SETTINGS_KEY, settingsJson);
    return true;
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
    return false;
  }
};

/**
 * Load workout settings from localStorage (legacy)
 */
export const loadSettings = (): WorkoutSettings => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available. Using default settings.');
    return DEFAULT_SETTINGS;
  }

  try {
    const settingsJson = localStorage.getItem(SETTINGS_KEY);

    if (!settingsJson) {
      return DEFAULT_SETTINGS;
    }

    const storedSettings = JSON.parse(settingsJson);

    const mergedSettings: WorkoutSettings = {
      ...DEFAULT_SETTINGS,
      ...storedSettings,
    };

    return {
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
      phaseColors: mergedSettings.phaseColors || DEFAULT_SETTINGS.phaseColors,
    };
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Clear stored settings from localStorage
 */
export const clearSettings = (): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear settings:', error);
    return false;
  }
};

/**
 * Load preset store with automatic migration from legacy format
 * This is the main entry point for loading settings
 */
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

// Re-export preset management functions from presetStorage
export {
  savePresetStore,
  createPreset,
  updatePreset,
  deletePreset,
  setActivePreset,
  isPresetNameUnique,
  DEFAULT_SETTINGS,
  DEFAULT_PRESET_NAME,
  isLocalStorageAvailable,
} from './presetStorage';
