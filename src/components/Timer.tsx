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
  const audioContextRef = useRef<AudioContext | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playBellSound = useCallback(() => {
    try {
      // Initialize AudioContext lazily (only when needed)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      const currentTime = audioContext.currentTime;

      // Create oscillator for bell-like sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Bell sound: starts at a higher frequency and quickly decays
      oscillator.frequency.setValueAtTime(800, currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, currentTime + 0.1);

      // Volume envelope: quick attack, exponential decay
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.5);
    } catch (error) {
      // Silently fail if audio is not supported
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
    // Play bell sound when transitioning (timer reached zero)
    playBellSound();
    
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
