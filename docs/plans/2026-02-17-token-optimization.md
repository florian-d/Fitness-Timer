# Token-Optimierung Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce Claude context tokens per session by consolidating 1,735 lines of `.claude/` documentation into one lean `CLAUDE.md` (~150 lines) and deleting stale log files.

**Architecture:** Replace four verbose `.claude/*.md` docs with a single enriched `CLAUDE.md`. Content from `instructions.md` (conventions, file structure, DO/DON'T) and `architecture-decisions.md` (summary table) is distilled into CLAUDE.md. Files `.claude/agent-prompts.md` and `.claude/README.md` are deleted entirely as they provide no project-specific value.

**Tech Stack:** No code changes — documentation and file system only.

---

### Task 1: Create the new consolidated CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Replace CLAUDE.md with the new consolidated version**

Write the following content to `CLAUDE.md`:

```markdown
# Fitness-Timer - Development Guide

## Quick Overview
HIIT timer app (React 18 + TypeScript). Test with Jest/Playwright on iPhone 12 viewport. Mobile-first.

---

## 🚨 CRITICAL RULES

### ⚠️ NEVER commit to `main` directly!
1. Create feature branch: `git checkout -b feat/name`
2. Make changes, commit, push
3. Create PR on GitHub
4. Merge via GitHub UI

### Branch Names
- `feat/` - Features  |  `fix/` - Bug fixes  |  `refactor/` - Refactoring  |  `test/` - Tests  |  `docs/` - Documentation

---

## ✅ Validation Checklist (Before Every Commit)

```bash
npm run build                    # Must compile
npm test -- --watchAll=false    # All tests must pass
npm start                        # Verify app loads (for UI changes)
```

---

## Tech Stack
- React 18 + TypeScript
- Jest + React Testing Library + Playwright
- useReducer state management
- react-i18next (EN/DE)
- CSS styling (separate `.css` files per component)

---

## File Structure

```
src/
├── App.tsx                    # Preset state management + types (WorkoutSettings, WorkoutPreset, PresetStore)
├── components/
│   ├── Timer.tsx              # Timer state machine + display
│   └── Settings.tsx           # Settings UI + preset editor
├── hooks/useWakeLock.ts       # Screen wake lock during exercise
├── utils/
│   ├── icons.tsx              # SVG icon components (NEVER use emoji!)
│   ├── localStorage.ts        # Preset persistence + legacy migration
│   ├── presetStorage.ts       # Preset CRUD + defaults
│   ├── timerReducer.ts        # Timer state machine (Phase enum)
│   └── analytics.ts           # Matomo event tracking
└── locales/{en,de}.json       # Translations (ALWAYS update both!)
```

---

## Key Implementation Details

### Phase Type (Enum)
- Location: `src/utils/timerReducer.ts`
- Values: `Ready → Prepare → Exercise ↔ Rest → Complete`

### Phase Colors
- Gray `#6B7280` (ready) | Yellow `#F59E0B` (prepare) | Red `#EF4444` (exercise) | Green `#10B981` (rest) | Blue `#3B82F6` (complete)

### Test Preset
- Location: `src/utils/presetStorage.ts` as `TEST_PRESET_SETTINGS`
- Intervals: 1s prepare, 5s exercise, 2s rest — speeds up E2E testing 20x

### Wake Lock
- Active during Exercise AND Rest phases
- Gracefully handles unsupported browsers

---

## Key Conventions

### ✅ DO
- Use SVG icons from `utils/icons.tsx` (PlayIcon, PauseIcon, ResetIcon, MenuIcon, CloseIcon, BackIcon, EditIcon, TrashIcon, CheckIcon)
- Use `useTranslation()` for ALL user-facing text — no hardcoded strings
- Use `useCallback` for stable event handler references
- Update BOTH `en.json` and `de.json` together
- Test on mobile viewport (390x844)

### ❌ DON'T
- Use emoji icons — always use SVG
- Hardcode text strings — always use i18n keys (`feature.action` pattern)
- Modify localStorage directly — use utility functions from `utils/localStorage.ts`
- Commit to `main` directly

---

## Architecture Decisions (Summary)

| Decision | Choice | Rationale |
|---|---|---|
| State management | `useReducer` (timer) + local state (settings form) + App.tsx (presets) | Clear separation |
| Icons | SVG components in `utils/icons.tsx` | Consistent, scalable, styleable |
| i18n | i18next + JSON files | Industry standard, browser detection |
| Persistence | localStorage (key: `fitnessTimerPresets`) | Simple, offline-first |
| Styling | Separate `.css` files per component | Simple, no runtime overhead |
| Testing | React Testing Library — test behavior not internals | User-focused |
| Analytics | Matomo (privacy-first) | GDPR compliant, self-hostable |

---

## Testing

### Unit Tests (Jest)
```bash
npm test -- --watchAll=false    # Run once (all must pass)
```
Location: `src/**/*.test.ts(x)`

### E2E Tests (Playwright)
```bash
npm run e2e          # Headless (iPhone 12 viewport)
npm run e2e:ui       # Interactive UI mode
```
- Viewport: iPhone 12 (390x844) | Browsers: Chromium, Firefox, WebKit
- Manual: `npm start` → use Playwright MCP tools (browser_navigate, browser_click, browser_snapshot)

---

## Known Issues

- [ ] Audio in test environment (browser sandbox)
- [ ] Wake lock API mock coverage
- [ ] Visual regression tests needed
```

**Step 2: Verify the file was written correctly**

Run: `wc -l CLAUDE.md`
Expected: ~160 lines

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: consolidate .claude docs into lean CLAUDE.md"
```

---

### Task 2: Delete redundant .claude documentation files

**Files:**
- Delete: `.claude/instructions.md`
- Delete: `.claude/agent-prompts.md`
- Delete: `.claude/architecture-decisions.md`
- Delete: `.claude/README.md`

**Step 1: Delete the four documentation files**

```bash
rm .claude/instructions.md .claude/agent-prompts.md .claude/architecture-decisions.md .claude/README.md
```

**Step 2: Verify only settings files remain**

```bash
ls .claude/
```
Expected output (only these files):
```
settings.json
settings.local.json
```

**Step 3: Commit**

```bash
git add -u .claude/
git commit -m "refactor: remove redundant .claude documentation files"
```

---

### Task 3: Delete stale Playwright log files

**Files:**
- Delete: `.playwright-mcp/` directory (12 log files)

**Step 1: Delete all Playwright MCP logs**

```bash
rm -rf .playwright-mcp/
```

**Step 2: Verify deletion**

```bash
ls -la | grep playwright
```
Expected: no output (directory gone)

**Step 3: Add to .gitignore to prevent future accumulation**

Check if `.playwright-mcp/` is already in `.gitignore`:
```bash
grep playwright .gitignore
```

If not found, add it:
```
.playwright-mcp/
```

**Step 4: Commit**

```bash
git add .gitignore
git commit -m "chore: remove stale playwright logs, add to .gitignore"
```

---

### Task 4: Verify everything still works

**Step 1: Build must succeed**

```bash
npm run build
```
Expected: Build completes with no errors.

**Step 2: All unit tests must pass**

```bash
npm test -- --watchAll=false
```
Expected: All tests pass (documentation changes don't affect runtime).

**Step 3: Final commit check**

```bash
git log --oneline -5
```
Expected: The 3 new commits visible.

---

## Summary

After completion:
- **CLAUDE.md**: ~160 lines (was 79, now also covers conventions + architecture)
- **`.claude/`**: Only `settings.json` + `settings.local.json` (4 docs deleted)
- **`.playwright-mcp/`**: Deleted + gitignored
- **Token savings**: ~1,735 lines of docs removed
