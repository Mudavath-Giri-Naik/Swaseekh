'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, Clock } from 'lucide-react'
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

  const TimeBlock = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/80 backdrop-blur-md border border-[#E8E0D8] rounded-[10px] w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center shadow-sm text-[#1A1A2E]">
        <div className="text-lg sm:text-xl font-bold tracking-tight">
          <Countdown value={value} padStart={true} />
        </div>
      </div>
      <span className="text-[8px] sm:text-[9px] font-semibold text-[#666] mt-1.5 uppercase tracking-wider">{label}</span>
    </div>
  )

  return (
    <div className="w-full max-w-[800px] mx-auto mb-6 md:mb-8 px-4 z-20 flex flex-col items-center relative">
      
      {/* Small floating elements to make it premium */}
      <div className="absolute -left-1 top-1 text-[#F26419]/20 animate-pulse">
        <CalendarDays size={16} />
      </div>
      <div className="absolute 0 -top-0 text-[#4ECDC4]/20 animate-pulse" style={{ animationDelay: '1s' }}>
        <Clock size={14} />
      </div>

      <div className="flex flex-col items-center p-3 sm:p-4 rounded-[20px] bg-gradient-to-b from-white/60 to-transparent backdrop-blur-sm border border-white/40 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-gradient-to-b from-[#F26419]/5 to-transparent blur-xl"></div>
        
        <div className="flex items-center gap-1.5 mb-3">
          <div className="h-1 w-1 rounded-full bg-[#F26419] animate-ping"></div>
          <span className="text-[9px] sm:text-[10px] font-bold text-[#F26419] uppercase tracking-widest">
            GATE 2027 Countdown
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 z-10">
          <TimeBlock value={timeLeft.days} label="Days" />
          <span className="text-base sm:text-lg font-bold text-[#CCC] -mt-4">:</span>
          <TimeBlock value={timeLeft.hours} label="Hours" />
          <span className="text-base sm:text-lg font-bold text-[#CCC] -mt-4">:</span>
          <TimeBlock value={timeLeft.minutes} label="Mins" />
          <span className="text-base sm:text-lg font-bold text-[#CCC] -mt-4">:</span>
          <TimeBlock value={timeLeft.seconds} label="Secs" />
        </div>
      </div>
    </div>
  )
}
