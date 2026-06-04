"use client"

import * as React from "react"

/**
 * App-wide layout / variant settings — stored in localStorage so a user's
 * preference persists across reloads. Exposed through a tiny context so
 * the header (settings drawer) and the sidebar can read + write the same
 * source of truth.
 */

export type SidebarVariant = "sidebar" | "floating" | "inset"
export type AppLayout = "default" | "compact" | "full"
export type AppDirection = "ltr" | "rtl"

interface AppSettings {
  variant: SidebarVariant
  layout: AppLayout
  direction: AppDirection
}

interface AppSettingsContextValue extends AppSettings {
  setVariant: (v: SidebarVariant) => void
  setLayout: (l: AppLayout) => void
  setDirection: (d: AppDirection) => void
  reset: () => void
}

const DEFAULTS: AppSettings = {
  variant: "sidebar",
  layout: "default",
  direction: "ltr",
}

const KEY = "swaseekh.app-settings"

const Ctx = React.createContext<AppSettingsContextValue | null>(null)

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppSettings>(DEFAULTS)

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<AppSettings>
      setState((s) => ({ ...s, ...parsed }))
    } catch {
      /* ignore */
    }
  }, [])

  // Apply `dir` attribute on <html>
  React.useEffect(() => {
    document.documentElement.dir = state.direction
  }, [state.direction])

  const write = React.useCallback((next: Partial<AppSettings>) => {
    setState((prev) => {
      const merged = { ...prev, ...next }
      try {
        window.localStorage.setItem(KEY, JSON.stringify(merged))
      } catch {
        /* ignore */
      }
      return merged
    })
  }, [])

  const value = React.useMemo<AppSettingsContextValue>(
    () => ({
      ...state,
      setVariant: (v) => write({ variant: v }),
      setLayout: (l) => write({ layout: l }),
      setDirection: (d) => write({ direction: d }),
      reset: () => {
        try {
          window.localStorage.removeItem(KEY)
        } catch {
          /* ignore */
        }
        setState(DEFAULTS)
      },
    }),
    [state, write]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAppSettings(): AppSettingsContextValue {
  const v = React.useContext(Ctx)
  if (!v) throw new Error("useAppSettings must be used inside AppSettingsProvider")
  return v
}
