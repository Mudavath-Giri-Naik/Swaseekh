"use client"

import * as React from "react"
import { Check, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAppSettings } from "@/components/app-settings"
import { cn } from "@/lib/utils"

/**
 * ConfigDrawer — opens a right-anchored sheet with Theme / Sidebar
 * variant / Layout / Direction options. Each change applies immediately
 * and persists (theme via next-themes cookies, the rest via localStorage).
 */
export function ConfigDrawer() {
  const { theme, setTheme } = useTheme()
  const settings = useAppSettings()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Theme settings"
          title="Settings"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent"
        >
          <Settings className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Theme Settings</SheetTitle>
          <SheetDescription>
            Adjust the appearance and layout to suit your preferences.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-4 pb-6">
          {/* ─── Theme ──────────────────────────────────────────── */}
          <Section title="Theme" onReset={() => setTheme("system")}>
            <OptionGrid cols={3}>
              <OptionTile
                label="System"
                selected={mounted && theme === "system"}
                onClick={() => setTheme("system")}
              />
              <OptionTile
                label="Light"
                selected={mounted && theme === "light"}
                onClick={() => setTheme("light")}
              />
              <OptionTile
                label="Dark"
                selected={mounted && theme === "dark"}
                onClick={() => setTheme("dark")}
                preview="dark"
              />
            </OptionGrid>
          </Section>

          {/* ─── Sidebar variant ───────────────────────────────── */}
          <Section title="Sidebar" onReset={() => settings.setVariant("sidebar")}>
            <OptionGrid cols={3}>
              <OptionTile
                label="Inset"
                selected={settings.variant === "inset"}
                onClick={() => settings.setVariant("inset")}
              />
              <OptionTile
                label="Floating"
                selected={settings.variant === "floating"}
                onClick={() => settings.setVariant("floating")}
              />
              <OptionTile
                label="Sidebar"
                selected={settings.variant === "sidebar"}
                onClick={() => settings.setVariant("sidebar")}
              />
            </OptionGrid>
          </Section>

          {/* ─── Layout ────────────────────────────────────────── */}
          <Section title="Layout" onReset={() => settings.setLayout("default")}>
            <OptionGrid cols={3}>
              <OptionTile
                label="Default"
                selected={settings.layout === "default"}
                onClick={() => settings.setLayout("default")}
              />
              <OptionTile
                label="Compact"
                selected={settings.layout === "compact"}
                onClick={() => settings.setLayout("compact")}
              />
              <OptionTile
                label="Full"
                selected={settings.layout === "full"}
                onClick={() => settings.setLayout("full")}
              />
            </OptionGrid>
          </Section>

          {/* ─── Direction ─────────────────────────────────────── */}
          <Section title="Direction" onReset={() => settings.setDirection("ltr")}>
            <OptionGrid cols={2}>
              <OptionTile
                label="Left to Right"
                selected={settings.direction === "ltr"}
                onClick={() => settings.setDirection("ltr")}
              />
              <OptionTile
                label="Right to Left"
                selected={settings.direction === "rtl"}
                onClick={() => settings.setDirection("rtl")}
              />
            </OptionGrid>
          </Section>

          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              settings.reset()
              setTheme("system")
            }}
          >
            Reset
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* ─── tiny presentation helpers ─────────────────────────────────────── */

function Section({
  title,
  onReset,
  children,
}: {
  title: string
  onReset?: () => void
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

function OptionGrid({
  cols,
  children,
}: {
  cols: 2 | 3
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "grid gap-2",
        cols === 2 ? "grid-cols-2" : "grid-cols-3"
      )}
    >
      {children}
    </div>
  )
}

function OptionTile({
  label,
  selected,
  onClick,
  preview = "light",
}: {
  label: string
  selected: boolean
  onClick: () => void
  preview?: "light" | "dark"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-stretch overflow-hidden rounded-lg border bg-background p-1.5 transition-all",
        selected
          ? "border-foreground ring-2 ring-foreground/20"
          : "border-border hover:border-foreground/30"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center justify-center rounded text-[10px] font-medium",
          preview === "dark"
            ? "bg-slate-900 text-slate-200"
            : "bg-slate-100 text-slate-500"
        )}
      >
        Aa
      </div>
      <span className="mt-1.5 text-center text-xs font-medium text-foreground">
        {label}
      </span>
      {selected && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background">
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
      )}
    </button>
  )
}
