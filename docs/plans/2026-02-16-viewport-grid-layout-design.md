# Viewport Grid Layout with Training Information - Design Document

**Date:** 2026-02-16
**Status:** Approved
**Author:** Claude Sonnet 4.5

---

## Overview

Add a CSS Grid-based layout to the Timer component that divides the viewport into logical areas. Display additional training information in dedicated areas:
- **Top area:** Total remaining time of the entire workout
- **Bottom area:** Current round progress (e.g., "Round 2 of 8")

These information areas are only visible during active training phases (Prepare, Exercise, Rest) and hidden in Ready/Complete states.

---

## Requirements

1. Divide viewport into logical grid areas using CSS Grid
2. Display total remaining workout time in top-center area
3. Display current round progress in bottom-center area
4. Grid lines are for visualization only - not visible in final UI
5. Information areas visible only during training (Prepare → Rest phases)
6. Maintain mobile-first responsive design (iPhone 12 viewport: 390×844)
7. Keep existing functionality intact (no breaking changes)

---

## Design Decisions

### Approach: CSS Grid with Named Areas

**Selected:** CSS Grid with `grid-template-areas` for semantic, maintainable layout.

**Alternatives considered:**
- Absolute positioning: Too brittle, harder to maintain
- Grid with fr units only: Less semantic than named areas

**Why CSS Grid with named areas:**
- ✅ Semantic and self-documenting code
- ✅ Easy to extend with future information areas
- ✅ Responsive-friendly
- ✅ Modern CSS best practice
- ✅ Easy to test (clear class names)

---

## Architecture

### Layout Structure

```
┌─────────────────────────────────────┐
│         (empty spacer)              │  Row 1 (auto)
├─────────────────────────────────────┤
│    [Noch 5:30]                      │  Row 2 (auto) - info-top
├─────────────────────────────────────┤
│                                     │
│          Preset Name                │
│         "GET READY!"                │  Row 3 (3fr) - main
│           0:09                      │
│        [Play] [Reset]               │
│                                     │
├─────────────────────────────────────┤
│    [Runde 2 von 8]                  │  Row 4 (auto) - info-bottom
├─────────────────────────────────────┤
│         (empty spacer)              │  Row 5 (auto)
└─────────────────────────────────────┘
```

### Grid Definition

**Columns:** `1fr 3fr 1fr` (left spacer - center content - right spacer)
**Rows:** `auto auto 3fr auto auto`
- Row 1: Empty spacer (top)
- Row 2: Total remaining time
- Row 3: Main timer area (3fr - takes most space)
- Row 4: Round progress
- Row 5: Empty spacer (bottom)

**Grid Template Areas:**
```css
grid-template-areas:
  ". . ."
  ". info-top ."
  ". main ."
  ". info-bottom ."
  ". . .";
```

---

## Component Changes

### Timer.tsx

**New Elements:**
```tsx
{/* Render only during training phases */}
{(phase === Phase.Prepare || phase === Phase.Exercise || phase === Phase.Rest) && (
  <>
    <div className="info-top">
      {t('timer.totalRemaining', { time: formatTime(calculateTotalRemainingTime()) })}
    </div>

    <div className="info-bottom">
      {t('timer.roundInfo', { current: state.currentRound, total: settings.rounds })}
    </div>
  </>
)}
```

**New Helper Function:**
```typescript
const calculateTotalRemainingTime = (): number => {
  let remaining = state.timeRemaining; // Current phase time

  switch (state.phase) {
    case Phase.Prepare:
      // Add all exercise and rest times
      remaining += settings.rounds * settings.exerciseTime;
      remaining += (settings.rounds - 1) * settings.restTime;
      break;

    case Phase.Exercise:
      // Add remaining exercises and rests after current round
      const remainingRoundsAfterCurrent = settings.rounds - state.currentRound;
      remaining += remainingRoundsAfterCurrent * settings.exerciseTime;
      remaining += remainingRoundsAfterCurrent * settings.restTime;
      break;

    case Phase.Rest:
      // Add remaining exercises and rests
      const remainingRoundsInRest = settings.rounds - state.currentRound;
      remaining += remainingRoundsInRest * settings.exerciseTime;
      remaining += (remainingRoundsInRest - 1) * settings.restTime;
      break;

    default:
      remaining = 0;
  }

  return remaining;
};
```

**Calculation Examples:**

*Scenario 1: Prepare Phase*
- Settings: 8 rounds, 45s exercise, 15s rest, 10s prepare
- Current: Prepare phase, 7s remaining
```
Total = 7s (prepare) + (8 × 45s) + (7 × 15s)
      = 7 + 360 + 105 = 472s = 7:52
```

*Scenario 2: Exercise Phase (Round 2)*
- Current: Round 2, Exercise phase, 30s remaining
```
Total = 30s (current exercise) + (6 × 45s) + (6 × 15s)
      = 30 + 270 + 90 = 390s = 6:30
```

*Scenario 3: Rest Phase (Round 2)*
- Current: Round 2, Rest phase, 10s remaining
```
Total = 10s (current rest) + (6 × 45s) + (5 × 15s)
      = 10 + 270 + 75 = 355s = 5:55
```

---

## Styling

### Timer.css Changes

**Grid Container:**
```css
.timer-container {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: auto auto 3fr auto auto;
  grid-template-areas:
    ". . ."
    ". info-top ."
    ". main ."
    ". info-bottom ."
    ". . .";
  width: 100%;
  height: 100vh;
  transition: background-color 0.5s ease;
}
```

**Main Content Area:**
```css
.timer-content {
  grid-area: main;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 20px;
}
```

**Info Areas:**
```css
.info-top {
  grid-area: info-top;
  color: white;
  font-size: 18px;
  font-weight: 500;
  opacity: 0.85;
  padding: 12px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  text-align: center;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.info-bottom {
  grid-area: info-bottom;
  color: white;
  font-size: 18px;
  font-weight: 500;
  opacity: 0.85;
  padding: 12px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  text-align: center;
  transition: opacity 0.3s ease, transform 0.3s ease;
}
```

**Responsive Design:**
```css
/* Tablet */
@media (max-width: 768px) {
  .info-top, .info-bottom {
    font-size: 16px;
    padding: 10px;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .info-top, .info-bottom {
    font-size: 14px;
    padding: 8px;
  }
}
```

---

## Internationalization

### Translation Keys

**German (de/translation.json):**
```json
{
  "timer": {
    "totalRemaining": "Noch {{time}}",
    "roundInfo": "Runde {{current}} von {{total}}"
  }
}
```

**English (en/translation.json):**
```json
{
  "timer": {
    "totalRemaining": "{{time}} remaining",
    "roundInfo": "Round {{current}} of {{total}}"
  }
}
```

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

**Test File:** `src/components/Timer.test.tsx`

1. **calculateTotalRemainingTime() Tests:**
   - Prepare phase: Verify all rounds/rests are included
   - Exercise phase (Round 1): Verify calculation
   - Exercise phase (Round 5): Verify mid-workout calculation
   - Rest phase: Verify remaining exercises/rests
   - Edge case: Last round (no remaining rests)

2. **Rendering Tests:**
   - Info areas hidden in Phase.Ready
   - Info areas hidden in Phase.Complete
   - Info areas visible in Phase.Prepare
   - Info areas visible in Phase.Exercise
   - Info areas visible in Phase.Rest
   - Correct round display (e.g., "Runde 2 von 8")
   - Correct time formatting (MM:SS)

3. **Grid Layout Tests:**
   - Verify CSS classes are applied
   - Verify grid-area assignments

**Example Test:**
```typescript
test('calculates total remaining time correctly in exercise phase', () => {
  const settings: WorkoutSettings = {
    rounds: 8,
    exerciseTime: 45,
    restTime: 15,
    prepTime: 10
  };

  const state: TimerState = {
    phase: Phase.Exercise,
    currentRound: 2,
    timeRemaining: 30,
    isRunning: true
  };

  // Expected: 30 + (6 × 45) + (6 × 15) = 390s
  const result = calculateTotalRemainingTime(state, settings);
  expect(result).toBe(390);
});
```

### E2E Tests (Playwright)

**Test File:** `e2e/fitness-timer.spec.ts`

**Test Scenario: Training Information Display**
```typescript
test('displays training information during workout', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Start with TEST_PRESET (fast intervals)
  await page.click('[aria-label="Start"]');

  // Wait for Prepare phase
  await page.waitForSelector('.info-top');

  // Verify total remaining time is visible
  expect(await page.locator('.info-top').isVisible()).toBe(true);
  expect(await page.locator('.info-bottom').isVisible()).toBe(true);

  // Verify round info shows "Runde 1 von X"
  const roundText = await page.locator('.info-bottom').textContent();
  expect(roundText).toContain('Runde 1');

  // Wait for Exercise phase
  await page.waitForText('ÜBUNG!');

  // Verify info areas still visible
  expect(await page.locator('.info-top').isVisible()).toBe(true);

  // Verify time decreases
  const time1 = await page.locator('.info-top').textContent();
  await page.waitForTimeout(2000);
  const time2 = await page.locator('.info-top').textContent();
  expect(time1).not.toBe(time2);
});
```

**Test Scenario: Info Hidden in Ready/Complete**
```typescript
test('hides training info in Ready and Complete phases', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Initially in Ready phase - info should be hidden
  expect(await page.locator('.info-top').count()).toBe(0);
  expect(await page.locator('.info-bottom').count()).toBe(0);

  // Start and complete workout (using TEST_PRESET)
  await page.click('[aria-label="Start"]');

  // Wait for Complete phase
  await page.waitForText('FERTIG!', { timeout: 20000 });

  // Info should be hidden again
  expect(await page.locator('.info-top').count()).toBe(0);
  expect(await page.locator('.info-bottom').count()).toBe(0);
});
```

### Manual Testing with Playwright MCP

**Before PR Creation:**
1. Start app: `npm start`
2. Use Playwright MCP tools:
   - `browser_navigate` to http://localhost:3000
   - `browser_snapshot` to inspect initial state
   - `browser_click` on Play button
   - `browser_snapshot` to verify info areas appear
   - Wait through phases, verify countdown works
   - `browser_close` when done
3. Document findings in PR description

---

## Files to Modify

1. **src/components/Timer.tsx**
   - Add grid structure to JSX
   - Add `calculateTotalRemainingTime()` function
   - Add conditional rendering for info areas
   - Add translation keys usage

2. **src/components/Timer.css**
   - Convert container to CSS Grid
   - Add grid-template-areas
   - Style `.info-top` and `.info-bottom`
   - Add responsive adjustments

3. **public/locales/de/translation.json**
   - Add `timer.totalRemaining`
   - Add `timer.roundInfo`

4. **public/locales/en/translation.json**
   - Add `timer.totalRemaining`
   - Add `timer.roundInfo`

5. **src/components/Timer.test.tsx**
   - Add unit tests for calculation logic
   - Add rendering tests for conditional display
   - Add tests for grid layout classes

6. **e2e/fitness-timer.spec.ts** (optional, but recommended)
   - Add E2E test for training info display
   - Add test for Ready/Complete state hiding

---

## Validation Checklist

Before creating PR:
- [ ] `npm run build` - Must compile without errors
- [ ] `npm test -- --watchAll=false` - All 149+ tests must pass
- [ ] `npm start` - Verify app loads and info areas display correctly
- [ ] Manual Playwright MCP testing - Verify workflow end-to-end
- [ ] Verify responsive design on mobile viewport
- [ ] Verify German and English translations work

---

## Implementation Notes

### Potential Edge Cases

1. **Single Round Workout:** Round info shows "Runde 1 von 1" - consider special case text
2. **Very Long Workouts:** Total time could exceed 99:59 - formatTime handles this correctly
3. **Grid on Small Screens:** Info areas might be cramped - responsive styles handle this

### Future Enhancements (Out of Scope)

- Additional info areas (e.g., calories burned, heart rate)
- Animated transitions when info appears/disappears
- User setting to toggle info visibility
- Visual progress bar alongside time

---

## Success Criteria

✅ Grid layout implemented with CSS Grid and named areas
✅ Total remaining workout time displays correctly and counts down
✅ Round progress displays correctly (e.g., "Runde 2 von 8")
✅ Info areas hidden in Ready and Complete phases
✅ Info areas visible during Prepare, Exercise, Rest phases
✅ Responsive design works on iPhone 12 viewport (390×844)
✅ All existing tests pass
✅ New tests added and passing
✅ German and English translations work
✅ Build succeeds without errors

---

## References

- CSS Grid Guide: https://css-tricks.com/snippets/css/complete-guide-grid/
- React Testing Library: https://testing-library.com/react
- Playwright: https://playwright.dev/
- Project CLAUDE.md: Workflow and testing guidelines
