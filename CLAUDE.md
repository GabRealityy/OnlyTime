# CLAUDE.md

Einstiegspunkt für Claude Code und neue Contributors.

## Projekt

**OnlyTime** — Schweizer Personal-Finance-Web-App, die Ausgaben in Arbeitszeit umrechnet. Gibt man Stundenlohn, Pendelzeit, Überstunden und Steuern an, zeigt die App, wie viele Stunden man für einen Einkauf arbeiten muss. 100 % lokal (localStorage), kein Backend, kein Tracking.

## Tech-Stack

- React 19.2 + TypeScript 5.9, Vite 7.2, Vitest 4.0
- Tailwind CSS 4.1 mit semantischen Theme-Tokens
- Deployment: GitHub Pages (`/only-time/`)

## Dokumentation

- [README.md](README.md) — Projektübersicht, Setup, Deployment
- [IMPLEMENTIERUNG.md](IMPLEMENTIERUNG.md) — Feature-Historie, Umsetzungsstand
- [CHANGELOG.md](CHANGELOG.md) — Versionshistorie

### Bestehende Feature-Docs

- [docs/THEME-SYSTEM.md](docs/THEME-SYSTEM.md) — CSS-Variablen, Dark/Light-Mode
- [docs/STUNDENLOHN-BERECHNUNG.md](docs/STUNDENLOHN-BERECHNUNG.md) — Rechenlogik effektiver Stundenlohn
- [docs/SCHRITT-2-ZEITBEZUG-IMPLEMENTIERT.md](docs/SCHRITT-2-ZEITBEZUG-IMPLEMENTIERT.md) — Zeit-fokussierter Anzeigemodus

## Verbesserungsprogramm

Sechsphasiges Programm zur Stabilisierung und Strukturierung des Codes. Reihenfolge = Priorität.

1. [01 — Lint & Hook-Hygiene](docs/features/01-lint-und-hook-hygiene.md) (S)
2. [02 — Refetch-Modell](docs/features/02-refetch-modell.md) (S)
3. [03 — Komponenten-Zerlegung](docs/features/03-komponenten-zerlegung.md) (M)
4. [04 — Daten-Schicht](docs/features/04-daten-schicht.md) (M)
5. [05 — UI-Test-Infrastruktur](docs/features/05-ui-test-infrastruktur.md) (M)
6. [06 — E2E & Release-Guards](docs/features/06-e2e-und-release-guards.md) (S–M)

## Hinweise für Claude

- **Sprache:** Dokumentation und User-Facing-Text auf Deutsch halten (konsistent mit Bestand). Code, Bezeichner, Commit-Messages auf Englisch.
- **Keine neuen `.md`-Dateien** ohne explizite Anfrage.
- **Lokale App:** kein Backend, keine Netzwerk-Calls, keine externen Secrets.
- **Persistenz:** ausschliesslich `localStorage` mit versionierten Keys (`onlytime:v1`).
- **Abhängigkeiten:** keine zusätzlichen State-Libraries, Query-Libraries oder i18n-Frameworks einführen — bewusst verworfen.
