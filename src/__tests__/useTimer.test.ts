import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTimer } from '../composables/useTimer'

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should initialize with default config', () => {
    const timer = useTimer()
    
    expect(timer.config.value.rounds).toBe(8)
    expect(timer.config.value.exerciseDuration).toBe(20)
    expect(timer.config.value.restDuration).toBe(10)
    expect(timer.currentRound.value).toBe(1)
    expect(timer.currentPhase.value).toBe('exercise')
    expect(timer.isRunning.value).toBe(false)
  })

  it('should format time correctly', () => {
    const timer = useTimer()
    
    timer.timeRemaining.value = 80
    expect(timer.formattedTime.value).toBe('1:20')
    
    timer.timeRemaining.value = 15
    expect(timer.formattedTime.value).toBe('0:15')
    
    timer.timeRemaining.value = 0
    expect(timer.formattedTime.value).toBe('0:00')
  })

  it('should set background color based on phase', () => {
    const timer = useTimer()
    
    timer.currentPhase.value = 'exercise'
    expect(timer.backgroundColor.value).toBe('#ef4444')
    
    timer.currentPhase.value = 'rest'
    expect(timer.backgroundColor.value).toBe('#22c55e')
  })

  it('should start the timer', () => {
    const timer = useTimer()
    
    timer.start()
    expect(timer.isRunning.value).toBe(true)
    expect(timer.isPaused.value).toBe(false)
  })

  it('should pause the timer', () => {
    const timer = useTimer()
    
    timer.start()
    timer.pause()
    
    expect(timer.isRunning.value).toBe(false)
    expect(timer.isPaused.value).toBe(true)
  })

  it('should resume the timer', () => {
    const timer = useTimer()
    
    timer.start()
    timer.pause()
    timer.resume()
    
    expect(timer.isRunning.value).toBe(true)
    expect(timer.isPaused.value).toBe(false)
  })

  it('should reset the timer', () => {
    const timer = useTimer()
    
    timer.start()
    vi.advanceTimersByTime(5000) // Advance 5 seconds
    timer.reset()
    
    expect(timer.isRunning.value).toBe(false)
    expect(timer.currentRound.value).toBe(1)
    expect(timer.currentPhase.value).toBe('exercise')
    expect(timer.timeRemaining.value).toBe(20)
  })

  it('should countdown and switch to rest phase', () => {
    const timer = useTimer()
    timer.start()
    
    // Advance through exercise phase (20 seconds + 1 to trigger phase change)
    vi.advanceTimersByTime(21000)
    
    expect(timer.currentPhase.value).toBe('rest')
    expect(timer.timeRemaining.value).toBe(10)
  })

  it('should switch to next round after rest', () => {
    const timer = useTimer()
    timer.start()
    
    // Complete exercise phase (20 seconds + 1)
    vi.advanceTimersByTime(21000)
    expect(timer.currentPhase.value).toBe('rest')
    
    // Complete rest phase (10 seconds + 1)
    vi.advanceTimersByTime(11000)
    
    expect(timer.currentRound.value).toBe(2)
    expect(timer.currentPhase.value).toBe('exercise')
    expect(timer.timeRemaining.value).toBe(20)
  })

  it('should stop after completing all rounds', () => {
    const timer = useTimer()
    timer.config.value.rounds = 2
    timer.config.value.exerciseDuration = 5
    timer.config.value.restDuration = 3
    timer.reset()
    timer.start()
    
    // Complete round 1
    vi.advanceTimersByTime(6000) // exercise
    vi.advanceTimersByTime(4000) // rest
    
    // Complete round 2
    vi.advanceTimersByTime(6000) // exercise
    vi.advanceTimersByTime(4000) // rest
    
    expect(timer.isRunning.value).toBe(false)
    expect(timer.currentRound.value).toBe(2)
  })

  it('should update config and reset timer', () => {
    const timer = useTimer()
    
    timer.updateConfig({
      rounds: 5,
      exerciseDuration: 30,
      restDuration: 15
    })
    
    expect(timer.config.value.rounds).toBe(5)
    expect(timer.config.value.exerciseDuration).toBe(30)
    expect(timer.config.value.restDuration).toBe(15)
    expect(timer.timeRemaining.value).toBe(30)
    expect(timer.currentRound.value).toBe(1)
  })
})
