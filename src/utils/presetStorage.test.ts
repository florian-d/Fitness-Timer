import { createPreset, updatePreset, deletePreset, setActivePreset, isPresetNameUnique } from './presetStorage';
import { PresetStore, WorkoutPreset, WorkoutSettings } from '../App';

describe('presetStorage', () => {
  const defaultSettings: WorkoutSettings = {
    rounds: 8,
    exerciseTime: 30,
    restTime: 10,
    prepTime: 10,
  };

  const createMockPreset = (id: string, name: string): WorkoutPreset => ({
    id,
    name,
    settings: defaultSettings,
    createdAt: Date.now(),
  });

  const createMockStore = (presets: WorkoutPreset[], activeId: string): PresetStore => ({
    presets,
    activePresetId: activeId,
    version: 1,
  });

  describe('isPresetNameUnique', () => {
    test('returns true for unique name', () => {
      const presets = [createMockPreset('1', 'Default')];
      expect(isPresetNameUnique('Cardio', presets)).toBe(true);
    });

    test('returns false for duplicate name (case-insensitive)', () => {
      const presets = [createMockPreset('1', 'Default')];
      expect(isPresetNameUnique('default', presets)).toBe(false);
    });

    test('excludes given preset ID from check', () => {
      const presets = [createMockPreset('1', 'Default')];
      expect(isPresetNameUnique('Default', presets, '1')).toBe(true);
    });
  });

  describe('createPreset', () => {
    test('creates new preset successfully', () => {
      const store = createMockStore([createMockPreset('1', 'Default')], '1');
      const result = createPreset(store, 'Cardio', defaultSettings);

      expect(result).not.toBeNull();
      expect(result!.presets).toHaveLength(2);
      expect(result!.presets[1].name).toBe('Cardio');
    });

    test('returns null for empty name', () => {
      const store = createMockStore([createMockPreset('1', 'Default')], '1');
      const result = createPreset(store, '', defaultSettings);
      expect(result).toBeNull();
    });

    test('returns null for duplicate name', () => {
      const store = createMockStore([createMockPreset('1', 'Default')], '1');
      const result = createPreset(store, 'Default', defaultSettings);
      expect(result).toBeNull();
    });

    test('trims whitespace from name', () => {
      const store = createMockStore([createMockPreset('1', 'Default')], '1');
      const result = createPreset(store, '  NewPreset  ', defaultSettings);
      expect(result!.presets[1].name).toBe('NewPreset');
    });
  });

  describe('updatePreset', () => {
    test('updates preset name successfully', () => {
      const preset = createMockPreset('1', 'Default');
      const store = createMockStore([preset], '1');
      const result = updatePreset(store, '1', { name: 'Updated' });

      expect(result).not.toBeNull();
      expect(result!.presets[0].name).toBe('Updated');
    });

    test('updates preset settings successfully', () => {
      const preset = createMockPreset('1', 'Default');
      const store = createMockStore([preset], '1');
      const newSettings = { ...defaultSettings, rounds: 10 };
      const result = updatePreset(store, '1', { settings: newSettings });

      expect(result!.presets[0].settings.rounds).toBe(10);
    });

    test('returns null if preset not found', () => {
      const store = createMockStore([createMockPreset('1', 'Default')], '1');
      const result = updatePreset(store, '999', { name: 'Updated' });
      expect(result).toBeNull();
    });

    test('returns null for empty name', () => {
      const store = createMockStore([createMockPreset('1', 'Default')], '1');
      const result = updatePreset(store, '1', { name: '' });
      expect(result).toBeNull();
    });

    test('returns null for duplicate name', () => {
      const presets = [createMockPreset('1', 'Default'), createMockPreset('2', 'Cardio')];
      const store = createMockStore(presets, '1');
      const result = updatePreset(store, '2', { name: 'Default' });
      expect(result).toBeNull();
    });
  });

  describe('deletePreset', () => {
    test('deletes preset successfully', () => {
      const presets = [createMockPreset('1', 'Default'), createMockPreset('2', 'Cardio')];
      const store = createMockStore(presets, '1');
      const result = deletePreset(store, '2');

      expect(result!.presets).toHaveLength(1);
      expect(result!.presets[0].id).toBe('1');
    });

    test('switches active preset if deleted preset was active', () => {
      const presets = [createMockPreset('1', 'Default'), createMockPreset('2', 'Cardio')];
      const store = createMockStore(presets, '2');
      const result = deletePreset(store, '2');

      expect(result!.activePresetId).toBe('1');
    });

    test('returns null if trying to delete last preset', () => {
      const store = createMockStore([createMockPreset('1', 'Default')], '1');
      const result = deletePreset(store, '1');
      expect(result).toBeNull();
    });
  });

  describe('setActivePreset', () => {
    test('sets active preset successfully', () => {
      const presets = [createMockPreset('1', 'Default'), createMockPreset('2', 'Cardio')];
      const store = createMockStore(presets, '1');
      const result = setActivePreset(store, '2');

      expect(result!.activePresetId).toBe('2');
    });

    test('returns null if preset not found', () => {
      const store = createMockStore([createMockPreset('1', 'Default')], '1');
      const result = setActivePreset(store, '999');
      expect(result).toBeNull();
    });
  });
});
