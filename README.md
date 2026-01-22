# Only Time

**Only Time** ist eine Web-App, die Geldbeträge in Lebenszeit umrechnet. Basierend auf Ihrem persönlichen Stundenlohn zeigt sie Ihnen, wie viele Stunden oder Tage Arbeit ein Produkt oder eine Dienstleistung wirklich kostet.

## 🎯 Konzept

Anstatt einen Preis nur als Geldbetrag zu sehen, rechnet Only Time ihn in die Zeit um, die Sie arbeiten müssen, um diesen Betrag zu verdienen. Dies hilft Ihnen:

- **Bewusster zu konsumieren**: Ist das neue Smartphone wirklich 80 Arbeitsstunden wert?
- **Bessere finanzielle Entscheidungen zu treffen**: Vergleichen Sie Anschaffungen in einer einheitlichen Währung – Ihrer Lebenszeit
- **Den wahren Wert Ihrer Zeit zu verstehen**: Berücksichtigen Sie alle Faktoren, die Ihren effektiven Stundenlohn beeinflussen

## ✨ Features

## 📝 Changelog

Siehe [CHANGELOG.md](CHANGELOG.md) für Release Notes.

### Effektive Stundenlohn-Berechnung

Die App berechnet Ihren **effektiven Stundenlohn** unter Berücksichtigung aller relevanten Faktoren:

- ✅ **Brutto- oder Netto-Einkommen** - Wählen Sie, was für Sie passt
- ✅ **Pendelzeit** - Wird als Arbeitszeit gezählt
- ✅ **Unbezahlte Überstunden** - Senken Ihren effektiven Stundenlohn
- ✅ **Mehrere Einkommensquellen** - Nebenjobs, passive Einkünfte
- ✅ **Flexible Arbeitsmodelle** - 4-Tage-Woche, Teilzeit, etc.

[→ Detaillierte Dokumentation zur Stundenlohn-Berechnung](docs/STUNDENLOHN-BERECHNUNG.md)

### Calculator

Rechnen Sie beliebige Geldbeträge in Lebenszeit um:
- CHF → Stunden/Tage/Wochen
- Live-Berechnung während der Eingabe
- Visualisierung als Diagramm

### Status-Übersicht

Sehen Sie auf einen Blick:
- Ihre monatlichen/jährlichen Ausgaben
- In Lebenszeit umgerechnet
- Historische Entwicklung

## 🚀 Installation & Start

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Production Build erstellen
npm run build

# Tests ausführen
npm test
```

## 🧪 Tests

Das Projekt enthält umfassende Unit Tests für die Berechnungslogik:

```bash
# Tests im Watch-Modus
npm test

# Tests einmalig ausführen
npm run test:run
```

Alle Tests finden Sie in [src/lib/__tests__/settings.test.ts](src/lib/__tests__/settings.test.ts).

## 📖 Verwendung

1. **Settings konfigurieren**: Geben Sie Ihr Einkommen und Ihre Arbeitszeit ein
2. **Erweiterte Optionen** (optional): Pendelzeit, Überstunden, Nebeneinkünfte
3. **Calculator nutzen**: Rechnen Sie beliebige Beträge in Lebenszeit um
4. **Status prüfen**: Sehen Sie Ihre Ausgaben in Zeiteinheiten

### Beispiel

```
Netto: 5500 CHF/Monat
Arbeitszeit: 40 h/Woche
Pendelzeit: 60 Min/Tag

→ Effektiver Stundenlohn: 28,23 CHF/h

Ein iPhone für 1200 CHF kostet Sie also:
1200 / 28,23 = 42,5 Arbeitsstunden
= 5,3 Arbeitstage à 8 Stunden
```

## 🛠️ Tech Stack

- **React 19** mit TypeScript
- **Vite** für schnelle Entwicklung
- **Tailwind CSS** für Styling
- **Vitest** für Unit Tests
- **LocalStorage** für Datenpersistenz

## 📁 Projekt-Struktur

```
src/
├── components/          # UI-Komponenten
│   ├── LineChart.tsx
│   ├── Modal.tsx
│   └── TopNav.tsx
├── screens/             # Haupt-Screens
│   ├── CalculatorScreen.tsx
│   ├── SettingsScreen.tsx
│   └── StatusScreen.tsx
├── lib/                 # Business Logic
│   ├── settings.ts      # Stundenlohn-Berechnung
│   ├── expenses.ts
│   ├── money.ts
│   └── __tests__/       # Unit Tests
└── hooks/               # Custom Hooks
    └── useLocalStorageState.ts
```

## 🎨 Design-Prinzipien

- **Minimalismus**: Fokus auf das Wesentliche
- **Transparenz**: Alle Berechnungen sind nachvollziehbar
- **Flexibilität**: Passt sich verschiedenen Lebensmodellen an
- **Privacy**: Alle Daten bleiben lokal im Browser

## 🤝 Contributing

Verbesserungsvorschläge und Pull Requests sind willkommen!

## License

This project is publicly available for viewing and evaluation purposes only.
All rights are reserved. See LICENSE file for details.

---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
