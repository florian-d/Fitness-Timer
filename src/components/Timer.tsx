import React, { useEffect, useCallback, useRef, useReducer } from 'react';
import { WorkoutSettings } from '../App';
import { useWakeLock } from '../hooks/useWakeLock';
import './Timer.css';

interface TimerProps {
  settings: WorkoutSettings;
  onRunningChange: (isRunning: boolean) => void;
}

type Phase = 'ready' | 'exercise' | 'rest' | 'complete';

// Delay in milliseconds between consecutive bell sounds
const BELL_SOUND_DELAY_MS = 300;

type TimerState = {
  phase: Phase;
  currentRound: number;
  timeRemaining: number;
  isRunning: boolean;
};

type TimerEvent =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'TICK' }
  | { type: 'SYNC_SETTINGS' };

const Timer: React.FC<TimerProps> = ({ settings, onRunningChange }) => {
  const reducer = (currentState: TimerState, event: TimerEvent): TimerState => {
    switch (event.type) {
      case 'START':
        if (currentState.phase === 'ready') {
          return {
            phase: 'exercise',
            currentRound: 1,
            timeRemaining: settings.exerciseTime,
            isRunning: true,
          };
        }
        if (currentState.phase === 'complete') {
          return {
            phase: 'ready',
            currentRound: 1,
            timeRemaining: settings.exerciseTime,
            isRunning: false,
          };
        }
        return currentState;
      case 'PAUSE':
        if (!currentState.isRunning) {
          return currentState;
        }
        return { ...currentState, isRunning: false };
      case 'RESUME':
        if (currentState.isRunning || currentState.phase === 'ready' || currentState.phase === 'complete') {
          return currentState;
        }
        return { ...currentState, isRunning: true };
      case 'RESET':
        return {
          phase: 'ready',
          currentRound: 1,
          timeRemaining: settings.exerciseTime,
          isRunning: false,
        };
      case 'SYNC_SETTINGS':
        if (currentState.phase === 'ready' || currentState.phase === 'complete') {
          return {
            ...currentState,
            currentRound: 1,
            timeRemaining: settings.exerciseTime,
          };
        }
        return currentState;
      case 'TICK':
        if (!currentState.isRunning || (currentState.phase !== 'exercise' && currentState.phase !== 'rest')) {
          return currentState;
        }
        if (currentState.timeRemaining > 1) {
          return { ...currentState, timeRemaining: currentState.timeRemaining - 1 };
        }
        if (currentState.phase === 'exercise') {
          if (currentState.currentRound < settings.rounds) {
            return {
              ...currentState,
              phase: 'rest',
              timeRemaining: settings.restTime,
            };
          }
          return {
            ...currentState,
            phase: 'complete',
            timeRemaining: 0,
            isRunning: false,
          };
        }
        return {
          ...currentState,
          phase: 'exercise',
          currentRound: currentState.currentRound + 1,
          timeRemaining: settings.exerciseTime,
        };
      default:
        return currentState;
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    phase: 'ready',
    currentRound: 1,
    timeRemaining: settings.exerciseTime,
    isRunning: false,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);
  const previousPhaseRef = useRef<Phase | null>(null);

  // Keep screen awake during exercise phase only
  useWakeLock(state.phase === 'exercise' && state.isRunning);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    try {
      audioRef.current = new Audio('/bell.mp3');
      audioRef.current.preload = 'auto';
      audioRef.current.volume = 0.3;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      audioRef.current = null;
    }

    return () => {
      if (audioRef.current) {
        try {
          if (typeof audioRef.current.pause === 'function') {
            audioRef.current.pause();
          }
        } catch (error) {
          console.warn('Audio cleanup failed:', error);
        }
        audioRef.current = null;
      }
    };
  }, []);

  const unlockAudio = useCallback(() => {
    if (!audioRef.current || audioUnlockedRef.current) {
      return;
    }
    try {
      const playResult = audioRef.current.play();
      if (playResult && typeof playResult.then === 'function') {
        playResult
          .then(() => {
            if (!audioRef.current) {
              return;
            }
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioUnlockedRef.current = true;
          })
          .catch(() => {
            // Ignore unlock errors; iOS may block until a user gesture is detected
          });
      }
    } catch (error) {
      // Ignore unlock errors; browsers may block without a user gesture
    }
  }, []);

  const playSingleBell = useCallback(() => {
    if (!audioRef.current) {
      return;
    }
    try {
      if (typeof audioRef.current.play !== 'function') {
        return;
      }
      if (typeof audioRef.current.pause === 'function') {
        audioRef.current.pause();
      }
      audioRef.current.currentTime = 0;
      const playResult = audioRef.current.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch((error) => {
          console.warn('Audio playback failed:', error);
        });
      }
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, []);

  const playBellSound = useCallback((times: number = 1) => {
    try {
      // Play bell sound the specified number of times
      for (let i = 0; i < times; i++) {
        setTimeout(() => {
          playSingleBell();
        }, i * BELL_SOUND_DELAY_MS);
      }
    } catch (error) {
      console.warn('Audio playback not supported:', error);
    }
  }, [playSingleBell]);

  const getPhaseColor = (): string => {
    switch (state.phase) {
      case 'exercise':
        return '#EF4444'; // Red
      case 'rest':
        return '#10B981'; // Green
      case 'complete':
        return '#3B82F6'; // Blue
      default:
        return '#6B7280'; // Gray
    }
  };

  const getPhaseText = (): string => {
    switch (state.phase) {
      case 'ready':
        return 'READY?';
      case 'exercise':
        return `EXERCISE - Round ${state.currentRound}/${settings.rounds}`;
      case 'rest':
        return `REST - Round ${state.currentRound}/${settings.rounds}`;
      case 'complete':
        return 'COMPLETE!';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (previousPhaseRef.current && previousPhaseRef.current !== state.phase && state.phase !== 'ready') {
      playBellSound(1);
    }
    previousPhaseRef.current = state.phase;
  }, [state.phase, playBellSound]);

  useEffect(() => {
    if (state.isRunning && state.phase !== 'ready' && state.phase !== 'complete') {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.phase]);

  useEffect(() => {
    onRunningChange(state.isRunning && state.phase !== 'complete');
  }, [state.isRunning, state.phase, onRunningChange]);

  useEffect(() => {
    dispatch({ type: 'SYNC_SETTINGS' });
  }, [settings.exerciseTime, settings.restTime, settings.rounds]);

  const handleStartPause = () => {
    unlockAudio();
    if (state.phase === 'ready' || state.phase === 'complete') {
      dispatch({ type: 'START' });
      return;
    }
    if (state.isRunning) {
      dispatch({ type: 'PAUSE' });
    } else {
      dispatch({ type: 'RESUME' });
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <div className="timer-container" style={{ backgroundColor: getPhaseColor() }}>
      <div className="timer-content">
        <div className="phase-text">{getPhaseText()}</div>
        <div className="timer-display">
          {state.phase === 'ready' ? 'TAP TO START' : formatTime(state.timeRemaining)}
        </div>
        <div className="controls">
          <button 
            className="control-button start-pause-button" 
            onClick={handleStartPause}
            aria-label={state.phase === 'ready' ? 'Start' : state.isRunning ? 'Pause' : 'Resume'}
          >
            {state.phase === 'ready' || state.phase === 'complete' ? '▶' : state.isRunning ? '⏸' : '▶'}
          </button>
          {state.phase !== 'ready' && state.phase !== 'complete' && (
            <button 
              className="control-button reset-button" 
              onClick={handleReset}
              aria-label="Reset"
            >
              ⟲
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timer;
