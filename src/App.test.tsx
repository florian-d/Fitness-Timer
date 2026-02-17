import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App, { WorkoutSettings } from './App';
import * as localStorageUtils from './utils/localStorage';
import { DEFAULT_PHASE_COLORS } from './utils/constants';

// Mock the localStorage utilities
jest.mock('./utils/localStorage');

const mockLoadPresetStore = localStorageUtils.loadPresetStore as jest.MockedFunction<typeof localStorageUtils.loadPresetStore>;
const mockSavePresetStore = localStorageUtils.savePresetStore as jest.MockedFunction<typeof localStorageUtils.savePresetStore>;
const mockUpdatePreset = localStorageUtils.updatePreset as jest.MockedFunction<typeof localStorageUtils.updatePreset>;
const mockSetActivePreset = localStorageUtils.setActivePreset as jest.MockedFunction<typeof localStorageUtils.setActivePreset>;

const defaultPresetStore = {
  activePresetId: 'preset-1',
  presets: [
    {
      id: 'preset-1',
      name: 'Default',
      settings: {
        rounds: 8,
        exerciseTime: 30,
        restTime: 10,
        prepTime: 10,
        phaseColors: {
          ready: DEFAULT_PHASE_COLORS.ready,
          prepare: DEFAULT_PHASE_COLORS.prepare,
          exercise: DEFAULT_PHASE_COLORS.exercise,
          rest: DEFAULT_PHASE_COLORS.rest,
        },
      },
      createdAt: Date.now(),
    },
  ],
  version: 1,
};

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadPresetStore.mockReturnValue(defaultPresetStore);
    mockSavePresetStore.mockReturnValue(true);
    // setActivePreset returns the same store (switching to already-active preset)
    mockSetActivePreset.mockReturnValue(defaultPresetStore);
    // updatePreset returns an updated store by default
    mockUpdatePreset.mockImplementation((store, _presetId, updates) => {
      const updatedPresets = store.presets.map(p => {
        if (p.id === store.activePresetId && updates.settings) {
          return { ...p, settings: updates.settings };
        }
        return p;
      });
      return { ...store, presets: updatedPresets };
    });
  });

  test('renders menu button', () => {
    render(<App />);
    const menuButton = screen.getByLabelText(/open settings/i);
    expect(menuButton).toBeInTheDocument();
  });

  test('renders timer in ready state', () => {
    render(<App />);
    const readyText = screen.getByText('timer.tapToStart');
    expect(readyText).toBeInTheDocument();
  });

  test('opens settings when menu button is clicked', () => {
    render(<App />);
    const menuButton = screen.getByLabelText(/open settings/i);
    fireEvent.click(menuButton);

    const settingsTitle = screen.getByText('settings.title');
    expect(settingsTitle).toBeInTheDocument();
  });

  test('closes settings when close button is clicked', () => {
    render(<App />);
    const menuButton = screen.getByLabelText(/open settings/i);
    fireEvent.click(menuButton);

    const closeButton = screen.getByLabelText(/close settings/i);
    fireEvent.click(closeButton);

    const readyText = screen.getByText('timer.tapToStart');
    expect(readyText).toBeInTheDocument();
  });

  test('menu button is disabled when timer is running', async () => {
    render(<App />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      const menuButton = screen.getByLabelText(/open settings/i);
      expect(menuButton).toBeDisabled();
    });
  });

  test('loads preset store from localStorage on mount', () => {
    render(<App />);
    expect(mockLoadPresetStore).toHaveBeenCalled();
  });

  test('shows preset list on settings main view', () => {
    render(<App />);
    const menuButton = screen.getByLabelText(/open settings/i);
    fireEvent.click(menuButton);

    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('presets.title')).toBeInTheDocument();
  });

  test('opens preset sub-page and saves settings', async () => {
    render(<App />);

    // Open settings
    const menuButton = screen.getByLabelText(/open settings/i);
    fireEvent.click(menuButton);

    // Click preset to open sub-page
    fireEvent.click(screen.getByText('Default'));

    // Verify timer values are shown
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();

    // Modify settings (increase rounds)
    const increaseButtons = screen.getAllByLabelText(/increase/i);
    fireEvent.click(increaseButtons[0]); // Increase rounds

    // Save settings
    const saveButton = screen.getByText('settings.save');
    fireEvent.click(saveButton);

    // Should return to main settings view
    expect(screen.getByText('presets.title')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSavePresetStore).toHaveBeenCalled();
    });
  });
});

describe('WorkoutSettings', () => {
  it('should support phaseColors property', () => {
    const settings: WorkoutSettings = {
      rounds: 8,
      exerciseTime: 30,
      restTime: 10,
      prepTime: 10,
      phaseColors: {
        ready: DEFAULT_PHASE_COLORS.ready,
        prepare: DEFAULT_PHASE_COLORS.prepare,
        exercise: DEFAULT_PHASE_COLORS.exercise,
        rest: DEFAULT_PHASE_COLORS.rest,
      }
    };

    expect(settings.phaseColors.ready).toBe('#6B7280');
    expect(settings.phaseColors.prepare).toBe('#F59E0B');
    expect(settings.phaseColors.exercise).toBe('#EF4444');
    expect(settings.phaseColors.rest).toBe('#10B981');
  });
});
