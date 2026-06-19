'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, Clock } from 'lucide-react'

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

  const TimeBlock = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/80 backdrop-blur-md border border-[#E8E0D8] rounded-xl w-14 h-16 sm:w-16 sm:h-20 flex items-center justify-center shadow-sm">
        <span className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] tabular-nums tracking-tight">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs font-medium text-[#666] mt-2 uppercase tracking-wider">{label}</span>
    </div>
  )

  return (
    <div className="w-full max-w-[800px] mx-auto mb-8 md:mb-12 px-4 z-20 flex flex-col items-center relative">
      
      {/* Small floating elements to make it premium */}
      <div className="absolute -left-4 top-4 text-[#F26419]/20 animate-pulse">
        <CalendarDays size={24} />
      </div>
      <div className="absolute -right-2 -top-2 text-[#4ECDC4]/20 animate-pulse" style={{ animationDelay: '1s' }}>
        <Clock size={20} />
      </div>

      <div className="flex flex-col items-center p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-white/60 to-transparent backdrop-blur-sm border border-white/40 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-[#F26419]/5 to-transparent blur-2xl"></div>
        
        <div className="flex items-center gap-2 mb-6">
          <div className="h-1.5 w-1.5 rounded-full bg-[#F26419] animate-ping"></div>
          <span className="text-xs sm:text-sm font-semibold text-[#F26419] uppercase tracking-widest">
            GATE 2027 Countdown
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 z-10">
          <TimeBlock value={timeLeft.days} label="Days" />
          <span className="text-xl sm:text-2xl font-bold text-[#CCC] -mt-6">:</span>
          <TimeBlock value={timeLeft.hours} label="Hours" />
          <span className="text-xl sm:text-2xl font-bold text-[#CCC] -mt-6">:</span>
          <TimeBlock value={timeLeft.minutes} label="Mins" />
          <span className="text-xl sm:text-2xl font-bold text-[#CCC] -mt-6">:</span>
          <TimeBlock value={timeLeft.seconds} label="Secs" />
        </div>
      </div>
    </div>
  )
}
