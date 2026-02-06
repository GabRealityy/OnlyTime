/*
  Dummy data generator for testing and demonstrations.
  
  This module generates realistic expense data for a specified number of months
  to populate the app for testing, demos, or workshops.
*/

import { addExpense, type ExpenseCategory } from './expenses'
import type { Settings } from './settings'

type ExpenseTemplate = {
  titles: string[]
  category: ExpenseCategory | string
  minAmount: number
  maxAmount: number
  frequency: number // Durchschnittliche Häufigkeit pro Monat
}

const expenseTemplates: ExpenseTemplate[] = [
  // Essen
  {
    titles: ['Kaffee', 'Espresso', 'Cappuccino', 'Latte Macchiato'],
    category: 'Essen',
    minAmount: 3.50,
    maxAmount: 6.50,
    frequency: 15,
  },
  {
    titles: ['Mittagessen', 'Lunch', 'Znüni', 'Zvieri'],
    category: 'Essen',
    minAmount: 12,
    maxAmount: 25,
    frequency: 20,
  },
  {
    titles: ['Abendessen', 'Restaurant', 'Take-Away', 'Pizza'],
    category: 'Essen',
    minAmount: 20,
    maxAmount: 60,
    frequency: 8,
  },
  {
    titles: ['Supermarkt', 'Einkauf', 'Migros', 'Coop'],
    category: 'Essen',
    minAmount: 30,
    maxAmount: 150,
    frequency: 4,
  },
  
  // Mobilität
  {
    titles: ['ÖV-Ticket', 'Tram', 'Bus', 'Zug'],
    category: 'Mobilität',
    minAmount: 3,
    maxAmount: 8,
    frequency: 18,
  },
  {
    titles: ['Tankstelle', 'Benzin', 'Diesel'],
    category: 'Mobilität',
    minAmount: 50,
    maxAmount: 100,
    frequency: 2,
  },
  {
    titles: ['Parkgebühr', 'Parkhaus', 'Parkuhr'],
    category: 'Mobilität',
    minAmount: 2,
    maxAmount: 15,
    frequency: 4,
  },
  
  // Einkaufen
  {
    titles: ['Kleidung', 'H&M', 'Zara', 'Shopping'],
    category: 'Einkaufen',
    minAmount: 30,
    maxAmount: 150,
    frequency: 2,
  },
  {
    titles: ['Drogerie', 'dm', 'Rossmann', 'Müller'],
    category: 'Einkaufen',
    minAmount: 10,
    maxAmount: 50,
    frequency: 3,
  },
  {
    titles: ['Amazon', 'Online-Shop', 'Galaxus', 'Digitec'],
    category: 'Einkaufen',
    minAmount: 15,
    maxAmount: 200,
    frequency: 3,
  },
  
  // Wohnen
  {
    titles: ['Baumarkt', 'Haushalt', 'IKEA', 'Möbel'],
    category: 'Wohnen',
    minAmount: 20,
    maxAmount: 300,
    frequency: 1,
  },
  {
    titles: ['Strom', 'Stromrechnung'],
    category: 'Wohnen',
    minAmount: 50,
    maxAmount: 120,
    frequency: 0.25, // Vierteljährlich
  },
  
  // Freizeit
  {
    titles: ['Kino', 'Film', 'Movie'],
    category: 'Freizeit',
    minAmount: 15,
    maxAmount: 25,
    frequency: 2,
  },
  {
    titles: ['Bar', 'Ausgang', 'Club', 'Drinks'],
    category: 'Freizeit',
    minAmount: 30,
    maxAmount: 100,
    frequency: 3,
  },
  {
    titles: ['Sport', 'Fitnessstudio', 'Yoga', 'Schwimmbad'],
    category: 'Freizeit',
    minAmount: 10,
    maxAmount: 80,
    frequency: 4,
  },
  {
    titles: ['Buch', 'Buchhandlung', 'eBook'],
    category: 'Freizeit',
    minAmount: 15,
    maxAmount: 40,
    frequency: 1,
  },
  {
    titles: ['Konzert', 'Event', 'Theater', 'Museum'],
    category: 'Freizeit',
    minAmount: 30,
    maxAmount: 120,
    frequency: 1,
  },
  
  // Abos
  {
    titles: ['Netflix', 'Spotify', 'Disney+', 'YouTube Premium'],
    category: 'Abos',
    minAmount: 9.90,
    maxAmount: 19.90,
    frequency: 1,
  },
  {
    titles: ['Handy-Abo', 'Internet', 'Telefon'],
    category: 'Abos',
    minAmount: 30,
    maxAmount: 80,
    frequency: 1,
  },
  
  // Sonstiges
  {
    titles: ['Geschenk', 'Geburtstagsgeschenk', 'Present'],
    category: 'Sonstiges',
    minAmount: 20,
    maxAmount: 100,
    frequency: 1,
  },
  {
    titles: ['Arzt', 'Apotheke', 'Medikamente', 'Zahnarzt'],
    category: 'Sonstiges',
    minAmount: 30,
    maxAmount: 200,
    frequency: 0.5,
  },
]

/**
 * Generiert realistische Dummy-Daten für einen bestimmten Zeitraum
 * 
 * @param _settings - Die aktuellen App-Einstellungen (für zukünftige Verwendung reserviert)
 * @param months - Anzahl der Monate mit Daten (z.B. 12 für ein Jahr)
 * @returns Anzahl der erstellten Ausgaben
 */
export function generateDummyData(_settings: Settings, months: number): number {
  const today = new Date()
  let totalExpenses = 0
  
  // Für jeden Monat rückwärts
  for (let monthOffset = 0; monthOffset < months; monthOffset++) {
    const targetDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1)
    const year = targetDate.getFullYear()
    const month = targetDate.getMonth()
    
    // Monatschlüssel im Format YYYY-MM
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
    
    // Tage im Monat
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    // Generiere Ausgaben für diesen Monat
    for (const template of expenseTemplates) {
      // Zufällige Anzahl basierend auf Frequenz (mit etwas Variation)
      const baseCount = template.frequency
      const variation = Math.random() * 0.4 - 0.2 // ±20%
      const count = Math.max(0, Math.round(baseCount * (1 + variation)))
      
      for (let i = 0; i < count; i++) {
        // Zufälliger Tag im Monat
        const day = Math.floor(Math.random() * daysInMonth) + 1
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        
        // Zufälliger Titel aus der Liste
        const title = template.titles[Math.floor(Math.random() * template.titles.length)]
        
        // Zufälliger Betrag im Bereich
        const range = template.maxAmount - template.minAmount
        const amount = template.minAmount + Math.random() * range
        const amountCHF = Math.round(amount * 20) / 20 // Runden auf 0.05
        
        addExpense(monthKey, {
          date,
          title,
          amountCHF,
          category: template.category,
        })
        
        totalExpenses++
      }
    }
  }
  
  return totalExpenses
}

/**
 * Generiert Dummy-Daten mit zusätzlicher Variation in den Einstellungen
 * (optional für fortgeschrittene Tests)
 * 
 * Dies fügt zufällige Schwankungen bei Überstunden und zusätzlichen Einkommen hinzu,
 * um verschiedene Stundenlohn-Szenarien zu testen.
 */
export function generateDummyDataWithVariation(settings: Settings, months: number): number {
  // TODO: Implementierung für variable Einkommen und Arbeitszeiten
  // Könnte verwendet werden, um realistische Einkommensspitzen zu simulieren
  return generateDummyData(settings, months)
}
