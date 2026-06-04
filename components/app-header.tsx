"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import {
  Search,
  Bell,
  CreditCard,
  LogOut,
  User as UserIcon,
  Sparkles,
  Settings,
} from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeSwitch } from "@/components/theme-switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Top header used inside every authenticated route. Provides the sidebar
 * toggle, an optional search button, theme switch, settings drawer, and
 * the profile dropdown — mirrors the shadcn-admin header layout.
 */
export function AppHeader({
  title,
  rightSlot,
}: {
  title?: string
  rightSlot?: React.ReactNode
}) {
  const { data: session } = useSession()
  const isPro = (session?.user as { plan?: string } | undefined)?.plan === 'pro'

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-3 sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      {title && (
        <h2 className="hidden text-sm font-medium text-muted-foreground sm:block">
          {title}
        </h2>
      )}

      {rightSlot}

      <div className="ml-auto flex items-center gap-1">
        {/* Search button (visual stub) */}
        <button
          type="button"
          className="hidden h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent md:inline-flex"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
          <span>Search…</span>
          <kbd className="ml-4 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        <ThemeSwitch />
        {/* Settings icon — kept visible for visual consistency. */}
        <button
          type="button"
          aria-label="Settings"
          title="Settings"
          className="inline-flex h-9 w-9 cursor-default items-center justify-center rounded-md text-muted-foreground opacity-60"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ml-1 inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-transparent transition hover:ring-border"
              aria-label="Account"
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={36}
                  height={36}
                  className="size-9 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {session?.user?.name?.[0]?.toUpperCase() || 'S'}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={32}
                    height={32}
                    className="size-8 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-bold">
                    {session?.user?.name?.[0]?.toUpperCase() || 'S'}
                  </div>
                )}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold flex items-center gap-1.5">
                    {session?.user?.name || 'Student'}
                    {isPro && (
                      <span className="bg-[#4A235A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                        Pro
                      </span>
                    )}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {session?.user?.email || ''}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {!isPro && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/pricing" className="cursor-pointer">
                      <Sparkles className="mr-2 size-4" />
                      Upgrade to Pro
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <UserIcon className="mr-2 size-4" />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/pricing" className="cursor-pointer">
                  <CreditCard className="mr-2 size-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Bell className="mr-2 size-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/' })}
              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
