import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutPreset, WorkoutSettings } from '../types';
import { BackIcon } from '../utils/icons';
import NumericInput from './NumericInput';
import './Settings.css';
import './PresetList.css';

interface PresetEditorProps {
  preset: WorkoutPreset;
  onBack: () => void;
  onSave: (presetId: string, settings: WorkoutSettings) => void;
}

const PresetEditor: React.FC<PresetEditorProps> = ({ preset, onBack, onSave }) => {
  const { t } = useTranslation();

  const [rounds, setRounds] = useState(preset.settings.rounds);
  const [exerciseTime, setExerciseTime] = useState(preset.settings.exerciseTime);
  const [restTime, setRestTime] = useState(preset.settings.restTime);
  const [prepTime, setPrepTime] = useState(preset.settings.prepTime);

  const handleSave = () => {
    onSave(preset.id, { rounds, exerciseTime, restTime, prepTime });
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="back-button" onClick={onBack} aria-label="Back to settings">
          <BackIcon />
        </button>
        <h1 className="subpage-title">{preset.name}</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="settings-content">
        <NumericInput
          label={t('settings.rounds') as string}
          value={rounds}
          min={1}
          max={50}
          onChange={setRounds}
          inputId="rounds"
        />

        <NumericInput
          label={t('settings.exerciseTime') as string}
          value={exerciseTime}
          min={5}
          max={600}
          step={5}
          onChange={setExerciseTime}
          inputId="exercise-time"
        />

        <NumericInput
          label={t('settings.restTime') as string}
          value={restTime}
          min={5}
          max={300}
          step={5}
          onChange={setRestTime}
          inputId="rest-time"
        />

        <NumericInput
          label={t('settings.prepTime') as string}
          value={prepTime}
          min={3}
          max={30}
          step={1}
          onChange={setPrepTime}
          inputId="prep-time"
        />

        <div className="settings-summary">
          <h3>{t('settings.summary')}</h3>
          <p>{t('settings.totalTime', { minutes: Math.ceil((exerciseTime * rounds + restTime * (rounds - 1)) / 60) })}</p>
        </div>

        <button className="save-button" onClick={handleSave}>
          {t('settings.save')}
        </button>
      </div>
    </div>
  );
};

export default PresetEditor;
