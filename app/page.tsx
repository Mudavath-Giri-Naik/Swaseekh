import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Outfit } from 'next/font/google'
import { ChevronRight, GraduationCap, Star } from 'lucide-react'
import Image from 'next/image'

const outfit = Outfit({ subsets: ['latin'], display: 'swap' })

const PerformanceCard = () => (
  <div className="bg-white rounded-[2rem] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center w-[240px]">
    <div className="w-full flex justify-between items-start mb-4">
      <span className="text-slate-500 font-medium text-sm">Performance</span>
      <div className="w-6 h-6 rounded-full border border-orange-200 flex items-center justify-center text-orange-500">
        <ChevronRight size={12} strokeWidth={3} className="-rotate-45" />
      </div>
    </div>
    
    <div className="relative w-32 h-32 mb-6 mt-2">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
        <circle cx="50" cy="50" r="40" stroke="#FF6000" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="50.24" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-800">80%</span>
        <span className="text-[10px] text-slate-400 font-medium">Performance</span>
      </div>
    </div>

    <p className="text-sm font-medium text-slate-600 text-center w-full border-t border-slate-100 pt-4">
      You did a great job!
    </p>
  </div>
)

const TimeSpentCard = () => (
  <div className="bg-white rounded-[2rem] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col w-[260px]">
    <div className="w-full flex justify-end mb-2">
      <div className="w-6 h-6 rounded-full border border-orange-200 flex items-center justify-center text-orange-500">
        <ChevronRight size={12} strokeWidth={3} className="-rotate-45" />
      </div>
    </div>
    
    <div className="flex flex-col mb-6">
      <span className="text-slate-500 font-medium text-sm mb-1">Time Spent</span>
      <span className="text-3xl font-bold text-slate-800">13.6 Hours</span>
      <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#FF6000]"></div>Study</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-slate-200"></div>Exams</div>
      </div>
    </div>

    <div className="flex items-end justify-between h-20 gap-1.5 mb-2 relative">
      <div className="absolute -top-6 left-[60%] -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-full whitespace-nowrap">
        12.5 H
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-slate-900"></div>
      </div>
      {[30, 45, 60, 40, 80, 50, 70].map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1">
          <div className="w-full bg-slate-100 rounded-t-sm relative h-full flex items-end">
            <div className={`w-full rounded-t-sm ${i === 4 ? 'bg-[#FF6000]' : 'bg-slate-800'}`} style={{ height: `${h}%` }}></div>
            {i === 4 && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FF6000]"></div>}
          </div>
        </div>
      ))}
    </div>
    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 uppercase">
      <span>J</span><span>F</span><span>M</span><span>A</span><span>M</span><span>J</span><span>J</span><span>A</span><span>S</span><span>O</span><span>N</span>
    </div>
  </div>
)

export default function HomePage() {
  return (
    <div className={`relative min-h-screen bg-[#FCFCFD] ${outfit.className}`}>
      {/* Background glow */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(255, 96, 0, 0.03) 0%, transparent 70%)'
        }}
      />
      
      <Navbar />

      <main className="relative z-10 pt-20 md:pt-32 pb-20 overflow-hidden flex flex-col items-center text-center px-4">
        {/* Floating cards (Desktop) */}
        <div className="absolute left-[calc(50%-550px)] top-40 hidden xl:block" style={{ transform: 'rotate(-12deg)' }}>
          <PerformanceCard />
        </div>
        <div className="absolute right-[calc(50%-550px)] top-40 hidden xl:block" style={{ transform: 'rotate(12deg)' }}>
          <TimeSpentCard />
        </div>

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 bg-white border border-slate-100 shadow-sm rounded-full px-4 py-1.5 mb-8">
          <div className="bg-orange-100 text-[#FF6000] p-1 rounded-full">
            <GraduationCap size={14} />
          </div>
          <span className="text-sm font-medium text-slate-600">Trusted by over 50,000+ students</span>
        </div>

        {/* Headline */}
        <h1 className="text-[2.5rem] md:text-[4.5rem] leading-[1.1] font-bold text-slate-900 max-w-4xl tracking-tight mb-6">
          Your Ultimate Platform for <br className="hidden md:block" />
          <span className="text-slate-900">Seamless Learning & Growth</span>
        </h1>

        {/* Subhead */}
        <p className="text-slate-500 text-base md:text-lg max-w-2xl leading-relaxed mb-10">
          Transform the way you prepare for GATE with our comprehensive Learning Management System. 
          Manage progress, track topics, and master concepts like never before.
        </p>

        {/* CTA */}
        <Link 
          href="/dashboard"
          className="group inline-flex items-center gap-3 bg-[#FF6000] hover:bg-[#e65600] text-white rounded-full pl-2 pr-6 py-2 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="bg-white text-[#FF6000] rounded-full p-2.5 transition-transform group-hover:scale-110">
            <ChevronRight size={18} strokeWidth={3} />
          </div>
          <span className="font-semibold text-lg">Get Started for Free</span>
        </Link>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 mt-12 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl text-slate-800 tracking-tight">Clutch</span>
            <div className="flex items-center gap-0.5 text-[#FFB800]">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} strokeWidth={i < 4 ? 0 : 2} />)}
            </div>
            <span className="text-sm font-medium text-slate-600">4.5/5</span>
          </div>
          <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
          <div className="flex items-center gap-2">
            <span className="font-black text-xl text-slate-800 flex items-center gap-1">
              <Star size={20} fill="#00B67A" stroke="#00B67A" />
              Trustpilot
            </span>
            <div className="flex items-center gap-0.5 text-[#00B67A]">
              {[...Array(5)].map((_, i) => <div key={i} className={`w-4 h-4 flex items-center justify-center ${i < 4 ? 'bg-[#00B67A]' : 'bg-[#00B67A]/20'}`}><Star size={10} fill="white" strokeWidth={0} /></div>)}
            </div>
            <span className="text-sm font-medium text-slate-600">4.5/5</span>
          </div>
        </div>

        {/* Mobile stacking for cards */}
        <div className="flex flex-col items-center gap-8 mt-20 xl:hidden">
          <PerformanceCard />
          <TimeSpentCard />
        </div>
      </main>
    </div>
  )
}
