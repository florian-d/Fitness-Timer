import { WorkoutSettings } from '../App';

const SETTINGS_KEY = 'fitnessTimerSettings';

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
