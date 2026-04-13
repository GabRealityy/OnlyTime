# Phase 6 — E2E & Release-Guards

**Grösse:** S–M (~1 Tag)

## Kontext

Unit- und Komponenten-Tests decken Logik und einzelne Bausteine ab. Was fehlt: ein Smoke-Test, der einen kompletten User-Flow im echten Browser durchspielt — Garantie, dass nichts im Zusammenspiel kaputt ist. Dazu soll die CI-Pipeline einen Typecheck-Gate bekommen, sodass TS-Fehler nicht erst beim Build auffallen.

## Aufgaben

### 1. Playwright einrichten
`@playwright/test` als devDependency, `playwright.config.ts` im Root. Basis-URL auf den Vite-Dev-Server (`http://localhost:5173/only-time/`). Tests unter `e2e/`.

### 2. Smoke-Flow
Eine Datei `e2e/smoke.spec.ts` mit einem Test:

1. App öffnen, Onboarding überspringen
2. Mindest-Einstellungen setzen (Stundenlohn)
3. Ausgabe hinzufügen (Quick-Add oder Modal)
4. Ausgabe erscheint in Liste mit korrektem CHF-Betrag
5. Ausgabe löschen → Undo-Toast → Undo klicken → Ausgabe zurück

### 3. Typecheck-Script
`package.json`:

```json
"scripts": {
  "typecheck": "tsc --noEmit"
}
```

`.nvmrc` mit der verwendeten Node-Version anlegen.

### 4. CI-Pipeline
GitHub-Pages-Workflow um die Reihenfolge ergänzen:

1. `npm run lint`
2. `npm run typecheck`
3. `npm test -- --run`
4. `npx playwright test`
5. `npm run build`

Jede Stufe scheitert rot und **blockiert den Deploy** (die bisher informational konfigurierten Checks werden auf blocking umgestellt).

### 5. Dokumentation
In [IMPLEMENTIERUNG.md](../../IMPLEMENTIERUNG.md) einen Abschnitt „Daten-Schicht" ergänzen, der das Repo-Interface aus Phase 4 und den Testing-Seam aus Phase 5 beschreibt.

## Akzeptanzkriterien

- `npx playwright test` grün lokal
- CI-Run zeigt alle fünf Stufen grün; simulierter TS-Fehler lässt CI rot werden
- `.nvmrc` vorhanden und korrekt
- Playwright-Artefakte (Screenshots, Traces) sind in `.gitignore`

## Abhängigkeiten

Phase 5. Sollte die letzte Phase des Programms sein — E2E-Tests sind fragil und profitieren von stabilem Komponenten-Layout aus Phase 3.
