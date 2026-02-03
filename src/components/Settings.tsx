import React, { useState } from 'react';
import { WorkoutSettings } from '../App';
import './Settings.css';

interface SettingsProps {
  settings: WorkoutSettings;
  onSave: (settings: WorkoutSettings) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onClose }) => {
  const [rounds, setRounds] = useState(settings.rounds);
  const [exerciseTime, setExerciseTime] = useState(settings.exerciseTime);
  const [restTime, setRestTime] = useState(settings.restTime);

  const handleSave = () => {
    onSave({
      rounds,
      exerciseTime,
      restTime,
    });
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <button className="close-button" onClick={onClose} aria-label="Close settings">
          ✕
        </button>
      </div>
      
      <div className="settings-content">
        <div className="setting-item">
          <label htmlFor="rounds">Number of Rounds</label>
          <div className="input-group">
            <button 
              onClick={() => setRounds(Math.max(1, rounds - 1))}
              aria-label="Decrease rounds"
            >
              −
            </button>
            <input
              id="rounds"
              type="number"
              min="1"
              max="50"
              value={rounds}
              onChange={(e) => setRounds(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <button 
              onClick={() => setRounds(Math.min(50, rounds + 1))}
              aria-label="Increase rounds"
            >
              +
            </button>
          </div>
        </div>

        <div className="setting-item">
          <label htmlFor="exercise-time">Exercise Time (seconds)</label>
          <div className="input-group">
            <button 
              onClick={() => setExerciseTime(Math.max(5, exerciseTime - 5))}
              aria-label="Decrease exercise time"
            >
              −
            </button>
            <input
              id="exercise-time"
              type="number"
              min="5"
              max="600"
              step="5"
              value={exerciseTime}
              onChange={(e) => setExerciseTime(Math.max(5, parseInt(e.target.value) || 5))}
            />
            <button 
              onClick={() => setExerciseTime(Math.min(600, exerciseTime + 5))}
              aria-label="Increase exercise time"
            >
              +
            </button>
          </div>
        </div>

        <div className="setting-item">
          <label htmlFor="rest-time">Rest Time (seconds)</label>
          <div className="input-group">
            <button 
              onClick={() => setRestTime(Math.max(5, restTime - 5))}
              aria-label="Decrease rest time"
            >
              −
            </button>
            <input
              id="rest-time"
              type="number"
              min="5"
              max="300"
              step="5"
              value={restTime}
              onChange={(e) => setRestTime(Math.max(5, parseInt(e.target.value) || 5))}
            />
            <button 
              onClick={() => setRestTime(Math.min(300, restTime + 5))}
              aria-label="Increase rest time"
            >
              +
            </button>
          </div>
        </div>

        <div className="settings-summary">
          <h3>Workout Summary</h3>
          <p>Total Time: {Math.ceil((exerciseTime * rounds + restTime * (rounds - 1)) / 60)} minutes</p>
        </div>

        <button className="save-button" onClick={handleSave}>
          Save & Start
        </button>
      </div>
    </div>
  );
};

export default Settings;
