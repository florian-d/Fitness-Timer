import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutSettings, PresetStore } from '../App';
import { BackIcon, CloseIcon, EditIcon, TrashIcon, CheckIcon } from '../utils/icons';
import NumericInput from './NumericInput';
import './Settings.css';

interface SettingsProps {
  settings: WorkoutSettings;
  presetStore: PresetStore;
  activePresetId: string;
  onSave: (presetId: string, settings: WorkoutSettings) => void;
  onClose: () => void;
  onPresetCreate: (name: string, settings: WorkoutSettings) => string | null;
  onPresetRename: (presetId: string, newName: string) => boolean;
  onPresetDelete: (presetId: string) => boolean;
  onPresetSwitch: (presetId: string) => void;
}

const Settings: React.FC<SettingsProps> = ({
  settings,
  presetStore,
  activePresetId,
  onSave,
  onClose,
  onPresetCreate,
  onPresetRename,
  onPresetDelete,
  onPresetSwitch,
}) => {
  const { t, i18n } = useTranslation();

  // Sub-page state: which preset's settings are being edited
  const [editingPresetSettings, setEditingPresetSettings] = useState<string | null>(null);

  // Timer value state (used in sub-page)
  const [rounds, setRounds] = useState(settings.rounds);
  const [exerciseTime, setExerciseTime] = useState(settings.exerciseTime);
  const [restTime, setRestTime] = useState(settings.restTime);
  const [prepTime, setPrepTime] = useState(settings.prepTime);

  // Preset management state
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetName, setEditingPresetName] = useState('');
  const [showNewPresetForm, setShowNewPresetForm] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [presetError, setPresetError] = useState('');

  // Get current language, defaulting to 'en' if not supported
  const supportedLanguages = ['en', 'de'];
  const currentLanguage = supportedLanguages.includes(i18n.resolvedLanguage || '')
    ? i18n.resolvedLanguage
    : 'en';

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value).catch((error: unknown) => {
      // eslint-disable-next-line no-console
      console.error('Failed to change language:', error);
    });
  };

  const openPresetSettings = (presetId: string) => {
    const preset = presetStore.presets.find(p => p.id === presetId);
    if (!preset) return;
    // Switch to this preset as active
    onPresetSwitch(presetId);
    // Load its settings into local state
    setRounds(preset.settings.rounds);
    setExerciseTime(preset.settings.exerciseTime);
    setRestTime(preset.settings.restTime);
    setPrepTime(preset.settings.prepTime);
    // Open sub-page
    setEditingPresetSettings(presetId);
  };

  const handleSavePresetSettings = () => {
    if (!editingPresetSettings) return;
    onSave(editingPresetSettings, {
      rounds,
      exerciseTime,
      restTime,
      prepTime,
    });
    setEditingPresetSettings(null);
  };

  const handleBackFromSubpage = () => {
    setEditingPresetSettings(null);
  };

  const handleCreatePreset = () => {
    const newPresetId = onPresetCreate(newPresetName, settings);
    if (newPresetId) {
      setNewPresetName('');
      setShowNewPresetForm(false);
      setPresetError('');
      // Open sub-page for the new preset
      openPresetSettings(newPresetId);
    } else {
      setPresetError(t('presets.error.nameTaken') as string);
    }
  };

  const handleRenamePreset = (presetId: string) => {
    const success = onPresetRename(presetId, editingPresetName);
    if (success) {
      setEditingPresetId(null);
      setPresetError('');
    } else {
      setPresetError(t('presets.error.nameTaken') as string);
    }
  };

  const handleDeletePreset = (presetId: string, presetName: string) => {
    if (presetStore.presets.length <= 1) {
      setPresetError(t('presets.error.cannotDeleteLast') as string);
      return;
    }
    if (window.confirm(t('presets.confirmDelete', { name: presetName }) as string)) {
      onPresetDelete(presetId);
      setPresetError('');
    }
  };

  const handleAddNewPreset = () => {
    if (presetStore.presets.length >= 20) {
      setPresetError(t('presets.error.tooMany') as string);
    } else {
      setShowNewPresetForm(true);
      setPresetError('');
    }
  };

  // Get the name of the preset being edited in sub-page
  const editingPreset = editingPresetSettings
    ? presetStore.presets.find(p => p.id === editingPresetSettings)
    : null;

  // Sub-page: edit preset timer values
  if (editingPresetSettings && editingPreset) {
    return (
      <div className="settings-container">
        <div className="settings-header">
          <button className="back-button" onClick={handleBackFromSubpage} aria-label="Back to settings">
            <BackIcon />
          </button>
          <h1 className="subpage-title">{editingPreset.name}</h1>
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

          <button className="save-button" onClick={handleSavePresetSettings}>
            {t('settings.save')}
          </button>
        </div>
      </div>
    );
  }

  // Main view: preset list + language
  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>{t('settings.title')}</h1>
        <button className="close-button" onClick={onClose} aria-label="Close settings">
          <CloseIcon />
        </button>
      </div>

      <div className="settings-content">
        {/* Preset Management Section */}
        <div className="preset-section">
          <h3>{t('presets.title')}</h3>

          {/* Preset List */}
          <div className="preset-list">
            {presetStore.presets.map(preset => (
              <div
                key={preset.id}
                className={`preset-item ${preset.id === activePresetId ? 'active' : ''}`}
              >
                {editingPresetId === preset.id ? (
                  <div className="preset-edit">
                    <input
                      type="text"
                      value={editingPresetName}
                      onChange={(e) => setEditingPresetName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleRenamePreset(preset.id);
                        }
                      }}
                      autoFocus
                    />
                    <button onClick={() => handleRenamePreset(preset.id)} aria-label="Confirm">
                      <CheckIcon />
                    </button>
                    <button onClick={() => setEditingPresetId(null)} aria-label="Cancel">
                      <CloseIcon />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className="preset-select-button"
                      onClick={() => openPresetSettings(preset.id)}
                    >
                      <span className="preset-name">{preset.name}</span>
                      {preset.id === activePresetId && <span className="active-indicator">●</span>}
                    </button>
                    <button
                      className="preset-action-button"
                      onClick={() => {
                        setEditingPresetId(preset.id);
                        setEditingPresetName(preset.name);
                      }}
                      aria-label={t('presets.rename') as string}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="preset-action-button"
                      onClick={() => handleDeletePreset(preset.id, preset.name)}
                      disabled={presetStore.presets.length <= 1}
                      aria-label={t('presets.delete') as string}
                    >
                      <TrashIcon />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* New Preset Form */}
          {showNewPresetForm ? (
            <div className="new-preset-form">
              <input
                type="text"
                placeholder={t('presets.newPresetPlaceholder') as string}
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreatePreset();
                  }
                }}
                autoFocus
              />
              <button onClick={handleCreatePreset}>
                {t('presets.create')}
              </button>
              <button onClick={() => {
                setShowNewPresetForm(false);
                setNewPresetName('');
                setPresetError('');
              }}>
                {t('presets.cancel')}
              </button>
            </div>
          ) : (
            <button
              className="add-preset-button"
              onClick={handleAddNewPreset}
            >
              + {t('presets.addNew')}
            </button>
          )}

          {/* Error Message */}
          {presetError && (
            <div className="preset-error">{presetError}</div>
          )}
        </div>

        <div className="settings-divider"></div>

        <div className="setting-item">
          <label htmlFor="language">{t('settings.language')}</label>
          <div className="input-group">
            <select
              id="language"
              value={currentLanguage}
              onChange={handleLanguageChange}
              className="language-select"
            >
              <option value="en">{t('languages.en')}</option>
              <option value="de">{t('languages.de')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
