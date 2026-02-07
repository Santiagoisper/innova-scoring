"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark'
  brightness: number
  setTheme: (theme: 'light' | 'dark') => void
  setBrightness: (brightness: number) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark')
  const [brightness, setBrightnessState] = useState(100)
  const [mounted, setMounted] = useState(false)

  // Cargar configuración guardada
  useEffect(() => {
    const savedTheme = (localStorage.getItem('admin_theme') as 'light' | 'dark') || 'dark'
    const savedBrightness = parseInt(localStorage.getItem('admin_brightness') || '100')
    
    setThemeState(savedTheme)
    setBrightnessState(savedBrightness)
    setMounted(true)
    
    // Aplicar tema al documento
    applyTheme(savedTheme, savedBrightness)
  }, [])

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme)
    localStorage.setItem('admin_theme', newTheme)
    applyTheme(newTheme, brightness)
  }

  const setBrightness = (newBrightness: number) => {
    setBrightnessState(newBrightness)
    localStorage.setItem('admin_brightness', newBrightness.toString())
    applyTheme(theme, newBrightness)
  }

  const applyTheme = (currentTheme: 'light' | 'dark', currentBrightness: number) => {
    const root = document.documentElement
    
    if (currentTheme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }

    // Aplicar brillo ajustando la opacidad del fondo
    const brightnessPercent = currentBrightness / 100
    root.style.setProperty('--brightness', brightnessPercent.toString())
    
    // Ajustar el fondo según el brillo
    if (currentTheme === 'dark') {
      const darkBg = Math.round(15 + (brightnessPercent * 30)) // 15 a 45
      root.style.backgroundColor = `rgb(${darkBg}, ${darkBg}, ${darkBg})`
    } else {
      const lightBg = Math.round(245 - (brightnessPercent * 30)) // 245 a 215
      root.style.backgroundColor = `rgb(${lightBg}, ${lightBg}, ${lightBg})`
    }
  }

  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ theme, brightness, setTheme, setBrightness }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider')
  }
  return context
}
