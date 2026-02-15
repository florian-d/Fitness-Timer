# Fitness Timer - Developer Documentation

This directory contains comprehensive documentation for developers and Claude Code agents working on the Fitness Timer project.

## 📚 Documentation Index

### **[instructions.md](./instructions.md)** - Project Standards & Guidelines
The main reference for how to code in this project.

- Project overview and architecture
- React/TypeScript best practices
- Icon system (SVG-based)
- CSS conventions
- Internationalization (i18n) guidelines
- Testing best practices
- localStorage patterns
- Common gotchas

👉 **Start here** for general project questions and coding standards.

### **[agent-prompts.md](./agent-prompts.md)** - Task-Specific Workflows
Detailed guidance for specific types of tasks.

- Add New Feature (step-by-step checklist)
- Fix Bug (investigation & testing approach)
- Refactor Code (maintaining quality)
- Update UI/Styling (responsive design)
- Update Documentation (what to document)
- Add i18n Support (translation workflow)
- Improve Performance (profiling & optimization)
- Add Tests (testing patterns)
- Browser Compatibility (testing guide)
- Git Workflow & Commit conventions

👉 **Use when** starting a specific task type.

### **[architecture-decisions.md](./architecture-decisions.md)** - Design Rationale
Architecture Decision Records (ADRs) explaining why things are designed the way they are.

- ADR-001: SVG Icons Instead of Emojis
- ADR-002: useReducer for Timer State Machine
- ADR-003: Component-Level State for Settings
- ADR-004: Preset Store Structure
- ADR-005: i18next for i18n
- ADR-006: localStorage for Persistence
- ADR-007: CSS Files (vs CSS-in-JS)
- ADR-008: Wake Lock Implementation
- ADR-009: Matomo Analytics
- ADR-010: Test-Driven Development
- ADR-011: Multilingual UI
- ADR-012: Git Workflow with Feature Branches

Each ADR includes problem, decision, rationale, benefits, and tradeoffs.

👉 **Read when** wondering "Why did they do it this way?"

---

## 🚀 Quick Start

### First Time?
1. Read **instructions.md** for project overview
2. Understand the architecture from **architecture-decisions.md**
3. Look at examples in `src/components/`

### Starting a Task?
1. Find your task type in **agent-prompts.md**
2. Follow the checklist
3. Refer to **instructions.md** for standards

### Implementing a Feature?
```
1. Read instructions.md (structure, patterns)
2. Check agent-prompts.md (Add New Feature)
3. Look at existing similar component
4. Code following the patterns
5. Write tests
6. Update README.md
7. Commit with proper message
```

---

## 📋 Key Principles

### Never Do This ❌
- Use emoji icons (`⏸`, `☰`, `✕`)
- Hardcode text (`<h1>Settings</h1>`)
- Skip tests for new features
- Ignore mobile responsiveness
- Use `any` type in TypeScript

### Always Do This ✅
- Use SVG icons from `src/utils/icons.tsx`
- Use `t('key')` for all text (i18n)
- Write tests for user-facing behavior
- Mobile-first CSS approach
- Proper TypeScript types

---

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Timer.tsx       # Timer state machine
│   ├── Timer.css
│   ├── Timer.test.tsx
│   ├── Settings.tsx    # Preset editor
│   ├── Settings.css
│   └── Settings.test.tsx
├── hooks/              # Custom React hooks
│   └── useWakeLock.ts  # Screen wake lock
├── utils/              # Utilities
│   ├── icons.tsx       # SVG icon components
│   ├── localStorage.ts # Preset persistence
│   └── analytics.ts    # Matomo tracking
└── locales/            # Translations
    ├── en.json
    └── de.json
```

---

## 💡 Common Tasks

### Add a New Feature
→ See `agent-prompts.md` "Add New Feature"

### Fix a Bug
→ See `agent-prompts.md` "Fix Bug"

### Update UI Styling
→ See `agent-prompts.md` "Update UI/Styling"

### Add i18n Support
→ See `agent-prompts.md` "Add i18n Support"

### Write Tests
→ See `agent-prompts.md` "Add Tests" and `instructions.md` "Testing Guidelines"

---

## 🧪 Testing

```bash
npm test                                    # Interactive mode
npm run test:ci                             # CI mode (no watch)
npm test -- --coverage --watchAll=false   # With coverage report
```

---

## 🔗 Links

- [Main README](../README.md) - User-facing documentation
- [GitHub Repository](https://github.com/florian-d/Fitness-Timer)
- [FTP Deployment Guide](./FTP_DEPLOYMENT.md)

---

## 📝 Contributing

1. Create feature branch from `main`
2. Follow standards in `instructions.md`
3. Follow workflow in `agent-prompts.md` for your task type
4. Write tests (see Testing Guidelines)
5. Create PR with description
6. Address review comments
7. Merge when approved

---

**This documentation is for developers and AI agents contributing to the Fitness Timer project.**

Last Updated: 2026-02-15
