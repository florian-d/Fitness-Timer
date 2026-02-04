import { WorkoutSettings } from '../App';
import {
  DEFAULT_SETTINGS,
  isLocalStorageAvailable,
  saveSettings,
  loadSettings,
  clearSettings,
} from './localStorage';

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
        // missing restTime
      };

      store['fitnessTimerSettings'] = JSON.stringify(partialSettings);

      const settings = loadSettings();

      expect(settings).toEqual({
        rounds: 15,
        exerciseTime: 40,
        restTime: DEFAULT_SETTINGS.restTime, // Should use default
      });
    });

    test('validates stored values are numbers', () => {
      const invalidSettings = {
        rounds: 'invalid',
        exerciseTime: 45,
        restTime: 15,
      };

      store['fitnessTimerSettings'] = JSON.stringify(invalidSettings);

      const settings = loadSettings();

      expect(settings.rounds).toBe(DEFAULT_SETTINGS.rounds); // Should fallback to default
      expect(settings.exerciseTime).toBe(45);
      expect(settings.restTime).toBe(15);
    });

    test('validates stored values are positive', () => {
      const invalidSettings = {
        rounds: -5,
        exerciseTime: 45,
        restTime: 0,
      };

      store['fitnessTimerSettings'] = JSON.stringify(invalidSettings);

      const settings = loadSettings();

      expect(settings.rounds).toBe(DEFAULT_SETTINGS.rounds); // Should fallback to default
      expect(settings.exerciseTime).toBe(45);
      expect(settings.restTime).toBe(DEFAULT_SETTINGS.restTime); // Should fallback to default
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
});
