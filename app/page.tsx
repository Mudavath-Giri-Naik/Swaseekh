import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Inter } from 'next/font/google'
import { ChevronsRight, ArrowUpRight, Star } from 'lucide-react'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const PerformanceCard = () => (
  <div className="bg-white rounded-[24px] p-5 shadow-[0_15px_40px_rgb(0,0,0,0.08)] flex flex-col items-center w-[180px] h-[220px]">
    <div className="w-full flex justify-between items-start mb-2">
      <span className="text-[#666666] font-medium text-[13px]">Performance</span>
      <div className="w-6 h-6 rounded-full border border-orange-100 flex items-center justify-center text-[#F26419]">
        <ArrowUpRight size={14} strokeWidth={2.5} />
      </div>
    </div>
    
    <div className="relative w-[100px] h-[100px] my-3">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="#F0F0F0" strokeWidth="8" fill="none" />
        <circle cx="50" cy="50" r="40" stroke="#F26419" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="50.24" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-bold text-[#1A1A2E] leading-tight">80%</span>
        <span className="text-[9px] text-[#666666] font-medium">Performance</span>
      </div>
    </div>

    <p className="text-[12px] font-medium text-[#666666] text-center w-full mt-auto">
      You did a great job!
    </p>
  </div>
)

const TimeSpentCard = () => (
  <div className="bg-white rounded-[24px] p-5 shadow-[0_15px_40px_rgb(0,0,0,0.08)] flex flex-col w-[220px] h-[220px]">
    <div className="w-full flex justify-end mb-1">
      <div className="w-6 h-6 rounded-full border border-orange-100 flex items-center justify-center text-[#F26419]">
        <ArrowUpRight size={14} strokeWidth={2.5} />
      </div>
    </div>
    
    <div className="flex flex-col mb-4">
      <span className="text-[#666666] font-medium text-[13px] mb-0.5">Time Spent</span>
      <span className="text-[24px] font-bold text-[#1A1A2E] tracking-tight">13.6 Hours</span>
      <div className="flex items-center gap-3 mt-1.5 text-[11px] font-medium text-[#666666]">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#F26419]"></div>Study</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#E5E7EB]"></div>Exams</div>
      </div>
    </div>

    <div className="flex items-end justify-between h-[50px] gap-1.5 mt-auto relative">
      <div className="absolute -top-[28px] left-[60%] -translate-x-1/2 bg-[#1A1A2E] text-white text-[10px] font-bold py-1 px-2.5 rounded-full whitespace-nowrap z-10">
        12.5 H
        <div className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-[#1A1A2E]"></div>
      </div>
      {[30, 45, 60, 40, 80, 50, 70, 45, 60, 40, 30].map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full relative">
          <div className="w-full bg-[#F3F4F6] rounded-t-[2px] relative h-full flex items-end">
            <div className={`w-full rounded-t-[2px] ${i === 4 ? 'bg-[#F26419]' : 'bg-[#1A1A2E]'}`} style={{ height: `${h}%` }}></div>
            {i === 4 && <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#F26419]"></div>}
          </div>
        </div>
      ))}
    </div>
    <div className="flex justify-between text-[8px] font-bold text-[#9CA3AF] mt-1.5 uppercase">
      <span>J</span><span>F</span><span>M</span><span>A</span><span>M</span><span>J</span><span>J</span><span>A</span><span>S</span><span>O</span><span>N</span>
    </div>
  </div>
)

export default function HomePage() {
  return (
    <div className={`relative min-h-screen bg-[#F7F3EE] ${inter.className} overflow-hidden flex flex-col`}>
      <Navbar />

      {/* Main Container */}
      <main className="relative flex-1 flex flex-col items-center justify-center w-full max-w-[1100px] mx-auto px-4 pt-32 pb-20">
        
        {/* Floating cards (Absolute to the sides) */}
        <div className="absolute left-4 xl:-left-12 top-1/2 -translate-y-[60%] hidden lg:block z-10" style={{ transform: 'translateY(-60%) rotate(-9deg)' }}>
          <PerformanceCard />
        </div>
        <div className="absolute right-4 xl:-right-12 top-1/2 -translate-y-[60%] hidden lg:block z-10" style={{ transform: 'translateY(-60%) rotate(9deg)' }}>
          <TimeSpentCard />
        </div>

        {/* Content Column */}
        <div className="relative z-20 flex flex-col items-center text-center">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/60 border border-[#EBE5DE] rounded-full px-4 py-1.5 mb-8">
            <span className="text-lg">🏅</span>
            <span className="text-[13px] font-medium text-[#666666]">Trusted by over 50,000+ students</span>
          </div>

          {/* Headline */}
          <h1 className="flex flex-col items-center text-[#1A1A2E] leading-[1.1] tracking-[-0.02em] mb-6 whitespace-nowrap">
            <span className="font-normal text-[clamp(2.5rem,5vw,56px)]">Your Ultimate LMS for</span>
            <span className="font-extrabold text-[clamp(2.5rem,5vw,56px)]">Seamless Learning & Growth</span>
          </h1>

          {/* Subtext */}
          <p className="text-[#666666] text-[16px] max-w-[580px] leading-[1.6] mb-10">
            Transform the way you teach and learn with our AI-driven Learning Management System. 
            Manage courses, track progress, and engage learners like never before.
          </p>

          {/* CTA */}
          <Link 
            href="/dashboard"
            className="group flex items-center gap-3 bg-[#F26419] hover:bg-[#d95815] text-white rounded-full pl-2 pr-8 py-2.5 transition-transform hover:scale-105 shadow-[0_10px_25px_rgba(242,100,25,0.2)]"
          >
            <div className="bg-white text-[#F26419] rounded-full p-2.5 flex items-center justify-center">
              <ChevronsRight size={20} strokeWidth={3} />
            </div>
            <span className="text-[18px] font-semibold">Get Started for Free</span>
          </Link>

          {/* Review Badges */}
          <div className="flex items-center justify-center gap-6 mt-14">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-[#1A1A2E] tracking-tight">Clutch</span>
              <div className="flex items-center gap-0.5 text-[#F26419]">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 4 ? "currentColor" : i === 4 ? "url(#half-star)" : "none"} strokeWidth={i < 4 ? 0 : 2} />)}
              </div>
              <span className="text-[14px] font-medium text-[#666666]">4.5/5</span>
            </div>
            <div className="w-px h-5 bg-[#D1D5DB]"></div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-[#1A1A2E] flex items-center gap-1">
                <Star size={20} fill="#00B67A" stroke="#00B67A" />
                Trustpilot
              </span>
              <div className="flex items-center gap-0.5 text-[#00B67A]">
                {[...Array(5)].map((_, i) => <div key={i} className={`w-[18px] h-[18px] flex items-center justify-center ${i < 4 ? 'bg-[#00B67A]' : 'bg-[#00B67A]/30'}`}><Star size={10} fill="white" strokeWidth={0} /></div>)}
              </div>
              <span className="text-[14px] font-medium text-[#666666]">4.5/5</span>
            </div>
          </div>

        </div>

        {/* Mobile stacking for cards */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mt-16 lg:hidden relative z-20">
          <PerformanceCard />
          <TimeSpentCard />
        </div>
      </main>

      {/* SVG Definitions for half star */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="half-star" x1="0" x2="100%" y1="0" y2="0">
            <stop offset="50%" stopColor="#F26419" />
            <stop offset="50%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
