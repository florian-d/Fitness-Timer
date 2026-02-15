import React, { useEffect, useCallback, useRef, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutSettings, WorkoutPreset } from '../App';
import { useWakeLock } from '../hooks/useWakeLock';
import { trackEvent } from '../utils/analytics';
import { PlayIcon, PauseIcon, ResetIcon } from '../utils/icons';
import './Timer.css';

interface TimerProps {
  settings: WorkoutSettings;
  activePresetName: string;
  presets: WorkoutPreset[];
  activePresetId: string;
  onRunningChange: (isRunning: boolean) => void;
  onPresetChange: (presetId: string) => void;
}

type Phase = 'ready' | 'prepare' | 'exercise' | 'rest' | 'complete';

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

const Timer: React.FC<TimerProps> = ({
  settings,
  activePresetName,
  presets,
  activePresetId,
  onRunningChange,
  onPresetChange
}) => {
  const { t } = useTranslation();

  const reducer = (currentState: TimerState, event: TimerEvent): TimerState => {
    switch (event.type) {
      case 'START':
        if (currentState.phase === 'ready') {
          return {
            phase: 'prepare',
            currentRound: 1,
            timeRemaining: settings.prepTime,
            isRunning: true,
          };
        }
        if (currentState.phase === 'complete') {
          return {
            phase: 'ready',
            currentRound: 1,
            timeRemaining: settings.prepTime,
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
          timeRemaining: settings.prepTime,
          isRunning: false,
        };
      case 'SYNC_SETTINGS':
        if (currentState.phase === 'ready' || currentState.phase === 'complete') {
          return {
            ...currentState,
            currentRound: 1,
            timeRemaining: settings.prepTime,
          };
        }
        return currentState;
      case 'TICK':
        if (!currentState.isRunning || (currentState.phase !== 'prepare' && currentState.phase !== 'exercise' && currentState.phase !== 'rest')) {
          return currentState;
        }
        if (currentState.timeRemaining > 1) {
          return { ...currentState, timeRemaining: currentState.timeRemaining - 1 };
        }
        if (currentState.phase === 'prepare') {
          return {
            ...currentState,
            phase: 'exercise',
            timeRemaining: settings.exerciseTime,
          };
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
    timeRemaining: settings.prepTime,
    isRunning: false,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const doubleBellAudioRef = useRef<HTMLAudioElement | null>(null);
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
      doubleBellAudioRef.current = new Audio('/bell_twice.mp3');
      doubleBellAudioRef.current.preload = 'auto';
      doubleBellAudioRef.current.volume = 0.3;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      audioRef.current = null;
      doubleBellAudioRef.current = null;
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
      if (doubleBellAudioRef.current) {
        try {
          if (typeof doubleBellAudioRef.current.pause === 'function') {
            doubleBellAudioRef.current.pause();
          }
        } catch (error) {
          console.warn('Audio cleanup failed:', error);
        }
        doubleBellAudioRef.current = null;
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

  const playAudio = useCallback((audioElement: HTMLAudioElement | null) => {
    if (!audioElement) {
      return;
    }
    try {
      if (typeof audioElement.play !== 'function') {
        return;
      }
      if (typeof audioElement.pause === 'function') {
        audioElement.pause();
      }
      audioElement.currentTime = 0;
      const playResult = audioElement.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch((error) => {
          console.warn('Audio playback failed:', error);
        });
      }
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, []);

  const playSingleBell = useCallback(() => {
    playAudio(audioRef.current);
  }, [playAudio]);

  const playDoubleBell = useCallback(() => {
    playAudio(doubleBellAudioRef.current);
  }, [playAudio]);

  const getPhaseColor = (): string => {
    switch (state.phase) {
      case 'prepare':
        return '#F59E0B'; // Yellow
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
        return t('timer.ready');
      case 'prepare':
        return t('timer.prepare');
      case 'exercise':
        return t('timer.exercise', { current: state.currentRound, total: settings.rounds });
      case 'rest':
        return t('timer.rest', { current: state.currentRound, total: settings.rounds });
      case 'complete':
        return t('timer.complete');
      default:
        return '';
    }
  };

  useEffect(() => {
    if (previousPhaseRef.current && previousPhaseRef.current !== state.phase && state.phase !== 'ready') {
      // Play double bell when transitioning to exercise (from prepare or rest)
      if (state.phase === 'exercise') {
        playDoubleBell();
      } else {
        playSingleBell();
      }

      // Track workout events in Matomo
      if (previousPhaseRef.current === 'ready' && state.phase === 'prepare') {
        trackEvent('Workout', 'Started', `${settings.rounds} rounds`);
      }
      if (state.phase === 'complete') {
        trackEvent('Workout', 'Completed', `${settings.rounds} rounds`);
      }
    }
    previousPhaseRef.current = state.phase;
  }, [state.phase, playSingleBell, playDoubleBell, settings.rounds]);

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
  }, [settings.exerciseTime, settings.restTime, settings.rounds, settings.prepTime]);

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
        {/* Preset: dropdown before training, read-only label during training */}
        {state.phase === 'ready' && presets.length > 1 ? (
          <div className="preset-selector">
            <select
              id="preset-select"
              value={activePresetId}
              onChange={(e) => onPresetChange(e.target.value)}
              className="preset-dropdown"
            >
              {presets.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="preset-label">{activePresetName}</div>
        )}

        <div className="phase-text">{getPhaseText()}</div>
        <div className="timer-display">
          {state.phase === 'ready' ? t('timer.tapToStart') : formatTime(state.timeRemaining)}
        </div>
        <div className="controls">
          <button
            className="control-button start-pause-button"
            onClick={handleStartPause}
            aria-label={state.phase === 'ready' ? 'Start' : state.isRunning ? 'Pause' : 'Resume'}
          >
            {state.phase === 'ready' || state.phase === 'complete' ? <PlayIcon /> : state.isRunning ? <PauseIcon /> : <PlayIcon />}
          </button>
          {state.phase !== 'ready' && state.phase !== 'complete' && (
            <button
              className="control-button reset-button"
              onClick={handleReset}
              aria-label="Reset"
            >
              <ResetIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timer;
