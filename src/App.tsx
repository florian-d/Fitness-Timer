import React, { useState, useEffect } from 'react';
import Timer from './components/Timer';
import Settings from './components/Settings';
import { loadSettings, saveSettings } from './utils/localStorage';
import './App.css';

export interface WorkoutSettings {
  rounds: number;
  exerciseTime: number; // in seconds
  restTime: number; // in seconds
}

function App() {
  const [settings, setSettings] = useState<WorkoutSettings>(() => {
    // Load settings from localStorage on initial render
    return loadSettings();
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

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
    </div>
  );
}

export default App;
