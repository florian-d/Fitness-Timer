import React, { useState, useEffect, useRef } from 'react';
import Timer from './components/Timer';
import Settings from './components/Settings';
import { loadSettings, saveSettings } from './utils/localStorage';
import './App.css';

export interface WorkoutSettings {
  rounds: number;
  exerciseTime: number; // in seconds
  restTime: number; // in seconds
  prepTime: number; // in seconds
}

function App() {
  const [settings, setSettings] = useState<WorkoutSettings>(() => {
    // Load settings from localStorage on initial render
    return loadSettings();
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const isInitialMount = useRef(true);

  // Save settings to localStorage whenever they change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveSettings(settings);
  }, [settings]);

  const commitSha = process.env.REACT_APP_GIT_SHA;
  const commitLabel = commitSha ? commitSha.slice(0, 7) : 'dev';

  const handleSettingsUpdate = (newSettings: WorkoutSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
  };

  return (
    <div className="App">
      {showSettings ? (
        <Settings 
          settings={settings} 
          onSave={handleSettingsUpdate}
          onClose={() => setShowSettings(false)}
        />
      ) : (
        <>
          <button 
            className="menu-button" 
            onClick={() => setShowSettings(true)}
            disabled={isRunning}
            aria-label="Open settings"
          >
            ☰
          </button>
          <Timer 
            settings={settings} 
            onRunningChange={setIsRunning}
          />
        </>
      )}
      <footer className="app-footer">
        Commit: {commitLabel}
      </footer>
    </div>
  );
}

export default App;
