export interface WorkoutSettings {
  rounds: number;
  exerciseTime: number; // in seconds
  restTime: number; // in seconds
  prepTime: number; // in seconds
}

export interface WorkoutPreset {
  id: string;
  name: string;
  settings: WorkoutSettings;
  createdAt: number; // timestamp for ordering
}

export interface PresetStore {
  activePresetId: string;
  presets: WorkoutPreset[];
  version: number; // for future migrations
}
