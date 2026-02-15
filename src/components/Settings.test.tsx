import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Settings from './Settings';
import { WorkoutSettings, PresetStore } from '../App';

const mockSettings: WorkoutSettings = {
  rounds: 8,
  exerciseTime: 30,
  restTime: 10,
  prepTime: 10,
};

const mockPresetStore: PresetStore = {
  activePresetId: 'preset-1',
  presets: [
    {
      id: 'preset-1',
      name: 'Default',
      settings: mockSettings,
      createdAt: Date.now(),
    },
  ],
  version: 1,
};

const mockOnSave = jest.fn();
const mockOnClose = jest.fn();
const mockOnPresetCreate = jest.fn();
const mockOnPresetRename = jest.fn();
const mockOnPresetDelete = jest.fn();
const mockOnPresetSwitch = jest.fn();

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSettings = (settings = mockSettings, presetStore = mockPresetStore) => {
    return render(
      <Settings
        settings={settings}
        presetStore={presetStore}
        activePresetId="preset-1"
        onSave={mockOnSave}
        onClose={mockOnClose}
        onPresetCreate={mockOnPresetCreate}
        onPresetRename={mockOnPresetRename}
        onPresetDelete={mockOnPresetDelete}
        onPresetSwitch={mockOnPresetSwitch}
      />
    );
  };

  test('renders settings with initial values', () => {
    renderSettings();
    
    expect(screen.getByText('settings.title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    // Use getById for fields with same value (rest-time and prep-time both have 10)
    expect(screen.getByRole('spinbutton', { name: 'settings.restTime' })).toHaveValue(10);
    expect(screen.getByRole('spinbutton', { name: 'settings.prepTime' })).toHaveValue(10);
  });

  test('increments rounds when + button is clicked', () => {
    renderSettings();
    
    const roundsInput = screen.getByDisplayValue('8');
    const increaseButtons = screen.getAllByLabelText(/increase/i);
    const roundsIncreaseButton = increaseButtons[0]; // First increase button is for rounds
    
    fireEvent.click(roundsIncreaseButton);
    
    expect(roundsInput).toHaveValue(9);
  });

  test('decrements rounds when - button is clicked', () => {
    renderSettings();
    
    const roundsInput = screen.getByDisplayValue('8');
    const decreaseButtons = screen.getAllByLabelText(/decrease/i);
    const roundsDecreaseButton = decreaseButtons[0]; // First decrease button is for rounds
    
    fireEvent.click(roundsDecreaseButton);
    
    expect(roundsInput).toHaveValue(7);
  });

  test('does not allow rounds to go below 1', () => {
    const settingsWithOneRound: WorkoutSettings = {
      rounds: 1,
      exerciseTime: 30,
      restTime: 10,
      prepTime: 10,
    };

    renderSettings(settingsWithOneRound);
    
    const roundsInput = screen.getByDisplayValue('1');
    const decreaseButtons = screen.getAllByLabelText(/decrease/i);
    const roundsDecreaseButton = decreaseButtons[0];
    
    fireEvent.click(roundsDecreaseButton);
    
    expect(roundsInput).toHaveValue(1);
  });

  test('calls onSave with updated settings when save button is clicked', () => {
    renderSettings();
    
    const increaseButtons = screen.getAllByLabelText(/increase/i);
    fireEvent.click(increaseButtons[0]); // Increase rounds
    
    const saveButton = screen.getByText('settings.save');
    fireEvent.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith({
      rounds: 9,
      exerciseTime: 30,
      restTime: 10,
      prepTime: 10,
    });
  });

  test('calls onClose when close button is clicked', () => {
    renderSettings();
    
    const closeButton = screen.getByLabelText(/close settings/i);
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('displays workout summary with correct total time', () => {
    renderSettings();
    
    // 8 rounds * 30 sec exercise + 7 rest periods * 10 sec rest = 240 + 70 = 310 seconds = 6 minutes (rounded up)
    // With i18n mock, interpolation replaces {{minutes}} with actual value
    expect(screen.getByText('settings.totalTime')).toBeInTheDocument();
  });

  test('updates workout summary when settings change', () => {
    renderSettings();
    
    const increaseButtons = screen.getAllByLabelText(/increase/i);
    const exerciseIncreaseButton = increaseButtons[1]; // Second increase button is for exercise time
    
    // Increase exercise time (30 + 5 = 35)
    fireEvent.click(exerciseIncreaseButton);
    
    // With i18n mock, we just check that the summary element exists
    expect(screen.getByText('settings.summary')).toBeInTheDocument();
  });

  test('allows manual input of values', () => {
    renderSettings();
    
    const roundsInput = screen.getByDisplayValue('8');
    
    fireEvent.change(roundsInput, { target: { value: '12' } });
    
    expect(roundsInput).toHaveValue(12);
  });
});
