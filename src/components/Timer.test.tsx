import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Timer from './Timer';
import { WorkoutSettings } from '../App';

const mockSettings: WorkoutSettings = {
  rounds: 2,
  exerciseTime: 3,
  restTime: 2,
};

const mockOnRunningChange = jest.fn();

describe('Timer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders in ready state', () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    expect(screen.getByText(/ready\?/i)).toBeInTheDocument();
    expect(screen.getByText(/tap to start/i)).toBeInTheDocument();
  });

  test('starts timer when play button is clicked', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
    });
  });

  test('formats time correctly', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/0:03/)).toBeInTheDocument();
    });
  });

  test('counts down exercise time', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/0:03/)).toBeInTheDocument();
    });

    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText(/0:02/)).toBeInTheDocument();
    });
  });

  test('transitions from exercise to rest', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
    });

    // Advance through exercise time
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
    });
  });

  test('transitions from rest to next exercise round', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
    });

    // Advance through exercise time
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
    });

    // Advance through rest time
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText(/exercise - round 2\/2/i)).toBeInTheDocument();
    });
  });

  test('completes workout after all rounds', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    // Round 1 exercise + rest
    jest.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
    });

    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.getByText(/exercise - round 2\/2/i)).toBeInTheDocument();
    });

    // Round 2 exercise (final round, no rest after)
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.getByText(/complete!/i)).toBeInTheDocument();
    });
  });

  test('pause and resume functionality', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/0:03/)).toBeInTheDocument();
    });

    const pauseButton = screen.getByLabelText(/pause/i);
    fireEvent.click(pauseButton);

    // Time should not advance when paused
    jest.advanceTimersByTime(2000);
    expect(screen.getByText(/0:03/)).toBeInTheDocument();

    const resumeButton = screen.getByLabelText(/resume/i);
    fireEvent.click(resumeButton);

    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText(/0:02/)).toBeInTheDocument();
    });
  });

  test('reset functionality', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
    });

    jest.advanceTimersByTime(1000);

    const resetButton = screen.getByLabelText(/reset/i);
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/ready\?/i)).toBeInTheDocument();
      expect(screen.getByText(/tap to start/i)).toBeInTheDocument();
    });
  });

  test('calls onRunningChange callback', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockOnRunningChange).toHaveBeenCalledWith(true);
    });
  });
});
