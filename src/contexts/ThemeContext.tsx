/*
  Theme Context for Light/Dark Mode
  
  Provides theme state and toggle functionality across the app.
  Persists user preference in localStorage.
*/

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('onlyTime_theme')
    if (saved === 'light' || saved === 'dark') return saved
    
    // Default to dark theme
    return 'dark'
  })

  useEffect(() => {
    // Apply theme class to document root
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    
    // Save preference
    localStorage.setItem('onlyTime_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
