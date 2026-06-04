'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Check, Tag, X, Loader2 } from 'lucide-react'
import PayButton from '@/components/PayButton'

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
          if (data.payment) {
            setPaymentDetails({ ...data.payment, subscriptionExpiresAt: data.subscriptionExpiresAt })
          }
        })
        .catch(console.error)
    }
  }, [isProActive])

  const discount = appliedCoupon?.discountAmount || 0
  const finalPrice = appliedCoupon?.finalPrice ?? BASE_PRICE

  // Validate coupon via API (reads from MongoDB)
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
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto py-8 sm:py-12 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Upgrade to Pro</h1>
          <p className="text-muted-foreground text-sm">
            Get full access to all GATE preparation resources for 1 full year.
          </p>
        </div>

        {/* Plan Card */}
        {isProActive ? (
          <div className="border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/40 rounded-2xl p-6 sm:p-8 text-center max-w-md mx-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Check className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-300" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-1.5 sm:mb-2">You&apos;re a Pro!</h2>
            <p className="text-sm sm:text-base text-emerald-700 dark:text-emerald-300/80 mb-4 sm:mb-6">
              Congratulations, you have full access to all GATE preparation resources.
            </p>

            {paymentDetails && (
              <div className="bg-card border dark:border-emerald-500/20 rounded-xl p-4 sm:p-6 text-left mb-4 sm:mb-6 shadow-sm">
                <h3 className="font-semibold text-foreground border-b pb-2 sm:pb-3 mb-2 sm:mb-3 text-sm sm:text-base">Subscription Receipt</h3>
                <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium text-foreground">{session?.user?.name || 'User'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment ID</span>
                    <span className="font-medium text-foreground font-mono text-xs mt-0.5">{paymentDetails.razorpayPaymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wide text-xs mt-0.5">{paymentDetails.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-bold text-foreground">₹{paymentDetails.finalAmount}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-muted-foreground">Valid Until</span>
                    <span className="font-medium text-[#4A235A]">
                      {new Date(paymentDetails.subscriptionExpiresAt || (session?.user as any)?.subscriptionExpiresAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <a
              href="/gate"
              className="inline-block w-full py-3 px-6 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors"
            >
              Go to Questions
            </a>
          </div>
        ) : (
          <div className="border-2 border-[#4A235A] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#4A235A] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
              PRO
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                {discount > 0 ? (
                  <>
                    <span className="text-4xl font-bold text-foreground">₹{finalPrice}</span>
                    <span className="text-lg text-muted-foreground/70 line-through">₹{BASE_PRICE}</span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-foreground">₹{BASE_PRICE}</span>
                )}
                <span className="text-muted-foreground/70 text-sm">/year</span>
              </div>
              {appliedCoupon && (
                <p className="text-emerald-600 dark:text-emerald-300 text-sm mt-1 font-medium">
                  You save ₹{appliedCoupon.discountAmount} with code {appliedCoupon.code}
                </p>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <Check className="w-4 h-4 text-[#4A235A] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Coupon Section */}
            <div className="mb-6">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium">{appliedCoupon.code}</span>
                    <span className="text-emerald-600 dark:text-emerald-300">— {appliedCoupon.label}</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-emerald-600 dark:text-emerald-300 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value); setCouponError('') }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border border rounded-lg text-sm
                                 focus:outline-none focus:border-[#4A235A] focus:ring-1 focus:ring-[#4A235A]/20"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={validating}
                      className="px-4 py-2 bg-muted hover:bg-accent rounded-lg text-sm font-medium
                                 text-foreground/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                                 flex items-center gap-1.5"
                    >
                      {validating && <Loader2 className="w-3 h-3 animate-spin" />}
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-500 text-xs mt-1.5">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Price Summary */}
            {discount > 0 && (
              <div className="mb-6 border-t border-border/60 pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Original price</span>
                  <span>₹{BASE_PRICE}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-300">
                  <span>Discount ({appliedCoupon?.label})</span>
                  <span>-₹{discount}</span>
                </div>
                <div className="flex justify-between font-semibold text-foreground pt-1.5 border-t border-border/60">
                  <span>Total payable</span>
                  <span>₹{finalPrice}</span>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <PayButton couponCode={appliedCoupon?.code} finalAmount={finalPrice}>
              Pay ₹{finalPrice}
            </PayButton>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground/70 space-x-4">
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/privacy-policy" className="hover:underline">Privacy</a>
          <a href="/refund-policy" className="hover:underline">Refund Policy</a>
          <a href="/contact" className="hover:underline">Contact</a>
        </div>
      </div>
    </div>
  )
}
