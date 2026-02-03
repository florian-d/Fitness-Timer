<template>
  <div class="app" :style="{ backgroundColor: backgroundColor }">
    <button class="menu-button" @click="openSettings" aria-label="Settings">
      ☰
    </button>
    
    <div class="timer-container">
      <div class="phase-label">
        {{ currentPhase.toUpperCase() }}
      </div>
      
      <div class="timer-display">
        {{ formattedTime }}
      </div>
      
      <div class="round-info">
        Round {{ currentRound }} / {{ totalRounds }}
      </div>
      
      <div class="controls">
        <button 
          v-if="!isRunning && !isPaused" 
          @click="start" 
          class="control-button start-button"
        >
          Start
        </button>
        <button 
          v-if="isRunning" 
          @click="pause" 
          class="control-button pause-button"
        >
          Pause
        </button>
        <button 
          v-if="isPaused" 
          @click="resume" 
          class="control-button resume-button"
        >
          Resume
        </button>
        <button 
          @click="reset" 
          class="control-button reset-button"
        >
          Reset
        </button>
      </div>
    </div>
    
    <SettingsPanel 
      :isOpen="isSettingsOpen" 
      :config="config"
      @close="closeSettings"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTimer } from './composables/useTimer'
import SettingsPanel from './components/SettingsPanel.vue'
import type { TimerConfig } from './composables/useTimer'

const {
  config,
  currentRound,
  currentPhase,
  isRunning,
  isPaused,
  totalRounds,
  backgroundColor,
  formattedTime,
  start,
  pause,
  resume,
  reset,
  updateConfig
} = useTimer()

const isSettingsOpen = ref(false)

function openSettings() {
  isSettingsOpen.value = true
}

function closeSettings() {
  isSettingsOpen.value = false
}

function handleSave(newConfig: TimerConfig) {
  updateConfig(newConfig)
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background-color 0.5s ease;
  position: relative;
  padding: 20px;
}

.menu-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: white;
  font-size: 28px;
  width: 50px;
  height: 50px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  z-index: 100;
}

.menu-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.timer-container {
  text-align: center;
  color: white;
}

.phase-label {
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 4px;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.timer-display {
  font-size: 8rem;
  font-weight: bold;
  line-height: 1;
  text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.4);
  margin: 30px 0;
  font-variant-numeric: tabular-nums;
}

.round-info {
  font-size: 1.5rem;
  margin-bottom: 40px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.controls {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.control-button {
  padding: 15px 30px;
  font-size: 1.2rem;
  font-weight: 600;
  border: 3px solid white;
  border-radius: 10px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  min-width: 120px;
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.control-button:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .timer-display {
    font-size: 6rem;
  }
  
  .phase-label {
    font-size: 1.5rem;
  }
  
  .round-info {
    font-size: 1.2rem;
  }
  
  .control-button {
    font-size: 1rem;
    padding: 12px 24px;
  }
}

@media (max-width: 480px) {
  .timer-display {
    font-size: 4rem;
  }
}
</style>
