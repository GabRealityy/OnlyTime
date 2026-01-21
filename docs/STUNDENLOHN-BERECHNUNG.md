# Only Time - Erweiterte Stundenlohn-Berechnung

## Übersicht

Die Stundenlohn-Berechnung in Only Time wurde erheblich erweitert, um den **effektiven Stundenlohn** realistischer zu ermitteln. Dieser berücksichtigt nicht nur das Gehalt und die regulären Arbeitsstunden, sondern auch alle weiteren Zeitaufwände und Einkommensquellen.

## Neue Funktionen

### 1. Brutto-Netto-Berechnung

Sie können nun wählen, ob Sie Ihr Netto- oder Bruttoeinkommen angeben möchten:

- **Netto-Modus** (Standard): Geben Sie Ihr tatsächliches Einkommen nach allen Abzügen ein
- **Brutto-Modus**: Geben Sie Ihr Bruttoeinkommen und den Prozentsatz für Steuern & Sozialabgaben an

**Beispiel:**
```
Bruttoeinkommen: 7000 CHF
Steuern & Abgaben: 25%
→ Nettoeinkommen: 5250 CHF
```

### 2. Zeitfaktoren

#### Pendelzeit
Erfassen Sie Ihre durchschnittliche Pendelzeit pro Arbeitstag (Hin- und Rückweg zusammen). Diese Zeit wird zu Ihrer Arbeitszeit addiert, da sie notwendig ist, um Ihr Einkommen zu verdienen.

**Beispiel:**
```
Pendelzeit: 60 Minuten pro Tag
Arbeitstage: 5 pro Woche
→ Zusätzliche Zeit: 5 Stunden pro Woche
```

**Warum ist das wichtig?** Die Pendelzeit ist "verlorene Lebenszeit", die direkt mit Ihrer Arbeit zusammenhängt. Sie sollte in den effektiven Stundenlohn eingerechnet werden.

#### Unbezahlte Überstunden
Tragen Sie hier regelmäßige Überstunden ein, die nicht extra vergütet werden. Diese senken Ihren effektiven Stundenlohn.

**Beispiel:**
```
Reguläre Arbeitszeit: 40 h/Woche
Unbezahlte Überstunden: 5 h/Woche
→ Tatsächliche Arbeitszeit: 45 h/Woche
```

#### Arbeitstage pro Woche
Standardmäßig 5 Tage. Wird für die Berechnung der Pendelzeit verwendet (z.B. bei 4-Tage-Woche entsprechend anpassen).

### 3. Zusätzliche Einkommensquellen

Erfassen Sie alle weiteren Einkommensquellen neben Ihrem Hauptjob:

- **Nebenjobs**: Tragen Sie den monatlichen Betrag und die dafür aufgewendeten Stunden ein
- **Passive Einkünfte**: Tragen Sie nur den Betrag ein (0 Stunden), z.B. für Mieteinnahmen, Dividenden

**Beispiel:**
```
Quelle 1: Nebenjob als Freelancer
  → 600 CHF/Monat, 25 Stunden/Monat

Quelle 2: Mieteinnahmen
  → 800 CHF/Monat, 0 Stunden/Monat
```

Passive Einkünfte erhöhen Ihren effektiven Stundenlohn, während zusätzliche Arbeitsstunden ihn senken können.

## Berechnungslogik

### Effektive monatliche Arbeitszeit

```
Wöchentliche Zeit = reguläre Stunden + Überstunden + (Pendelminuten × Arbeitstage / 60)

Monatliche Zeit = Wöchentliche Zeit × Wochen pro Monat + Zusätzliche Stunden aus Nebenjobs
```

**Beispiel:**
```
40 h/Woche (regulär)
+ 5 h/Woche (Überstunden)
+ 5 h/Woche (60 Min Pendeln × 5 Tage / 60)
= 50 h/Woche

50 h × 4.33 Wochen/Monat = 216,5 h/Monat
+ 20 h (Nebenjob) = 236,5 h/Monat
```

### Effektives monatliches Nettoeinkommen

```
Nettoeinkommen = Haupteinkommen + Summe(Zusatzeinkommen)
```

Bei Brutto-Modus:
```
Haupteinkommen = Bruttoeinkommen × (1 - Steuersatz/100)
```

**Beispiel:**
```
5500 CHF (Hauptjob)
+ 600 CHF (Nebenjob)
+ 800 CHF (Passiv)
= 6900 CHF/Monat
```

### Effektiver Stundenlohn

```
Stundenlohn = Effektives Nettoeinkommen / Effektive monatliche Arbeitszeit
```

**Beispiel:**
```
6900 CHF / 236,5 h = 29,18 CHF/h
```

## Verwendung

### Einfache Nutzung

Wenn Sie nur die grundlegenden Funktionen nutzen möchten:

1. Tragen Sie Ihr Nettoeinkommen ein
2. Tragen Sie Ihre wöchentlichen Arbeitsstunden ein
3. Fertig!

Die erweiterten Felder können Sie ignorieren.

### Erweiterte Nutzung

Für eine realistische Berechnung:

1. **Einkommen**: Wählen Sie zwischen Netto oder Brutto
2. **Arbeitszeit**: Tragen Sie reguläre Stunden und Wochen/Monat ein
3. **Zeitfaktoren** (aufklappen):
   - Pendelzeit pro Tag eingeben
   - Überstunden pro Woche eingeben
   - Arbeitstage anpassen falls nötig
4. **Zusätzliche Einkommen** (aufklappen):
   - Nebenjobs mit Stunden hinzufügen
   - Passive Einkünfte hinzufügen

Die Berechnung erfolgt automatisch und zeigt Ihnen sofort den **effektiven Stundenlohn**.

## UI-Features

- **Aufklappbare Bereiche**: Erweiterte Optionen sind standardmäßig eingeklappt, um die UI übersichtlich zu halten
- **Live-Berechnung**: Alle Werte werden sofort aktualisiert bei Eingabe
- **Hilfetexte**: Tooltips und Erklärungen direkt bei den Feldern
- **Validierung**: Negative Werte werden automatisch korrigiert
- **Visuelle Bestätigung**: Grüne Bestätigung wenn der Stundenlohn berechnet wurde

## Tests

Alle Berechnungsfunktionen sind mit umfassenden Unit Tests abgedeckt:

```bash
# Tests ausführen
npm test

# Tests einmalig ausführen
npm run test:run
```

Die Tests decken ab:
- Grundlegende Berechnungen
- Pendelzeit-Berechnung
- Überstunden-Berechnung
- Brutto-Netto-Konvertierung
- Mehrere Einkommensquellen
- Kombinierte Szenarien
- Validierung und Normalisierung

## Beispiele

### Beispiel 1: Vollzeitjob mit Pendelzeit

```
Netto: 5500 CHF/Monat
Arbeitszeit: 40 h/Woche
Pendelzeit: 60 Min/Tag (5 Tage)

Effektive Zeit: (40 + 5) × 4.33 = 194,85 h/Monat
Effektiver Stundenlohn: 5500 / 194,85 = 28,23 CHF/h

Ohne Pendelzeit wären es: 5500 / 173,2 = 31,76 CHF/h
→ Differenz: -3,53 CHF/h (-11%)
```

### Beispiel 2: Job mit unbezahlten Überstunden

```
Netto: 6000 CHF/Monat
Arbeitszeit: 40 h/Woche
Überstunden: 10 h/Woche (unbezahlt)

Effektive Zeit: (40 + 10) × 4.33 = 216,5 h/Monat
Effektiver Stundenlohn: 6000 / 216,5 = 27,71 CHF/h

Ohne Überstunden wären es: 6000 / 173,2 = 34,64 CHF/h
→ Differenz: -6,93 CHF/h (-20%)
```

### Beispiel 3: Hauptjob + Nebenjob + Passive Einkünfte

```
Hauptjob: 5000 CHF, 40 h/Woche
Nebenjob: 600 CHF, 25 h/Monat
Mieteinnahmen: 1000 CHF, 0 h
Pendelzeit: 45 Min/Tag (5 Tage)

Effektive Zeit:
  40 + 3,75 (Pendeln) = 43,75 h/Woche
  43,75 × 4.33 + 25 = 214,4 h/Monat

Effektives Einkommen: 5000 + 600 + 1000 = 6600 CHF

Effektiver Stundenlohn: 6600 / 214,4 = 30,78 CHF/h
```

### Beispiel 4: Brutto-Netto mit allen Faktoren

```
Brutto: 7000 CHF
Steuern: 25%
→ Netto: 5250 CHF

Arbeitszeit: 42 h/Woche
Pendelzeit: 90 Min/Tag (4 Tage, Homeoffice 1 Tag)
Überstunden: 3 h/Woche

Nebenjob: 400 CHF, 15 h/Monat

Effektive Zeit:
  42 + 3 + 6 (90 Min × 4 Tage / 60) = 51 h/Woche
  51 × 4.33 + 15 = 235,83 h/Monat

Effektives Einkommen: 5250 + 400 = 5650 CHF

Effektiver Stundenlohn: 5650 / 235,83 = 23,95 CHF/h
```

## Technische Details

### Dateien

- `src/lib/settings.ts`: Berechnungslogik und Datenmodell
- `src/screens/SettingsScreen.tsx`: UI-Komponente
- `src/lib/__tests__/settings.test.ts`: Unit Tests

### Hauptfunktionen

- `effectiveNetMonthlyIncome(settings)`: Berechnet Gesamteinkommen
- `monthlyWorkingHours(settings)`: Berechnet Gesamtarbeitszeit
- `hourlyRateCHF(settings)`: Berechnet effektiven Stundenlohn
- `weeklyCommuteHours(settings)`: Hilfsfunktion für Pendelzeit

### Datenstruktur

```typescript
type Settings = {
  // Haupteinkommen
  netMonthlyIncomeCHF: number
  grossMonthlyIncomeCHF: number
  taxRatePercent: number
  useGrossIncome: boolean
  
  // Arbeitszeit
  weeklyWorkingHours: number
  weeksPerMonth: number
  
  // Zeitfaktoren
  commuteMinutesPerDay: number
  overtimeHoursPerWeek: number
  workingDaysPerWeek: number
  
  // Zusätzliche Einkommen
  additionalIncomeSources: IncomeSource[]
}

type IncomeSource = {
  id: string
  name: string
  amountCHF: number
  hoursPerMonth: number
}
```

## Fazit

Die erweiterte Stundenlohn-Berechnung ermöglicht es Ihnen, ein viel realistischeres Bild Ihres tatsächlichen Wertes pro Stunde zu erhalten. Dies ist fundamental für das Konzept von Only Time, da es die Grundlage für alle Preis-in-Zeit-Umrechnungen bildet.

**Kernbotschaft:** Ihr effektiver Stundenlohn ist oft deutlich niedriger als Sie denken, wenn Sie alle Faktoren berücksichtigen. Diese Transparenz hilft Ihnen, bessere finanzielle Entscheidungen zu treffen.
