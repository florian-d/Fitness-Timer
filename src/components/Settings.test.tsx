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
        activePresetId={presetStore.activePresetId}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onPresetCreate={mockOnPresetCreate}
        onPresetRename={mockOnPresetRename}
        onPresetDelete={mockOnPresetDelete}
        onPresetSwitch={mockOnPresetSwitch}
      />
    );
  };

  test('renders main view with preset list and language', () => {
    renderSettings();

    expect(screen.getByText('settings.title')).toBeInTheDocument();
    expect(screen.getByText('presets.title')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('settings.language')).toBeInTheDocument();
    // Timer values should NOT be visible on main view
    expect(screen.queryByText('settings.rounds')).not.toBeInTheDocument();
  });

  test('opens sub-page when clicking a preset', () => {
    renderSettings();

    // Click the preset to open sub-page
    fireEvent.click(screen.getByText('Default'));

    // Sub-page should show preset name and timer values
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'settings.restTime' })).toHaveValue(10);
    expect(screen.getByRole('spinbutton', { name: 'settings.prepTime' })).toHaveValue(10);
    // Should have switched to this preset
    expect(mockOnPresetSwitch).toHaveBeenCalledWith('preset-1');
  });

  test('increments rounds on sub-page when + button is clicked', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Default'));

    const roundsInput = screen.getByDisplayValue('8');
    const increaseButtons = screen.getAllByLabelText(/increase/i);
    fireEvent.click(increaseButtons[0]);

    expect(roundsInput).toHaveValue(9);
  });

  test('decrements rounds on sub-page when - button is clicked', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Default'));

    const roundsInput = screen.getByDisplayValue('8');
    const decreaseButtons = screen.getAllByLabelText(/decrease/i);
    fireEvent.click(decreaseButtons[0]);

    expect(roundsInput).toHaveValue(7);
  });

  test('does not allow rounds to go below 1', () => {
    const settingsWithOneRound: WorkoutSettings = {
      rounds: 1,
      exerciseTime: 30,
      restTime: 10,
      prepTime: 10,
    };
    const store: PresetStore = {
      activePresetId: 'preset-1',
      presets: [{
        id: 'preset-1',
        name: 'Default',
        settings: settingsWithOneRound,
        createdAt: Date.now(),
      }],
      version: 1,
    };

    renderSettings(settingsWithOneRound, store);
    fireEvent.click(screen.getByText('Default'));

    const roundsInput = screen.getByDisplayValue('1');
    const decreaseButtons = screen.getAllByLabelText(/decrease/i);
    fireEvent.click(decreaseButtons[0]);

    expect(roundsInput).toHaveValue(1);
  });

  test('calls onSave with presetId and updated settings when save button is clicked', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Default'));

    const increaseButtons = screen.getAllByLabelText(/increase/i);
    fireEvent.click(increaseButtons[0]); // Increase rounds

    const saveButton = screen.getByText('settings.save');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('preset-1', {
      rounds: 9,
      exerciseTime: 30,
      restTime: 10,
      prepTime: 10,
    });
  });

  test('returns to main view after saving', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Default'));

    const saveButton = screen.getByText('settings.save');
    fireEvent.click(saveButton);

    // Should be back on main view
    expect(screen.getByText('settings.title')).toBeInTheDocument();
    expect(screen.getByText('presets.title')).toBeInTheDocument();
  });

  test('returns to main view when back button is clicked', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Default'));

    // Should be on sub-page
    expect(screen.getByLabelText(/back to settings/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/back to settings/i));

    // Should be back on main view
    expect(screen.getByText('settings.title')).toBeInTheDocument();
    expect(screen.getByText('presets.title')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    renderSettings();

    const closeButton = screen.getByLabelText(/close settings/i);
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('displays workout summary on sub-page', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Default'));

    expect(screen.getByText('settings.summary')).toBeInTheDocument();
    expect(screen.getByText('settings.totalTime')).toBeInTheDocument();
  });

  test('allows manual input of values on sub-page', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Default'));

    const roundsInput = screen.getByDisplayValue('8');
    fireEvent.change(roundsInput, { target: { value: '12' } });

    expect(roundsInput).toHaveValue(12);
  });
});
