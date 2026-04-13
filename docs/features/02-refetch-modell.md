# Phase 2 — Refetch-Modell

**Grösse:** S (~0.5 Tage)

## Kontext

StatusScreen triggert das Neuladen von Expenses über `setLastUpdate(Date.now())`. Das ist ein Anti-Pattern: Zeitstempel als Invalidations-Key machen Tests nicht-deterministisch, koppeln Render-Zeitpunkte an Wall-Clock und verstecken die tatsächliche Absicht („mutiert, bitte neu laden"). Phase 1 entfernt den schlimmsten Teil; Phase 2 ersetzt das Muster durch einen expliziten Hook.

## Aufgaben

### 1. Neuer Hook `useExpenses`
Neue Datei `src/hooks/useExpenses.ts`:

```ts
export function useExpenses(monthKey: string) {
  const [token, setToken] = useState(0);
  const expenses = useMemo(
    () => loadExpensesForMonth(monthKey),
    [monthKey, token]
  );
  const mutate = useCallback(() => setToken(t => t + 1), []);
  return { expenses, mutate };
}
```

Hinweis: Der direkte Import aus `lib/expenses` wird in Phase 4 durch das Repo-Interface ersetzt — hier noch nicht vorwegnehmen.

### 2. StatusScreen migrieren
[src/screens/StatusScreen.tsx](../../src/screens/StatusScreen.tsx)

Alle `setLastUpdate(Date.now())`-Aufrufe durch `mutate()` aus dem Hook ersetzen. Den lokalen `lastUpdate`-State löschen.

### 3. Injizierbare Uhrzeit
StatusScreen bekommt eine optionale `now`-Prop mit Default:

```ts
type Props = { now?: Date };
export function StatusScreen({ now = new Date() }: Props) { ... }
```

Alle internen `new Date()`-Aufrufe durch `now` ersetzen. Erlaubt deterministische Tests in Phase 5.

## Akzeptanzkriterien

- `grep "Date.now()" src/screens/StatusScreen.tsx` liefert keine Treffer
- Ausgabe hinzufügen/löschen aktualisiert die sichtbare Liste ohne Reload
- `useExpenses` hat einen Unit-Test (fixed `monthKey`, mutate triggert Reload)
- Manuelle Verifikation: Monatswechsel lädt korrekt, Undo nach Delete funktioniert weiterhin

## Abhängigkeiten

Phase 1 — selbe Datei, saubere Diffs nötig.
