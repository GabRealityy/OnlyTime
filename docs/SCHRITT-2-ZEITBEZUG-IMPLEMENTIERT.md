# Schritt 2: Zeitbezug konsequent mit erweitertem Stundenlohn umgesetzt

## Zusammenfassung

Der erweiterte Stundenlohn aus Commit d9b6e086b7da2e52d267566a8eb0459c44288df1 wurde konsequent in der gesamten App integriert. Die App zeigt jetzt an allen Stellen parallel zu den Geldwerten auch die entsprechenden Zeitwerte (in Stunden und Minuten), basierend auf dem effektiven Stundenlohn, der Pendelzeit, Überstunden und zusätzliche Einkommen berücksichtigt.

## Durchgeführte Änderungen

### 1. Zeitberechnungs-Funktionen erweitert ([src/lib/money.ts](src/lib/money.ts))

**Neue Funktionen:**
- `toHours(amountCHF, hourlyRateCHF)` - Konvertiert CHF-Betrag in Stunden
- `toMinutes(hours)` - Konvertiert Stunden in Minuten
- Bestehende Funktionen `formatHoursMinutes()` und `toHoursMinutes()` bleiben unverändert

**Verwendung:**
```typescript
const hourlyRate = hourlyRateCHF(settings) // z.B. 28.87 CHF/h
const purchaseAmount = 100 // CHF
const timeInHours = toHours(purchaseAmount, hourlyRate) // 3.46 Stunden
const formatted = formatHoursMinutes(timeInHours) // "3h 28m"
```

### 2. Type-Erweiterungen ([src/lib/expenses.ts](src/lib/expenses.ts))

**Expense-Type erweitert:**
```typescript
export type Expense = {
  id: string
  date: string
  amountCHF: number
  title: string
  category: ExpenseCategory
  createdAt: number
  amountHours?: number // Optional: dynamisch berechnet
}
```

Das `amountHours`-Feld wird nicht persistiert, sondern bei Bedarf dynamisch aus `amountCHF / hourlyRateCHF` berechnet.

### 3. StatusScreen erweitert ([src/screens/StatusScreen.tsx](src/screens/StatusScreen.tsx))

**Neue Berechnungen:**
- `earnedHours` - Verdiente Stunden basierend auf anteiliger monatlicher Verdienst
- `spentHours` - Ausgegebene Stunden basierend auf Ausgaben
- `availableHours` - Verfügbare Stunden (earnedHours - spentHours)
- `timeOverspent` - Boolean für Zeitüberschreitung-Warnung

**UI-Verbesserungen:**
- **Earned/Spent-Karten:** Zeigen jetzt unter dem CHF-Betrag die entsprechenden Stunden an
- **Balance-Karte:** Zeigt verfügbare Stunden und den aktuellen Stundenlohn
- **Zeitüberschreitungs-Warnung:** Rotes Warnfeld erscheint, wenn mehr ausgegeben wurde als verdient
- **Ausgabenliste:** Jede Ausgabe zeigt unter dem CHF-Betrag die Zeit-Kosten in "h:m"-Format

**Beispiel-Anzeige:**
```
Earned so far: 3000 CHF
              120h 0m verdient

Spent this month: 1500 CHF
                  60h 0m ausgegeben

Balance: 🟢 1500 CHF
         60h 0m verfügbare Zeit
         Stundenlohn: 25.00 CHF/h
```

### 4. LineChart interaktiv erweitert ([src/components/LineChart.tsx](src/components/LineChart.tsx))

**Neue Features:**
- **DailyPoint-Type erweitert:** Enthält jetzt auch `earnedHours` und `spentHours`
- **Hover-Interaktivität:** Mouseover zeigt Tooltip mit Werten für den jeweiligen Tag
- **Duale Werte:** Tooltip zeigt sowohl CHF als auch Stunden-Werte
- **Zeitachsen-Hinweis:** Legende zeigt "(Zeitwerte berücksichtigt)" wenn Stundenlohn gesetzt

**Props erweitert:**
```typescript
export function LineChart(props: {
  points: DailyPoint[]
  width?: number
  height?: number
  hourlyRate?: number      // Neu
  showTimeAxis?: boolean   // Neu
})
```

**Tooltip-Anzeige:**
```
Tag 15
Verdient: 1875 CHF (65h 0m)
Ausgegeben: 1200 CHF (41h 30m)
```

### 5. Calculator mit Speicherfunktion ([src/screens/CalculatorScreen.tsx](src/screens/CalculatorScreen.tsx))

**Neue Funktionalität:**
- **"Als Ausgabe speichern"-Button:** Wandelt berechnete Zeit direkt in Ausgabe um
- **Save-Modal:** Eingabefelder für Titel, Datum und Kategorie
- **Erfolgs-Feedback:** Kurze Bestätigung nach dem Speichern

**Workflow:**
1. Nutzer gibt Preis ein (z.B. 142 CHF)
2. Sieht Zeit-Kosten (z.B. 5h 8m)
3. Klickt "Als Ausgabe speichern"
4. Füllt Titel und Kategorie aus
5. Ausgabe wird in aktuellem Monat gespeichert

**Reflexionsfragen bleiben erhalten** und können weiterhin zur Selbstreflexion genutzt werden.

### 6. Umfassende Tests ([src/lib/__tests__/](src/lib/__tests__/))

**Neue Test-Datei:** `money.test.ts`
- Tests für `formatCHF`, `formatHoursMinutes`, `toHours`, `toMinutes`
- Integration-Tests für Zeit-Berechnungen
- Real-World-Szenarien

**Erweiterte Test-Datei:** `settings.test.ts`
- Neue Test-Suite "Zeit-Berechnungen Integration"
- Tests zeigen Auswirkungen von Pendelzeit, Überstunden auf Kaufkraft
- Komplexe Real-World-Szenarien mit mehreren Einkommensquellen
- Tests für Zeitüberschreitungs-Logik

**Test-Ergebnisse:** ✅ 49 Tests bestehen

## Berechnungslogik

### Effektiver Stundenlohn (bereits implementiert)

```typescript
// Monatliche Arbeitsstunden (inkl. Pendelzeit, Überstunden)
monthlyWorkingHours = (weeklyWorkingHours + overtimeHoursPerWeek + commuteHoursPerWeek) 
                      * weeksPerMonth 
                      + additionalIncomeHours

// Effektives Nettoeinkommen
effectiveNetMonthlyIncome = netMonthlyIncomeCHF + Σ(additionalIncomeSources.amountCHF)

// Effektiver Stundenlohn
hourlyRateCHF = effectiveNetMonthlyIncome / monthlyWorkingHours
```

### Zeit-Kosten Berechnung (neu)

```typescript
// Zeit-Kosten einer Ausgabe
amountHours = amountCHF / hourlyRateCHF

// Verdiente Stunden (anteilig im Monat)
earnedHours = earnedCHF / hourlyRateCHF

// Ausgegebene Stunden
spentHours = spentCHF / hourlyRateCHF

// Verfügbare Zeit
availableHours = earnedHours - spentHours

// Zeitüberschreitung?
timeOverspent = spentHours > earnedHours
```

## Auswirkungen für Nutzer

### Transparenz über Zeitkosten

Nutzer sehen jetzt direkt, wie viel Lebenszeit jede Ausgabe "kostet":
- Ein 100 CHF Kauf bei 25 CHF/h Stundenlohn = 4 Stunden Arbeitszeit
- Mit 1h Pendelzeit pro Tag sinkt der Stundenlohn → derselbe Kauf kostet mehr Zeit

### Pendelzeit-Bewusstsein

Die App zeigt deutlich, wie Pendelzeit die Kaufkraft senkt:
```
Ohne Pendelzeit: 100 CHF = 3h 28m
Mit 1h Pendelzeit/Tag: 100 CHF = 3h 54m
→ 26 Minuten mehr Lebenszeit pro 100 CHF
```

### Überstunden-Transparenz

Unbezahlte Überstunden reduzieren den effektiven Stundenlohn:
```
40h/Woche ohne Überstunden: Stundenlohn 28.87 CHF/h
40h/Woche + 10h Überstunden: Stundenlohn 23.09 CHF/h
→ Jeder Kauf kostet 25% mehr Lebenszeit
```

### Motivierende Sprache

Die App nutzt positive Formulierungen:
- "60h 0m verfügbare Zeit" statt "Restbudget"
- Grüne Emoji 🟢 bei positiver Balance
- Warnungen nur bei echter Zeitüberschreitung

## Technische Details

### Performance

- Zeitwerte werden **dynamisch berechnet**, nicht persistiert
- Bei Änderung der Settings aktualisieren sich automatisch alle Zeitwerte
- Keine zusätzlichen localStorage-Zugriffe

### Kompatibilität

- Bestehende Ausgaben ohne `amountHours` funktionieren weiterhin
- Rückwärtskompatibilität vollständig gewährleistet
- Kein Breaking Change für bestehende Daten

### Barrierefreiheit

- Klare Farbcodierung (Grün = positiv, Rot = negativ)
- Semantische HTML-Struktur
- Tastatur-Navigation funktioniert

## Nächste Schritte (optional)

Folgende Erweiterungen wären denkbar:
1. **Kategorien-Report:** Zeitverbrauch pro Kategorie visualisieren
2. **Wochen-/Jahres-Ansicht:** Verschiedene Zeiträume analysieren
3. **Savings-Tracker:** "Eingesparte Zeit" durch Verzicht auf Käufe anzeigen
4. **Export-Funktion:** Zeit- und Geld-Daten als CSV exportieren
5. **Tooltips in Settings:** Erklären, wie Pendelzeit und Überstunden berechnet werden

## Build & Tests

✅ Build erfolgreich: `npm run build`
✅ Alle Tests bestehen: `npm test` (49/49)
✅ TypeScript-Fehler: Keine
✅ ESLint-Warnungen: Keine relevanten

## Dateien geändert

- ✏️ `src/lib/money.ts` - Zeitberechnungs-Funktionen hinzugefügt
- ✏️ `src/lib/expenses.ts` - Expense-Type um amountHours erweitert
- ✏️ `src/screens/StatusScreen.tsx` - Zeitwerte-Anzeige integriert
- ✏️ `src/components/LineChart.tsx` - Interaktiver Tooltip mit Zeit-Werten
- ✏️ `src/screens/CalculatorScreen.tsx` - "Als Ausgabe speichern"-Feature
- ➕ `src/lib/__tests__/money.test.ts` - Neue Tests für Zeitberechnungen
- ✏️ `src/lib/__tests__/settings.test.ts` - Integration-Tests erweitert

## Fazit

Schritt 2 ist vollständig umgesetzt. Die App zeigt jetzt konsequent an allen Stellen parallel zu Geldwerten auch Zeitwerte, basierend auf dem erweiterten Stundenlohn-Modell. Nutzer erhalten dadurch ein viel klareres Bild davon, wie ihre Pendelzeit, Überstunden und Nebenjobs ihre tatsächliche Kaufkraft in Lebenszeit beeinflussen.

Die Implementierung ist robust getestet, performant und rückwärtskompatibel.
