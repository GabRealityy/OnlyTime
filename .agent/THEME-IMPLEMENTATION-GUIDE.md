# OnlyTime Theme Implementation Guide

> **Für Entwickler und AI-Agenten**: Diese Anleitung beschreibt das Theme-System von OnlyTime und wie neue Features korrekt implementiert werden.

## 🎨 Theme-System-Architektur

OnlyTime verwendet ein **semantisches Theme-System** basierend auf CSS-Variablen und Tailwind-Tokens. Es gibt **KEINE** direkten Farbwerte oder `dark:`-Präfixe in Komponenten.

### Grundprinzipien

1. **Zentrale Farbdefinition**: Alle Farben sind CSS-Variablen in `src/index.css`
2. **Semantische Namen**: Farben heißen nach ihrer Funktion, nicht nach ihrem Aussehen
3. **Automatisches Theming**: Komponenten funktionieren automatisch in Light/Dark Mode
4. **WCAG-Konformität**: Alle Farbkombinationen erfüllen AA-Standards (4.5:1+)

---

## 📁 Dateistruktur

```
src/
├── index.css                 # CSS-Variablen für Light/Dark Mode
├── contexts/
│   └── ThemeContext.tsx      # Theme-State-Management
├── components/               # UI-Komponenten
└── screens/                  # Screen-Komponenten

tailwind.config.js            # Tailwind-Farb-Tokens
docs/THEME-SYSTEM.md          # Ausführliche Dokumentation
```

---

## 🎨 Verfügbare Farb-Tokens

### Hintergrundfarben

```tsx
// Seiten-Hintergrund
<div className="bg-page">

// Karten/Container
<div className="bg-card">
<div className="bg-card hover:bg-card-hover">

// Input-Felder
<input className="bg-input focus:bg-input-focus" />
```

### Textfarben

```tsx
// Primärer Text (Überschriften, wichtiger Content)
<h1 className="text-primary">

// Sekundärer Text (Labels, Beschreibungen)
<p className="text-secondary">

// Tertiärer Text (Platzhalter, Metadaten)
<span className="text-tertiary">

// Invertierter Text (auf dunklen Hintergründen)
<div className="bg-primary text-primary-inverse">
```

### Borders

```tsx
// Standard-Rahmen
<div className="border border-border">

// Subtile Rahmen
<div className="border border-secondary">

// Fokus-Rahmen
<input className="focus:border-focus" />
```

### Semantische Farben

```tsx
// Success (Erfolg, Positives)
<div className="bg-success-bg text-success-text">
<span className="text-success">

// Warning (Warnungen)
<div className="bg-warning-bg text-warning-text">
<span className="text-warning">

// Danger (Fehler, Löschaktionen)
<div className="bg-danger-bg text-danger-text">
<button className="text-danger">

// Accent (Interaktive Elemente, Links)
<button className="bg-accent hover:bg-accent-hover text-accent-text">
```

---

## ✅ DO: Korrekte Implementierung

### Komponenten erstellen

```tsx
// ✅ RICHTIG: Semantische Farb-Tokens verwenden
export function MyComponent() {
  return (
    <div className="bg-card border border-border p-4 rounded-xl">
      <h2 className="text-primary font-bold">Titel</h2>
      <p className="text-secondary mt-2">Beschreibung</p>
      <button className="bg-accent text-accent-text px-4 py-2 rounded-lg">
        Aktion
      </button>
    </div>
  )
}
```

### Bedingte Farben

```tsx
// ✅ RICHTIG: Semantische Tokens für Status
function BalanceDisplay({ balance }: { balance: number }) {
  return (
    <div className={balance >= 0 ? 'text-success' : 'text-danger'}>
      {formatCHF(balance)}
    </div>
  )
}
```

### Hover-Zustände

```tsx
// ✅ RICHTIG: Hover mit semantischen Tokens
<button className="bg-card hover:bg-card-hover text-secondary hover:text-primary transition-colors">
  Hover mich
</button>
```

---

## ❌ DON'T: Häufige Fehler

### Direkte Farbwerte

```tsx
// ❌ FALSCH: Direkte Tailwind-Farben
<div className="bg-zinc-50 dark:bg-zinc-900">

// ❌ FALSCH: Hardcodierte Hex-Werte
<div style={{ backgroundColor: '#f9fafb' }}>

// ✅ RICHTIG: Semantische Tokens
<div className="bg-card">
```

### Dark-Mode-Präfixe

```tsx
// ❌ FALSCH: Manuelle Dark-Mode-Klassen
<p className="text-zinc-950 dark:text-zinc-50">

// ✅ RICHTIG: Automatisches Theming
<p className="text-primary">
```

### Halbtransparente Farben

```tsx
// ❌ FALSCH: Opacity-Modifier reduzieren Kontrast
<div className="bg-zinc-800/40 text-zinc-400">

// ✅ RICHTIG: Solide Farben mit hohem Kontrast
<div className="bg-card text-secondary">
```

### Nicht-semantische Namen

```tsx
// ❌ FALSCH: Farbnamen statt Funktionen
<div className="bg-gray-100 text-green-600">

// ✅ RICHTIG: Semantische Namen
<div className="bg-card text-success">
```

---

## 🔧 Neue Farben hinzufügen

Wenn eine neue semantische Farbe benötigt wird:

### 1. CSS-Variablen definieren (`src/index.css`)

```css
:root {
  /* Light Mode */
  --info: #3b82f6;
  --info-bg: #eff6ff;
  --info-text: #1e3a8a;
}

html.dark {
  /* Dark Mode */
  --info: #60a5fa;
  --info-bg: #1e3a8a;
  --info-text: #dbeafe;
}
```

### 2. Tailwind-Token hinzufügen (`tailwind.config.js`)

```javascript
colors: {
  // ... bestehende Farben
  'info': {
    DEFAULT: 'var(--info)',
    bg: 'var(--info-bg)',
    text: 'var(--info-text)',
  },
}
```

### 3. In Komponenten verwenden

```tsx
<div className="bg-info-bg text-info-text border border-info">
  <span className="text-info">ℹ️ Info-Nachricht</span>
</div>
```

---

## 🎯 Feature-Implementierung: Checkliste

Beim Hinzufügen neuer Features oder Komponenten:

- [ ] **Keine** direkten Farbwerte (`zinc-*`, `gray-*`, etc.)
- [ ] **Keine** `dark:`-Präfixe in Komponenten
- [ ] **Nur** semantische Farb-Tokens verwenden
- [ ] Hover/Focus-Zustände mit semantischen Tokens
- [ ] Text-Kontraste prüfen (min. 4.5:1 für AA)
- [ ] In beiden Themes testen (Light & Dark)
- [ ] Accessibility: Semantisches HTML verwenden

---

## 🧪 Testing

### Manuelle Tests

1. **Theme-Toggle**: Button in TopNav klicken
2. **Kontrast-Check**: Browser DevTools → Accessibility Tab
3. **Visual Check**: Alle Komponenten in beiden Modi ansehen

### Automatische Validierung

```bash
# Suche nach verbotenen Farbklassen
grep -r "dark:bg-zinc-" src/
grep -r "text-gray-" src/
grep -r "bg-slate-" src/

# Sollte keine Treffer geben!
```

---

## 📖 Beispiele aus dem Codebase

### StatusScreen - Metrics Cards

```tsx
// Verdienst-Karte
<div className="rounded-[1.5rem] border border-border-secondary bg-card p-4 sm:p-5">
  <div className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">
    Verdienst (Monat)
  </div>
  <div className="text-xl sm:text-2xl font-black tracking-tight text-primary">
    {formatCHF(earned)}
  </div>
</div>

// Bilanz-Karte (invertiert)
<div className="rounded-[1.5rem] border border-primary bg-primary p-4 text-primary-inverse">
  <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">
    Bilanz (Monat)
  </div>
  <div className="text-2xl font-black tracking-tighter">
    {formatCHF(balance)}
  </div>
</div>
```

### Buttons

```tsx
// Standard Button
<button className="ot-btn">
  Standard
</button>

// Primary Button
<button className="ot-btn ot-btn-primary">
  Primär
</button>

// Danger Button
<button className="ot-btn ot-btn-danger">
  Löschen
</button>
```

### Forms

```tsx
<div>
  <label>E-Mail</label>
  <input
    type="email"
    className="bg-input focus:bg-input-focus border border-border focus:border-focus"
  />
</div>
```

### Notifications

```tsx
// Success
<div className="border border-success bg-success-bg p-4 rounded-xl">
  <p className="text-success-text">✓ Erfolgreich gespeichert</p>
</div>

// Danger
<div className="border border-danger bg-danger-bg p-4 rounded-xl">
  <p className="text-danger-text">⚠ Fehler aufgetreten</p>
</div>

// Warning
<div className="border border-warning bg-warning-bg p-4 rounded-xl">
  <p className="text-warning-text">⚡ Budget-Warnung</p>
</div>
```

---

## 🔍 Debugging

### Problem: Farben ändern sich nicht beim Theme-Wechsel

**Ursache**: Komponente verwendet hardcodierte Farben

```tsx
// ❌ Problem
<div className="bg-white dark:bg-black">

// ✅ Lösung
<div className="bg-page">
```

### Problem: Schlechter Kontrast im Dark Mode

**Ursache**: Halbtransparente Farben oder falsche Variablen

```tsx
// ❌ Problem
<div className="bg-zinc-800/40 text-zinc-400">

// ✅ Lösung
<div className="bg-card text-secondary">
```

### Problem: Neue Komponente hat falsche Farben

**Checkliste**:
1. DevTools öffnen → `<html>` Element prüfen
2. Hat es die `dark` Klasse im Dark Mode? ✓
3. CSS-Variablen inspizieren: `--bg-card` hat richtigen Wert? ✓
4. Tailwind-Klasse korrekt: `bg-card` statt `bg-zinc-50`? ✓

---

## 📚 Weitere Ressourcen

- **Theme-Dokumentation**: `docs/THEME-SYSTEM.md`
- **CSS-Variablen**: `src/index.css` (Zeilen 1-90)
- **Tailwind-Config**: `tailwind.config.js`
- **Theme-Context**: `src/contexts/ThemeContext.tsx`

---

## 🚀 Quick Reference

| Use Case | Klasse | Beispiel |
|----------|--------|----------|
| Seiten-BG | `bg-page` | `<main className="bg-page">` |
| Karte | `bg-card` | `<div className="bg-card">` |
| Text (wichtig) | `text-primary` | `<h1 className="text-primary">` |
| Text (normal) | `text-secondary` | `<p className="text-secondary">` |
| Text (Meta) | `text-tertiary` | `<span className="text-tertiary">` |
| Rahmen | `border-border` | `<div className="border border-border">` |
| Erfolg | `text-success` | `<span className="text-success">✓</span>` |
| Warnung | `text-warning` | `<div className="text-warning">⚠</div>` |
| Fehler | `text-danger` | `<p className="text-danger">Error</p>` |
| Fokus | `focus:border-focus` | `<input className="focus:border-focus">` |

---

## ✨ Zusammenfassung

**Goldene Regel**: Wenn du Farben hinzufügen möchtest:

1. Frage: "Was ist die **Funktion** dieser Farbe?" (nicht: "Welche Farbe sieht gut aus?")
2. Nutze existierende semantische Tokens (`text-primary`, `bg-card`, etc.)
3. Falls kein Token passt: Neue semantische Farbe in `index.css` + `tailwind.config.js` hinzufügen
4. **NIEMALS** direkte Farben wie `zinc-500` oder `dark:bg-*` verwenden

**Das Theme-System funktioniert nur, wenn ALLE sich daran halten!** 🎯
