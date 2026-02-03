<template>
  <div class="settings-panel" :class="{ open: isOpen }">
    <div class="settings-overlay" @click="close" v-if="isOpen"></div>
    <div class="settings-content">
      <div class="settings-header">
        <h2>Settings</h2>
        <button @click="close" class="close-button">✕</button>
      </div>
      
      <div class="settings-body">
        <div class="setting-item">
          <label for="rounds">Rounds</label>
          <input
            id="rounds"
            type="number"
            v-model.number="localConfig.rounds"
            min="1"
            max="50"
          />
        </div>
        
        <div class="setting-item">
          <label for="exercise">Exercise Duration (seconds)</label>
          <input
            id="exercise"
            type="number"
            v-model.number="localConfig.exerciseDuration"
            min="1"
            max="600"
          />
        </div>
        
        <div class="setting-item">
          <label for="rest">Rest Duration (seconds)</label>
          <input
            id="rest"
            type="number"
            v-model.number="localConfig.restDuration"
            min="1"
            max="600"
          />
        </div>
        
        <button @click="save" class="save-button">Save & Reset</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TimerConfig } from '../composables/useTimer'

const props = defineProps<{
  isOpen: boolean
  config: TimerConfig
}>()

const emit = defineEmits<{
  close: []
  save: [config: TimerConfig]
}>()

const localConfig = ref<TimerConfig>({ ...props.config })

watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig }
})

function close() {
  emit('close')
}

function save() {
  emit('save', localConfig.value)
  emit('close')
}
</script>

<style scoped>
.settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.settings-panel.open {
  pointer-events: all;
}

.settings-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  animation: fadeIn 0.3s forwards;
}

.settings-content {
  position: absolute;
  top: 0;
  right: -320px;
  width: 320px;
  height: 100%;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  transition: right 0.3s ease;
}

.settings-panel.open .settings-content {
  right: 0;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;
}

.settings-header h2 {
  margin: 0;
  font-size: 24px;
}

.close-button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.close-button:hover {
  color: #000;
}

.settings-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.setting-item {
  margin-bottom: 24px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.setting-item input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

.setting-item input:focus {
  outline: none;
  border-color: #3b82f6;
}

.save-button {
  width: 100%;
  padding: 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
}

.save-button:hover {
  background: #2563eb;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@media (max-width: 400px) {
  .settings-content {
    width: 100%;
    right: -100%;
  }
}
</style>
