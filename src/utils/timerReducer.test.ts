import { timerReducer, getInitialTimerState, Phase, TimerState } from './timerReducer';
import { WorkoutSettings } from '../App';

describe('timerReducer', () => {
  const mockSettings: WorkoutSettings = {
    rounds: 3,
    exerciseTime: 30,
    restTime: 10,
    prepTime: 5,
  };

  describe('getInitialTimerState', () => {
    test('returns correct initial state', () => {
      const state = getInitialTimerState(mockSettings.prepTime);
      expect(state).toEqual({
        phase: 'ready',
        currentRound: 1,
        timeRemaining: 5,
        isRunning: false,
      });
    });
  });

  describe('START action', () => {
    test('starts timer from ready state', () => {
      const state = getInitialTimerState(mockSettings.prepTime);
      const newState = timerReducer(state, { type: 'START' }, mockSettings);
      expect(newState.phase).toBe('prepare');
      expect(newState.isRunning).toBe(true);
      expect(newState.timeRemaining).toBe(mockSettings.prepTime);
    });

    test('resets timer from complete state', () => {
      const state: TimerState = {
        phase: 'complete',
        currentRound: 3,
        timeRemaining: 0,
        isRunning: false,
      };
      const newState = timerReducer(state, { type: 'START' }, mockSettings);
      expect(newState.phase).toBe('ready');
      expect(newState.isRunning).toBe(false);
      expect(newState.currentRound).toBe(1);
    });
  });

  describe('PAUSE action', () => {
    test('pauses running timer', () => {
      const state: TimerState = {
        phase: 'exercise',
        currentRound: 1,
        timeRemaining: 25,
        isRunning: true,
      };
      const newState = timerReducer(state, { type: 'PAUSE' }, mockSettings);
      expect(newState.isRunning).toBe(false);
      expect(newState.phase).toBe('exercise');
    });

    test('does nothing if already paused', () => {
      const state: TimerState = {
        phase: 'exercise',
        currentRound: 1,
        timeRemaining: 25,
        isRunning: false,
      };
      const newState = timerReducer(state, { type: 'PAUSE' }, mockSettings);
      expect(newState).toEqual(state);
    });
  });

  describe('RESUME action', () => {
    test('resumes paused timer', () => {
      const state: TimerState = {
        phase: 'exercise',
        currentRound: 1,
        timeRemaining: 20,
        isRunning: false,
      };
      const newState = timerReducer(state, { type: 'RESUME' }, mockSettings);
      expect(newState.isRunning).toBe(true);
    });

    test('does not resume if already running', () => {
      const state: TimerState = {
        phase: 'exercise',
        currentRound: 1,
        timeRemaining: 20,
        isRunning: true,
      };
      const newState = timerReducer(state, { type: 'RESUME' }, mockSettings);
      expect(newState).toEqual(state);
    });
  });

  describe('RESET action', () => {
    test('resets to ready state', () => {
      const state: TimerState = {
        phase: 'exercise',
        currentRound: 2,
        timeRemaining: 15,
        isRunning: true,
      };
      const newState = timerReducer(state, { type: 'RESET' }, mockSettings);
      expect(newState.phase).toBe('ready');
      expect(newState.currentRound).toBe(1);
      expect(newState.isRunning).toBe(false);
      expect(newState.timeRemaining).toBe(mockSettings.prepTime);
    });
  });

  describe('TICK action', () => {
    test('decrements time remaining', () => {
      const state: TimerState = {
        phase: 'exercise',
        currentRound: 1,
        timeRemaining: 30,
        isRunning: true,
      };
      const newState = timerReducer(state, { type: 'TICK' }, mockSettings);
      expect(newState.timeRemaining).toBe(29);
    });

    test('transitions from prepare to exercise', () => {
      const state: TimerState = {
        phase: 'prepare',
        currentRound: 1,
        timeRemaining: 1,
        isRunning: true,
      };
      const newState = timerReducer(state, { type: 'TICK' }, mockSettings);
      expect(newState.phase).toBe('exercise');
      expect(newState.timeRemaining).toBe(mockSettings.exerciseTime);
    });

    test('transitions from exercise to rest', () => {
      const state: TimerState = {
        phase: 'exercise',
        currentRound: 1,
        timeRemaining: 1,
        isRunning: true,
      };
      const newState = timerReducer(state, { type: 'TICK' }, mockSettings);
      expect(newState.phase).toBe('rest');
      expect(newState.timeRemaining).toBe(mockSettings.restTime);
    });

    test('transitions from rest to exercise on next round', () => {
      const state: TimerState = {
        phase: 'rest',
        currentRound: 1,
        timeRemaining: 1,
        isRunning: true,
      };
      const newState = timerReducer(state, { type: 'TICK' }, mockSettings);
      expect(newState.phase).toBe('exercise');
      expect(newState.currentRound).toBe(2);
    });

    test('completes workout after last round', () => {
      const state: TimerState = {
        phase: 'exercise',
        currentRound: 3,
        timeRemaining: 1,
        isRunning: true,
      };
      const newState = timerReducer(state, { type: 'TICK' }, mockSettings);
      expect(newState.phase).toBe('complete');
      expect(newState.isRunning).toBe(false);
    });

    test('does not tick if not running', () => {
      const state: TimerState = {
        phase: 'exercise',
        currentRound: 1,
        timeRemaining: 25,
        isRunning: false,
      };
      const newState = timerReducer(state, { type: 'TICK' }, mockSettings);
      expect(newState).toEqual(state);
    });
  });

  describe('SYNC_SETTINGS action', () => {
    test('updates timeRemaining for ready state', () => {
      const state: TimerState = {
        phase: 'ready',
        currentRound: 1,
        timeRemaining: 10,
        isRunning: false,
      };
      const newSettings = { ...mockSettings, prepTime: 15 };
      const newState = timerReducer(state, { type: 'SYNC_SETTINGS' }, newSettings);
      expect(newState.timeRemaining).toBe(15);
    });

    test('does not sync settings if timer is running', () => {
      const state: TimerState = {
        phase: 'exercise',
        currentRound: 1,
        timeRemaining: 20,
        isRunning: true,
      };
      const newState = timerReducer(state, { type: 'SYNC_SETTINGS' }, mockSettings);
      expect(newState).toEqual(state);
    });
  });
});
