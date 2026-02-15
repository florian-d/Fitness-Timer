# Architecture Decisions - Fitness Timer

This document records important architectural decisions and their rationale.

---

## ADR-001: SVG Icons Instead of Emojis

**Status**: Adopted (v1.0.0)
**Date**: 2026-02-15

### Problem
Emoji icons (⏸, ⟲, ☰, ✕) didn't integrate well visually with the app's design. They looked inconsistent with button styling and weren't sizable/stylable.

### Decision
Replace all emoji icons with professional SVG icons using a consistent icon system.

### Implementation
- Created `src/utils/icons.tsx` with reusable SVG icon components
- All SVG icons use `stroke` and `currentColor` for consistency
- Icons are scalable without pixelation
- Centralized icon management makes updates easy

### Affected Components
- `Timer.tsx` - PlayIcon, PauseIcon, ResetIcon
- `App.tsx` - MenuIcon
- `Settings.tsx` - CloseIcon, BackIcon, EditIcon, TrashIcon, CheckIcon

### Benefits
- ✅ Professional, consistent appearance
- ✅ Better mobile touch targets
- ✅ Easy to theme/style
- ✅ Scalable without quality loss
- ✅ Single source of truth for icons

### Tradeoffs
- ⚠️ Slightly more code (icon definitions)
- ⚠️ Component overhead vs simple emoji
- ⚠️ CSS required for proper sizing/alignment

### Future Considerations
- Could extract to icon library if project grows
- Could add icon animation (hover effects, etc.)

---

## ADR-002: useReducer for Timer State Machine

**Status**: Adopted (v0.1.0)
**Date**: 2025-12-15

### Problem
Timer has complex state with multiple phases and transitions. Using separate useState calls would be error-prone.

### Decision
Implement timer state machine using React useReducer hook.

### Design
```
Phases: ready → prepare → exercise ↔ rest → complete
Events: START, PAUSE, RESUME, RESET, TICK, SYNC_SETTINGS
```

### Implementation
- Single reducer function handles all phase transitions
- Clear, testable state logic
- Prevents invalid state combinations

### Benefits
- ✅ Clear state machine semantics
- ✅ Easy to test transitions
- ✅ Prevents impossible states
- ✅ Easier to debug (action log)

### Tradeoffs
- ⚠️ Less straightforward than useState initially
- ⚠️ Requires understanding reducer pattern

### Lessons Learned
- Always dispatch `SYNC_SETTINGS` when settings change while timer not running
- Keep reducer pure - no side effects in dispatch
- Use `useCallback` for event handlers to prevent infinite loops

---

## ADR-003: Component-Level State for Settings

**Status**: Adopted (v0.3.0)
**Date**: 2025-12-20

### Problem
Settings form has temporary input state that shouldn't affect global app state until "Save" is clicked.

### Decision
Keep input state local to Settings component, only sync to App.tsx on save.

### Implementation
- Local useState for rounds, exerciseTime, restTime, prepTime
- onSave callback sends final values to parent
- onClose discards changes if "Cancel" clicked

### Benefits
- ✅ Clean separation of concerns
- ✅ Natural form behavior (discard on cancel)
- ✅ No unnecessary global state updates
- ✅ Better performance

### Tradeoffs
- ⚠️ Local state duplication (temporary values)
- ⚠️ Manual sync required on preset switch

### Related Pattern
Similar approach used for preset renaming - local input state until confirmed.

---

## ADR-004: Preset Store Structure with activePresetId

**Status**: Adopted (v0.5.0)
**Date**: 2026-01-10

### Problem
Single WorkoutSettings couldn't support multiple presets. Need to store multiple configurations and track which is active.

### Decision
Create `PresetStore` with array of presets and activePresetId reference.

### Data Model
```typescript
interface PresetStore {
  presets: WorkoutPreset[];
  activePresetId: string;
  version: number;
}
```

### Design Rationale
- **Array of presets** - Flexible, allows CRUD operations
- **activePresetId** - Reference to current preset (not index, for stability)
- **version field** - Enables future migrations without breaking changes

### Benefits
- ✅ Supports multiple configurations
- ✅ Easy to migrate from old format
- ✅ Can add presets/delete without reordering
- ✅ Version field for future extensibility

### Tradeoffs
- ⚠️ Must validate activePresetId always points to valid preset
- ⚠️ Migration code required for existing users
- ⚠️ More complex than single settings object

### Migration Strategy
- Detect old `fitnessTimerSettings` format in localStorage
- Auto-create "Default" preset with old settings
- Seamless for users (transparent migration)

---

## ADR-005: i18n with i18next vs Alternative Solutions

**Status**: Adopted (v0.4.0)
**Date**: 2025-12-21

### Problem
App supports English and German. Need proper translation system.

### Decision
Use `i18next` with `react-i18next` and `i18next-browser-languagedetector`.

### Configuration
- Translation files: `src/locales/{en,de}.json`
- Auto-detect browser language
- Fall back to English if unsupported
- Manual language switching in Settings

### Benefits
- ✅ Industry standard i18n library
- ✅ Good ecosystem and documentation
- ✅ Simple file-based translations
- ✅ Browser language detection built-in

### Tradeoffs
- ⚠️ Additional dependency (but worth it)
- ⚠️ Requires discipline: NO hardcoded strings

### Why Not...
- **Hardcoded strings**: Not scalable, error-prone
- **gettext**: Overkill for 2 languages
- **Custom solution**: Reinventing the wheel

---

## ADR-006: localStorage for Persistence vs Alternatives

**Status**: Adopted (v0.1.0)
**Date**: 2025-12-10

### Problem
App needs to save presets between sessions.

### Decision
Use `localStorage` (with PWA Service Worker fallback via Workbox).

### Implementation
- Single `presetStore` key in localStorage
- Synchronous loading on app start
- Auto-save on every change (via useEffect)
- Validation on load to prevent corruption

### Benefits
- ✅ Simple, built-in browser API
- ✅ No backend required
- ✅ Works offline
- ✅ Good size (5-10MB typical quota)

### Tradeoffs
- ⚠️ Limited to ~5MB (but we use <100KB)
- ⚠️ Synchronous (could block on large data)
- ⚠️ No multi-tab sync (acceptable for this app)

### Why Not...
- **IndexedDB**: Overkill for this data size
- **Backend API**: Not needed, offline first
- **SessionStorage**: Lost on page close (undesired)

### Safety Measures
- Try/catch for parsing errors
- Fallback to defaults if corrupted
- Version field for migrations

---

## ADR-007: CSS-in-JS vs Separate CSS Files

**Status**: Adopted (v0.1.0)
**Date**: 2025-12-10

### Problem
How to manage component styles?

### Decision
Use separate `.css` files per component (CSS Modules not needed for this project size).

### Benefits
- ✅ Simple to understand
- ✅ No runtime overhead
- ✅ Easy to modify for designers
- ✅ Good mobile viewport support

### Organization
- `Timer.css` - Timer display and controls
- `Settings.css` - Settings form and presets
- `App.css` - Global app styles

### CSS Conventions
- Mobile-first approach
- Media queries for larger screens
- Color constants (repeated values, consider SCSS later if needed)
- BEM-like naming (`preset-item`, `control-button`)

### Why Not...
- **CSS-in-JS (Styled Components)**: Adds runtime, complexity not needed
- **Tailwind CSS**: Would require configuration, project simple enough for vanilla
- **SCSS**: Not needed yet, plain CSS sufficient

### Future Consideration
Could migrate to SCSS/CSS Modules if styles become complex.

---

## ADR-008: Wake Lock Implementation

**Status**: Adopted (v0.2.0)
**Date**: 2025-12-15

### Problem
Phone screen locks during workout, interrupting user.

### Decision
Implement `useWakeLock` hook that requests screen wake lock during exercise phase.

### Implementation
```typescript
// Only activate during exercise, not prepare/rest
useWakeLock(state.phase === 'exercise' && state.isRunning);
```

### Benefits
- ✅ Screen stays on during exercise (critical)
- ✅ Minimal overhead (only during exercise)
- ✅ Graceful fallback if not supported
- ✅ Auto-releases on phase change

### Tradeoffs
- ⚠️ Requires user permission (shown in browser)
- ⚠️ Battery drain (acceptable trade-off)
- ⚠️ Not supported on all browsers/devices

### Browser Support
- ✅ Chrome/Edge (Desktop & Android)
- ✅ Safari 16.4+ (iOS)
- ❌ Older browsers (graceful degradation)

### Why Only During Exercise?
- Battery impact significant if always on
- Not needed during prep/rest (user can lock)
- Most critical when user actively working

---

## ADR-009: Matomo Analytics Integration

**Status**: Adopted (v0.2.0)
**Date**: 2025-12-15

### Problem
Need to understand user behavior and feature usage.

### Decision
Integrate Matomo (privacy-respecting analytics) via script tag.

### Tracked Events
- Workout Started (with round count)
- Workout Completed (with round count)
- Phase transitions

### Benefits
- ✅ Privacy-first (no personal data collected)
- ✅ Self-hosted option available
- ✅ Understand feature usage
- ✅ Zero user-facing impact

### Tradeoffs
- ⚠️ Requires Matomo setup (not included in repo)
- ⚠️ Minor JavaScript overhead
- ⚠️ Adds external script tag

### Why Matomo vs Google Analytics?
- Matomo respects privacy (GDPR compliant)
- Can be self-hosted
- No consent banner needed
- User data stays under your control

### Configuration
- Set Matomo site ID in script
- Set tracking server URL
- Currently: `dev` environment (minimal tracking)

---

## ADR-010: Test-Driven Development (TDD) Approach

**Status**: Recommended (v1.0.0)
**Date**: 2026-02-15

### Problem
Ensuring features work correctly and preventing regressions.

### Decision
Write tests alongside features, following React Testing Library patterns.

### Test Coverage Areas
1. **State Management** - Timer phase transitions, preset switching
2. **User Interactions** - Button clicks, form inputs
3. **Edge Cases** - Invalid inputs, empty states
4. **Integration** - Components working together

### Testing Philosophy
- Test user behavior, not implementation
- Use semantic queries (getByRole, getByText)
- Don't test third-party libraries
- Focus on critical paths

### Benefits
- ✅ Confidence in changes
- ✅ Catches regressions early
- ✅ Documents expected behavior
- ✅ Easier refactoring

### Tradeoffs
- ⚠️ Takes longer to write (offset by fewer bugs)
- ⚠️ Requires discipline to maintain
- ⚠️ Not all code equally testable

### Example Pattern
```typescript
// Test user-visible behavior
it('should transition to exercise when prepare ends', () => {
  // Don't test: expect(state.phase).toBe('exercise')
  // Do test: expect(screen.getByText(/round 1/)).toBeInTheDocument()
});
```

---

## ADR-011: Multilingual UI Approach

**Status**: Adopted (v0.4.0)
**Date**: 2025-12-21

### Problem
Support both English and German users.

### Decision
Use i18next with separate JSON files for each language.

### Language Selection
1. Auto-detect from browser language
2. Manual override in Settings
3. Persisted choice in browser

### Key Patterns
- `feature.action` naming (e.g., `timer.ready`)
- All text in JSON files
- ZERO hardcoded strings in components
- Both languages updated together

### Benefits
- ✅ Easy to add more languages later
- ✅ Clear translation hierarchy
- ✅ Automatic browser language detection
- ✅ User choice respected and remembered

### Adding New Language
1. Create `src/locales/[lang].json`
2. Copy structure from `en.json`
3. Translate all keys
4. Add to language select in Settings
5. Test switching

### Why Required
- Users expect their language
- German is primary secondary market
- No excuses for poor localization

---

## ADR-012: Git Workflow with Feature Branches

**Status**: Adopted (v0.2.0)
**Date**: 2025-12-20

### Problem
Multiple people might work on the project. Need organized Git workflow.

### Decision
Feature branch workflow:
- Main branch: `main` (stable, deployable)
- Feature branches: `feat/feature-name`
- PR review before merge to main

### Process
1. Create branch from `main`
2. Implement feature
3. Write/update tests
4. Create PR with description
5. Address review comments
6. Merge when approved

### Benefits
- ✅ Stable main branch
- ✅ Code review opportunity
- ✅ Clear feature history
- ✅ Easy rollback if needed

### Tradeoffs
- ⚠️ More process overhead
- ⚠️ Merge conflicts possible
- ⚠️ Requires discipline

### Commit Message Format
```
type: brief description

Optional detailed explanation
- Use bullet points for multiple changes
- Reference issues if applicable
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`

---

## Summary of Key Architectural Patterns

| Pattern | Decision | Rationale |
|---------|----------|-----------|
| State Management | App.tsx (presets) + useReducer (timer) + local (settings) | Clear separation of concerns |
| Icons | SVG from utils/icons.tsx | Professional, consistent, scalable |
| i18n | i18next + JSON files | Industry standard, browser detection |
| Persistence | localStorage | Simple, offline-first |
| Styling | Separate CSS files | Simple, maintainable |
| Testing | React Testing Library | User-focused, good practices |
| Async | Minimal (localStorage sync, audio preload) | App is mostly synchronous |

---

## Future Architectural Considerations

### If Project Grows
- **Complex styling**: Consider SCSS or CSS Modules
- **Many icons**: Consider icon library (Feather, Heroicons)
- **More languages**: Maybe translation management platform
- **More features**: Consider state management library (Zustand, Jotai)
- **Backend**: Consider cloud sync, user accounts

### Performance Monitoring
- Set up real user monitoring (RUM)
- Monitor timer accuracy over time
- Track localStorage corruption rates
- Monitor app bundle size

### Scaling Concerns
- Max preset limit (currently 20)
- localStorage quota (currently <100KB, limit ~5MB)
- Audio file size
- Bundle size for slow networks

---

**Last Updated**: 2026-02-15
**Maintainer**: Claude Code Agent System
