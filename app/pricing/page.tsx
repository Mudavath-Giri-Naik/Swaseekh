'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Check, Tag, X, Loader2, Award, Zap, ShieldCheck, ArrowRight, FileText } from 'lucide-react'
import PayButton from '@/components/PayButton'
import Link from 'next/link'

const BASE_PRICE = 999

const proFeatures = [
  'Full access to all PYQs (1989–2025)',
  'Detailed explanations & solutions',
  'Topic-wise question filtering',
  'Progress tracking (Solved/Unsolved)',
  'All subjects unlocked',
  'Concept documents & notes',
  'Priority support',
  '1-year access',
]

interface CouponData {
  code: string
  discountType: string
  discountValue: number
  discountAmount: number
  finalPrice: number
  label: string
}

export default function PricingPage() {
  const { data: session } = useSession()
  const userPlan = (session?.user as any)?.plan || 'free'
  const isProActive = userPlan === 'pro'

  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [couponError, setCouponError] = useState('')
  const [validating, setValidating] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  useEffect(() => {
    if (isProActive) {
      fetch('/api/my-payment')
        .then(res => res.json())
        .then(data => {
          if (data.payment) setPaymentDetails(data.payment)
        })
        .catch(console.error)
    }
  }, [isProActive])

  const discount = appliedCoupon?.discountAmount || 0
  const finalPrice = appliedCoupon?.finalPrice ?? BASE_PRICE

  // Validate coupon via API
  const handleApplyCoupon = async () => {
    setCouponError('')
    const code = couponInput.trim()

    if (!code) {
      setCouponError('Please enter a coupon code')
      return
    }

    setValidating(true)

    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon')
        setAppliedCoupon(null)
      } else {
        setAppliedCoupon({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmount: data.discountAmount,
          finalPrice: data.finalPrice,
          label: data.label,
        })
        setCouponError('')
      }
    } catch {
      setCouponError('Failed to validate coupon. Try again.')
      setAppliedCoupon(null)
    } finally {
      setValidating(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError('')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#4A235A]/20">
      {/* Premium Gradient Background Banner */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-br from-[#2D1139] via-[#4A235A] to-[#6A3280] -z-10 overflow-hidden">
        {/* Subtle decorative patterns could go here */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 blend-overlay"></div>
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium uppercase tracking-widest mb-6 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-yellow-300" fill="currentColor" />
            Premium Access
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-sm">
            {isProActive ? "You're a Pro Member" : "Unlock Your Full Potential"}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto font-medium">
            {isProActive 
              ? "Enjoy unrestricted access to India's most comprehensive GATE platform." 
              : "Get full, uninterrupted access to all GATE preparation resources for 1 full year."}
          </p>
        </div>

        {isProActive ? (
          /* ─── PRO VIEW (Digital Receipt) ─── */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
              
              {/* Receipt Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20">
                  <Award className="w-32 h-32 text-white transform rotate-12" />
                </div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner border border-white/30">
                    <Check className="w-10 h-10 text-white drop-shadow-md" strokeWidth={3} />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Active Subscription</h2>
                  <p className="text-emerald-50 font-medium text-lg">Thank you for being a premium member!</p>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="p-8 md:p-12">
                {paymentDetails ? (
                  <div className="bg-slate-50 border border-gray-200 rounded-2xl p-8 relative">
                    {/* Dotted top edge to mimic receipt */}
                    <div className="absolute top-0 left-4 right-4 h-px border-t-[3px] border-dashed border-gray-200 -mt-px"></div>
                    
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 bg-[#4A235A]/10 rounded-lg text-[#4A235A]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Subscription Receipt</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-gray-100 pb-4">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Billed To</span>
                        <span className="text-base font-bold text-gray-900">{session?.user?.name || 'User'}</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-gray-100 pb-4">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Transaction ID</span>
                        <span className="text-sm font-mono font-medium bg-gray-100 px-2.5 py-1 rounded-md text-gray-700">{paymentDetails.razorpayPaymentId}</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-gray-100 pb-4">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {paymentDetails.status}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-gray-100 pb-4">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Valid Until</span>
                        <span className="text-base font-bold text-[#4A235A]">
                          {new Date((session?.user as any)?.subscriptionExpiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pt-2">
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Total Paid</span>
                        <span className="text-3xl font-black text-gray-900 tracking-tight">₹{paymentDetails.finalAmount}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="w-8 h-8 text-[#4A235A] animate-spin" />
                  </div>
                )}

                <div className="mt-10">
                  <Link
                    href="/gate"
                    className="flex items-center justify-center gap-2 w-full py-4 px-8 rounded-xl font-bold text-lg bg-[#4A235A] text-white hover:bg-[#3d1d4a] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Start Practicing <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── CHECKOUT VIEW (Non-Pro) ─── */
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start max-w-5xl mx-auto">
            
            {/* Left: Features / Sales Pitch */}
            <div className="lg:col-span-2 text-white pt-2 lg:pt-8">
              <h2 className="text-2xl font-bold mb-6 drop-shadow-sm">Everything you need to crack GATE.</h2>
              <ul className="space-y-5">
                {proFeatures.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white/90">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/10 backdrop-blur-sm">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                    <span className="font-medium text-lg drop-shadow-sm leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-12 p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hidden lg:block">
                <p className="text-white/90 italic font-medium leading-relaxed">
                  "Swaseekh saved me hundreds of hours compiling previous year questions and answers. Highly recommended for serious aspirants."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-300 to-purple-400"></div>
                  <div>
                    <div className="font-bold">Rahul T.</div>
                    <div className="text-xs text-white/70">GATE CS Aspirant</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Pricing Card */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-[2rem] shadow-2xl shadow-[#4A235A]/20 p-8 md:p-10 border border-gray-100 relative overflow-hidden">
                
                {/* Decorative blob */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#4A235A]/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Pro Membership</h2>
                    <p className="text-gray-500 font-medium">Billed once for the entire year</p>
                  </div>
                  <span className="bg-[#4A235A]/10 text-[#4A235A] text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>

                {/* Price Display */}
                <div className="mb-10 bg-slate-50 rounded-2xl p-6 border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      {discount > 0 ? (
                        <>
                          <span className="text-5xl font-black text-gray-900 tracking-tighter">₹{finalPrice}</span>
                          <span className="text-xl text-gray-400 line-through font-semibold">₹{BASE_PRICE}</span>
                        </>
                      ) : (
                        <span className="text-5xl font-black text-gray-900 tracking-tighter">₹{BASE_PRICE}</span>
                      )}
                      <span className="text-gray-500 font-semibold text-lg">/ year</span>
                    </div>
                    {appliedCoupon && (
                      <p className="text-emerald-600 text-sm mt-2 font-bold flex items-center gap-1.5">
                        <Tag className="w-4 h-4" /> You save ₹{appliedCoupon.discountAmount} with {appliedCoupon.code}
                      </p>
                    )}
                  </div>
                  
                  <div className="hidden sm:block h-12 w-px bg-gray-200"></div>
                  
                  <div className="text-center sm:text-right w-full sm:w-auto">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-2xl font-bold text-[#4A235A]">₹{finalPrice}</p>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="mb-8">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 shadow-sm">
                      <div className="flex items-center gap-3 text-sm text-emerald-800">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Tag className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="font-bold text-base block">{appliedCoupon.code}</span>
                          <span className="text-emerald-600/80 font-medium">{appliedCoupon.label}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-emerald-600 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                        title="Remove coupon"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label htmlFor="coupon" className="block text-sm font-semibold text-gray-700">
                        Have a coupon code?
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <input
                            id="coupon"
                            type="text"
                            value={couponInput}
                            onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                            placeholder="Enter code"
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base font-medium
                                       focus:outline-none focus:border-[#4A235A] focus:ring-2 focus:ring-[#4A235A]/20 transition-all uppercase placeholder:normal-case"
                          />
                        </div>
                        <button
                          onClick={handleApplyCoupon}
                          disabled={validating || !couponInput.trim()}
                          className="px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-base font-bold
                                     transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                                     flex items-center justify-center gap-2 shadow-md hover:shadow-lg sm:w-auto w-full"
                        >
                          {validating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-red-500 text-sm font-medium flex items-center gap-1.5 mt-2">
                          <X className="w-4 h-4" /> {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Checkout Button */}
                <div className="pt-2">
                  <PayButton couponCode={appliedCoupon?.code} finalAmount={finalPrice}>
                    Complete Payment • ₹{finalPrice}
                  </PayButton>
                  <p className="text-center text-xs text-gray-400 mt-4 font-medium flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Secure 256-bit SSL encrypted payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 md:mt-24 pb-8 flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-500">
          <Link href="/terms" className="hover:text-[#4A235A] hover:underline transition-colors">Terms of Service</Link>
          <Link href="/privacy-policy" className="hover:text-[#4A235A] hover:underline transition-colors">Privacy Policy</Link>
          <Link href="/refund-policy" className="hover:text-[#4A235A] hover:underline transition-colors">Refund Policy</Link>
          <Link href="/contact" className="hover:text-[#4A235A] hover:underline transition-colors">Contact Support</Link>
        </div>
      </div>
    </div>
  )
}
