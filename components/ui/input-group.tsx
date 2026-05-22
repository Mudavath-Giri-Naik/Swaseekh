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
      "flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm transition-colors focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200",
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
      "min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none",
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
      "flex shrink-0 items-center text-slate-500 [&>svg]:h-4 [&>svg]:w-4",
      align === "inline-end" ? "order-last text-xs" : "",
      className
    )}
    {...props}
  />
))
InputGroupAddon.displayName = "InputGroupAddon"

export { InputGroup, InputGroupInput, InputGroupAddon }
