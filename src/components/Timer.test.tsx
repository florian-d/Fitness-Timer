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

  describe('Bell Sound', () => {
    let mockPlay: jest.Mock;
    let mockAudio: any;

    beforeEach(() => {
      // Mock HTMLAudioElement
      mockPlay = jest.fn().mockResolvedValue(undefined);
      mockAudio = {
        play: mockPlay,
        pause: jest.fn(),
        volume: 0,
        currentTime: 0,
      };

      // Mock Audio constructor
      (window as any).Audio = jest.fn(() => mockAudio);
    });

    test('plays bell sound when exercise phase completes', async () => {
      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
      });

      // Clear previous calls (from ready to exercise transition)
      jest.clearAllMocks();

      // Advance through exercise time to trigger bell
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
      });

      // Verify bell sound was played once (exercise to rest transition)
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    test('plays bell sound when rest phase completes', async () => {
      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through exercise time
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
      });

      // Clear previous calls
      jest.clearAllMocks();

      // Advance through rest time to trigger bell
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/exercise - round 2\/2/i)).toBeInTheDocument();
      });

      // Verify bell sound was played twice (rest to exercise transition)
      // First bell plays immediately
      expect(mockPlay).toHaveBeenCalledTimes(1);
      
      // Advance timer to allow second bell to play (300ms delay)
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(mockPlay).toHaveBeenCalledTimes(2);
      });
    });

    test('plays bell sound when workout completes', async () => {
      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
      });

      // Complete all rounds
      jest.advanceTimersByTime(3000); // Round 1 exercise
      
      await waitFor(() => {
        expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
      });

      jest.advanceTimersByTime(2000); // Round 1 rest

      await waitFor(() => {
        expect(screen.getByText(/exercise - round 2\/2/i)).toBeInTheDocument();
      });

      // Clear previous calls
      jest.clearAllMocks();

      jest.advanceTimersByTime(3000); // Round 2 exercise (final)

      await waitFor(() => {
        expect(screen.getByText(/complete!/i)).toBeInTheDocument();
      });

      // Verify bell sound was played (Audio already created, so just check play)
      expect(mockPlay).toHaveBeenCalled();
    });

    test('handles audio API errors gracefully', async () => {
      // Mock Audio constructor to throw an error
      (window as any).Audio = jest.fn(() => {
        throw new Error('Audio not supported');
      });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through exercise time
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
      });

      // App should continue working despite audio error
      expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Audio playback not supported:', expect.any(Error));

      consoleWarnSpy.mockRestore();
    });
  });
});
