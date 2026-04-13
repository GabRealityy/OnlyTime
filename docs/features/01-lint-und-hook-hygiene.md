# Phase 1 — Lint & Hook-Hygiene

**Grösse:** S (~0.5 Tage) · **Parallelisierbar:** ja, alle Aufgaben unabhängig

## Kontext

Das Projekt hat 15 ESLint-Fehler, drei React-Hook-Regelverstösse und `(window as any).showToast`-Casts in zwei Komponenten. Ergebnis: unsichere Render-Pfade, unterdrückte Type-Fehler, lauter CI-Output. Ziel dieser Phase ist ein sauberer Baseline-Zustand, auf dem alle weiteren Phasen aufsetzen.

## Aufgaben

### 1. Onboarding-Flag ohne Effect
[src/App.tsx:23,32-37](../../src/App.tsx#L23-L37)

Lazy-Init statt `useEffect`:

```ts
const [showOnboarding, setShowOnboarding] = useState(
  () => !localStorage.getItem('onlyTime_hasSeenOnboarding')
);
```

Den bestehenden Effect, der den Flag synchronisiert, ersatzlos löschen.

### 2. Formular-Reset in ExpenseFormModal
[src/components/ExpenseFormModal.tsx:51-64](../../src/components/ExpenseFormModal.tsx#L51-L64)

Die Modal-Komponente mit `key={open ? 'open' : 'closed'}` remounten und den Effect vollständig entfernen. Vermeidet zukünftige Dep-Lücken bei neuen Feldern. Fokus auf das erste Feld über `autoFocus` statt `setTimeout`.

### 3. Reload-Token statt Date.now()
[src/screens/StatusScreen.tsx:41,51,279](../../src/screens/StatusScreen.tsx#L41)

`Date.now()` als Invalidations-Trigger entfernen:

```ts
const [reloadToken, setReloadToken] = useState(0);
const reload = () => setReloadToken(t => t + 1);
```

`new Date()` im Render-Body in `useMemo(() => new Date(), [reloadToken])` kapseln.

### 4. Toast ohne window-Cast
[src/components/BudgetManager.tsx:104-112](../../src/components/BudgetManager.tsx#L104-L112) · [src/components/CategoryManager.tsx:84-92](../../src/components/CategoryManager.tsx#L84-L92)

`(window as any).showToast(...)` durch direkten Import aus [src/components/Toast.tsx](../../src/components/Toast.tsx) ersetzen.

### 5. Residuen
`npm run lint -- --fix` laufen lassen, verbleibende Warnungen manuell schliessen.

## Akzeptanzkriterien

- `npm run lint` beendet mit Exit-Code 0, keine `react-hooks/exhaustive-deps`-Warnungen
- `npm run build` grün
- Suche nach `as any` in `src/components/` und `src/screens/` liefert keine Treffer
- Suche nach `Date.now()` in `src/screens/StatusScreen.tsx` liefert keine Treffer
- Manuelle UI-Verifikation: Onboarding erscheint nur beim ersten Start; Expense-Modal resettet bei Öffnen; Toast-Messages erscheinen in BudgetManager und CategoryManager

## Abhängigkeiten

Keine. Basis für alle folgenden Phasen.
