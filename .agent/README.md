# .agent Verzeichnis

> **Für AI-Agenten und Entwickler**: Dieses Verzeichnis enthält wichtige Anleitungen für die Arbeit am OnlyTime-Codebase.

## 📁 Dateien in diesem Verzeichnis

### 1. `ARCHITECTURE.md`
**Vollständige Architektur-Übersicht**
- Projekt-Struktur
- Datenfluss
- State-Management
- Code-Conventions
- Build & Deploy

**Wann nutzen?**
- Neues Feature implementieren
- Codebase verstehen
- Architektur-Entscheidungen treffen

---

### 2. `THEME-IMPLEMENTATION-GUIDE.md`
**Detaillierte Theme-System-Anleitung**
- Verfügbare Farb-Tokens
- Korrekte Implementierung
- Häufige Fehler
- Beispiele aus dem Codebase

**Wann nutzen?**
- Neue UI-Komponente erstellen
- Styling hinzufügen
- Theme-Probleme debuggen

---

## 🎯 Quick Start für Agenten

### Wenn du eine neue Komponente erstellen sollst:

1. Lies `ARCHITECTURE.md` → "Code-Conventions"
2. Lies `THEME-IMPLEMENTATION-GUIDE.md` → "✅ DO: Korrekte Implementierung"
3. Nutze **NUR** semantische Farb-Tokens
4. Teste in Light & Dark Mode

### Wenn du ein bestehendes Feature ändern sollst:

1. Lies `ARCHITECTURE.md` → Finde das richtige Modul
2. Prüfe bestehende Implementierung
3. Halte dich an die Code-Conventions
4. **NIEMALS** hardcodierte Farben hinzufügen

### Wenn du Styling ändern sollst:

1. Lies `THEME-IMPLEMENTATION-GUIDE.md` vollständig
2. Nutze **AUSSCHLIESSLICH** semantische Tokens
3. Teste beide Themes
4. Validiere Kontraste (WCAG AA)

---

## ⚠️ Kritische Regeln

### Goldene Regel #1: Theme-System
```tsx
// ❌ NIEMALS
<div className="bg-zinc-50 dark:bg-zinc-900">

// ✅ IMMER
<div className="bg-card">
```

### Goldene Regel #2: TypeScript
```typescript
// ❌ NIEMALS
function doSomething(data: any) {}

// ✅ IMMER
function doSomething(data: Expense) {}
```

### Goldene Regel #3: Business-Logik
```tsx
// ❌ NIEMALS in Komponenten
const hourlyRate = settings.monthlyIncome / (settings.workingHours * 4.33)

// ✅ IMMER in lib/
import { hourlyRateCHF } from '../lib/settings'
const hourlyRate = hourlyRateCHF(settings)
```

---

## 📚 Weiterführende Dokumentation

```
OnlyTime/
├── .agent/
│   ├── README.md                          ← Du bist hier
│   ├── ARCHITECTURE.md                    ← Vollständige Architektur
│   └── THEME-IMPLEMENTATION-GUIDE.md      ← Theme-System
│
├── docs/
│   ├── THEME-SYSTEM.md                    ← User-Dokumentation
│   ├── SCHRITT-2-ZEITBEZUG-IMPLEMENTIERT.md
│   └── STUNDENLOHN-BERECHNUNG.md
│
├── src/
│   ├── index.css                          ← CSS-Variablen
│   ├── types.ts                           ← TypeScript-Typen
│   └── ...
│
└── tailwind.config.js                     ← Farb-Tokens
```

---

## 🔍 Schnell-Referenz

| Task | Datei |
|------|-------|
| Neue Komponente erstellen | `THEME-IMPLEMENTATION-GUIDE.md` |
| Architektur verstehen | `ARCHITECTURE.md` |
| Farbe hinzufügen | `THEME-IMPLEMENTATION-GUIDE.md` → "Neue Farben" |
| Business-Logik hinzufügen | `ARCHITECTURE.md` → "Wichtige Module" |
| Debug Theme-Problem | `THEME-IMPLEMENTATION-GUIDE.md` → "Debugging" |
| Code-Conventions | `ARCHITECTURE.md` → "Code-Conventions" |

---

## ✅ Pre-Commit Checklist

Bevor du Code committest:

- [ ] Keine TypeScript-Errors (`npm run type-check`)
- [ ] Keine hardcodierten Farben (`grep -r "zinc-" src/`)
- [ ] Keine `dark:` Präfixe (`grep -r "dark:bg-" src/`)
- [ ] Code-Conventions eingehalten
- [ ] In beiden Themes getestet
- [ ] Responsive Design geprüft

---

## 🆘 Support

Bei Fragen zur Architektur oder Implementierung:

1. **Erst**: Relevante `.md` Datei in `.agent/` lesen
2. **Dann**: Bestehenden Code als Referenz nutzen
3. **Zuletzt**: Im Zweifel: Semantische Farb-Tokens verwenden!

---

**Viel Erfolg bei der Implementierung! 🚀**
