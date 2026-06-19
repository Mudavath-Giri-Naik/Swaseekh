import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  background?: string
  className?: string
  children?: React.ReactNode
  href?: string
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      href,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      "group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/10 px-6 py-3 whitespace-nowrap text-white",
      "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
      className
    )

    const innerContent = (
      <>
        {/* Background */}
        <div
          className="absolute inset-0 -z-20"
          style={{ background }}
        />
        
        {/* Shimmer Sweep Animation */}
        <div className="absolute inset-0 -z-10 animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-3">
          {children}
        </div>

        {/* Highlight on hover/active */}
        <div
          className={cn(
            "absolute inset-0 size-full pointer-events-none",
            "rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#ffffff1f]",
            "transform-gpu transition-all duration-300 ease-in-out",
            "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",
            "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"
          )}
        />
      </>
    )

    if (href) {
      return (
        <Link href={href} className={classes} {...(props as any)}>
          {innerContent}
        </Link>
      )
    }

    return (
      <button className={classes} ref={ref} {...props}>
        {innerContent}
      </button>
    )
  }
)

ShimmerButton.displayName = "ShimmerButton"
