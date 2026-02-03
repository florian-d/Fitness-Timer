import { ref, computed } from 'vue'

export type TimerPhase = 'exercise' | 'rest'

export interface TimerConfig {
  rounds: number
  exerciseDuration: number // in seconds
  restDuration: number // in seconds
}

export function useTimer() {
  const config = ref<TimerConfig>({
    rounds: 8,
    exerciseDuration: 20,
    restDuration: 10
  })

  const currentRound = ref(1)
  const currentPhase = ref<TimerPhase>('exercise')
  const timeRemaining = ref(config.value.exerciseDuration)
  const isRunning = ref(false)
  const isPaused = ref(false)
  let intervalId: number | null = null

  const totalRounds = computed(() => config.value.rounds)
  
  const backgroundColor = computed(() => 
    currentPhase.value === 'exercise' ? '#ef4444' : '#22c55e'
  )

  const formattedTime = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60)
    const seconds = timeRemaining.value % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  function tick() {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      nextPhase()
    }
  }

  function nextPhase() {
    if (currentPhase.value === 'exercise') {
      currentPhase.value = 'rest'
      timeRemaining.value = config.value.restDuration
    } else {
      // Move to next round
      if (currentRound.value < config.value.rounds) {
        currentRound.value++
        currentPhase.value = 'exercise'
        timeRemaining.value = config.value.exerciseDuration
      } else {
        // Workout complete
        stop()
      }
    }
  }

  function start() {
    if (!isRunning.value) {
      isRunning.value = true
      isPaused.value = false
      intervalId = setInterval(tick, 1000) as unknown as number
    }
  }

  function pause() {
    isPaused.value = true
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
    isRunning.value = false
  }

  function resume() {
    if (isPaused.value) {
      start()
    }
  }

  function stop() {
    isRunning.value = false
    isPaused.value = false
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function reset() {
    stop()
    currentRound.value = 1
    currentPhase.value = 'exercise'
    timeRemaining.value = config.value.exerciseDuration
  }

  function updateConfig(newConfig: Partial<TimerConfig>) {
    config.value = { ...config.value, ...newConfig }
    reset()
  }

  return {
    config,
    currentRound,
    currentPhase,
    timeRemaining,
    isRunning,
    isPaused,
    totalRounds,
    backgroundColor,
    formattedTime,
    start,
    pause,
    resume,
    stop,
    reset,
    updateConfig
  }
}
