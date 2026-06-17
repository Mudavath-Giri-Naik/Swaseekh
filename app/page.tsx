import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Inter } from 'next/font/google'
import { ChevronsRight, ArrowUpRight, Star } from 'lucide-react'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const PerformanceCard = () => (
  <div className="relative bg-white/85 backdrop-blur-[8px] rounded-[24px] p-5 border border-[#1A1A2E]/15 flex flex-col items-center w-[190px] h-[210px]">
    {/* Top Right Orange Button INSIDE the card */}
    <div className="absolute top-3 right-3 w-6 h-6 rounded-full border border-orange-100 bg-white flex items-center justify-center text-[#F26419] z-10">
      <ArrowUpRight size={14} strokeWidth={2.5} />
    </div>

    <div className="w-full flex justify-start mb-2 mt-1">
      <span className="text-[#888888] font-medium text-[11px]">Performance</span>
    </div>
    
    <div className="relative w-[95px] h-[95px] my-1">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="#F0F0F0" strokeWidth="8" fill="none" strokeDasharray="4 6" />
        <circle cx="50" cy="50" r="40" stroke="#F26419" strokeWidth="8" fill="none" strokeDasharray="4 6" strokeDashoffset="50.24" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[20px] font-bold text-[#1A1A2E] leading-tight">80%</span>
        <span className="text-[9px] text-[#666666] font-medium">Performance</span>
      </div>
    </div>

    <p className="text-[11px] font-medium text-[#555555] italic text-center w-full mt-auto">
      You did a great job!
    </p>
  </div>
)

const TimeSpentCard = () => (
  <div className="relative bg-white/75 backdrop-blur-[8px] rounded-[24px] p-5 border border-[#1A1A2E]/15 flex flex-col w-[190px] h-[210px]">
    {/* Top Right Orange Button INSIDE the card */}
    <div className="absolute top-3 right-3 w-6 h-6 rounded-full border border-orange-100 bg-white flex items-center justify-center text-[#F26419] z-10">
      <ArrowUpRight size={14} strokeWidth={2.5} />
    </div>
    
    <div className="flex flex-col mb-4 mt-1">
      <span className="text-[#888888] font-medium text-[11px] mb-0.5">Time Spent</span>
      <span className="text-[20px] font-bold text-[#1A1A2E] tracking-tight">13.6 Hours</span>
      <div className="flex items-center gap-3 mt-1 text-[10px] font-medium text-[#666666]">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#F26419]"></div>Study</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#E5E7EB]"></div>Exams</div>
      </div>
    </div>

    <div className="flex items-end justify-between h-[45px] gap-[3px] mt-auto relative">
      <div className="absolute -top-[24px] left-[60%] -translate-x-1/2 bg-[#1A1A2E] text-white text-[10px] font-bold py-[2px] px-2 rounded-full whitespace-nowrap z-10">
        12.5 H
        <div className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-[#1A1A2E]"></div>
      </div>
      {[30, 45, 60, 40, 80, 50, 70, 45, 60, 40, 30].map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-[2px] flex-1 h-full relative">
          <div className="w-full bg-[#F3F4F6] rounded-t-[2px] relative h-full flex items-end">
            <div className={`w-full rounded-t-[2px] ${i === 4 ? 'bg-[#F26419]' : 'bg-[#1A1A2E]'}`} style={{ height: `${h}%` }}></div>
            {i === 4 && <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[4px] h-[4px] rounded-full bg-[#F26419]"></div>}
          </div>
        </div>
      ))}
    </div>
    <div className="flex justify-between text-[6.5px] font-bold text-[#9CA3AF] mt-2 uppercase px-1">
      <span>J</span><span>F</span><span>M</span><span>A</span><span>M</span><span>J</span><span>J</span><span>A</span><span>S</span><span>O</span><span>N</span>
    </div>
  </div>
)

export default function HomePage() {
  return (
    <div className={`relative min-h-screen bg-[#FCFBF9] ${inter.className} overflow-hidden flex flex-col`}>
      <Navbar />

      {/* Main Container */}
      <main className="relative flex-1 flex flex-col items-center justify-center w-full mx-auto px-4 pt-[220px] pb-20">
        
        {/* Content Column (Restricted Width) */}
        <div className="relative z-20 flex flex-col items-center text-center max-w-[640px] w-full mx-auto">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#e8e0d8] rounded-[20px] px-[16px] py-[6px] mb-[20px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#F26419"/>
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[13px] font-medium text-[#444]">Trusted by over 50,000+ students</span>
          </div>

          {/* Headline */}
          <h1 className="flex flex-col items-center text-[#1A1A2E] leading-[1.1] tracking-[-0.02em] mb-[16px] whitespace-nowrap">
            <span className="font-normal text-[clamp(2.25rem,4.8vw,52px)]">Your Ultimate LMS for</span>
            <span className="font-extrabold text-[clamp(2.25rem,4.8vw,52px)]">Seamless Learning & Growth</span>
          </h1>

          {/* Subtext */}
          <p className="text-[#666666] text-[16px] max-w-[580px] leading-[1.6] mb-[28px]">
            Transform the way you teach and learn with our AI-driven Learning Management System. 
            Manage courses, track progress, and engage learners like never before.
          </p>

          {/* CTA */}
          <Link 
            href="/dashboard"
            className="group flex items-center gap-3 bg-[#F26419] hover:bg-[#d95815] text-white rounded-[50px] pl-2 pr-[32px] py-[16px] transition-transform hover:scale-105 shadow-[0_10px_25px_rgba(242,100,25,0.2)]"
          >
            <div className="bg-white text-[#F26419] rounded-full w-8 h-8 flex items-center justify-center">
              <ChevronsRight size={20} strokeWidth={3} />
            </div>
            <span className="text-[18px] font-medium">Get Started for Free</span>
          </Link>

          {/* Review Badges */}
          <div className="flex items-center justify-center gap-6 mt-[48px]">
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

        {/* Floating cards (Absolute to the sides) */}
        {/* We use a wider max-width container to push them to the very edges */}
        <div className="absolute inset-0 w-full max-w-[1440px] px-4 lg:px-12 mx-auto pointer-events-none hidden lg:block">
          <div className="absolute left-4 lg:left-12 top-[50%] -translate-y-[50%] pointer-events-auto" style={{ transform: 'translateY(-50%) rotate(-16deg)' }}>
            <PerformanceCard />
          </div>
          <div className="absolute right-4 lg:right-12 top-[50%] -translate-y-[50%] pointer-events-auto" style={{ transform: 'translateY(-50%) rotate(14deg)' }}>
            <TimeSpentCard />
          </div>
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
