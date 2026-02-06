import React, { useState } from 'react';
import Timer from './components/Timer';
import Settings from './components/Settings';
import './App.css';

export interface WorkoutSettings {
  rounds: number;
  exerciseTime: number; // in seconds
  restTime: number; // in seconds
}

function App() {
  const [settings, setSettings] = useState<WorkoutSettings>({
    rounds: 8,
    exerciseTime: 30,
    restTime: 10,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

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
