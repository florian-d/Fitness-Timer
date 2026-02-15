import { WorkoutSettings, WorkoutPreset, PresetStore } from '../App';

const SETTINGS_KEY = 'fitnessTimerSettings';
const PRESETS_KEY = 'fitnessTimerPresets';
export const DEFAULT_PRESET_NAME = 'Default';

// Default settings to use when no settings are stored or on error
export const DEFAULT_SETTINGS: WorkoutSettings = {
  rounds: 8,
  exerciseTime: 30,
  restTime: 10,
  prepTime: 10,
};

/**
 * Check if localStorage is available and accessible
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Save workout settings to localStorage
 * Returns true if successful, false otherwise
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
 * Load workout settings from localStorage
 * Returns stored settings if available, otherwise returns default settings
 * Handles backwards compatibility by merging stored settings with defaults
 */
export const loadSettings = (): WorkoutSettings => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available. Using default settings.');
    return DEFAULT_SETTINGS;
  }

  try {
    const settingsJson = localStorage.getItem(SETTINGS_KEY);
    
    if (!settingsJson) {
      // No settings stored, return defaults (first-time user)
      return DEFAULT_SETTINGS;
    }

    const storedSettings = JSON.parse(settingsJson);
    
    // Merge with defaults to ensure all required fields exist (backwards compatibility)
    const mergedSettings: WorkoutSettings = {
      ...DEFAULT_SETTINGS,
      ...storedSettings,
    };

    // Validate that the values are reasonable
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
    };
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Clear stored settings from localStorage
 * Useful for testing or resetting the app
 */
export const clearSettings = (): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear settings from localStorage:', error);
    return false;
  }
};

// ============================================================================
// Preset Management Functions
// ============================================================================

/**
 * Generate a unique preset ID
 * Uses crypto.randomUUID() if available, falls back to timestamp-based ID
 */
const generatePresetId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Create a default preset with the given settings
 */
const createDefaultPreset = (settings: WorkoutSettings = DEFAULT_SETTINGS): WorkoutPreset => ({
  id: generatePresetId(),
  name: DEFAULT_PRESET_NAME,
  settings,
  createdAt: Date.now(),
});

/**
 * Load preset store from localStorage with migration from legacy format
 * Returns preset store with at least one preset
 */
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
    // First check for new format
    const presetsJson = localStorage.getItem(PRESETS_KEY);

    if (presetsJson) {
      const store: PresetStore = JSON.parse(presetsJson);

      // Validate store structure
      if (store.presets && Array.isArray(store.presets) && store.presets.length > 0) {
        // Ensure active preset exists
        if (!store.presets.find(p => p.id === store.activePresetId)) {
          store.activePresetId = store.presets[0].id;
        }
        return store;
      }
    }

    // Migration: Check for legacy format
    const legacyJson = localStorage.getItem(SETTINGS_KEY);

    if (legacyJson) {
      const legacySettings = JSON.parse(legacyJson);
      const mergedSettings: WorkoutSettings = {
        ...DEFAULT_SETTINGS,
        ...legacySettings,
      };

      // Validate legacy settings
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
      };

      // Create default preset with migrated settings
      const defaultPreset = createDefaultPreset(validatedSettings);
      const newStore: PresetStore = {
        activePresetId: defaultPreset.id,
        presets: [defaultPreset],
        version: 1,
      };

      // Save new format and remove legacy key
      savePresetStore(newStore);
      localStorage.removeItem(SETTINGS_KEY);

      console.log('Migrated settings from legacy format to presets');
      return newStore;
    }

    // First-time user: create default preset
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

/**
 * Save preset store to localStorage
 * Returns true if successful, false otherwise
 */
export const savePresetStore = (store: PresetStore): boolean => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available. Presets will not be persisted.');
    return false;
  }

  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(store));
    return true;
  } catch (error) {
    console.error('Failed to save preset store:', error);
    return false;
  }
};

/**
 * Check if a preset name is unique (case-insensitive)
 * @param name - Name to check
 * @param presets - Array of existing presets
 * @param excludeId - Optional preset ID to exclude from check (for renaming)
 */
export const isPresetNameUnique = (
  name: string,
  presets: WorkoutPreset[],
  excludeId?: string
): boolean => {
  const normalizedName = name.trim().toLowerCase();
  return !presets.some(
    p => p.id !== excludeId && p.name.toLowerCase() === normalizedName
  );
};

/**
 * Create a new preset
 * Returns updated store or null if validation fails
 */
export const createPreset = (
  store: PresetStore,
  name: string,
  settings: WorkoutSettings
): PresetStore | null => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return null; // Invalid name
  }

  if (!isPresetNameUnique(trimmedName, store.presets)) {
    return null; // Name already exists
  }

  const newPreset: WorkoutPreset = {
    id: generatePresetId(),
    name: trimmedName,
    settings,
    createdAt: Date.now(),
  };

  return {
    ...store,
    presets: [...store.presets, newPreset],
  };
};

/**
 * Update a preset (rename or change settings)
 * Returns updated store or null if validation fails
 */
export const updatePreset = (
  store: PresetStore,
  presetId: string,
  updates: { name?: string; settings?: WorkoutSettings }
): PresetStore | null => {
  const presetIndex = store.presets.findIndex(p => p.id === presetId);

  if (presetIndex === -1) {
    return null; // Preset not found
  }

  if (updates.name !== undefined) {
    const trimmedName = updates.name.trim();
    if (!trimmedName) {
      return null; // Invalid name
    }
    if (!isPresetNameUnique(trimmedName, store.presets, presetId)) {
      return null; // Name collision
    }
  }

  const updatedPresets = [...store.presets];
  updatedPresets[presetIndex] = {
    ...updatedPresets[presetIndex],
    ...(updates.name !== undefined && { name: updates.name.trim() }),
    ...(updates.settings && { settings: updates.settings }),
  };

  return {
    ...store,
    presets: updatedPresets,
  };
};

/**
 * Delete a preset
 * Returns updated store or null if validation fails (e.g., deleting last preset)
 */
export const deletePreset = (
  store: PresetStore,
  presetId: string
): PresetStore | null => {
  if (store.presets.length <= 1) {
    return null; // Cannot delete last preset
  }

  const filteredPresets = store.presets.filter(p => p.id !== presetId);

  // If deleted preset was active, switch to first remaining preset
  const newActiveId = store.activePresetId === presetId
    ? filteredPresets[0].id
    : store.activePresetId;

  return {
    ...store,
    activePresetId: newActiveId,
    presets: filteredPresets,
  };
};

/**
 * Set the active preset
 * Returns updated store or null if preset not found
 */
export const setActivePreset = (
  store: PresetStore,
  presetId: string
): PresetStore | null => {
  if (!store.presets.find(p => p.id === presetId)) {
    return null; // Preset not found
  }

  return {
    ...store,
    activePresetId: presetId,
  };
};
