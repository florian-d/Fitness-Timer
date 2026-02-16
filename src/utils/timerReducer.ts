import { WorkoutSettings } from '../App';

export type Phase = 'ready' | 'prepare' | 'exercise' | 'rest' | 'complete';

export type TimerState = {
  phase: Phase;
  currentRound: number;
  timeRemaining: number;
  isRunning: boolean;
};

export type TimerEvent =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'TICK' }
  | { type: 'SYNC_SETTINGS' };

/**
 * Get initial timer state with given prep time
 */
export const getInitialTimerState = (prepTime: number): TimerState => ({
  phase: 'ready',
  currentRound: 1,
  timeRemaining: prepTime,
  isRunning: false,
});

/**
 * Timer state reducer - pure function for state transitions
 */
export const timerReducer = (
  currentState: TimerState,
  event: TimerEvent,
  settings: WorkoutSettings
): TimerState => {
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
      if (
        currentState.isRunning ||
        currentState.phase === 'ready' ||
        currentState.phase === 'complete'
      ) {
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
      if (
        !currentState.isRunning ||
        (currentState.phase !== 'prepare' &&
          currentState.phase !== 'exercise' &&
          currentState.phase !== 'rest')
      ) {
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

      // phase === 'rest'
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
