"use client"
import { useTheme } from "./ThemeContext"

/**
 * Resolves CSS custom properties to literal colours for chart libraries
 * (SVG attributes). Accepts "var(--name)", "--name" or a literal colour.
 * Re-resolves whenever the theme changes.
 */
export function useCssVar() {
  useTheme() // subscribe: re-render on theme change
  const cs = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null
  return (v: string): string => {
    const m = /^var\((--[\w-]+)\)$/.exec(v) || /^(--[\w-]+)$/.exec(v)
    if (!m) return v
    const r = cs?.getPropertyValue(m[1]).trim()
    return r || "#7C3AED"
  }
}
