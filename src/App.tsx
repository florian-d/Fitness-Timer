import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Timer from './components/Timer';
import Settings from './components/Settings';
import {
  loadPresetStore,
  savePresetStore,
  createPreset,
  updatePreset,
  deletePreset,
  setActivePreset,
} from './utils/localStorage';
import { MenuIcon } from './utils/icons';
import { WorkoutSettings, PresetStore } from './types';
import './App.css';

function App() {
  const { t } = useTranslation();
  const [presetStore, setPresetStore] = useState<PresetStore>(() => {
    // Load preset store from localStorage on initial render
    return loadPresetStore();
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const isInitialMount = useRef(true);

  // Derive active preset and settings
  const activePreset = presetStore.presets.find(
    p => p.id === presetStore.activePresetId
  ) || presetStore.presets[0];
  const settings = activePreset.settings;

  // Save preset store to localStorage whenever it changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    savePresetStore(presetStore);
  }, [presetStore]);

  const commitSha = process.env.REACT_APP_GIT_SHA;
  const commitDate = process.env.REACT_APP_GIT_DATE;
  const commitLabel = commitSha ? commitSha.slice(0, 7) : 'dev';

  // Format commit date for display (e.g., "2026-02-08 12:34")
  const formatCommitDate = (isoDate: string | undefined): string => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };
  const commitDateLabel = formatCommitDate(commitDate);

  const handleSettingsUpdate = (presetId: string, newSettings: WorkoutSettings) => {
    const updatedStore = updatePreset(
      presetStore,
      presetId,
      { settings: newSettings }
    );

    if (updatedStore) {
      setPresetStore(updatedStore);
    }
  };

  const handlePresetChange = (presetId: string) => {
    const updatedStore = setActivePreset(presetStore, presetId);
    if (updatedStore) {
      setPresetStore(updatedStore);
    }
  };

  const handlePresetCreate = (name: string, settings: WorkoutSettings): string | null => {
    const updatedStore = createPreset(presetStore, name, settings);
    if (updatedStore) {
      // Find the newly created preset (the one not in the current store)
      const newPreset = updatedStore.presets.find(
        p => !presetStore.presets.some(existing => existing.id === p.id)
      );
      setPresetStore(updatedStore);
      return newPreset?.id || null;
    }
    return null;
  };

  const handlePresetRename = (presetId: string, newName: string): boolean => {
    const updatedStore = updatePreset(presetStore, presetId, { name: newName });
    if (updatedStore) {
      setPresetStore(updatedStore);
      return true;
    }
    return false;
  };

  const handlePresetDelete = (presetId: string): boolean => {
    const updatedStore = deletePreset(presetStore, presetId);
    if (updatedStore) {
      setPresetStore(updatedStore);
      return true;
    }
    return false;
  };

  return (
    <div className="App">
      {showSettings ? (
        <Settings
          settings={settings}
          presetStore={presetStore}
          activePresetId={activePreset.id}
          onSave={handleSettingsUpdate}
          onClose={() => setShowSettings(false)}
          onPresetCreate={handlePresetCreate}
          onPresetRename={handlePresetRename}
          onPresetDelete={handlePresetDelete}
          onPresetSwitch={handlePresetChange}
        />
      ) : (
        <>
          <button
            className="menu-button"
            onClick={() => setShowSettings(true)}
            disabled={isRunning}
            aria-label="Open settings"
          >
            <MenuIcon />
          </button>
          <Timer
            settings={settings}
            activePresetName={activePreset.name}
            presets={presetStore.presets}
            activePresetId={activePreset.id}
            onRunningChange={setIsRunning}
            onPresetChange={handlePresetChange}
          />
        </>
      )}
      <footer className="app-footer">
        {t('app.commit', { label: commitLabel })}
        {commitDateLabel && ` (${commitDateLabel})`}
      </footer>
    </div>
  );
}

export default App;
