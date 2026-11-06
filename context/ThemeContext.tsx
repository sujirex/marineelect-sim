"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Theme = "dark" | "light"
interface ThemeContextType { theme: Theme; toggle: () => void }

const KEY = "marineelect-sim-theme"
const ThemeContext = createContext<ThemeContextType>({ theme: "light", toggle: () => {} })

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    // The head script has already applied the right theme; mirror it in state.
    const applied = document.documentElement.getAttribute("data-theme") as Theme | null
    setTheme(applied === "dark" || applied === "light" ? applied : systemTheme())

    // Follow the device setting until the user picks a theme.
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      let saved: string | null = null
      try { saved = localStorage.getItem(KEY) } catch {}
      if (saved === "light" || saved === "dark") return
      const next = systemTheme()
      document.documentElement.setAttribute("data-theme", next)
      setTheme(next)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
    try { localStorage.setItem(KEY, next) } catch {}
    document.documentElement.setAttribute("data-theme", next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
