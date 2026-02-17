import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutSettings, PresetStore } from '../types';
import { CloseIcon, EditIcon, TrashIcon, CheckIcon } from '../utils/icons';
import PresetEditor from './PresetEditor';
import './Settings.css';
import './PresetList.css';

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
    onPresetSwitch(presetId);
    setEditingPresetSettings(presetId);
  };

  const handleCreatePreset = () => {
    const newPresetId = onPresetCreate(newPresetName, settings);
    if (newPresetId) {
      setNewPresetName('');
      setShowNewPresetForm(false);
      setPresetError('');
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

  // Sub-page: delegate to PresetEditor
  const editingPreset = editingPresetSettings
    ? presetStore.presets.find(p => p.id === editingPresetSettings)
    : null;

  if (editingPresetSettings && editingPreset) {
    return (
      <PresetEditor
        preset={editingPreset}
        onBack={() => setEditingPresetSettings(null)}
        onSave={(presetId, newSettings) => {
          onSave(presetId, newSettings);
          setEditingPresetSettings(null);
        }}
      />
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

        <div className="language-setting">
          <label htmlFor="language">{t('settings.language')}</label>
          <div className="language-input">
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
