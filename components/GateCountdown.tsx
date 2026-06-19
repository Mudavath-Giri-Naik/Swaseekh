'use client'

import { useState, useEffect } from 'react'
import { Countdown } from './ui/countdown'

export default function GateCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const targetDate = new Date('February 7, 2027 00:00:00').getTime()

    const updateCountdown = () => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!isMounted) return null

  return (
    <div className="w-full max-w-[800px] mx-auto mt-6 md:mt-8 mb-8 md:mb-12 px-4 z-20 flex justify-center">
      <div className="flex items-center gap-1.5 sm:gap-2 text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1A2E] tracking-tighter">
        <Countdown value={timeLeft.days} padStart={true} />
        <span className="text-[#A1A1AA] font-normal mx-0.5 sm:mx-1 relative -top-0.5">:</span>
        <Countdown value={timeLeft.hours} padStart={true} />
        <span className="text-[#A1A1AA] font-normal mx-0.5 sm:mx-1 relative -top-0.5">:</span>
        <Countdown value={timeLeft.minutes} padStart={true} />
        <span className="text-[#A1A1AA] font-normal mx-0.5 sm:mx-1 relative -top-0.5">:</span>
        <Countdown value={timeLeft.seconds} padStart={true} />
      </div>
    </div>
  )
}
