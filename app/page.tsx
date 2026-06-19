import Link from 'next/link'
import Navbar from '@/components/Navbar'
import GateCountdown from '@/components/GateCountdown'
import FeaturesParallax from '@/components/FeaturesParallax'
import { Inter } from 'next/font/google'
import { ChevronsRight, ArrowUpRight, Star } from 'lucide-react'
import { RainbowButton } from '@/components/ui/rainbow-button'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const PerformanceCard = () => (
  <div className="relative bg-white/85 backdrop-blur-[8px] rounded-[24px] p-5 border border-black/20 flex flex-col items-center w-[190px] h-[210px]">
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
  <div className="relative bg-white/75 backdrop-blur-[8px] rounded-[24px] p-5 border border-black/20 flex flex-col w-[190px] h-[210px]">
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
    <div className={`relative min-h-screen bg-[#FCFBF9] ${inter.className} flex flex-col overflow-clip`}>
      <Navbar />

      {/* Main Container */}
      <main className="relative flex-1 flex flex-col items-center justify-center w-full mx-auto px-4 pt-[100px] md:pt-[120px] pb-20">
        
        <GateCountdown />

        {/* Content Column (Restricted Width) */}
        <div className="relative z-20 flex flex-col items-center text-center max-w-[800px] w-full mx-auto mt-8 md:mt-12">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#e8e0d8] rounded-[20px] px-[16px] py-[6px] mb-[20px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#F26419"/>
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[13px] font-medium text-[#444]">Trusted by over 500+ students</span>
          </div>

          {/* Headline */}
          <h1 className="flex flex-col items-center text-[#1A1A2E] leading-[1.1] tracking-[-0.02em] mb-[16px] w-full text-center">
            <span className="font-normal text-[clamp(1.75rem,6vw,52px)] sm:whitespace-nowrap">
              Don't Study <span className="relative inline-block">
                More.
                <div className="absolute -top-4 -right-6 md:-top-6 md:-right-8 w-[28px] md:w-[38px] h-auto pointer-events-none animate-pulse duration-[3000ms]">
                  <img 
                    src="/078.svg" 
                    alt="Decorative lines" 
                    className="w-full h-full object-contain -rotate-45"
                  />
                </div>
              </span>
            </span>
            <span className="font-extrabold text-[clamp(1.75rem,6vw,52px)] mt-1 sm:whitespace-nowrap">Study What Matters.</span>
          </h1>

          {/* Subtext */}
          <p className="text-[#666666] text-[16px] max-w-[580px] leading-[1.6] mb-[28px] px-2">
            Built around years of previous-year questions and exam patterns, Swaseekh helps you identify high-impact concepts, eliminate wasted effort, and prepare with confidence.
          </p>

          {/* CTA with Flanking Plants */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mt-2">
            {/* Left Plant */}
            <div className="w-[32px] md:w-[42px] opacity-80 pointer-events-none animate-[float_6s_ease-in-out_infinite]">
              <img src="/plant-illustration.svg" alt="" className="w-full h-auto drop-shadow-sm -rotate-[100deg]" />
            </div>
            
            <RainbowButton asChild className="px-6 py-2.5 text-[15px] h-auto rounded-md">
              <Link href="/dashboard">
                Get Started for Free
              </Link>
            </RainbowButton>

            {/* Right Plant */}
            <div className="w-[32px] md:w-[42px] opacity-80 pointer-events-none animate-[float_8s_ease-in-out_infinite_reverse]">
              <img src="/plant-illustration.svg" alt="" className="w-full h-auto drop-shadow-sm rotate-[100deg] -scale-x-100" />
            </div>
          </div>

          {/* Review Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-[48px]">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-[#1A1A2E] tracking-tight">Clutch</span>
              <div className="flex items-center gap-0.5 text-[#F26419]">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 4 ? "currentColor" : i === 4 ? "url(#half-star)" : "none"} strokeWidth={i < 4 ? 0 : 2} />)}
              </div>
              <span className="text-[14px] font-medium text-[#666666]">4.5/5</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-[#D1D5DB]"></div>
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

      {/* Dashboard Preview Section */}
      <section className="relative w-full max-w-[1200px] mx-auto px-4 pb-12 md:pb-16 z-20 mt-4 md:mt-8">
        <div className="relative rounded-[24px] md:rounded-[32px] border-[8px] md:border-[12px] border-[#333333] shadow-2xl overflow-hidden bg-white">
          <img 
            src="/dashboard.png" 
            alt="Swaseekh Dashboard Preview" 
            className="w-full h-auto block"
          />
        </div>
      </section>

      {/* Features Parallax Section */}
      <FeaturesParallax />


      {/* Newsletter Section */}
      <section className="relative w-full max-w-[1200px] mx-auto px-4 pb-24 z-20">
        <div className="relative bg-[#FFF7F0] rounded-[40px] overflow-hidden py-16 md:py-24 px-4 md:px-12 flex flex-col items-center text-center">
          {/* Background Illustration */}
          <img 
            src="/free-time-bg.svg" 
            alt="Background Illustration" 
            className="absolute inset-0 w-full h-full object-cover opacity-5 pointer-events-none mix-blend-multiply"
          />

          {/* Floating Elements (CSS only to mimic) */}
          <div className="absolute top-12 left-12 hidden md:flex items-center gap-2 animate-[float_6s_ease-in-out_infinite]">
            <div className="bg-[#B9FF66] text-[#1A1A2E] text-xs font-bold px-3 py-1.5 rounded-full rotate-[-10deg] shadow-sm">Richards</div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#1A1A2E] rotate-[30deg] drop-shadow-sm"></div>
          </div>
          <div className="absolute bottom-16 right-24 hidden md:flex items-center gap-2 animate-[float_8s_ease-in-out_infinite_reverse]">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[#1A1A2E] rotate-[-20deg] drop-shadow-sm"></div>
            <div className="bg-[#9D71FD] text-white text-xs font-bold px-4 py-1.5 rounded-full rounded-tr-none rotate-[5deg] shadow-sm">You</div>
          </div>

          <div className="relative z-10 max-w-[700px]">
            <h2 className="text-[#1A1A2E] text-3xl md:text-[44px] font-extrabold leading-[1.1] mb-5 tracking-tight">
              Stay Ahead in Education with Swaseekh and Unlock Your Full Potential!
            </h2>
            <p className="text-[#666] text-sm md:text-base leading-[1.6] mb-10 max-w-[600px] mx-auto">
              Want to stay updated on the latest trends in online learning? Join the Swaseekh newsletter and receive expert insights, new course launches, and exclusive offers—all in one place!
            </p>

            <div className="relative flex items-center w-full max-w-[480px] mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-white rounded-full h-[56px] pl-6 pr-36 outline-none text-[#1A1A2E] shadow-sm border border-[#EBE5DE]"
              />
              <button className="group absolute right-1.5 top-1.5 bottom-1.5 w-[130px] bg-[#FFF5F0] border border-[#F26419]/30 text-[#1A1A2E] rounded-full flex items-center px-1.5 hover:bg-[#FFF0E5] transition-colors font-semibold text-sm overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#F26419] group-hover:bg-[#1A1A2E] text-white flex items-center justify-center transition-all duration-500 ease-in-out group-hover:translate-x-[86px] relative z-10 shrink-0">
                  <ChevronsRight size={18} strokeWidth={3} />
                </div>
                <span className="absolute left-[44px] transition-all duration-500 ease-in-out group-hover:-translate-x-[32px] whitespace-nowrap">
                  Subscribe
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full bg-[#17171F] text-white pt-20 pb-12 overflow-hidden mt-auto">
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-12 gap-y-10 gap-x-6 md:gap-8 mb-6 md:mb-8">
          {/* Col 1 */}
          <div className="col-span-2 md:col-span-4 flex flex-col">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center text-[#F26419]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="currentColor"/>
                  <path d="M12 7L7 12L12 17L17 12L12 7Z" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-[24px] tracking-tight">Swaseekh</span>
            </Link>
            <p className="text-[#A0A0A0] text-[15px] leading-[1.6] mb-8 max-w-[300px]">
              Helping students learn smarter through AI-powered insights, concept mastery, and previous-year question analysis.
            </p>
            <p className="text-[#A0A0A0] text-sm mt-auto hidden md:block">
              © Copyrights 2026 Swaseekh. All rights reserved.
            </p>
          </div>

          <div className="hidden md:block md:col-span-1"></div>

          {/* Col 2 */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-bold mb-6 text-[15px]">Useful Links</h4>
            <ul className="flex flex-col gap-4 text-[15px] text-[#A0A0A0]">
              <li><Link href="#" className="text-[#F26419] font-medium hover:underline">Home</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing Plan</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-bold mb-6 text-[15px]">Quick Links</h4>
            <ul className="flex flex-col gap-4 text-[15px] text-[#A0A0A0]">
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog & Articles</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">404</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="col-span-2 md:col-span-3">
            <h4 className="text-white font-bold mb-6 text-[15px]">Let's Connect</h4>
            <ul className="flex flex-col gap-4 text-[15px] text-[#A0A0A0]">
              <li>
                <Link href="#" className="flex items-center gap-3 hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center gap-3 hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> 
                  x.com
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center gap-3 hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center gap-3 hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  Facebook
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-2 block md:hidden mt-4">
            <p className="text-[#A0A0A0] text-sm text-center">
              © Copyrights 2026 Swaseekh. All rights reserved.
            </p>
          </div>
        </div>

        {/* Big Background Text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full overflow-hidden flex justify-center pointer-events-none select-none z-0">
          <span className="text-[13vw] md:text-[20vw] font-black text-white/[0.03] leading-[0.75] tracking-tighter whitespace-nowrap">
            SWASEEKH
          </span>
        </div>
      </footer>

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
