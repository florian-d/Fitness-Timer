import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WorkoutSettings } from '../App';
import './Timer.css';

interface TimerProps {
  settings: WorkoutSettings;
  onRunningChange: (isRunning: boolean) => void;
}

type Phase = 'ready' | 'exercise' | 'rest' | 'complete';

const Timer: React.FC<TimerProps> = ({ settings, onRunningChange }) => {
  const [phase, setPhase] = useState<Phase>('ready');
  const [currentRound, setCurrentRound] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(settings.exerciseTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playBellSound = useCallback((times: number = 1) => {
    try {
      // Initialize audio element lazily (only when needed)
      if (!audioRef.current) {
        audioRef.current = new Audio('/bell.mp3');
        audioRef.current.volume = 0.3;
      }
      
      // Play bell sound the specified number of times
      const playSound = (count: number) => {
        if (count === 0) return;
        
        audioRef.current!.currentTime = 0;
        audioRef.current!.play()
          .then(() => {
            // Wait for the sound to finish before playing again
            if (count > 1) {
              setTimeout(() => playSound(count - 1), 300);
            }
          })
          .catch((error) => {
            console.warn('Audio playback failed:', error);
          });
      };
      
      playSound(times);
    } catch (error) {
      console.warn('Audio playback not supported:', error);
    }
  }, []);

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
    // Determine if transitioning from rest to exercise
    const isRestToExercise = phase === 'rest';
    
    // Play bell sound when transitioning (timer reached zero)
    // Play twice for rest to exercise, once for other transitions
    playBellSound(isRestToExercise ? 2 : 1);
    
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
