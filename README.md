# OnlyTime

**OnlyTime** ist eine Web-App, die Geldbeträge in Lebenszeit umrechnet. Basierend auf Ihrem persönlichen Stundenlohn zeigt sie Ihnen, wie viele Stunden oder Tage Arbeit ein Produkt oder eine Dienstleistung wirklich kostet.

🌐 **Live-Webseite:** [https://swissinnovationstudios.github.io/only-time/](https://swissinnovationstudios.github.io/only-time/)

## 🎯 Konzept

Anstatt einen Preis nur als Geldbetrag zu sehen, rechnet OnlyTime ihn in die Zeit um, die Sie arbeiten müssen, um diesen Betrag zu verdienen. Dies hilft Ihnen:

- **Bewusster zu konsumieren**: Ist das neue Smartphone wirklich 80 Arbeitsstunden wert?
- **Bessere finanzielle Entscheidungen zu treffen**: Vergleichen Sie Anschaffungen in einer einheitlichen Währung – Ihrer Lebenszeit.
- **Den wahren Wert Ihrer Zeit zu verstehen**: Berücksichtigen Sie alle Faktoren, die Ihren effektiven Stundenlohn beeinflussen.

## ✨ Features

### Effektive Stundenlohn-Berechnung
Die App berechnet Ihren **effektiven Stundenlohn** unter Berücksichtigung aller relevanten Faktoren:
- ✅ **Brutto- oder Netto-Einkommen** - Wählen Sie, was für Sie passt.
- ✅ **Pendelzeit** - Wird als Arbeitszeit gezählt.
- ✅ **Unbezahlte Überstunden** - Senken Ihren effektiven Stundenlohn.
- ✅ **Mehrere Einkommensquellen** - Nebenjobs, passive Einkünfte.
- ✅ **Flexible Arbeitsmodelle** - 4-Tage-Woche, Teilzeit, etc.

[→ Detaillierte Dokumentation zur Stundenlohn-Berechnung](docs/STUNDENLOHN-BERECHNUNG.md)

### Ausgaben-Management & Tracking
- 🕒 **Status-Board**: Echtzeit-Berechnung deiner Ausgaben in CHF und Arbeitszeit.
- 📊 **Visualisierungen**: Kumulierte Charts und Kategorie-Breakdowns für volle Transparenz.
- ⚡ **Quick-Add**: Schnellerfassung häufiger Ausgaben mit Titeln, Emojis und Beträgen.
- 📂 **CSV-Import**: Importiere bestehende Daten aus anderen Quellen.

### Privacy & Rechtliches
- 🛡️ **100% Lokal**: Alle Daten bleiben in deinem Browser-Speicher (`localStorage`). Nichts wird an Server übertragen.
- ⚖️ **Rechtskonform**: Integriertes Impressum und Datenschutzerklärung.

## 📝 Changelog

Siehe [CHANGELOG.md](CHANGELOG.md) für Release Notes.

## 🚀 Installation & Start (Development)

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

## 🛠️ Tech Stack

- **React 19** mit TypeScript
- **Vite** & **Vitest**
- **Tailwind CSS** (v4)
- **LocalStorage** für Datenpersistenz
- **GitHub Actions** für automatisiertes Deployment

## 🎨 Design-Prinzipien

- **Minimalismus**: Fokus auf das Wesentliche, klare Kontraste (Dark/Light Mode).
- **Stabilität**: Layout-optimierte Charts ohne Sprünge beim Hovern.
- **Transparenz**: Alle Berechnungen sind nachvollziehbar und lokal.

## 🤝 Contributing

Verbesserungsvorschläge und Pull Requests sind willkommen!

## License

This project is publicly available for viewing and evaluation purposes only.
All rights are reserved. See LICENSE file for details.
