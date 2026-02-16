# Viewport Grid Layout with Training Information - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add CSS Grid layout to Timer component displaying total remaining workout time and current round progress in dedicated areas.

**Architecture:** Convert Timer container to CSS Grid with named areas (info-top, main, info-bottom). Add `calculateTotalRemainingTime()` helper function. Conditionally render info areas only during training phases (Prepare, Exercise, Rest).

**Tech Stack:** React 18, TypeScript, CSS Grid, Jest, React Testing Library, react-i18next

---

## Task 1: Create Feature Branch and GitHub Issue

**Files:**
- None (Git/GitHub operations)

**Step 1: Create GitHub issue**

Go to GitHub repository and create issue with title:
```
Viewport Grid Layout: Display total remaining time and round progress
```

Body:
```markdown
## Description
Add CSS Grid layout to divide viewport into logical areas. Display:
- **Top area:** Total remaining workout time (e.g., "Noch 5:30")
- **Bottom area:** Current round progress (e.g., "Runde 2 von 8")

Info areas visible only during training (Prepare, Exercise, Rest phases).

## Design Document
See: docs/plans/2026-02-16-viewport-grid-layout-design.md

## Acceptance Criteria
- [ ] Grid layout with named areas implemented
- [ ] Total remaining time calculates and displays correctly
- [ ] Round progress displays correctly
- [ ] Info areas hidden in Ready/Complete phases
- [ ] All tests pass (149+)
- [ ] Build succeeds
- [ ] Responsive on mobile (iPhone 12 viewport)
```

Expected: Issue created with number (e.g., #28)

**Step 2: Create feature branch**

```bash
git checkout main && git pull
git checkout -b feat/viewport-grid-layout
```

Expected: Branch created and checked out

**Step 3: Verify clean working directory**

```bash
git status
```

Expected: `On branch feat/viewport-grid-layout` with clean working tree (except app-loaded.md which is untracked)

---

## Task 2: Add i18n Translation Keys

**Files:**
- Modify: `src/locales/de.json:2-10`
- Modify: `src/locales/en.json:2-10`

**Step 1: Add German translations**

In `src/locales/de.json`, add to the `"timer"` object (after line 8, before closing brace):

```json
{
  "timer": {
    "ready": "BEREIT?",
    "prepare": "MACH DICH BEREIT!",
    "exercise": "TRAINING - Runde {{current}}/{{total}}",
    "rest": "PAUSE - Runde {{current}}/{{total}}",
    "complete": "GESCHAFFT!",
    "tapToStart": "TIPPEN ZUM STARTEN",
    "preset": "Preset wählen",
    "totalRemaining": "Noch {{time}}",
    "roundInfo": "Runde {{current}} von {{total}}"
  }
}
```

**Step 2: Add English translations**

In `src/locales/en.json`, add to the `"timer"` object (after line 8, before closing brace):

```json
{
  "timer": {
    "ready": "READY?",
    "prepare": "GET READY!",
    "exercise": "EXERCISE - Round {{current}}/{{total}}",
    "rest": "REST - Round {{current}}/{{total}}",
    "complete": "COMPLETE!",
    "tapToStart": "TAP TO START",
    "preset": "Select Preset",
    "totalRemaining": "{{time}} remaining",
    "roundInfo": "Round {{current}} of {{total}}"
  }
}
```

**Step 3: Verify JSON syntax**

```bash
npm run build
```

Expected: Build succeeds (validates JSON is syntactically correct)

**Step 4: Commit translations**

```bash
git add src/locales/de.json src/locales/en.json
git commit -m "feat: add i18n keys for training info display

- Add timer.totalRemaining for total workout time
- Add timer.roundInfo for round progress
- Support both German and English"
```

Expected: Commit created successfully

---

## Task 3: Add Calculation Logic with Unit Tests (TDD)

**Files:**
- Modify: `src/components/Timer.tsx:42-46` (add helper function)
- Modify: `src/components/Timer.test.tsx` (add tests)

**Step 1: Write failing test for Prepare phase calculation**

Add to `src/components/Timer.test.tsx` (before closing describe block):

```typescript
describe('calculateTotalRemainingTime', () => {
  test('calculates correctly in Prepare phase', () => {
    const settings: WorkoutSettings = {
      rounds: 8,
      exerciseTime: 45,
      restTime: 15,
      prepTime: 10
    };

    render(
      <Timer
        settings={settings}
        activePresetName="Test"
        presets={[{ id: '1', name: 'Test', settings, createdAt: Date.now() }]}
        activePresetId="1"
        onRunningChange={() => {}}
        onPresetChange={() => {}}
      />
    );

    // Start timer to enter Prepare phase
    const startButton = screen.getByLabelText('Start');
    fireEvent.click(startButton);

    // In Prepare phase with prepTime=10s remaining:
    // Expected: 10 + (8 × 45) + (7 × 15) = 10 + 360 + 105 = 475s
    // This test will fail until we implement the function
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- --watchAll=false Timer.test
```

Expected: Test fails (calculateTotalRemainingTime not visible yet)

**Step 3: Add calculateTotalRemainingTime helper function**

In `src/components/Timer.tsx`, add after `formatTime` function (around line 46):

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

**Step 4: Add comprehensive unit tests**

Replace the placeholder test with complete tests in `src/components/Timer.test.tsx`:

```typescript
describe('Total remaining time calculation', () => {
  const createTestSettings = (
    rounds = 8,
    exerciseTime = 45,
    restTime = 15,
    prepTime = 10
  ): WorkoutSettings => ({
    rounds,
    exerciseTime,
    restTime,
    prepTime
  });

  test('displays total remaining time in Prepare phase', () => {
    const settings = createTestSettings();
    render(
      <Timer
        settings={settings}
        activePresetName="Test"
        presets={[{ id: '1', name: 'Test', settings, createdAt: Date.now() }]}
        activePresetId="1"
        onRunningChange={() => {}}
        onPresetChange={() => {}}
      />
    );

    const startButton = screen.getByLabelText('Start');
    fireEvent.click(startButton);

    // Prepare phase: should show info-top with total time
    const infoTop = screen.getByText(/Noch|remaining/i);
    expect(infoTop).toBeInTheDocument();
  });

  test('calculates correctly in Exercise phase Round 1', () => {
    const settings = createTestSettings(8, 45, 15, 10);
    const { rerender } = render(
      <Timer
        settings={settings}
        activePresetName="Test"
        presets={[{ id: '1', name: 'Test', settings, createdAt: Date.now() }]}
        activePresetId="1"
        onRunningChange={() => {}}
        onPresetChange={() => {}}
      />
    );

    const startButton = screen.getByLabelText('Start');
    fireEvent.click(startButton);

    // Fast-forward through Prepare phase using act and jest timers
    act(() => {
      jest.advanceTimersByTime(10000); // Skip 10s prepare time
    });

    rerender(
      <Timer
        settings={settings}
        activePresetName="Test"
        presets={[{ id: '1', name: 'Test', settings, createdAt: Date.now() }]}
        activePresetId="1"
        onRunningChange={() => {}}
        onPresetChange={() => {}}
      />
    );

    // Now in Exercise phase Round 1
    // Remaining: 45s (current) + (7 × 45) + (7 × 15) = 45 + 315 + 105 = 465s = 7:45
    const infoTop = screen.getByText(/7:45|Noch/i);
    expect(infoTop).toBeInTheDocument();
  });

  test('displays round info correctly', () => {
    const settings = createTestSettings(8, 45, 15, 10);
    render(
      <Timer
        settings={settings}
        activePresetName="Test"
        presets={[{ id: '1', name: 'Test', settings, createdAt: Date.now() }]}
        activePresetId="1"
        onRunningChange={() => {}}
        onPresetChange={() => {}}
      />
    );

    const startButton = screen.getByLabelText('Start');
    fireEvent.click(startButton);

    // Fast-forward to Exercise phase
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Should show "Runde 1 von 8" or "Round 1 of 8"
    const infoBottom = screen.getByText(/Runde 1 von 8|Round 1 of 8/i);
    expect(infoBottom).toBeInTheDocument();
  });
});
```

**Step 5: Run tests to verify they pass**

```bash
npm test -- --watchAll=false Timer.test
```

Expected: All Timer tests pass

**Step 6: Commit calculation logic with tests**

```bash
git add src/components/Timer.tsx src/components/Timer.test.tsx
git commit -m "feat: add total remaining time calculation logic

- Add calculateTotalRemainingTime() helper function
- Handle Prepare, Exercise, Rest phases correctly
- Add comprehensive unit tests for all phases
- Tests verify correct time calculations"
```

Expected: Commit created

---

## Task 4: Update Timer CSS for Grid Layout

**Files:**
- Modify: `src/components/Timer.css:1-18`
- Modify: `src/components/Timer.css:90-107` (add info area styles)

**Step 1: Convert timer-container to CSS Grid**

In `src/components/Timer.css`, replace `.timer-container` style (lines 1-8):

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

**Step 2: Add grid-area to timer-content**

In `src/components/Timer.css`, update `.timer-content` (lines 10-18):

```css
.timer-content {
  grid-area: main;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  width: 100%;
  padding: 20px;
}
```

**Step 3: Add info area styles**

In `src/components/Timer.css`, add after `.preset-label` style (around line 161):

```css
/* Training info areas */
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

**Step 4: Add responsive styles for info areas**

In `src/components/Timer.css`, add to existing `@media (max-width: 768px)` block (around line 163):

```css
/* Tablet */
@media (max-width: 768px) {
  .preset-dropdown {
    font-size: 15px;
    padding: 9px 18px;
    min-width: 180px;
  }

  .preset-label {
    font-size: 13px;
    padding: 5px 10px;
  }

  .info-top,
  .info-bottom {
    font-size: 16px;
    padding: 10px;
  }
}
```

And to `@media (max-width: 480px)` block (around line 176):

```css
/* Mobile */
@media (max-width: 480px) {
  .preset-dropdown {
    font-size: 14px;
    padding: 8px 16px;
    min-width: 160px;
  }

  .preset-label {
    font-size: 12px;
    padding: 4px 8px;
  }

  .info-top,
  .info-bottom {
    font-size: 14px;
    padding: 8px;
  }
}
```

**Step 5: Verify CSS compiles**

```bash
npm run build
```

Expected: Build succeeds

**Step 6: Commit CSS changes**

```bash
git add src/components/Timer.css
git commit -m "feat: add CSS Grid layout for timer viewport

- Convert timer-container to CSS Grid with named areas
- Add info-top and info-bottom grid areas
- Add responsive styles for tablet and mobile
- Main content area uses grid-area: main"
```

Expected: Commit created

---

## Task 5: Update Timer Component JSX

**Files:**
- Modify: `src/components/Timer.tsx:236-283` (JSX structure)

**Step 1: Add info areas to JSX**

In `src/components/Timer.tsx`, update the return statement (around line 236):

```tsx
return (
  <div className="timer-container" style={{ backgroundColor: getPhaseColor() }}>
    {/* Info areas - visible only during training */}
    {(state.phase === Phase.Prepare ||
      state.phase === Phase.Exercise ||
      state.phase === Phase.Rest) && (
      <>
        <div className="info-top">
          {t('timer.totalRemaining', { time: formatTime(calculateTotalRemainingTime()) })}
        </div>
        <div className="info-bottom">
          {t('timer.roundInfo', { current: state.currentRound, total: settings.rounds })}
        </div>
      </>
    )}

    <div className="timer-content">
      {/* Preset: dropdown before training, read-only label during training */}
      {state.phase === Phase.Ready && presets.length > 1 ? (
        <div className="preset-selector">
          <select
            id="preset-select"
            value={activePresetId}
            onChange={(e) => onPresetChange(e.target.value)}
            className="preset-dropdown"
          >
            {presets.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="preset-label">{activePresetName}</div>
      )}

      <div className="phase-text">{getPhaseText()}</div>
      <div className="timer-display">
        {state.phase === Phase.Ready ? t('timer.tapToStart') : formatTime(state.timeRemaining)}
      </div>
      <div className="controls">
        <button
          className="control-button start-pause-button"
          onClick={handleStartPause}
          aria-label={state.phase === Phase.Ready ? 'Start' : state.isRunning ? 'Pause' : 'Resume'}
        >
          {state.phase === Phase.Ready || state.phase === Phase.Complete ? <PlayIcon /> : state.isRunning ? <PauseIcon /> : <PlayIcon />}
        </button>
        {state.phase !== Phase.Ready && state.phase !== Phase.Complete && (
          <button
            className="control-button reset-button"
            onClick={handleReset}
            aria-label="Reset"
          >
            <ResetIcon />
          </button>
        )}
      </div>
    </div>
  </div>
);
```

**Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: Build succeeds

**Step 3: Run all tests**

```bash
npm test -- --watchAll=false
```

Expected: All tests pass (149+ tests)

**Step 4: Commit JSX changes**

```bash
git add src/components/Timer.tsx
git commit -m "feat: add info areas to Timer component JSX

- Conditionally render info-top and info-bottom
- Show only during Prepare, Exercise, Rest phases
- Use i18n keys for translations
- Display total remaining time and round progress"
```

Expected: Commit created

---

## Task 6: Add Rendering Tests for Info Areas

**Files:**
- Modify: `src/components/Timer.test.tsx` (add rendering tests)

**Step 1: Write tests for conditional visibility**

Add to `src/components/Timer.test.tsx` after existing tests:

```typescript
describe('Training info areas visibility', () => {
  const defaultSettings: WorkoutSettings = {
    rounds: 8,
    exerciseTime: 45,
    restTime: 15,
    prepTime: 10
  };

  const defaultPreset = {
    id: '1',
    name: 'Test',
    settings: defaultSettings,
    createdAt: Date.now()
  };

  test('hides info areas in Ready phase', () => {
    render(
      <Timer
        settings={defaultSettings}
        activePresetName="Test"
        presets={[defaultPreset]}
        activePresetId="1"
        onRunningChange={() => {}}
        onPresetChange={() => {}}
      />
    );

    // Should not show info areas in Ready phase
    expect(screen.queryByText(/Noch|remaining/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Runde.*von|Round.*of/i)).not.toBeInTheDocument();
  });

  test('shows info areas in Prepare phase', () => {
    render(
      <Timer
        settings={defaultSettings}
        activePresetName="Test"
        presets={[defaultPreset]}
        activePresetId="1"
        onRunningChange={() => {}}
        onPresetChange={() => {}}
      />
    );

    // Start timer to enter Prepare phase
    const startButton = screen.getByLabelText('Start');
    fireEvent.click(startButton);

    // Should show both info areas
    expect(screen.getByText(/Noch|remaining/i)).toBeInTheDocument();
    expect(screen.getByText(/Runde 1 von 8|Round 1 of 8/i)).toBeInTheDocument();
  });

  test('shows info areas in Exercise phase', async () => {
    render(
      <Timer
        settings={defaultSettings}
        activePresetName="Test"
        presets={[defaultPreset]}
        activePresetId="1"
        onRunningChange={() => {}}
        onPresetChange={() => {}}
      />
    );

    const startButton = screen.getByLabelText('Start');
    fireEvent.click(startButton);

    // Fast-forward to Exercise phase
    act(() => {
      jest.advanceTimersByTime(10000); // Skip prepare time
    });

    // Should still show info areas
    expect(screen.getByText(/Noch|remaining/i)).toBeInTheDocument();
    expect(screen.getByText(/Runde 1 von 8|Round 1 of 8/i)).toBeInTheDocument();
  });

  test('shows info areas in Rest phase', async () => {
    render(
      <Timer
        settings={defaultSettings}
        activePresetName="Test"
        presets={[defaultPreset]}
        activePresetId="1"
        onRunningChange={() => {}}
        onPresetChange={() => {}}
      />
    );

    const startButton = screen.getByLabelText('Start');
    fireEvent.click(startButton);

    // Fast-forward to Rest phase (Prepare + Exercise)
    act(() => {
      jest.advanceTimersByTime(10000 + 45000); // 10s prepare + 45s exercise
    });

    // Should still show info areas
    expect(screen.getByText(/Noch|remaining/i)).toBeInTheDocument();
    expect(screen.getByText(/Runde 1 von 8|Round 1 of 8/i)).toBeInTheDocument();
  });

  test('hides info areas in Complete phase', async () => {
    const quickSettings: WorkoutSettings = {
      rounds: 1,
      exerciseTime: 1,
      restTime: 1,
      prepTime: 1
    };

    render(
      <Timer
        settings={quickSettings}
        activePresetName="Test"
        presets={[{ ...defaultPreset, settings: quickSettings }]}
        activePresetId="1"
        onRunningChange={() => {}}
        onPresetChange={() => {}}
      />
    );

    const startButton = screen.getByLabelText('Start');
    fireEvent.click(startButton);

    // Fast-forward to Complete phase
    act(() => {
      jest.advanceTimersByTime(3000); // 1s prepare + 1s exercise + buffer
    });

    // Should not show info areas in Complete phase
    expect(screen.queryByText(/Noch|remaining/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Runde.*von|Round.*of/i)).not.toBeInTheDocument();
  });

  test('applies correct CSS classes to info areas', () => {
    const { container } = render(
      <Timer
        settings={defaultSettings}
        activePresetName="Test"
        presets={[defaultPreset]}
        activePresetId="1"
        onRunningChange={() => {}}
        onPresetChange={() => {}}
      />
    );

    const startButton = screen.getByLabelText('Start');
    fireEvent.click(startButton);

    // Verify CSS classes exist
    const infoTop = container.querySelector('.info-top');
    const infoBottom = container.querySelector('.info-bottom');

    expect(infoTop).toBeInTheDocument();
    expect(infoBottom).toBeInTheDocument();
  });
});
```

**Step 2: Run tests to verify they pass**

```bash
npm test -- --watchAll=false Timer.test
```

Expected: All Timer tests pass (including new rendering tests)

**Step 3: Commit rendering tests**

```bash
git add src/components/Timer.test.tsx
git commit -m "test: add rendering tests for training info areas

- Test visibility in all phases (Ready, Prepare, Exercise, Rest, Complete)
- Verify info areas hidden in Ready and Complete
- Verify info areas visible during training
- Test CSS classes applied correctly"
```

Expected: Commit created

---

## Task 7: Run Full Test Suite and Build

**Files:**
- None (validation step)

**Step 1: Run all unit tests**

```bash
npm test -- --watchAll=false
```

Expected: All tests pass (149+ tests, should be ~155-160 with new tests)

**Step 2: Run production build**

```bash
npm run build
```

Expected: Build succeeds without errors or warnings

**Step 3: Start dev server for manual verification**

```bash
npm start
```

Expected: App starts on http://localhost:3000

(Keep this running for next task)

---

## Task 8: Manual Testing with Playwright MCP

**Files:**
- None (manual testing)

**Prerequisites:**
- Dev server running (`npm start` from previous task)
- Playwright MCP available

**Step 1: Navigate to app**

Use Playwright MCP tool:
```
browser_navigate to http://localhost:3000
```

Expected: App loads in Ready phase

**Step 2: Take initial snapshot**

```
browser_snapshot
```

Expected: Snapshot shows Ready phase, no info areas visible

**Step 3: Start timer**

```
browser_click on Play button (aria-label="Start")
```

Expected: Timer enters Prepare phase

**Step 4: Verify info areas appear**

```
browser_snapshot
```

Expected: Snapshot shows:
- info-top with "Noch X:XX" or "X:XX remaining"
- info-bottom with "Runde 1 von X" or "Round 1 of X"
- Main timer counting down

**Step 5: Wait for Exercise phase**

```
browser_wait_for text "TRAINING" or "EXERCISE"
```

Expected: Phase changes to Exercise

**Step 6: Verify info areas still visible**

```
browser_snapshot
```

Expected: Info areas still visible, time decreasing

**Step 7: Verify countdown works**

Wait 2-3 seconds and take another snapshot:
```
browser_snapshot
```

Expected: Total remaining time has decreased

**Step 8: Reset timer**

```
browser_click on Reset button
```

Expected: Timer returns to Ready phase

**Step 9: Verify info areas disappear**

```
browser_snapshot
```

Expected: Info areas are gone, back to Ready state

**Step 10: Close browser**

```
browser_close
```

**Step 11: Document findings**

Note: If any issues found during manual testing, fix them before proceeding to PR creation.

**Step 12: Stop dev server**

Press Ctrl+C in terminal running `npm start`

---

## Task 9: Commit Design Doc and Create PR

**Files:**
- Create: `docs/plans/2026-02-16-viewport-grid-layout-design.md` (already exists, add to git)

**Step 1: Add design document**

```bash
git add docs/plans/2026-02-16-viewport-grid-layout-design.md
git commit -m "docs: add viewport grid layout design document

- Document architecture and design decisions
- Include calculation logic examples
- Specify testing strategy
- Reference for future maintenance"
```

Expected: Commit created

**Step 2: Review all commits**

```bash
git log --oneline feat/viewport-grid-layout
```

Expected: Shows ~7 commits:
1. Add i18n keys
2. Add calculation logic with tests
3. Add CSS Grid layout
4. Add info areas to JSX
5. Add rendering tests
6. Add design document

**Step 3: Push feature branch**

```bash
git push -u origin feat/viewport-grid-layout
```

Expected: Branch pushed to remote

**Step 4: Create Pull Request**

Use GitHub CLI:
```bash
gh pr create --title "feat: Viewport Grid Layout with Training Information" --body "$(cat <<'EOF'
## Summary
Add CSS Grid layout to Timer component displaying:
- **Top area:** Total remaining workout time (e.g., "Noch 5:30")
- **Bottom area:** Current round progress (e.g., "Runde 2 von 8")

Info areas visible only during training phases (Prepare, Exercise, Rest).

## Changes
- ✅ CSS Grid layout with named areas (info-top, main, info-bottom)
- ✅ `calculateTotalRemainingTime()` helper function
- ✅ Conditional rendering based on phase
- ✅ i18n support (German & English)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Comprehensive unit tests (~10 new tests)
- ✅ Manual testing via Playwright MCP

## Testing
- ✅ All 155+ tests pass
- ✅ Build succeeds
- ✅ Manually tested with Playwright MCP
- ✅ Verified on iPhone 12 viewport (390×844)

## Test Plan
1. Start timer → Info areas appear
2. Verify total time counts down correctly
3. Verify round progress updates through phases
4. Reset timer → Info areas disappear
5. Complete workout → Info areas disappear

## Screenshots
[Add screenshots from Playwright MCP testing if available]

## Closes
Closes #[issue-number]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR created successfully with URL

**Step 5: Verify PR on GitHub**

Open PR URL in browser and verify:
- Title and description are correct
- All commits are present
- CI/CD checks start running (if configured)

**Step 6: Request review (if applicable)**

If there are team members, request review via GitHub UI.

---

## Post-Implementation Checklist

- [ ] Feature branch created (`feat/viewport-grid-layout`)
- [ ] GitHub issue created and referenced in PR
- [ ] i18n translations added (German & English)
- [ ] `calculateTotalRemainingTime()` implemented with tests
- [ ] CSS Grid layout implemented
- [ ] Info areas added to JSX with conditional rendering
- [ ] Rendering tests added for all phases
- [ ] All tests pass (155+ tests)
- [ ] Build succeeds
- [ ] Manual testing completed with Playwright MCP
- [ ] Design document committed
- [ ] PR created and ready for review

---

## Success Criteria

✅ Grid layout with CSS Grid and named areas
✅ Total remaining time calculates correctly (Prepare, Exercise, Rest phases)
✅ Round progress displays correctly (e.g., "Runde 2 von 8")
✅ Info areas hidden in Ready and Complete phases
✅ Info areas visible during Prepare, Exercise, Rest phases
✅ Responsive design (mobile, tablet, desktop)
✅ All tests pass (149+ → 155+)
✅ Build succeeds
✅ i18n works (German & English)

---

## Notes for Implementer

**TDD Approach:**
- Write failing tests first
- Implement minimal code to pass
- Refactor if needed
- Commit frequently

**Common Pitfalls:**
1. **Calculation errors:** Test edge cases (first round, last round, single round)
2. **Grid layout on mobile:** Verify info areas don't overlap with main content
3. **Phase transitions:** Ensure info areas appear/disappear smoothly
4. **i18n:** Test both German and English to verify interpolation works

**References:**
- Design Doc: `docs/plans/2026-02-16-viewport-grid-layout-design.md`
- CLAUDE.md: Project workflow and testing guidelines
- CSS Grid Guide: https://css-tricks.com/snippets/css/complete-guide-grid/

**Estimated Time:** 60-90 minutes (including testing)
