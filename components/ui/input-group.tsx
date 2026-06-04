"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Minimal shadcn-style InputGroup:
 *   <InputGroup>
 *     <InputGroupAddon><Icon /></InputGroupAddon>      ← left
 *     <InputGroupInput placeholder="..." />
 *     <InputGroupAddon align="inline-end">12 results</InputGroupAddon>  ← right
 *   </InputGroup>
 */

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Light: card bg + soft border. Dark: borderless translucent chip.
      "flex h-10 items-center gap-2 rounded-md border bg-card px-3 text-sm transition-colors focus-within:border-foreground/30 focus-within:ring-2 focus-within:ring-ring/20",
      "dark:border-transparent dark:bg-white/[0.04] dark:focus-within:bg-white/[0.06] dark:focus-within:ring-white/10",
      className
    )}
    {...props}
  />
))
InputGroup.displayName = "InputGroup"

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none",
      className
    )}
    {...props}
  />
))
InputGroupInput.displayName = "InputGroupInput"

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "inline-start" | "inline-end"
  }
>(({ className, align = "inline-start", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex shrink-0 items-center text-muted-foreground [&>svg]:h-4 [&>svg]:w-4",
      align === "inline-end" ? "order-last text-xs" : "",
      className
    )}
    {...props}
  />
))
InputGroupAddon.displayName = "InputGroupAddon"

export { InputGroup, InputGroupInput, InputGroupAddon }
