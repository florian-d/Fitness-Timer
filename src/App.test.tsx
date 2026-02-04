import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import * as localStorageUtils from './utils/localStorage';

// Mock the localStorage utilities
jest.mock('./utils/localStorage');

const mockLoadSettings = localStorageUtils.loadSettings as jest.MockedFunction<typeof localStorageUtils.loadSettings>;
const mockSaveSettings = localStorageUtils.saveSettings as jest.MockedFunction<typeof localStorageUtils.saveSettings>;

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    mockLoadSettings.mockReturnValue({
      rounds: 8,
      exerciseTime: 30,
      restTime: 10,
    });
    mockSaveSettings.mockReturnValue(true);
  });

  test('renders menu button', () => {
    render(<App />);
    const menuButton = screen.getByLabelText(/open settings/i);
    expect(menuButton).toBeInTheDocument();
  });

  test('renders timer in ready state', () => {
    render(<App />);
    const readyText = screen.getByText(/tap to start/i);
    expect(readyText).toBeInTheDocument();
  });

  test('opens settings when menu button is clicked', () => {
    render(<App />);
    const menuButton = screen.getByLabelText(/open settings/i);
    fireEvent.click(menuButton);
    
    const settingsTitle = screen.getByText(/settings/i);
    expect(settingsTitle).toBeInTheDocument();
  });

  test('closes settings when close button is clicked', () => {
    render(<App />);
    const menuButton = screen.getByLabelText(/open settings/i);
    fireEvent.click(menuButton);
    
    const closeButton = screen.getByLabelText(/close settings/i);
    fireEvent.click(closeButton);
    
    const readyText = screen.getByText(/tap to start/i);
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

  test('loads settings from localStorage on mount', () => {
    const customSettings = {
      rounds: 12,
      exerciseTime: 45,
      restTime: 15,
    };
    mockLoadSettings.mockReturnValue(customSettings);

    render(<App />);

    expect(mockLoadSettings).toHaveBeenCalled();
  });

  test('saves settings to localStorage when settings are updated', async () => {
    render(<App />);
    
    // Open settings
    const menuButton = screen.getByLabelText(/open settings/i);
    fireEvent.click(menuButton);
    
    // Modify settings (increase rounds)
    const increaseButtons = screen.getAllByLabelText(/increase/i);
    fireEvent.click(increaseButtons[0]); // Increase rounds
    
    // Save settings
    const saveButton = screen.getByText(/save & start/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalledWith({
        rounds: 9,
        exerciseTime: 30,
        restTime: 10,
      });
    });
  });

  test('uses custom loaded settings from localStorage', () => {
    const customSettings = {
      rounds: 15,
      exerciseTime: 60,
      restTime: 20,
    };
    mockLoadSettings.mockReturnValue(customSettings);

    render(<App />);
    
    // Open settings to verify the loaded values
    const menuButton = screen.getByLabelText(/open settings/i);
    fireEvent.click(menuButton);

    expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('60')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20')).toBeInTheDocument();
  });
});
