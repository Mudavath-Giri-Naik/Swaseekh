"use client"

import { useEffect } from "react"
import { globalCache } from "@/lib/global-cache"

export function GlobalPrefetch() {
  useEffect(() => {
    globalCache.init()
  }, [])

  return null
}
