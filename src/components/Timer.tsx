import React, { useEffect, useCallback, useRef, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutSettings, WorkoutPreset } from '../App';
import { useWakeLock } from '../hooks/useWakeLock';
import { trackEvent } from '../utils/analytics';
import { timerReducer, getInitialTimerState, TimerState, TimerEvent, Phase } from '../utils/timerReducer';
import { PlayIcon, PauseIcon, ResetIcon } from '../utils/icons';
import { DEFAULT_PHASE_COLORS } from '../utils/constants';
import './Timer.css';

interface TimerProps {
  settings: WorkoutSettings;
  activePresetName: string;
  presets: WorkoutPreset[];
  activePresetId: string;
  onRunningChange: (isRunning: boolean) => void;
  onPresetChange: (presetId: string) => void;
}

/**
 * Calculate total remaining time for the workout
 * Includes current phase time + all future phases
 */
export const calculateTotalRemainingTime = (
  state: TimerState,
  settings: WorkoutSettings
): number => {
  let remaining = state.timeRemaining;

  switch (state.phase) {
    case Phase.Prepare:
      // Add all exercise rounds
      remaining += settings.rounds * settings.exerciseTime;
      // Add all rest periods (one less than rounds)
      remaining += (settings.rounds - 1) * settings.restTime;
      break;

    case Phase.Exercise:
      // Calculate remaining rounds after current one
      const remainingRoundsAfterCurrent = settings.rounds - state.currentRound;
      // Add remaining exercises (after this one)
      remaining += remainingRoundsAfterCurrent * settings.exerciseTime;
      // Add remaining rest periods (after this exercise)
      remaining += remainingRoundsAfterCurrent * settings.restTime;
      break;

    case Phase.Rest:
      // Calculate remaining rounds (including current rest)
      const remainingRoundsInRest = settings.rounds - state.currentRound;
      // Add remaining exercises
      remaining += remainingRoundsInRest * settings.exerciseTime;
      // Add remaining rest periods (one less than remaining exercises)
      remaining += (remainingRoundsInRest - 1) * settings.restTime;
      break;

    default:
      // Ready and Complete phases have no remaining time
      remaining = 0;
  }

  return remaining;
};

/**
 * Calculate remaining exercise time only (excluding rest periods)
 * Shows how much "work" time is left in the workout
 */
export const calculateExerciseTimeRemaining = (
  state: TimerState,
  settings: WorkoutSettings
): number => {
  const { phase, currentRound, timeRemaining } = state;
  const { rounds, exerciseTime } = settings;

  // In Ready or Complete phase, no exercise time remaining
  if (phase === Phase.Ready || phase === Phase.Complete) {
    return 0;
  }

  const remainingRounds = rounds - currentRound;

  if (phase === Phase.Prepare) {
    // All rounds including current round
    return (remainingRounds + 1) * exerciseTime;
  } else if (phase === Phase.Exercise) {
    // Current phase time + remaining rounds
    return timeRemaining + remainingRounds * exerciseTime;
  } else if (phase === Phase.Rest) {
    // Only remaining rounds (current round's exercise is done)
    return remainingRounds * exerciseTime;
  }

  return 0;
};

const Timer: React.FC<TimerProps> = ({
  settings,
  activePresetName,
  presets,
  activePresetId,
  onRunningChange,
  onPresetChange
}) => {
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(
    (s: TimerState, e: TimerEvent) => timerReducer(s, e, settings),
    getInitialTimerState(settings.prepTime)
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const doubleBellAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);
  const previousPhaseRef = useRef<Phase | null>(null);

  // Keep screen awake during exercise and rest phases
  useWakeLock((state.phase === Phase.Exercise || state.phase === Phase.Rest) && state.isRunning);

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
      case Phase.Ready:
        return settings.phaseColors.ready;
      case Phase.Prepare:
        return settings.phaseColors.prepare;
      case Phase.Exercise:
        return settings.phaseColors.exercise;
      case Phase.Rest:
        return settings.phaseColors.rest;
      case Phase.Complete:
        return DEFAULT_PHASE_COLORS.complete;
      default:
        return DEFAULT_PHASE_COLORS.ready;
    }
  };

  const getPhaseText = (): string => {
    switch (state.phase) {
      case Phase.Ready:
        return t('timer.ready');
      case Phase.Prepare:
        return t('timer.prepare');
      case Phase.Exercise:
        return t('timer.exercise', { current: state.currentRound, total: settings.rounds });
      case Phase.Rest:
        return t('timer.rest', { current: state.currentRound, total: settings.rounds });
      case Phase.Complete:
        return t('timer.complete');
      default:
        return '';
    }
  };

  useEffect(() => {
    if (previousPhaseRef.current && previousPhaseRef.current !== state.phase && state.phase !== Phase.Ready) {
      // Play double bell when transitioning to exercise (from prepare or rest)
      if (state.phase === Phase.Exercise) {
        playDoubleBell();
      } else {
        playSingleBell();
      }

      // Track workout events in Matomo
      if (previousPhaseRef.current === Phase.Ready && state.phase === Phase.Prepare) {
        trackEvent('Workout', 'Started', `${settings.rounds} rounds`);
      }
      if (state.phase === Phase.Complete) {
        trackEvent('Workout', 'Completed', `${settings.rounds} rounds`);
      }
    }
    previousPhaseRef.current = state.phase;
  }, [state.phase, playSingleBell, playDoubleBell, settings.rounds]);

  useEffect(() => {
    if (state.isRunning && state.phase !== Phase.Ready && state.phase !== Phase.Complete) {
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
    if (state.phase === Phase.Ready || state.phase === Phase.Complete) {
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
      {/* Info areas - visible only during training */}
      {(state.phase === Phase.Prepare ||
        state.phase === Phase.Exercise ||
        state.phase === Phase.Rest) && (
        <>
          <div className="info-top">
            {t('timer.totalRemaining', { time: formatTime(calculateTotalRemainingTime(state, settings)) })}
          </div>
          <div className="info-bottom">
            {t('timer.exerciseRemaining', { time: formatTime(calculateExerciseTimeRemaining(state, settings)) })}
          </div>
        </>
      )}

      <div className="timer-content">
        {/* Preset: dropdown before training, read-only label during training */}
        {state.phase === Phase.Ready && presets.length > 1 ? (
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
          {state.phase === Phase.Ready ? t('timer.tapToStart') : formatTime(state.timeRemaining)}
        </div>
        <div className="controls">
          <button
            className="control-button start-pause-button"
            onClick={handleStartPause}
            aria-label={state.phase === Phase.Ready ? 'Start' : state.isRunning ? 'Pause' : 'Resume'}
          >
            {state.phase === Phase.Ready || state.phase === Phase.Complete ? <PlayIcon /> : state.isRunning ? <PauseIcon /> : <PlayIcon />}
          </button>
          {state.phase !== Phase.Ready && state.phase !== Phase.Complete && (
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
