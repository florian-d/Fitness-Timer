import en from './en.json';
import de from './de.json';

// Helper function to get all nested keys from an object
const getAllKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
  return Object.entries(obj).flatMap(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return getAllKeys(value as Record<string, unknown>, newKey);
    }
    return [newKey];
  });
};

// Helper function to extract interpolation variables from a string
const extractVariables = (str: string): string[] => {
  const matches = str.match(/\{\{(\w+)\}\}/g) || [];
  return matches.map(m => m.replace(/[{}]/g, '')).sort();
};

// Helper function to get value by nested key
const getValueByKey = (obj: Record<string, unknown>, key: string): string | undefined => {
  const keys = key.split('.');
  let current: unknown = obj;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
};

describe('Translation files', () => {
  const enKeys = getAllKeys(en);
  const deKeys = getAllKeys(de);

  test('English and German have the same keys', () => {
    expect(enKeys.sort()).toEqual(deKeys.sort());
  });

  test('no translation keys are empty', () => {
    const emptyEnKeys = enKeys.filter(key => {
      const value = getValueByKey(en, key);
      return value === '';
    });
    const emptyDeKeys = deKeys.filter(key => {
      const value = getValueByKey(de, key);
      return value === '';
    });

    expect(emptyEnKeys).toHaveLength(0);
    expect(emptyDeKeys).toHaveLength(0);
  });

  test('interpolation variables match across languages', () => {
    const mismatchedKeys: string[] = [];

    enKeys.forEach(key => {
      const enValue = getValueByKey(en, key);
      const deValue = getValueByKey(de, key);

      if (enValue && deValue) {
        const enVars = extractVariables(enValue);
        const deVars = extractVariables(deValue);

        if (JSON.stringify(enVars) !== JSON.stringify(deVars)) {
          mismatchedKeys.push(`${key}: EN has ${enVars.join(', ')}, DE has ${deVars.join(', ')}`);
        }
      }
    });

    expect(mismatchedKeys).toHaveLength(0);
  });

  test('all expected sections exist', () => {
    const expectedSections = ['timer', 'settings', 'app', 'languages'];

    expectedSections.forEach(section => {
      expect(en).toHaveProperty(section);
      expect(de).toHaveProperty(section);
    });
  });

  test('timer section has all required keys', () => {
    const requiredTimerKeys = ['ready', 'prepare', 'exercise', 'rest', 'complete', 'tapToStart'];

    requiredTimerKeys.forEach(key => {
      expect(en.timer).toHaveProperty(key);
      expect(de.timer).toHaveProperty(key);
    });
  });

  test('settings section has all required keys', () => {
    const requiredSettingsKeys = [
      'title', 'rounds', 'exerciseTime', 'restTime', 'prepTime',
      'summary', 'totalTime', 'save', 'language'
    ];

    requiredSettingsKeys.forEach(key => {
      expect(en.settings).toHaveProperty(key);
      expect(de.settings).toHaveProperty(key);
    });
  });

  test('German translations are not just copies of English', () => {
    // Check that key user-facing strings are actually translated
    const keyStringsToCheck = [
      { en: en.timer.ready, de: de.timer.ready },
      { en: en.timer.prepare, de: de.timer.prepare },
      { en: en.timer.complete, de: de.timer.complete },
      { en: en.settings.title, de: de.settings.title },
      { en: en.settings.save, de: de.settings.save },
    ];

    keyStringsToCheck.forEach(({ en: enStr, de: deStr }) => {
      expect(enStr).not.toEqual(deStr);
    });
  });
});
