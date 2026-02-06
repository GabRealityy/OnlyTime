# OnlyTime Architecture Overview

> **Für AI-Agenten**: Diese Datei beschreibt die Architektur von OnlyTime für automatisierte Code-Änderungen.

## 🏗️ Projekt-Struktur

```
OnlyTime/
├── src/
│   ├── main.tsx                 # App-Einstiegspunkt
│   ├── App.tsx                  # Haupt-Layout & Screen-Router
│   ├── index.css                # Globale Styles + CSS-Variablen
│   ├── types.ts                 # TypeScript-Typen
│   │
│   ├── components/              # Wiederverwendbare UI-Komponenten
│   │   ├── BudgetManager.tsx
│   │   ├── CategoryManager.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── CSVImportModal.tsx
│   │   ├── ExpenseFormModal.tsx
│   │   ├── LineChart.tsx
│   │   ├── Modal.tsx
│   │   ├── OnboardingChecklist.tsx
│   │   ├── OnboardingFlow.tsx
│   │   ├── QuickAddButtons.tsx
│   │   ├── Toast.tsx
│   │   └── TopNav.tsx
│   │
│   ├── contexts/                # React Contexts
│   │   └── ThemeContext.tsx     # Dark/Light Mode State
│   │
│   ├── hooks/                   # Custom React Hooks
│   │   └── useLocalStorageState.ts
│   │
│   ├── lib/                     # Business-Logik & Utilities
│   │   ├── date.ts              # Datums-Funktionen
│   │   ├── dummyData.ts         # Test-Daten
│   │   ├── expenses.ts          # Ausgaben-Logik
│   │   ├── math.ts              # Berechnungen
│   │   ├── money.ts             # Formatierung
│   │   ├── rangeAnalytics.ts    # Zeitraum-Analysen
│   │   ├── settings.ts          # Einstellungs-Logik
│   │   └── storage.ts           # LocalStorage-Wrapper
│   │
│   └── screens/                 # Haupt-Screens
│       ├── HelpScreen.tsx
│       ├── ImprintScreen.tsx
│       ├── PrivacyScreen.tsx
│       ├── ReportsScreen.tsx
│       ├── SettingsScreen.tsx
│       └── StatusScreen.tsx     # Haupt-Screen (Standard)
│
├── docs/                        # Dokumentation
│   ├── THEME-SYSTEM.md
│   └── ...
│
├── .agent/                      # Anweisungen für AI-Agenten
│   ├── ARCHITECTURE.md          # Diese Datei
│   └── THEME-IMPLEMENTATION-GUIDE.md
│
├── tailwind.config.js           # Tailwind-Konfiguration
├── vite.config.ts               # Vite-Build-Konfiguration
├── tsconfig.json                # TypeScript-Konfiguration
└── package.json                 # Dependencies

```

---

## 🎯 Architektur-Prinzipien

### 1. **Client-Only App**
- Keine Backend-Kommunikation
- Alle Daten in `localStorage`
- Funktioniert offline

### 2. **TypeScript First**
- Strikte Typen für alle Funktionen
- Typ-Definitionen in `types.ts`
- Keine `any`-Types

### 3. **Funktionale Programmierung**
- Pure Functions in `lib/`
- Immutable Data
- Keine Side-Effects außerhalb von React

### 4. **Theme-System**
- CSS-Variablen für Farben
- Automatisches Light/Dark Switching
- Keine hardcodierten Farben

### 5. **Accessibility**
- Semantisches HTML
- WCAG AA-Konformität
- Keyboard-Navigation

---

## 📦 Datenfluss

```
User Input
    ↓
React Component
    ↓
Business Logic (lib/)
    ↓
State Update
    ↓
localStorage Sync
    ↓
UI Re-render
```

### Beispiel: Neue Ausgabe hinzufügen

```
1. User klickt "Neue Ausgabe"
   → ExpenseFormModal öffnet

2. User füllt Formular aus
   → Local State Update

3. User klickt "Speichern"
   → addExpense() aus lib/expenses.ts

4. addExpense() validiert & speichert
   → localStorage.setItem('expenses_YYYY-MM', ...)

5. StatusScreen re-rendert
   → Zeigt neue Ausgabe an
```

---

## 🔧 Wichtige Module

### `lib/expenses.ts`
Kern-Logik für Ausgaben-Management

```typescript
// Hauptfunktionen
export function loadExpensesForMonth(monthKey: string): Expense[]
export function addExpense(expense: Expense, monthKey: string): void
export function deleteExpense(id: string, monthKey: string): void
export function updateExpense(expense: Expense, monthKey: string): void
```

### `lib/settings.ts`
Einstellungen & Berechnungen

```typescript
// Stundenlohn berechnen
export function hourlyRateCHF(settings: Settings): number

// Effektives Netto-Einkommen
export function effectiveNetMonthlyIncome(settings: Settings): number
```

### `lib/date.ts`
Datums-Utilities

```typescript
export function monthKeyFromDate(date: Date): string  // "2026-01"
export function isoDateLocal(): string                 // "2026-01-24"
export function dayOfMonth(date: Date): number         // 24
export function daysInMonth(date: Date): number        // 31
```

### `lib/money.ts`
Formatierung

```typescript
export function formatCHF(amount: number): string           // "CHF 1'234.56"
export function formatHoursMinutes(hours: number): string  // "12h 30m"
export function toHours(chf: number, rate: number): number
```

---

## 🎨 Theme-System (WICHTIG!)

### CSS-Variablen (`src/index.css`)

```css
:root {
  --bg-page: #ffffff;
  --bg-card: #f9fafb;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  /* ... */
}

html.dark {
  --bg-page: #0a0a0a;
  --bg-card: #1a1a1a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  /* ... */
}
```

### Tailwind-Tokens (`tailwind.config.js`)

```javascript
colors: {
  'page': 'var(--bg-page)',
  'card': 'var(--bg-card)',
  'primary': 'var(--text-primary)',
  'secondary': 'var(--text-secondary)',
  // ...
}
```

### Verwendung in Komponenten

```tsx
// ✅ IMMER so:
<div className="bg-card text-primary">

// ❌ NIEMALS so:
<div className="bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50">
```

**➡️ Siehe `.agent/THEME-IMPLEMENTATION-GUIDE.md` für Details!**

---

## 🔄 State-Management

### 1. **React State** (Component-Level)
Für UI-Interaktionen (Modals, Dropdowns, etc.)

```tsx
const [isOpen, setIsOpen] = useState(false)
```

### 2. **localStorage** (Persistence)
Für Daten-Persistenz

```tsx
const [settings, setSettings] = useLocalStorageState<Settings>('settings', defaultSettings)
```

### 3. **Context** (Global State)
Nur für Theme

```tsx
const { theme, toggleTheme } = useTheme()
```

---

## 📝 Code-Conventions

### Naming

```typescript
// Components: PascalCase
export function StatusScreen() {}

// Functions: camelCase
export function formatCHF(amount: number) {}

// Constants: UPPER_SNAKE_CASE
const DEFAULT_HOURLY_RATE = 50

// Types: PascalCase
export type Expense = { ... }
```

### File Organization

```typescript
// 1. Imports
import { useState } from 'react'
import { formatCHF } from '../lib/money'

// 2. Types (if needed)
type Props = { ... }

// 3. Component/Function
export function MyComponent(props: Props) {
  // 3a. Hooks
  const [state, setState] = useState()
  
  // 3b. Derived Values
  const total = useMemo(() => ...)
  
  // 3c. Event Handlers
  const handleClick = () => {}
  
  // 3d. JSX
  return <div>...</div>
}
```

### Comments

```typescript
// ✅ GUTE Kommentare: Warum, nicht Was
// Calculate accrued income based on linear daily distribution
const earned = (monthlyIncome / daysInMonth) * currentDay

// ❌ SCHLECHTE Kommentare: Offensichtliches
// Set the value to true
setIsOpen(true)
```

---

## 🧪 Testing-Strategie

### Manuelle Tests
- Light/Dark Mode Toggle
- Alle Screens durchklicken
- Responsive Design (Mobile/Desktop)
- Accessibility (Keyboard-Navigation)

### Validierung
```bash
# TypeScript-Fehler
npm run type-check

# Keine hardcodierten Farben
grep -r "dark:bg-" src/
grep -r "zinc-" src/
# → Sollte nichts finden!
```

---

## 🚀 Build & Deploy

```bash
# Development
npm run dev

# Production Build
npm run build

# Preview Build
npm run preview
```

### Build-Output
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
```

---

## 📊 Performance-Überlegungen

### LocalStorage Limits
- Max ~5-10 MB pro Domain
- OnlyTime nutzt ~100 KB (bei normaler Nutzung)
- Daten nach Monaten partitioniert

### Rendering
- React.memo für teure Komponenten (LineChart)
- useMemo für Berechnungen
- Debouncing bei Input-Feldern

---

## 🔐 Datenschutz

### Daten-Speicherung
- **NUR** localStorage (Browser)
- Keine Server-Kommunikation
- Keine Cookies
- Keine Tracking-Scripts

### Daten-Struktur
```
localStorage:
  ├── onlyTime_settings          # JSON: Settings
  ├── onlyTime_expenses_2026-01  # JSON: Expense[]
  ├── onlyTime_expenses_2026-02  # JSON: Expense[]
  └── onlyTime_theme             # string: "dark" | "light"
```

---

## ⚠️ Kritische Regeln für Code-Änderungen

### 1. **Theme-System**
- ❌ NIEMALS `dark:bg-*` oder `zinc-*` Klassen verwenden
- ✅ NUR semantische Tokens (`bg-card`, `text-primary`, etc.)

### 2. **TypeScript**
- ❌ NIEMALS `any` verwenden
- ✅ Strikte Typen für alle Funktionen

### 3. **Daten-Persistence**
- ❌ NIEMALS direkt `localStorage` manipulieren
- ✅ Funktionen aus `lib/storage.ts` verwenden

### 4. **Business-Logik**
- ❌ NIEMALS Berechnungen in Komponenten
- ✅ Pure Functions in `lib/` Module

### 5. **Accessibility**
- ❌ NIEMALS `<div onClick>` ohne Keyboard-Support
- ✅ Semantische Elemente (`<button>`, `<a>`, etc.)

---

## 📋 Checkliste für neue Features

Beim Hinzufügen neuer Features:

- [ ] TypeScript-Typen definiert
- [ ] Business-Logik in `lib/` Module
- [ ] Komponente verwendet semantische Farb-Tokens
- [ ] LocalStorage-Sync implementiert
- [ ] Responsive Design (Mobile + Desktop)
- [ ] Light & Dark Mode getestet
- [ ] Accessibility geprüft (Keyboard, ARIA)
- [ ] Keine TypeScript-Errors
- [ ] Code-Conventions eingehalten

---

## 🆘 Häufige Probleme

### Problem: Daten gehen beim Reload verloren
**Lösung**: `useLocalStorageState` Hook verwenden

### Problem: Theme wechselt nicht
**Lösung**: `ThemeContext` nutzen, nicht manuell

### Problem: Farben im Dark Mode falsch
**Lösung**: Semantische Tokens verwenden, siehe `.agent/THEME-IMPLEMENTATION-GUIDE.md`

### Problem: TypeScript-Fehler
**Lösung**: Strikte Typen in `types.ts` definieren

---

## 📚 Weitere Dokumentation

- **Theme-System**: `.agent/THEME-IMPLEMENTATION-GUIDE.md`
- **User-Doku**: `docs/THEME-SYSTEM.md`
- **Changelog**: `CHANGELOG.md`

---

**Letzte Aktualisierung**: 2026-01-24
**Version**: 1.0.0
**Architektur-Status**: ✅ Stabil
