# OnlyTime Theme-System

## Übersicht

Das OnlyTime Theme-System basiert auf CSS-Variablen und semantischen Farb-Tokens, die eine konsistente und barrierefrei zugängliche Dark/Light-Mode-Unterstützung gewährleisten.

## Architektur

### CSS-Variablen (index.css)

Alle Farben werden zentral über CSS-Variablen definiert:

```css
:root {
  /* Hintergründe */
  --bg-page: #ffffff;
  --bg-card: #f9fafb;
  --bg-card-hover: #f3f4f6;
  --bg-input: #fafafa;
  --bg-input-focus: #ffffff;
  
  /* Texte */
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  --text-inverse: #ffffff;
  
  /* Borders */
  --border-primary: #e5e5e5;
  --border-secondary: #f0f0f0;
  --border-focus: #1a1a1a;
  
  /* Semantische Farben */
  --accent: #0066ff;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
}

html.dark {
  /* Dark Mode Überschreibungen */
  --bg-page: #0a0a0a;
  --bg-card: #1a1a1a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  /* ... */
}
```

### Tailwind-Konfiguration

Die CSS-Variablen werden in Tailwind als semantische Farb-Tokens bereitgestellt:

```javascript
colors: {
  'page': 'var(--bg-page)',
  'card': {
    DEFAULT: 'var(--bg-card)',
    hover: 'var(--bg-card-hover)',
  },
  'primary': 'var(--text-primary)',
  'secondary': 'var(--text-secondary)',
  'tertiary': 'var(--text-tertiary)',
  // ...
}
```

## Verwendung in Komponenten

### Alt (mit direkten zinc-Klassen)
```tsx
<div className="bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50">
  Content
</div>
```

### Neu (mit semantischen Tokens)
```tsx
<div className="bg-card text-primary">
  Content
</div>
```

## Verfügbare Farb-Tokens

### Hintergrundfarben
- `bg-page` - Seiten-Hintergrund
- `bg-card` - Karten-Hintergrund
- `bg-card-hover` - Karten-Hover-Zustand
- `bg-input` - Input-Felder
- `bg-input-focus` - Fokussierte Input-Felder

### Textfarben
- `text-primary` - Primärer Text (Hauptinhalt)
- `text-secondary` - Sekundärer Text (Labels, Beschreibungen)
- `text-tertiary` - Tertiärer Text (Platzhalter, Metadaten)
- `text-primary-inverse` - Invertierter Text (auf dunklen Hintergründen)

### Borders
- `border-border` oder `border` - Standard-Rahmen
- `border-secondary` - Subtile Rahmen
- `border-focus` - Fokus-Rahmen

### Semantische Farben
- `bg-success`, `text-success`, `success-bg`, `success-text`
- `bg-warning`, `text-warning`, `warning-bg`, `warning-text`
- `bg-danger`, `text-danger`, `danger-bg`, `danger-text`
- `bg-accent`, `text-accent`, `accent-hover`

## WCAG-Konformität

Alle Farbkombinationen erfüllen die WCAG AA-Anforderungen:

### Light Mode
- `text-primary` (#1a1a1a) auf `bg-page` (#ffffff): **17.8:1** ✓
- `text-secondary` (#666666) auf `bg-page` (#ffffff): **5.7:1** ✓
- `text-primary` (#1a1a1a) auf `bg-card` (#f9fafb): **17.1:1** ✓

### Dark Mode
- `text-primary` (#ffffff) auf `bg-page` (#0a0a0a): **19.3:1** ✓
- `text-secondary` (#a0a0a0) auf `bg-page` (#0a0a0a): **7.2:1** ✓
- `text-primary` (#ffffff) auf `bg-card` (#1a1a1a): **17.8:1** ✓

## Best Practices

### ✅ DO
- Verwenden Sie semantische Tokens (`text-primary`, `bg-card`)
- Nutzen Sie solide Farben statt halbtransparenter Farben
- Testen Sie Ihre Komponenten in beiden Modi
- Prüfen Sie die Kontrastverhältnisse mit Tools wie Lighthouse

### ❌ DON'T
- Keine direkten `dark:` Präfixe mehr verwenden
- Keine halbtransparenten Farben (`bg-zinc-800/40`)
- Keine hardcodierten Farbwerte
- Keine zinc/slate/gray Farben direkt verwenden

## Migration

Bei der Migration alter Komponenten:

1. **Identifizieren**: Suchen Sie nach `dark:` Präfixen und `zinc-` Farben
2. **Mapping**: Ordnen Sie zinc-Farben den semantischen Tokens zu:
   - `text-zinc-950 dark:text-zinc-50` → `text-primary`
   - `text-zinc-600 dark:text-zinc-400` → `text-secondary`
   - `bg-zinc-50 dark:bg-zinc-900` → `bg-card`
3. **Testen**: Überprüfen Sie die Komponente in Light- und Dark-Mode
4. **Validieren**: Nutzen Sie axe DevTools oder Lighthouse für Kontrasttests

## Theme-Umschaltung

Der Theme-Toggle funktioniert über den `ThemeContext`:

```tsx
import { useTheme } from './contexts/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '☀️ Hell' : '🌙 Dunkel'}
    </button>
  )
}
```

Die Einstellung wird automatisch in `localStorage` persistiert und beim nächsten Besuch wiederhergestellt.

## Debugging

Bei Theme-Problemen:

1. **Inspektor**: Nutzen Sie die Browser-DevTools, um CSS-Variablen zu überprüfen
2. **HTML-Klasse**: Prüfen Sie, ob `<html class="dark">` korrekt gesetzt ist
3. **CSS-Variablen**: Validieren Sie, dass alle Variablen definiert sind
4. **Fallback**: Stellen Sie sicher, dass Tailwind die Variablen korrekt auflöst

## Erweiterte Anpassung

Um die Farbpalette anzupassen, bearbeiten Sie die CSS-Variablen in [index.css](../src/index.css):

```css
:root {
  /* Ändern Sie bestehende Werte */
  --accent: #ff6b00; /* Neuer Akzent */
  --bg-card: #f5f5f5; /* Hellerer Karten-Hintergrund */
}
```

Alle Komponenten werden automatisch aktualisiert, da sie die semantischen Tokens verwenden.
