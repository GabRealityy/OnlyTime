# Changelog

Dieses Dokument wird bei **jedem Release** erweitert.

Konvention:
- Neueste Version steht oben.
- Format: `## vX.Y.Z (YYYY-MM-DD)`
- Optional: Links zu Tags/Commits.

---

## v1.0 (2026-01-22)

Tag: [`v1.0`](https://github.com/GabRealityy/OnlyTime/releases/tag/v1.0)

### Highlights
- Status-Board: Verdient/Ausgegeben/Bilanz in CHF und Arbeitszeit, inkl. Zeitraum-Filter und kumuliertem Multi-Monats-Chart.
- Berichte: Zeitraum-Filter, historisches Chart (kumuliert) und Kategorie-Breakdown, plus monatliche Übersicht.
- Einstellungen: Schnellerfassung (Quick-Add) konfigurierbar (Emoji/Titel/Betrag/Kategorie, Reset, Undo beim Löschen).

### Features
- Ausgaben erfassen: manuell (Modal) und CSV-Import; Undo beim Löschen via Toast.
- Onboarding/Tour + Hilfe/FAQ.
- Dark/Light Mode (class-basiert), inkl. Kontrast-/Lesbarkeits-Verbesserungen.
- Budgets pro Kategorie in CHF **oder** Stunden/Arbeitszeit (inkl. Umrechnung).
- Branding: App-Logo im Header + als Favicon, theme-aware Darstellung.

### Berechnungen & Logik
- Effektives Netto-Monatseinkommen (optional Brutto→Netto) inkl. zusätzlicher Einkommensquellen.
- Effektive Arbeitszeit (inkl. Pendelzeit/Überstunden) → Stundenlohn.
- Status-Berechnungen nutzen den effektiven Income-Ansatz korrekt.

### Daten & Persistenz
- Lokale Persistenz via `localStorage` (Settings + Monatsdaten `YYYY-MM`).
- Custom-Kategorie-IDs werden bei Expenses unterstützt (werden nicht mehr beim Laden verworfen).

### UX
- Bestätigungsdialoge, Animationen, Toasts mit Actions.
- Terminologie konsistent auf **Arbeitszeit** (statt „Lebenszeit“).
