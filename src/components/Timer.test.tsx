import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Timer from './Timer';
import { WorkoutSettings } from '../App';

const mockSettings: WorkoutSettings = {
  rounds: 2,
  exerciseTime: 3,
  restTime: 2,
  prepTime: 2,
};

const mockOnRunningChange = jest.fn();

const advanceTime = (ms: number) => {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
};

const runPendingTimers = () => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
};

const clickWithAct = async (element: HTMLElement) => {
  await act(async () => {
    fireEvent.click(element);
    await Promise.resolve();
  });
};

describe('Timer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    runPendingTimers();
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
      expect(screen.getByText(/get ready!/i)).toBeInTheDocument();
    });
  });

  test('formats time correctly', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/0:02/)).toBeInTheDocument();
    });
  });

  test('counts down exercise time', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    // Prepare phase
    await waitFor(() => {
      expect(screen.getByText(/0:02/)).toBeInTheDocument();
    });

    // Advance through prepare time to exercise
    advanceTime(2000);
    
    await waitFor(() => {
      expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
      expect(screen.getByText(/0:03/)).toBeInTheDocument();
    });

    advanceTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText(/0:02/)).toBeInTheDocument();
    });
  });

  test('transitions from exercise to rest', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    // Advance through prepare time
    advanceTime(2000);

    await waitFor(() => {
      expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
    });

    // Advance through exercise time
    advanceTime(3000);

    await waitFor(() => {
      expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
    });
  });

  test('transitions from rest to next exercise round', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    // Advance through prepare time
    advanceTime(2000);

    await waitFor(() => {
      expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
    });

    // Advance through exercise time
    advanceTime(3000);

    await waitFor(() => {
      expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
    });

    // Advance through rest time
    advanceTime(2000);

    await waitFor(() => {
      expect(screen.getByText(/exercise - round 2\/2/i)).toBeInTheDocument();
    });
  });

  test('completes workout after all rounds', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    // Prepare phase
    advanceTime(2000);

    // Round 1 exercise + rest
    advanceTime(3000);
    await waitFor(() => {
      expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
    });

    advanceTime(2000);
    await waitFor(() => {
      expect(screen.getByText(/exercise - round 2\/2/i)).toBeInTheDocument();
    });

    // Round 2 exercise (final round, no rest after)
    advanceTime(3000);

    await waitFor(() => {
      expect(screen.getByText(/complete!/i)).toBeInTheDocument();
    });
  });

  test('pause and resume functionality', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    // Advance through prepare to exercise
    advanceTime(2000);

    await waitFor(() => {
      expect(screen.getByText(/0:03/)).toBeInTheDocument();
    });

    const pauseButton = screen.getByLabelText(/pause/i);
    fireEvent.click(pauseButton);

    // Time should not advance when paused
    advanceTime(2000);
    expect(screen.getByText(/0:03/)).toBeInTheDocument();

    const resumeButton = screen.getByLabelText(/resume/i);
    fireEvent.click(resumeButton);

    advanceTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText(/0:02/)).toBeInTheDocument();
    });
  });

  test('reset functionality', async () => {
    render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    // Advance through prepare to exercise
    advanceTime(2000);

    await waitFor(() => {
      expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
    });

    advanceTime(1000);

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

  describe('Preparation Phase', () => {
    test('shows preparation phase after start', async () => {
      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText(/get ready!/i)).toBeInTheDocument();
        expect(screen.getByText(/0:02/)).toBeInTheDocument();
      });
    });

    test('transitions from prepare to exercise', async () => {
      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText(/get ready!/i)).toBeInTheDocument();
      });

      // Advance through prepare time
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
      });
    });

    test('counts down during prepare phase', async () => {
      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText(/0:02/)).toBeInTheDocument();
      });

      advanceTime(1000);

      await waitFor(() => {
        expect(screen.getByText(/0:01/)).toBeInTheDocument();
      });
    });

    test('can pause during prepare phase', async () => {
      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText(/get ready!/i)).toBeInTheDocument();
      });

      const pauseButton = screen.getByLabelText(/pause/i);
      fireEvent.click(pauseButton);

      // Time should not advance when paused
      advanceTime(2000);
      expect(screen.getByText(/0:02/)).toBeInTheDocument();
    });

    test('displays yellow background during prepare phase', async () => {
      const { container } = render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        const timerContainer = container.querySelector('.timer-container');
        expect(timerContainer).toHaveStyle({ backgroundColor: '#F59E0B' });
      });
    });

    test('plays double bell when exercise starts after prepare', async () => {
      // Mock HTMLAudioElement
      const mockPlay = jest.fn().mockResolvedValue(undefined);
      const audioInstances: any[] = [];

      (window as any).Audio = jest.fn((src: string) => {
        const mockAudio = {
          play: mockPlay,
          pause: jest.fn(),
          volume: 0,
          currentTime: 0,
          preload: '',
          src: src,
        };
        audioInstances.push(mockAudio);
        return mockAudio;
      });

      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Clear any previous calls
      mockPlay.mockClear();

      // Advance through prepare time to trigger exercise
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
      });

      // Verify bell sound was played (double bell = bell_twice.mp3)
      expect(mockPlay).toHaveBeenCalled();
    });
  });

  describe('Bell Sound', () => {
    let mockPlay: jest.Mock;
    let audioInstances: any[];

    beforeEach(() => {
      // Mock HTMLAudioElement
      mockPlay = jest.fn().mockResolvedValue(undefined);
      audioInstances = [];

      // Mock Audio constructor to track all instances
      (window as any).Audio = jest.fn(() => {
        const mockAudio = {
          play: mockPlay,
          pause: jest.fn(),
          volume: 0,
          currentTime: 0,
        };
        audioInstances.push(mockAudio);
        return mockAudio;
      });
    });

    test('plays bell sound when exercise phase completes', async () => {
      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare time
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
      });

      // Clear previous calls (from prepare to exercise transition)
      jest.clearAllMocks();

      // Advance through exercise time to trigger bell
      advanceTime(3000);

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

      // Advance through prepare time
      advanceTime(2000);

      // Advance through exercise time
      advanceTime(3000);

      await waitFor(() => {
        expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
      });

      // Clear previous calls
      jest.clearAllMocks();

      // Advance through rest time to trigger bell
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/exercise - round 2\/2/i)).toBeInTheDocument();
      });

      // Verify bell sound was played once (rest to exercise transition)
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    test('plays bell sound when workout completes', async () => {
      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare time
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
      });

      // Complete all rounds
      advanceTime(3000); // Round 1 exercise
      
      await waitFor(() => {
        expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
      });

      advanceTime(2000); // Round 1 rest

      await waitFor(() => {
        expect(screen.getByText(/exercise - round 2\/2/i)).toBeInTheDocument();
      });

      // Clear previous calls
      jest.clearAllMocks();

      advanceTime(3000); // Round 2 exercise (final)

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

      // Advance through prepare time
      advanceTime(2000);

      // Advance through exercise time
      advanceTime(3000);

      await waitFor(() => {
        expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
      });

      // App should continue working despite audio error
      expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
      // With new implementation, errors in Audio constructor are caught on initialization
      expect(consoleWarnSpy).toHaveBeenCalledWith('Audio initialization failed:', expect.any(Error));

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Wake Lock', () => {
    let mockWakeLockRequest: jest.Mock;
    let mockWakeLockRelease: jest.Mock;
    let mockWakeLockSentinel: any;

    beforeEach(() => {
      mockWakeLockRelease = jest.fn().mockResolvedValue(undefined);
      mockWakeLockSentinel = {
        released: false,
        type: 'screen',
        release: mockWakeLockRelease,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
      mockWakeLockRequest = jest.fn().mockResolvedValue(mockWakeLockSentinel);
      (navigator as any).wakeLock = { request: mockWakeLockRequest };
    });

    afterEach(() => {
      delete (navigator as any).wakeLock;
    });

    test('requests wake lock during exercise phase', async () => {
      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare time
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
      });

      // Wait for wake lock to be requested
      await waitFor(() => {
        expect(mockWakeLockRequest).toHaveBeenCalledWith('screen');
      });
    });

    test('releases wake lock during rest phase', async () => {
      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare time
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
      });

      // Advance through exercise time to rest
      advanceTime(3000);

      await waitFor(() => {
        expect(screen.getByText(/rest - round 1\/2/i)).toBeInTheDocument();
      });

      // Wake lock should be released during rest
      await waitFor(() => {
        expect(mockWakeLockRelease).toHaveBeenCalled();
      });
    });

    test('releases wake lock when paused during exercise', async () => {
      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare time
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
      });

      // Wait for wake lock to be requested
      await waitFor(() => {
        expect(mockWakeLockRequest).toHaveBeenCalledWith('screen');
      });

      // Pause the timer
      const pauseButton = screen.getByLabelText(/pause/i);
      fireEvent.click(pauseButton);

      // Wake lock should be released when paused
      await waitFor(() => {
        expect(mockWakeLockRelease).toHaveBeenCalled();
      });
    });

    test('requests wake lock again when resuming exercise', async () => {
      render(<Timer settings={mockSettings} onRunningChange={mockOnRunningChange} />);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare time
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/exercise - round 1\/2/i)).toBeInTheDocument();
      });

      // Pause the timer
      const pauseButton = screen.getByLabelText(/pause/i);
      fireEvent.click(pauseButton);

      await waitFor(() => {
        expect(mockWakeLockRelease).toHaveBeenCalled();
      });

      // Clear mock to track new calls
      jest.clearAllMocks();
      mockWakeLockRequest.mockResolvedValue(mockWakeLockSentinel);

      // Resume the timer
      const resumeButton = screen.getByLabelText(/resume/i);
      fireEvent.click(resumeButton);

      // Wake lock should be requested again
      await waitFor(() => {
        expect(mockWakeLockRequest).toHaveBeenCalledWith('screen');
      });
    });
  });
});
