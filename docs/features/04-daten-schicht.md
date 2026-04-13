# Phase 4 — Daten-Schicht

**Grösse:** M (~1.5 Tage)

## Kontext

Komponenten importieren direkt aus [src/lib/expenses.ts](../../src/lib/expenses.ts) (`loadExpensesForMonth`, `addExpense`, `deleteExpense` usw.). Jede Änderung am Storage-Format — etwa ein späterer Wechsel zu IndexedDB für grössere Datenmengen — würde breite Refactorings erzwingen. Ebenso sind Tests an `localStorage` gekoppelt, was Phase 5 behindert.

Lösung: ein Repository-Interface als Seam. Komponenten kennen nur das Interface; die konkrete localStorage-Implementierung bleibt `lib/expenses.ts`. Für Tests wird ein In-Memory-Repo eingesetzt. **Kein** Zustand-Management-Framework — der Hook aus Phase 2 plus Context reichen.

## Aufgaben

### 1. Repository-Interface
Neue Datei `src/lib/expenseRepo.ts`:

```ts
export interface ExpenseRepo {
  listMonth(monthKey: string): Expense[];
  listRange(start: Date, end: Date): Expense[];
  add(expense: Expense): void;
  update(id: string, patch: Partial<Expense>): void;
  delete(id: string): void;
}

export const localStorageExpenseRepo: ExpenseRepo = {
  listMonth: loadExpensesForMonth,
  // ... übrige Methoden delegieren an lib/expenses
};
```

### 2. Context + Hook
Neue Datei `src/contexts/RepoContext.tsx`:

- `RepoProvider` mit `value={localStorageExpenseRepo}` als Default
- `useExpenseRepo()` Hook
- Provider in [src/App.tsx](../../src/App.tsx) um den **gesamten** App-Baum (oberhalb Router), damit jeder zukünftige Screen Zugriff hat

### 3. useExpenses umstellen
[src/hooks/useExpenses.ts](../../src/hooks/useExpenses.ts) (aus Phase 2) ruft `useExpenseRepo()` statt direkt zu importieren.

### 4. Alle Direkt-Imports entfernen
Suche `from.*lib/expenses` in `src/components/`, `src/screens/`, `src/hooks/`. Jeden Treffer durch `useExpenseRepo()` ersetzen. Erlaubte verbleibende Imports: nur in `expenseRepo.ts` selbst und in Tests.

## Akzeptanzkriterien

- `grep -r "from.*lib/expenses" src/` liefert ausschliesslich `expenseRepo.ts` und Test-Dateien
- In-Memory-Test-Repo kann via `RepoProvider` eingesetzt werden, ohne Komponenten zu ändern
- Manuelle Verifikation: Expense-CRUD, Monatswechsel, CSV-Import funktionieren unverändert
- Keine neuen Runtime-Dependencies in `package.json`

## Abhängigkeiten

Phase 2 (Hook ist der Refactor-Seam). Phase 3 Stream B (StatusScreen) vorher abschliessen, sonst vervielfachen sich Konflikte.
