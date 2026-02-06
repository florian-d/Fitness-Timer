import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const Timer: React.FC<TimerProps> = ({ settings, onRunningChange }) => {
  const [phase, setPhase] = useState<Phase>('ready');
  const [currentRound, setCurrentRound] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(settings.exerciseTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);

  // Keep screen awake during exercise phase only
  useWakeLock(phase === 'exercise' && isRunning);

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
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const unlockAudio = useCallback(() => {
    if (!audioRef.current || audioUnlockedRef.current) {
      return;
    }
    audioRef.current
      .play()
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
  }, []);

  const playSingleBell = useCallback(() => {
    if (!audioRef.current) {
      return;
    }
    try {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.warn('Audio playback failed:', error);
      });
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
    switch (phase) {
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
    switch (phase) {
      case 'ready':
        return 'READY?';
      case 'exercise':
        return `EXERCISE - Round ${currentRound}/${settings.rounds}`;
      case 'rest':
        return `REST - Round ${currentRound}/${settings.rounds}`;
      case 'complete':
        return 'COMPLETE!';
      default:
        return '';
    }
  };

  const nextPhase = useCallback(() => {
    // Play one bell sound on every transition
    playBellSound(1);
    
    if (phase === 'ready') {
      setPhase('exercise');
      setTimeRemaining(settings.exerciseTime);
      setCurrentRound(1);
    } else if (phase === 'exercise') {
      if (currentRound < settings.rounds) {
        setPhase('rest');
        setTimeRemaining(settings.restTime);
      } else {
        setPhase('complete');
        setIsRunning(false);
        onRunningChange(false);
      }
    } else if (phase === 'rest') {
      setPhase('exercise');
      setTimeRemaining(settings.exerciseTime);
      setCurrentRound(prev => prev + 1);
    }
  }, [phase, currentRound, settings, onRunningChange, playBellSound]);

  useEffect(() => {
    if (isRunning && phase !== 'ready' && phase !== 'complete') {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            nextPhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, phase, nextPhase]);

  useEffect(() => {
    onRunningChange(isRunning && phase !== 'complete');
  }, [isRunning, phase, onRunningChange]);

  const handleStartPause = () => {
    unlockAudio();
    if (phase === 'ready') {
      setIsRunning(true);
      nextPhase();
    } else if (phase === 'complete') {
      setPhase('ready');
      setCurrentRound(1);
      setTimeRemaining(settings.exerciseTime);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase('ready');
    setCurrentRound(1);
    setTimeRemaining(settings.exerciseTime);
    onRunningChange(false);
  };

  return (
    <div className="timer-container" style={{ backgroundColor: getPhaseColor() }}>
      <div className="timer-content">
        <div className="phase-text">{getPhaseText()}</div>
        <div className="timer-display">
          {phase === 'ready' ? 'TAP TO START' : formatTime(timeRemaining)}
        </div>
        <div className="controls">
          <button 
            className="control-button start-pause-button" 
            onClick={handleStartPause}
            aria-label={phase === 'ready' ? 'Start' : isRunning ? 'Pause' : 'Resume'}
          >
            {phase === 'ready' || phase === 'complete' ? '▶' : isRunning ? '⏸' : '▶'}
          </button>
          {phase !== 'ready' && phase !== 'complete' && (
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
