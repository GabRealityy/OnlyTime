# Phase 3 — Komponenten-Zerlegung

**Grösse:** M (~2 Tage) · **Parallelisierbar:** drei unabhängige Streams

## Kontext

Drei Dateien überschreiten 400 Zeilen und bündeln zu viele Verantwortlichkeiten:

- [src/screens/SettingsScreen.tsx](../../src/screens/SettingsScreen.tsx) — 869 LOC, vier inline-Manager
- [src/screens/StatusScreen.tsx](../../src/screens/StatusScreen.tsx) — 693 LOC, Business- und UI-Logik vermischt
- [src/components/LineChart.tsx](../../src/components/LineChart.tsx) — 408 LOC, SVG-Geometrie + Tooltip-Logik

Grosse Dateien erschweren Reviews, machen Merges konfliktreich und verhindern isoliertes Testen. Ziel: keine Komponentendatei über 300 LOC; pure Logik aus UI herauslösen, wo möglich.

## Aufgaben

### Stream A: SettingsScreen zerlegen
Zielstruktur `src/components/settings/`:

- `IncomeSection.tsx` — Brutto/Netto, zusätzliche Einkommen
- `RateSection.tsx` — Pendelzeit, Überstunden, effektive Rate
- `CategoriesSection.tsx` — bisheriger inline CategoryManager
- `BudgetsSection.tsx` — bisheriger inline BudgetManager
- `DataSection.tsx` — CSV-Import/Export, Dummy-Daten, Reset

Screen reduziert sich auf Layout + Sektions-Liste.

### Stream B: StatusScreen zerlegen
Zielstruktur `src/components/status/`:

- `StatusHeader.tsx` — Monatsnavigation, Titel
- `CategoryFilterBar.tsx` — Kategorie-Pills
- `ExpenseList.tsx` — Liste mit Swipe/Delete
- `RangeSummary.tsx` — Ausgaben-Summen in CHF + Stunden

StatusScreen orchestriert, rendert diese Komponenten und verwaltet gemeinsamen State (Filter, Zeitraum).

### Stream C: LineChart entschlacken
Pure Geometrie nach `src/lib/chartGeometry.ts` extrahieren:

- `buildScales(data, viewport)` — X/Y-Domains
- `buildPath(points, scales)` — SVG-Pfad-String
- `buildTicks(scale, count)` — Tick-Positionen + Labels
- `findNearestPoint(points, mouseX, scales)` — für Tooltip

[src/components/LineChart.tsx](../../src/components/LineChart.tsx) bleibt reine Render-Shell: ruft Geometrie-Funktionen, rendert SVG, handhabt Hover-State.

## Akzeptanzkriterien

- `SettingsScreen.tsx`, `StatusScreen.tsx`, `LineChart.tsx` jeweils <300 LOC
- `src/lib/chartGeometry.ts` mit ≥5 Unit-Tests (leere Daten, ein Punkt, lineare Reihe, Tick-Kalkulation, Nearest-Point)
- Keine Regression: alle Settings-Interaktionen, alle Status-Filter, Chart-Rendering + Tooltip manuell verifiziert
- `npm run build` und `npm run lint` grün

## Abhängigkeiten

Phase 1 (saubere Baseline). Parallelisierbar: die drei Streams berühren disjunkte Dateien. Stream B (StatusScreen) sollte vor Phase 4 abgeschlossen sein.
