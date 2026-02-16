# Fitness Timer - Agent Task Prompts

This document defines prompts and approaches for common task types in the Fitness Timer project.

---

## Task Type: Add New Feature

### Context to Gather
1. What phase/page should the feature appear on?
2. Does it affect timer behavior or just UI?
3. Does it require new i18n keys?
4. Does it need new localStorage persistence?

### Implementation Checklist
- [ ] Read existing similar feature for patterns
- [ ] Define TypeScript interfaces for any new data
- [ ] Create/update component with SVG icons (never emoji)
- [ ] Add all i18n keys to both en.json and de.json
- [ ] Add/update tests (Settings.test.tsx, Timer.test.tsx, etc.)
- [ ] Update README with new feature description
- [ ] Take screenshots with new feature (English language)
- [ ] Test on mobile viewport
- [ ] Commit with format: `feat: description of feature`

### Key Files to Touch
- `src/App.tsx` - State management if needed
- `src/components/Timer.tsx` or `Settings.tsx` - Component implementation
- `src/utils/localStorage.ts` - If persistence needed
- `src/locales/en.json` + `de.json` - Translations
- `src/components/[Component].css` - Styling
- `README.md` - Feature documentation

---

## Task Type: Fix Bug

### Investigation Steps
1. Check if bug is reproducible
2. Identify which component/utility is at fault
3. Review related tests - are they failing?
4. Check localStorage/browser state
5. Test on mobile if device-specific

### Fix Implementation
- [ ] Write failing test that reproduces bug
- [ ] Implement fix
- [ ] Verify test passes
- [ ] Check for side effects in related components
- [ ] Update documentation if behavior changes
- [ ] Commit with format: `fix: description of fix`

### Common Bug Sources
- **State not updating**: Check useEffect dependencies
- **Layout issues**: Check responsive CSS media queries
- **Translation missing**: Key not in en.json or de.json
- **Audio not playing**: iOS gesture lock, check permissions
- **localStorage issues**: Check migrations, data format

---

## Task Type: Refactor Code

### Approval Before Starting
- [ ] Confirm refactoring goal (readability? performance? consistency?)
- [ ] Identify all files affected
- [ ] Note: Don't refactor for hypothetical future needs, only clear issues

### Refactoring Steps
1. Ensure all tests pass before starting
2. Make changes in small, logical chunks
3. Run tests after each chunk
4. Document any API changes in code comments
5. Update tests if signatures changed
6. Commit with format: `refactor: what was improved`

### Anti-Patterns to Avoid
- Don't add unnecessary abstraction layers
- Don't rename unused variables (delete them instead)
- Don't add backward-compatibility shims
- Don't over-engineer for future requirements

---

## Task Type: Update UI/Styling

### Before Changes
- [ ] Take screenshot of current state
- [ ] Document what should change
- [ ] Consider mobile responsiveness
- [ ] Plan CSS breakpoints

### Implementation
- [ ] Update component styling in .css file
- [ ] Test responsive behavior (@media queries)
- [ ] Replace emoji with SVG icons if needed
- [ ] Verify colors match existing palette
- [ ] Test on mobile viewport
- [ ] Take new screenshot for README if public-facing

### CSS Guidelines
```css
/* Mobile-first base styles */
.element {
  /* Base mobile styles */
}

/* Tablet and up */
@media (max-width: 768px) {
  .element { /* Tablet adjustments */ }
}

/* Larger screens */
@media (max-width: 480px) {
  .element { /* Mobile adjustments */ }
}
```

---

## Task Type: Update Documentation

### README Changes
- Feature descriptions should explain "what" and "why"
- Include screenshots showing the feature in English
- Update feature list if adding major feature
- Keep installation/setup instructions current

### Screenshot Process
1. Run app on localhost
2. Set language to English
3. Navigate to feature
4. Use Playwright to take screenshot (professional quality)
5. Save to project root with descriptive name
6. Reference in README with proper markdown

### Code Comments
- Add comments only for non-obvious logic
- Don't add to freshly written clear code
- Keep comments updated with code changes
- Remove obsolete comments

---

## Task Type: Add i18n Support

### Process
1. Identify all user-facing strings
2. Create translation keys following `feature.action` pattern
3. Add entry to both `en.json` AND `de.json`
4. Use `useTranslation()` hook in component
5. Test both languages work
6. No hardcoded text strings in JSX

### Common Patterns
```typescript
// Simple text
const { t } = useTranslation();
<h1>{t('settings.title')}</h1>

// With variables
<p>{t('timer.exercise', { current: 3, total: 10 })}</p>

// Array of options
presets.map(preset => (
  <option value={preset.id}>{preset.name}</option>
))
```

### Key Naming Conventions
- `app.*` - Top-level app strings
- `timer.*` - Timer phase/display text
- `settings.*` - Settings form labels
- `presets.*` - Preset management strings
- `languages.*` - Language names (en, de)

---

## Task Type: Improve Performance

### Profiling
1. Use browser DevTools Performance tab
2. Check for unnecessary re-renders
3. Measure timer accuracy (should tick every 1s)
4. Check localStorage read/write performance
5. Monitor memory usage on long workouts

### Common Optimizations
- `useCallback` for stable event handler references
- Memoization for expensive calculations
- Lazy load non-critical components
- Optimize images/assets size

### Don't Optimize Prematurely
- Profile first, then optimize
- Only optimize identified bottlenecks
- Measure impact of changes

---

## Task Type: Add Tests

### Testing Approach
- Test user behavior, not implementation details
- Use React Testing Library (not Enzyme)
- One test file per component
- Name tests descriptively: `should do X when Y happens`

### Test Template
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Timer from './Timer';

describe('Timer Component', () => {
  it('should display "READY?" when in ready phase', () => {
    render(<Timer {...defaultProps} />);
    expect(screen.getByText('READY?')).toBeInTheDocument();
  });

  it('should transition to exercise phase after start', () => {
    render(<Timer {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    // Assert new state
  });
});
```

### What to Test
- User interactions (clicks, inputs)
- Phase transitions
- Validation logic
- Props changes
- Error states

### What NOT to Test
- Implementation details (internal state, private methods)
- External libraries (assume they work)
- Browser APIs (unless wrapping them)

---

## Task Type: Browser Compatibility

### Devices to Test
1. iPhone (primary)
   - Portrait + Landscape
   - Safari only
   - Test audio playback, screen lock

2. iPad (secondary)
   - Safari + Chrome
   - Portrait + Landscape

3. Android
   - Chrome primary
   - Firefox secondary

4. Desktop
   - Chrome, Firefox, Safari, Edge
   - Responsive design at various widths

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Audio won't play | iOS gesture requirement | Unlock with user gesture in handleStartPause |
| Screen locks during exercise | No wake lock | Use useWakeLock hook |
| Text looks blurry | -webkit properties missing | Add -webkit vendor prefixes |
| Keyboard pushes content up | No viewport management | Add viewport meta tag |
| Buttons hard to tap | Too small on mobile | Min 48px touch target |

---

## Task Type: Feature Request Planning

### Questions to Answer
1. **Who uses this?** (Primary user type)
2. **When do they need it?** (During/after/before workout?)
3. **Is it essential or nice-to-have?**
4. **How complex is it?** (Lines of code, data structures)
5. **What could break?** (Edge cases, regressions)
6. **Does it require new dependencies?**
7. **Will it impact performance?**

### Estimation (Relative)
- Small: 1-2 hours (simple UI change, new translation)
- Medium: 2-4 hours (new feature, localStorage change)
- Large: 4+ hours (major refactor, new state management)

### Before Implementing
- [ ] Get approval on approach
- [ ] Identify all affected files
- [ ] Check for similar existing code to follow patterns
- [ ] Plan testing strategy

---

## Git Workflow

### Branch Naming
- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation only
- `refactor/what-changed` - Refactoring

### Commit Message Format
```
type: brief description

Optional detailed explanation if needed.
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`

### Pull Request Template
```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update

## Testing Done
- Describe how you tested the change
- Include device/browser info

## Screenshots (if UI change)
Include before/after screenshots

## Checklist
- [ ] Tests pass
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] Mobile responsive
```

---

## Common Command Reference

```bash
# Start development
npm start

# Run tests
npm test
npm run test:ci                    # CI mode
npm test -- --coverage --watchAll=false

# Build for production
npm run build

# Format code (if prettier setup)
npm run format                     # (if available)
```

---

## Debugging Tips

### Browser Console Issues
- `[LOG] [Matomo]` - Analytics events (expected)
- `[WARNING] apple-mobile-web-app-capable` - iOS meta tag (expected)
- `[ERROR] Failed to load bell.mp3` - Audio not found (expected in dev sometimes)

### Common Issues
1. **Translations not loading**: Check i18n initialization in index.tsx
2. **localStorage empty**: Check privacy mode, check migrations
3. **Timer not ticking**: Check useEffect interval setup
4. **Presets not saving**: Check localStorage quota exceeded
5. **UI looks broken on mobile**: Check media queries, viewport meta tag

### Using DevTools
```javascript
// In browser console
// Inspect localStorage
localStorage.getItem('presetStore')

// Clear data
localStorage.clear()

// Check translations
i18n.t('timer.ready')
```

---

## Performance Targets

- **First Paint**: < 2 seconds
- **Timer Accuracy**: ±0.5 seconds per minute
- **App Size**: < 500KB gzipped
- **LocalStorage**: < 100KB (plenty of room)
- **Memory**: Stable after loading (no leaks)

---

## Resources for Agents

### When implementing a feature, check:
1. `.claude/instructions.md` - Project architecture and standards
2. `src/components/Timer.tsx` - Timer state machine pattern
3. `src/components/Settings.tsx` - Preset management pattern
4. `src/utils/icons.tsx` - Icon usage
5. `src/locales/en.json` - Translation keys structure

### External Resources
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs
- i18next: https://www.i18next.com
- Testing Library: https://testing-library.com

---

**Last Updated**: 2026-02-15
**For**: Claude Code Agents working on Fitness Timer project
