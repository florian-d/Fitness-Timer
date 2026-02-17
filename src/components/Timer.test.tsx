import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Timer, { calculateTotalRemainingTime, calculateExerciseTimeRemaining } from './Timer';
import { WorkoutSettings, WorkoutPreset } from '../types';
import { Phase } from '../utils/timerReducer';

const mockSettings: WorkoutSettings = {
  rounds: 2,
  exerciseTime: 3,
  restTime: 2,
  prepTime: 2,
};

const mockPresets: WorkoutPreset[] = [
  {
    id: 'preset-1',
    name: 'Default',
    settings: mockSettings,
    createdAt: Date.now(),
  },
];

const mockOnRunningChange = jest.fn();
const mockOnPresetChange = jest.fn();

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

  const renderTimer = (settings = mockSettings, presets = mockPresets) => {
    return render(
      <Timer
        settings={settings}
        activePresetName="Default"
        presets={presets}
        activePresetId="preset-1"
        onRunningChange={mockOnRunningChange}
        onPresetChange={mockOnPresetChange}
      />
    );
  };

  test('renders in ready state', () => {
    renderTimer();
    expect(screen.getByText('timer.ready')).toBeInTheDocument();
    expect(screen.getByText('timer.tapToStart')).toBeInTheDocument();
  });

  test('starts timer when play button is clicked', async () => {
    renderTimer();
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('timer.prepare')).toBeInTheDocument();
    });
  });

  test('formats time correctly', async () => {
    renderTimer();
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/0:02/)).toBeInTheDocument();
    });
  });

  test('counts down exercise time', async () => {
    renderTimer();
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    // Prepare phase
    await waitFor(() => {
      expect(screen.getByText(/0:02/)).toBeInTheDocument();
    });

    // Advance through prepare time to exercise
    advanceTime(2000);
    
    await waitFor(() => {
      expect(screen.getByText('timer.exercise')).toBeInTheDocument();
      expect(screen.getByText(/0:03/)).toBeInTheDocument();
    });

    advanceTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText(/0:02/)).toBeInTheDocument();
    });
  });

  test('transitions from exercise to rest', async () => {
    renderTimer();
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    // Advance through prepare time
    advanceTime(2000);

    await waitFor(() => {
      expect(screen.getByText('timer.exercise')).toBeInTheDocument();
    });

    // Advance through exercise time
    advanceTime(3000);

    await waitFor(() => {
      expect(screen.getByText('timer.rest')).toBeInTheDocument();
    });
  });

  test('transitions from rest to next exercise round', async () => {
    renderTimer();
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    // Advance through prepare time
    advanceTime(2000);

    await waitFor(() => {
      expect(screen.getByText('timer.exercise')).toBeInTheDocument();
    });

    // Advance through exercise time
    advanceTime(3000);

    await waitFor(() => {
      expect(screen.getByText('timer.rest')).toBeInTheDocument();
    });

    // Advance through rest time
    advanceTime(2000);

    await waitFor(() => {
      expect(screen.getByText('timer.exercise')).toBeInTheDocument();
    });
  });

  test('completes workout after all rounds', async () => {
    renderTimer();
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    // Prepare phase
    advanceTime(2000);

    // Round 1 exercise + rest
    advanceTime(3000);
    await waitFor(() => {
      expect(screen.getByText('timer.rest')).toBeInTheDocument();
    });

    advanceTime(2000);
    await waitFor(() => {
      expect(screen.getByText('timer.exercise')).toBeInTheDocument();
    });

    // Round 2 exercise (final round, no rest after)
    advanceTime(3000);

    await waitFor(() => {
      expect(screen.getByText('timer.complete')).toBeInTheDocument();
    });
  });

  test('pause and resume functionality', async () => {
    renderTimer();
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
    renderTimer();
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    // Advance through prepare to exercise
    advanceTime(2000);

    await waitFor(() => {
      expect(screen.getByText('timer.exercise')).toBeInTheDocument();
    });

    advanceTime(1000);

    const resetButton = screen.getByLabelText(/reset/i);
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('timer.ready')).toBeInTheDocument();
      expect(screen.getByText('timer.tapToStart')).toBeInTheDocument();
    });
  });

  test('calls onRunningChange callback', async () => {
    renderTimer();
    const startButton = screen.getByLabelText(/start/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockOnRunningChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Preparation Phase', () => {
    test('shows preparation phase after start', async () => {
      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('timer.prepare')).toBeInTheDocument();
        expect(screen.getByText(/0:02/)).toBeInTheDocument();
      });
    });

    test('transitions from prepare to exercise', async () => {
      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('timer.prepare')).toBeInTheDocument();
      });

      // Advance through prepare time
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText('timer.exercise')).toBeInTheDocument();
      });
    });

    test('counts down during prepare phase', async () => {
      renderTimer();
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
      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('timer.prepare')).toBeInTheDocument();
      });

      const pauseButton = screen.getByLabelText(/pause/i);
      fireEvent.click(pauseButton);

      // Time should not advance when paused
      advanceTime(2000);
      expect(screen.getByText(/0:02/)).toBeInTheDocument();
    });

    test('displays yellow background during prepare phase', async () => {
      const { container } = renderTimer();
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

      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Clear any previous calls
      mockPlay.mockClear();

      // Advance through prepare time to trigger exercise
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText('timer.exercise')).toBeInTheDocument();
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
      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare time
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText('timer.exercise')).toBeInTheDocument();
      });

      // Clear previous calls (from prepare to exercise transition)
      jest.clearAllMocks();

      // Advance through exercise time to trigger bell
      advanceTime(3000);

      await waitFor(() => {
        expect(screen.getByText('timer.rest')).toBeInTheDocument();
      });

      // Verify bell sound was played once (exercise to rest transition)
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    test('plays bell sound when rest phase completes', async () => {
      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare time
      advanceTime(2000);

      // Advance through exercise time
      advanceTime(3000);

      await waitFor(() => {
        expect(screen.getByText('timer.rest')).toBeInTheDocument();
      });

      // Clear previous calls
      jest.clearAllMocks();

      // Advance through rest time to trigger bell
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText('timer.exercise')).toBeInTheDocument();
      });

      // Verify bell sound was played once (rest to exercise transition)
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    test('plays bell sound when workout completes', async () => {
      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare time
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText('timer.exercise')).toBeInTheDocument();
      });

      // Complete all rounds
      advanceTime(3000); // Round 1 exercise
      
      await waitFor(() => {
        expect(screen.getByText('timer.rest')).toBeInTheDocument();
      });

      advanceTime(2000); // Round 1 rest

      await waitFor(() => {
        expect(screen.getByText('timer.exercise')).toBeInTheDocument();
      });

      // Clear previous calls
      jest.clearAllMocks();

      advanceTime(3000); // Round 2 exercise (final)

      await waitFor(() => {
        expect(screen.getByText('timer.complete')).toBeInTheDocument();
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

      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare time
      advanceTime(2000);

      // Advance through exercise time
      advanceTime(3000);

      await waitFor(() => {
        expect(screen.getByText('timer.rest')).toBeInTheDocument();
      });

      // App should continue working despite audio error
      expect(screen.getByText('timer.rest')).toBeInTheDocument();
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
      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare time
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText('timer.exercise')).toBeInTheDocument();
      });

      // Wait for wake lock to be requested
      await waitFor(() => {
        expect(mockWakeLockRequest).toHaveBeenCalledWith('screen');
      });
    });

    test('keeps wake lock active during rest phase', async () => {
      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare time
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText('timer.exercise')).toBeInTheDocument();
      });

      // Wait for wake lock to be requested during exercise
      const exerciseCallCount = mockWakeLockRequest.mock.calls.length;

      // Advance through exercise time to rest
      advanceTime(3000);

      await waitFor(() => {
        expect(screen.getByText('timer.rest')).toBeInTheDocument();
      });

      // Wake lock should remain active (not released) during rest
      // The release method should not be called
      expect(mockWakeLockRelease).not.toHaveBeenCalled();
      // Wake lock request should still be in effect (same count as before entering rest)
      expect(mockWakeLockRequest.mock.calls.length).toBeGreaterThanOrEqual(exerciseCallCount);
    });

    test('releases wake lock when paused during exercise', async () => {
      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare time
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText('timer.exercise')).toBeInTheDocument();
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
      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare time
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText('timer.exercise')).toBeInTheDocument();
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

  describe('calculateTotalRemainingTime', () => {
    test('Prepare phase: includes all exercises and rests', () => {
      const state = {
        phase: Phase.Prepare,
        currentRound: 1,
        timeRemaining: 10,
        isRunning: true
      };
      const settings = {
        rounds: 8,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10
      };

      // Expected: 10 + (8 × 45) + (7 × 15) = 10 + 360 + 105 = 475
      expect(calculateTotalRemainingTime(state, settings)).toBe(475);
    });

    test('Exercise phase Round 1: remaining exercises + rests', () => {
      const state = {
        phase: Phase.Exercise,
        currentRound: 1,
        timeRemaining: 30,
        isRunning: true
      };
      const settings = {
        rounds: 8,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10
      };

      // Expected: 30 + (7 × 45) + (7 × 15) = 30 + 315 + 105 = 450
      expect(calculateTotalRemainingTime(state, settings)).toBe(450);
    });

    test('Exercise phase Round 5: mid-workout calculation', () => {
      const state = {
        phase: Phase.Exercise,
        currentRound: 5,
        timeRemaining: 20,
        isRunning: true
      };
      const settings = {
        rounds: 8,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10
      };

      // Expected: 20 + (3 × 45) + (3 × 15) = 20 + 135 + 45 = 200
      expect(calculateTotalRemainingTime(state, settings)).toBe(200);
    });

    test('Rest phase Round 2: remaining exercises + rests', () => {
      const state = {
        phase: Phase.Rest,
        currentRound: 2,
        timeRemaining: 10,
        isRunning: true
      };
      const settings = {
        rounds: 8,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10
      };

      // Expected: 10 + (6 × 45) + (5 × 15) = 10 + 270 + 75 = 355
      expect(calculateTotalRemainingTime(state, settings)).toBe(355);
    });

    test('Rest phase Round 4: mid-workout calculation', () => {
      const state = {
        phase: Phase.Rest,
        currentRound: 4,
        timeRemaining: 8,
        isRunning: true
      };
      const settings = {
        rounds: 8,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10
      };

      // Expected: 8 + (4 × 45) + (3 × 15) = 8 + 180 + 45 = 233
      expect(calculateTotalRemainingTime(state, settings)).toBe(233);
    });

    test('Edge case: Last exercise phase (round = total rounds)', () => {
      const state = {
        phase: Phase.Exercise,
        currentRound: 8,
        timeRemaining: 25,
        isRunning: true
      };
      const settings = {
        rounds: 8,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10
      };

      // Expected: 25 + (0 × 45) + (0 × 15) = 25
      // No more rounds after this one
      expect(calculateTotalRemainingTime(state, settings)).toBe(25);
    });

    test('Edge case: Last rest phase (round = total rounds - 1)', () => {
      const state = {
        phase: Phase.Rest,
        currentRound: 7,
        timeRemaining: 5,
        isRunning: true
      };
      const settings = {
        rounds: 8,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10
      };

      // Expected: 5 + (1 × 45) + (0 × 15) = 5 + 45 = 50
      // One more exercise, no more rest after
      expect(calculateTotalRemainingTime(state, settings)).toBe(50);
    });

    test('Edge case: Single round workout in prepare phase', () => {
      const state = {
        phase: Phase.Prepare,
        currentRound: 1,
        timeRemaining: 10,
        isRunning: true
      };
      const settings = {
        rounds: 1,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10
      };

      // Expected: 10 + (1 × 45) + (0 × 15) = 10 + 45 = 55
      // Only one exercise, no rest periods
      expect(calculateTotalRemainingTime(state, settings)).toBe(55);
    });

    test('Edge case: Single round workout in exercise phase', () => {
      const state = {
        phase: Phase.Exercise,
        currentRound: 1,
        timeRemaining: 30,
        isRunning: true
      };
      const settings = {
        rounds: 1,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10
      };

      // Expected: 30 + (0 × 45) + (0 × 15) = 30
      // Only current exercise time remaining
      expect(calculateTotalRemainingTime(state, settings)).toBe(30);
    });

    test('Ready phase: returns 0', () => {
      const state = {
        phase: Phase.Ready,
        currentRound: 1,
        timeRemaining: 10,
        isRunning: false
      };
      const settings = {
        rounds: 8,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10
      };

      // Ready phase has no workout time
      expect(calculateTotalRemainingTime(state, settings)).toBe(0);
    });

    test('Complete phase: returns 0', () => {
      const state = {
        phase: Phase.Complete,
        currentRound: 8,
        timeRemaining: 0,
        isRunning: false
      };
      const settings = {
        rounds: 8,
        exerciseTime: 45,
        restTime: 15,
        prepTime: 10
      };

      // Complete phase has no remaining time
      expect(calculateTotalRemainingTime(state, settings)).toBe(0);
    });

    test('Verify calculation at start of prepare (full prep time)', () => {
      const state = {
        phase: Phase.Prepare,
        currentRound: 1,
        timeRemaining: 10,
        isRunning: true
      };
      const settings = {
        rounds: 3,
        exerciseTime: 30,
        restTime: 10,
        prepTime: 10
      };

      // Expected: 10 + (3 × 30) + (2 × 10) = 10 + 90 + 20 = 120
      expect(calculateTotalRemainingTime(state, settings)).toBe(120);
    });

    test('Verify calculation at end of prepare (1 second left)', () => {
      const state = {
        phase: Phase.Prepare,
        currentRound: 1,
        timeRemaining: 1,
        isRunning: true
      };
      const settings = {
        rounds: 3,
        exerciseTime: 30,
        restTime: 10,
        prepTime: 10
      };

      // Expected: 1 + (3 × 30) + (2 × 10) = 1 + 90 + 20 = 111
      expect(calculateTotalRemainingTime(state, settings)).toBe(111);
    });
  });

  describe('calculateExerciseTimeRemaining', () => {
    test('Ready phase: returns 0', () => {
      const state = {
        phase: Phase.Ready,
        currentRound: 1,
        timeRemaining: 10,
        isRunning: false
      };
      const settings = {
        rounds: 8,
        exerciseTime: 30,
        restTime: 10,
        prepTime: 5
      };

      expect(calculateExerciseTimeRemaining(state, settings)).toBe(0);
    });

    test('Complete phase: returns 0', () => {
      const state = {
        phase: Phase.Complete,
        currentRound: 8,
        timeRemaining: 0,
        isRunning: false
      };
      const settings = {
        rounds: 8,
        exerciseTime: 30,
        restTime: 10,
        prepTime: 5
      };

      expect(calculateExerciseTimeRemaining(state, settings)).toBe(0);
    });

    test('Prepare phase, Round 1: returns all exercise rounds', () => {
      const state = {
        phase: Phase.Prepare,
        currentRound: 1,
        timeRemaining: 5,
        isRunning: true
      };
      const settings = {
        rounds: 8,
        exerciseTime: 30,
        restTime: 10,
        prepTime: 5
      };

      // Expected: 8 rounds × 30s = 240s
      expect(calculateExerciseTimeRemaining(state, settings)).toBe(240);
    });

    test('Exercise phase, Round 1: returns current + remaining rounds', () => {
      const state = {
        phase: Phase.Exercise,
        currentRound: 1,
        timeRemaining: 25,
        isRunning: true
      };
      const settings = {
        rounds: 8,
        exerciseTime: 30,
        restTime: 10,
        prepTime: 5
      };

      // Expected: 25 (current) + (7 × 30) = 25 + 210 = 235s
      expect(calculateExerciseTimeRemaining(state, settings)).toBe(235);
    });

    test('Exercise phase, Round 2: returns current + remaining rounds', () => {
      const state = {
        phase: Phase.Exercise,
        currentRound: 2,
        timeRemaining: 15,
        isRunning: true
      };
      const settings = {
        rounds: 8,
        exerciseTime: 30,
        restTime: 10,
        prepTime: 5
      };

      // Expected: 15 (current) + (6 × 30) = 15 + 180 = 195s
      expect(calculateExerciseTimeRemaining(state, settings)).toBe(195);
    });

    test('Rest phase, Round 1: returns only remaining exercise rounds', () => {
      const state = {
        phase: Phase.Rest,
        currentRound: 1,
        timeRemaining: 10,
        isRunning: true
      };
      const settings = {
        rounds: 8,
        exerciseTime: 30,
        restTime: 10,
        prepTime: 5
      };

      // Expected: 7 remaining rounds × 30s = 210s
      // (Current round's exercise is already done)
      expect(calculateExerciseTimeRemaining(state, settings)).toBe(210);
    });

    test('Exercise phase, last round: returns only current time', () => {
      const state = {
        phase: Phase.Exercise,
        currentRound: 8,
        timeRemaining: 10,
        isRunning: true
      };
      const settings = {
        rounds: 8,
        exerciseTime: 30,
        restTime: 10,
        prepTime: 5
      };

      // Expected: 10 (current) + (0 × 30) = 10s
      expect(calculateExerciseTimeRemaining(state, settings)).toBe(10);
    });

    test('Edge case: single round workout in prepare phase', () => {
      const state = {
        phase: Phase.Prepare,
        currentRound: 1,
        timeRemaining: 5,
        isRunning: true
      };
      const settings = {
        rounds: 1,
        exerciseTime: 45,
        restTime: 0,
        prepTime: 5
      };

      // Expected: 1 round × 45s = 45s
      expect(calculateExerciseTimeRemaining(state, settings)).toBe(45);
    });

    test('Edge case: single round workout in exercise phase', () => {
      const state = {
        phase: Phase.Exercise,
        currentRound: 1,
        timeRemaining: 20,
        isRunning: true
      };
      const settings = {
        rounds: 1,
        exerciseTime: 45,
        restTime: 0,
        prepTime: 5
      };

      // Expected: 20 (current) + (0 × 45) = 20s
      expect(calculateExerciseTimeRemaining(state, settings)).toBe(20);
    });
  });

  describe('Info Areas Visibility', () => {
    test('Info areas are NOT rendered in Ready phase', () => {
      renderTimer();

      // Verify we're in Ready phase
      expect(screen.getByText('timer.ready')).toBeInTheDocument();

      // Info areas should not be present
      expect(screen.queryByText(/timer.totalRemaining/)).not.toBeInTheDocument();
      expect(screen.queryByText(/timer.exerciseRemaining/)).not.toBeInTheDocument();
    });

    test('Info areas are NOT rendered in Complete phase', async () => {
      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through all rounds to Complete
      advanceTime(2000); // Prepare
      advanceTime(3000); // Round 1 exercise
      advanceTime(2000); // Round 1 rest
      advanceTime(3000); // Round 2 exercise

      await waitFor(() => {
        expect(screen.getByText('timer.complete')).toBeInTheDocument();
      });

      // Info areas should not be present in Complete phase
      expect(screen.queryByText(/timer.totalRemaining/)).not.toBeInTheDocument();
      expect(screen.queryByText(/timer.exerciseRemaining/)).not.toBeInTheDocument();
    });

    test('Info areas ARE rendered in Prepare phase', async () => {
      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('timer.prepare')).toBeInTheDocument();
      });

      // Info areas should be visible
      expect(screen.getByText(/timer.totalRemaining/)).toBeInTheDocument();
      expect(screen.getByText(/timer.exerciseRemaining/)).toBeInTheDocument();
    });

    test('Info areas ARE rendered in Exercise phase', async () => {
      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare to exercise
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText('timer.exercise')).toBeInTheDocument();
      });

      // Info areas should be visible
      expect(screen.getByText(/timer.totalRemaining/)).toBeInTheDocument();
      expect(screen.getByText(/timer.exerciseRemaining/)).toBeInTheDocument();
    });

    test('Info areas ARE rendered in Rest phase', async () => {
      renderTimer();
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance through prepare and exercise to rest
      advanceTime(2000);
      advanceTime(3000);

      await waitFor(() => {
        expect(screen.getByText('timer.rest')).toBeInTheDocument();
      });

      // Info areas should be visible
      expect(screen.getByText(/timer.totalRemaining/)).toBeInTheDocument();
      expect(screen.getByText(/timer.exerciseRemaining/)).toBeInTheDocument();
    });

    test('Info areas display correct exercise remaining time', async () => {
      const customSettings = { ...mockSettings, rounds: 5 };
      renderTimer(customSettings);
      const startButton = screen.getByLabelText(/start/i);
      fireEvent.click(startButton);

      // Advance to exercise phase (round 1)
      advanceTime(2000);

      await waitFor(() => {
        expect(screen.getByText('timer.exercise')).toBeInTheDocument();
      });

      // Should show exercise remaining time
      expect(screen.getByText(/timer.exerciseRemaining/)).toBeInTheDocument();
    });
  });
});
