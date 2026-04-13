# Phase 5 — UI-Test-Infrastruktur

**Grösse:** M (~1.5 Tage)

## Kontext

Aktuell sind nur Module unter `src/lib/` getestet (49 Tests in Vitest). Komponenten, Screens und Flows haben null Abdeckung. Jede UI-Änderung ist ein Blindflug; visuelle Regressionen und kaputte Validierungen bleiben unentdeckt bis zur manuellen Stichprobe. Die Repo-Seam aus Phase 4 erlaubt jetzt, Komponenten-Tests ohne localStorage-Kopplung zu schreiben.

## Aufgaben

### 1. Test-Dependencies
`package.json` (devDependencies):

- `@testing-library/react`
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- `jsdom`

[vitest.config.ts](../../vitest.config.ts): `environment: 'jsdom'` aktivieren, Setup-Datei für `@testing-library/jest-dom`-Matcher einhängen.

### 2. Test-Helper
Neue Datei `src/test/renderWithRepo.tsx`:

```ts
export function renderWithRepo(
  ui: ReactElement,
  options?: { seed?: Expense[] }
) {
  const repo = createInMemoryRepo(options?.seed ?? []);
  return {
    repo,
    ...render(<RepoProvider value={repo}>{ui}</RepoProvider>),
  };
}
```

`createInMemoryRepo` als Hilfe im selben File — ein Array + die fünf `ExpenseRepo`-Methoden.

### 3. Seed-Tests
Drei erste Tests als Referenz-Patterns:

- **ExpenseFormModal** — Happy Path (Felder ausfüllen, Submit → `repo.add` aufgerufen) und Validierung (leerer Betrag verhindert Submit)
- **StatusScreen** — Rendering mit seeded Repo und injiziertem `now` (aus Phase 2); prüft angezeigte CHF- und Stunden-Summen
- **BudgetManager** — Delete → Undo-Toast erscheint → Undo stellt Budget wieder her

### 4. CI-Integration
In der GitHub-Pages-Workflow-Datei: `npm test -- --run` als Step **vor** `npm run build`. CI scheitert rot bei Test-Fehlern.

## Akzeptanzkriterien

- ≥6 Komponenten-Tests grün lokal und in CI
- Coverage-Report zeigt >0 % für `src/components/` und `src/screens/`
- Kein Test greift auf `localStorage` zu (Grep auf Testdateien)
- `npm test` läuft in <10 Sekunden

## Abhängigkeiten

Phase 4 — ohne Repo-Seam würden Tests an localStorage pinnen und müssten später neu geschrieben werden.
