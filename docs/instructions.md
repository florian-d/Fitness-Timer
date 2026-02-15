# Fitness Timer - Claude Code Agent Instructions

## Project Overview

**HIIT Timer** - A Progressive Web App for High-Intensity Interval Training workouts built with React, TypeScript, and i18n support.

- **Tech Stack**: React 18, TypeScript, i18next, CSS, PWA
- **Main Branch**: `main`
- **Current Feature**: Timer Presets (Multiple named workout configurations)

---

## Architecture & Structure

### File Organization
```
src/
├── App.tsx                          # Main app, preset management
├── App.css                          # App styling
├── components/
│   ├── Timer.tsx                   # Timer logic & display
│   ├── Timer.css                   # Timer styling
│   ├── Settings.tsx                # Settings & preset editor
│   └── Settings.css                # Settings styling
├── hooks/
│   └── useWakeLock.ts             # Keep screen awake during exercise
├── utils/
│   ├── icons.tsx                   # SVG icon components
│   ├── localStorage.ts             # Preset persistence
│   ├── analytics.ts                # Matomo event tracking
│   └── analytics.test.ts
└── locales/
    ├── en.json                     # English translations
    └── de.json                     # German translations
```

### Key Data Structures

**WorkoutSettings**:
```typescript
interface WorkoutSettings {
  rounds: number;              // 1-50
  exerciseTime: number;        // 5-600 seconds
  restTime: number;           // 5-300 seconds
  prepTime: number;           // 0-300 seconds
}
```

**WorkoutPreset**:
```typescript
interface WorkoutPreset {
  id: string;                 // UUID or timestamp-based
  name: string;               // User-chosen, unique
  settings: WorkoutSettings;
  createdAt: number;          // timestamp for ordering
}
```

**PresetStore**:
```typescript
interface PresetStore {
  activePresetId: string;
  presets: WorkoutPreset[];
  version: number;            // for migrations
}
```

---

## Coding Standards

### React Components

1. **Functional Components Only**
   - Use React hooks (useState, useEffect, useReducer, useCallback)
   - Example: Timer uses useReducer for state machine

2. **TypeScript Best Practices**
   - Always define interfaces for props
   - Use proper types, avoid `any`
   - Example from Timer:
   ```typescript
   interface TimerProps {
     settings: WorkoutSettings;
     activePresetName: string;
     presets: WorkoutPreset[];
     activePresetId: string;
     onRunningChange: (isRunning: boolean) => void;
     onPresetChange: (presetId: string) => void;
   }
   ```

3. **Performance**
   - Use useCallback for event handlers
   - Implement proper cleanup in useEffect
   - Avoid unnecessary re-renders

### Icon System (SVG-based)

**NEVER use emoji icons.** Use SVG icons instead.

All icons are in `src/utils/icons.tsx`:
- PlayIcon - Start/Resume
- PauseIcon - Pause
- ResetIcon - Reset/Refresh
- MenuIcon - Hamburger menu
- CloseIcon - X close button
- BackIcon - Back arrow
- EditIcon - Pencil edit
- TrashIcon - Trash delete
- CheckIcon - Checkmark confirm

**Usage**:
```typescript
import { PlayIcon, PauseIcon, ResetIcon } from '../utils/icons';

<button className="control-button">
  <PlayIcon />
</button>
```

### CSS Conventions

1. **Mobile-First Approach**
   - Base styles for mobile
   - Media queries for larger screens
   ```css
   @media (max-width: 768px) { /* tablet */ }
   @media (max-width: 480px) { /* mobile */ }
   ```

2. **Color System**
   - Gray (ready): #6B7280
   - Yellow (prepare): #F59E0B
   - Red (exercise): #EF4444
   - Green (rest): #10B981
   - Blue (complete): #3B82F6

3. **Button Styling**
   - Circular buttons: `border-radius: 50%`
   - Semi-transparent backgrounds: `rgba(255, 255, 255, 0.x)`
   - Smooth transitions: `transition: all 0.3s ease`

---

## Internationalization (i18n)

### Translation Keys Pattern

**Structure**: `feature.action` or `feature.status.state`

**Examples**:
- `timer.ready` - "READY?"
- `timer.exercise` - "Round {{current}} of {{total}}"
- `presets.addNew` - "+ Add New Preset"
- `settings.rounds` - "Number of Rounds"

### Adding New Translations

1. Add key to both `en.json` and `de.json`:
```json
{
  "settings": {
    "myNewSetting": "English text",
    "summary": "Workout Summary"
  }
}
```

2. Use in component:
```typescript
const { t } = useTranslation();
<label>{t('settings.myNewSetting')}</label>
```

3. **NEVER hardcode text** - always use i18n

---

## Preset Management Best Practices

### Creating Presets
```typescript
// In App.tsx
const handlePresetCreate = (name: string, settings: WorkoutSettings) => {
  const updatedStore = createPreset(presetStore, name, settings);
  if (updatedStore) {
    setPresetStore(updatedStore);
    return newPreset?.id || null;
  }
  return null;
};
```

### Validation Rules
- **Preset names must be unique** (case-insensitive)
- **At least one preset must exist** at all times
- **Max 20 presets** per user

### Default Preset Behavior
- Created on first launch with values: rounds=8, exerciseTime=30s, restTime=10s, prepTime=10s
- Can be renamed or deleted (as long as another preset exists)
- Auto-migrated from old single-settings format

---

## Timer State Machine

**Phases**: `ready` → `prepare` → `exercise` ↔ `rest` → `complete`

### Phase Transitions
```typescript
case 'TICK':
  if (currentState.timeRemaining > 1) {
    // Decrement
    return { ...currentState, timeRemaining: currentState.timeRemaining - 1 };
  }
  // Transition to next phase
  if (currentState.phase === 'prepare') {
    return { ...currentState, phase: 'exercise', timeRemaining: settings.exerciseTime };
  }
  // ... etc
```

### Rules
- Settings can only be changed in `ready` and `complete` phases
- Settings menu disabled while timer is running
- Presets can only be switched in `ready` phase
- Audio cues on phase transitions:
  - Single bell: rest → exercise, prepare complete
  - Double bell: exercise starts

---

## Audio & Wake Lock

### Audio Playback
- Bell sounds for phase transitions
- Preload on component mount
- Unlock audio with user gesture (iOS requirement)
- Volume set to 0.3 by default

### Wake Lock
- Keep screen awake **only during exercise phase**
- Use `useWakeLock` hook
- Important for phone workouts where screen would otherwise lock

---

## Testing Guidelines

### Unit Tests
- Located alongside components: `Timer.test.tsx`, `Settings.test.tsx`
- Use React Testing Library
- Test user interactions, not implementation details

### Test Coverage Areas
1. **Timer Logic**: Phase transitions, time counting
2. **Preset Management**: Create, rename, delete, switch
3. **Settings UI**: Input validation, form submission
4. **i18n**: Language switching
5. **localStorage**: Persistence, migrations

### Run Tests
```bash
npm test                                           # Interactive
npm run test:ci                                    # CI mode (no watch)
npm test -- --coverage --watchAll=false          # With coverage
```

---

## localStorage Persistence

### Keys
- `presetStore` - Contains all presets and active preset ID
- Old format `fitnessTimerSettings` - Auto-migrated to preset format

### Migrations
When adding new preset features:
1. Increment `PresetStore.version`
2. Add migration logic in `loadPresetStore()`
3. Test with old format data
4. Ensure backward compatibility

---

## UI/UX Patterns

### Disabled Button States
- Buttons disabled while timer is running
- Settings menu (☰) disabled during workout
- Delete preset button disabled if only 1 preset exists
- Use `disabled` attribute, not CSS opacity

### Confirmation Dialogs
- Use `window.confirm()` for destructive actions (delete preset)
- Always include preset name in confirmation message

### Loading States
- App loads presets synchronously from localStorage
- No loading spinner needed (instant)

### Error Messages
- Show inline error messages in preset management
- Examples: "Preset name already taken", "Cannot delete last preset"

---

## Common Patterns & Gotchas

### ✅ DO
- Import icons from `utils/icons.tsx`
- Use CSS media queries for responsive design
- Use `useCallback` for stable event handler references
- Update both `en.json` and `de.json` together
- Test on mobile viewport
- Use semantic HTML (buttons, labels, etc.)

### ❌ DON'T
- Use emoji icons (use SVG instead)
- Hardcode text strings (use i18n)
- Modify localStorage directly (use utility functions)
- Create new state for things derivable from props
- Ignore mobile responsiveness
- Skip TypeScript types

---

## Documentation Updates

### When to Update README
- New features (document with screenshots)
- API changes (update usage examples)
- Installation/setup changes

### Screenshot Guidelines
- Use English language in screenshots
- Show key UI elements clearly
- Include both mobile and desktop views if applicable
- Use descriptive captions

### Commit Messages
Format: `type: description`

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code structure changes (no behavior change)
- `docs:` - Documentation updates
- `chore:` - Dependencies, build, tooling
- `test:` - Test-related changes

Example:
```
feat: add SVG icons to replace emoji buttons
docs: update README with icon usage guidelines
```

---

## Browser & Device Support

### Target Platforms
- iPhone (primary) - iOS Safari
- iPad - iOS Safari
- Android - Chrome/Firefox
- Desktop - Modern browsers (Chrome, Firefox, Safari, Edge)

### Known Constraints
- iOS: Audio playback requires user gesture
- iOS: Screen lock behavior needs wake lock
- All: PWA installation should work

### Testing
- Always test on:
  - iPhone (physical device if possible)
  - Chrome DevTools mobile viewport
  - Both portrait and landscape

---

## Performance Tips

1. **Audio**
   - Preload on mount, don't load on-demand
   - Set `volume` to 0.3 to prevent sudden loud sounds
   - Use `pause()` + `currentTime = 0` for replay

2. **Rendering**
   - Timer uses `useReducer` for efficient state updates
   - Settings use local state (component-level)
   - Only App.tsx manages global preset store

3. **localStorage**
   - Save after each preset operation (handled by useEffect)
   - Only save when state actually changes

---

## Quick Start for New Tasks

1. **Read the existing code** - Especially components related to your task
2. **Follow the architecture** - Keep file organization consistent
3. **Use SVG icons** - Never add new emoji buttons
4. **Add i18n keys** - Both en.json and de.json
5. **Write tests** - Keep test files alongside components
6. **Update README** - Document new features with examples
7. **Test on mobile** - Use DevTools or real device
8. **Commit with proper message** - Follow convention

---

## Resources

- **React Docs**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **i18next Docs**: https://www.i18next.com
- **Feather Icons** (SVG reference): https://feathericons.com (our icons follow similar style)

---

**Last Updated**: 2026-02-15
**Project Version**: v1.0.0 (Presets Feature Complete)
