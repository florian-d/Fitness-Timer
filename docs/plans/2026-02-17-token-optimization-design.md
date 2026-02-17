# Design: Token-Kosten-Optimierung

**Datum:** 2026-02-17
**Status:** Approved
**Ziel:** Claude-Kontext-Tokens pro Session reduzieren

---

## Problem

Die `.claude/`-Dokumentation hat über 1.700 Zeilen in 4 Dateien, die bei Aufgaben
gelesen werden. Das inflationiert den Kontext unnötig, da CLAUDE.md (79 Zeilen)
die gleichen Kerninfos kürzer enthält.

| Datei | Zeilen |
|---|---|
| `.claude/instructions.md` | 425 |
| `.claude/agent-prompts.md` | 419 |
| `.claude/architecture-decisions.md` | 524 |
| `.claude/README.md` | 367 |
| **Gesamt** | **1.735** |

---

## Lösung: Konsolidierung in ein schlankes CLAUDE.md

### Neue CLAUDE.md-Struktur (~150-160 Zeilen)

1. **Quick Overview** — bestehend (2 Zeilen)
2. **Critical Rules** — bestehend (Branching, No Direct Commit)
3. **Validation Checklist** — bestehend (3 Befehle)
4. **Tech Stack** — bestehend (5 Zeilen)
5. **Key Implementation Details** — bestehend + Dateistruktur (kompaktes Tree)
6. **Architecture Decisions** — neue 7-Zeilen-Tabelle (statt 524 Zeilen ADRs)
7. **Key Conventions** — neu (Icons, i18n, CSS, DO/DON'T in 20 Zeilen)
8. **Testing** — bestehend (Unit + E2E)
9. **Known Issues** — bestehend

### Zu löschende Dateien

| Datei | Begründung |
|---|---|
| `.claude/instructions.md` | Inhalt geht in CLAUDE.md, Rest ist Redundanz |
| `.claude/agent-prompts.md` | Generische Checklisten ohne spezifischen Projektwert |
| `.claude/architecture-decisions.md` | 7-Zeilen-Tabelle in CLAUDE.md reicht aus |
| `.claude/README.md` | Pure Meta-Dokumentation (beschreibt nur andere Docs) |
| `.playwright-mcp/*.log` (12 Dateien) | Stale Logs, kein Nutzen |

### Zu behaltende Dateien

- `.claude/settings.json` — MCP-Server-Konfiguration
- `.claude/settings.local.json` — lokale Berechtigungen

---

## Erwartete Einsparung

- **1.735 Zeilen** Dokumentation entfernt
- **1 Anlaufpunkt** statt 5 Dateien
- Kein inhaltlicher Verlust für die Entwicklung

---

## Nicht in Scope

- Quellcode-Refactoring (Timer.tsx, Settings.tsx)
- Screenshot-PNGs im Root (keine Token-Auswirkung)
- Änderungen an Tests oder Build-Prozess
