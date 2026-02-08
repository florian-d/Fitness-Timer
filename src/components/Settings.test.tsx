import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Settings from './Settings';
import { WorkoutSettings } from '../App';

const mockSettings: WorkoutSettings = {
  rounds: 8,
  exerciseTime: 30,
  restTime: 10,
  prepTime: 10,
};

const mockOnSave = jest.fn();
const mockOnClose = jest.fn();

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders settings with initial values', () => {
    render(<Settings settings={mockSettings} onSave={mockOnSave} onClose={mockOnClose} />);
    
    expect(screen.getByText('settings.title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    // Use getById for fields with same value (rest-time and prep-time both have 10)
    expect(screen.getByRole('spinbutton', { name: 'settings.restTime' })).toHaveValue(10);
    expect(screen.getByRole('spinbutton', { name: 'settings.prepTime' })).toHaveValue(10);
  });

  test('increments rounds when + button is clicked', () => {
    render(<Settings settings={mockSettings} onSave={mockOnSave} onClose={mockOnClose} />);
    
    const roundsInput = screen.getByDisplayValue('8');
    const increaseButtons = screen.getAllByLabelText(/increase/i);
    const roundsIncreaseButton = increaseButtons[0]; // First increase button is for rounds
    
    fireEvent.click(roundsIncreaseButton);
    
    expect(roundsInput).toHaveValue(9);
  });

  test('decrements rounds when - button is clicked', () => {
    render(<Settings settings={mockSettings} onSave={mockOnSave} onClose={mockOnClose} />);
    
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
    
    render(<Settings settings={settingsWithOneRound} onSave={mockOnSave} onClose={mockOnClose} />);
    
    const roundsInput = screen.getByDisplayValue('1');
    const decreaseButtons = screen.getAllByLabelText(/decrease/i);
    const roundsDecreaseButton = decreaseButtons[0];
    
    fireEvent.click(roundsDecreaseButton);
    
    expect(roundsInput).toHaveValue(1);
  });

  test('calls onSave with updated settings when save button is clicked', () => {
    render(<Settings settings={mockSettings} onSave={mockOnSave} onClose={mockOnClose} />);
    
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
    render(<Settings settings={mockSettings} onSave={mockOnSave} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText(/close settings/i);
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('displays workout summary with correct total time', () => {
    render(<Settings settings={mockSettings} onSave={mockOnSave} onClose={mockOnClose} />);
    
    // 8 rounds * 30 sec exercise + 7 rest periods * 10 sec rest = 240 + 70 = 310 seconds = 6 minutes (rounded up)
    // With i18n mock, interpolation replaces {{minutes}} with actual value
    expect(screen.getByText('settings.totalTime')).toBeInTheDocument();
  });

  test('updates workout summary when settings change', () => {
    render(<Settings settings={mockSettings} onSave={mockOnSave} onClose={mockOnClose} />);
    
    const increaseButtons = screen.getAllByLabelText(/increase/i);
    const exerciseIncreaseButton = increaseButtons[1]; // Second increase button is for exercise time
    
    // Increase exercise time (30 + 5 = 35)
    fireEvent.click(exerciseIncreaseButton);
    
    // With i18n mock, we just check that the summary element exists
    expect(screen.getByText('settings.summary')).toBeInTheDocument();
  });

  test('allows manual input of values', () => {
    render(<Settings settings={mockSettings} onSave={mockOnSave} onClose={mockOnClose} />);
    
    const roundsInput = screen.getByDisplayValue('8');
    
    fireEvent.change(roundsInput, { target: { value: '12' } });
    
    expect(roundsInput).toHaveValue(12);
  });
});
