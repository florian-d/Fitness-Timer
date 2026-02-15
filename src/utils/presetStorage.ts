import { WorkoutSettings, WorkoutPreset, PresetStore } from '../App';

const PRESETS_KEY = 'fitnessTimerPresets';
export const DEFAULT_PRESET_NAME = 'Default';

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
 * Generate a unique preset ID
 */
const generatePresetId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
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
 * Load preset store from localStorage
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
    const presetsJson = localStorage.getItem(PRESETS_KEY);

    if (presetsJson) {
      const store: PresetStore = JSON.parse(presetsJson);
      if (store.presets && Array.isArray(store.presets) && store.presets.length > 0) {
        if (!store.presets.find(p => p.id === store.activePresetId)) {
          store.activePresetId = store.presets[0].id;
        }
        return store;
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

/**
 * Save preset store to localStorage
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
 */
export const createPreset = (
  store: PresetStore,
  name: string,
  settings: WorkoutSettings
): PresetStore | null => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return null;
  }

  if (!isPresetNameUnique(trimmedName, store.presets)) {
    return null;
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
 * Update a preset
 */
export const updatePreset = (
  store: PresetStore,
  presetId: string,
  updates: { name?: string; settings?: WorkoutSettings }
): PresetStore | null => {
  const presetIndex = store.presets.findIndex(p => p.id === presetId);

  if (presetIndex === -1) {
    return null;
  }

  if (updates.name !== undefined) {
    const trimmedName = updates.name.trim();
    if (!trimmedName) {
      return null;
    }
    if (!isPresetNameUnique(trimmedName, store.presets, presetId)) {
      return null;
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
 */
export const deletePreset = (
  store: PresetStore,
  presetId: string
): PresetStore | null => {
  if (store.presets.length <= 1) {
    return null;
  }

  const filteredPresets = store.presets.filter(p => p.id !== presetId);

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
 */
export const setActivePreset = (
  store: PresetStore,
  presetId: string
): PresetStore | null => {
  if (!store.presets.find(p => p.id === presetId)) {
    return null;
  }

  return {
    ...store,
    activePresetId: presetId,
  };
};
