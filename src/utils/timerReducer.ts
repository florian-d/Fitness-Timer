import { WorkoutSettings } from '../App';

export enum Phase {
  Ready = 'ready',
  Prepare = 'prepare',
  Exercise = 'exercise',
  Rest = 'rest',
  Complete = 'complete',
}

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
  phase: Phase.Ready,
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
      if (currentState.phase === Phase.Ready) {
        return {
          phase: Phase.Prepare,
          currentRound: 1,
          timeRemaining: settings.prepTime,
          isRunning: true,
        };
      }
      if (currentState.phase === Phase.Complete) {
        return {
          phase: Phase.Ready,
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
        currentState.phase === Phase.Ready ||
        currentState.phase === Phase.Complete
      ) {
        return currentState;
      }
      return { ...currentState, isRunning: true };

    case 'RESET':
      return {
        phase: Phase.Ready,
        currentRound: 1,
        timeRemaining: settings.prepTime,
        isRunning: false,
      };

    case 'SYNC_SETTINGS':
      if (currentState.phase === Phase.Ready || currentState.phase === Phase.Complete) {
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
        (currentState.phase !== Phase.Prepare &&
          currentState.phase !== Phase.Exercise &&
          currentState.phase !== Phase.Rest)
      ) {
        return currentState;
      }

      if (currentState.timeRemaining > 1) {
        return { ...currentState, timeRemaining: currentState.timeRemaining - 1 };
      }

      if (currentState.phase === Phase.Prepare) {
        return {
          ...currentState,
          phase: Phase.Exercise,
          timeRemaining: settings.exerciseTime,
        };
      }

      if (currentState.phase === Phase.Exercise) {
        if (currentState.currentRound < settings.rounds) {
          return {
            ...currentState,
            phase: Phase.Rest,
            timeRemaining: settings.restTime,
          };
        }
        return {
          ...currentState,
          phase: Phase.Complete,
          timeRemaining: 0,
          isRunning: false,
        };
      }

      // phase === Phase.Rest
      return {
        ...currentState,
        phase: Phase.Exercise,
        currentRound: currentState.currentRound + 1,
        timeRemaining: settings.exerciseTime,
      };

    default:
      return currentState;
  }
};
