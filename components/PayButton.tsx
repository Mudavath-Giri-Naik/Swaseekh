'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PayButtonProps {
  className?: string
  children?: React.ReactNode
  couponCode?: string
  finalAmount?: number
}

/**
 * PayButton component
 * 
 * Flow:
 * 1. Load Razorpay checkout script
 * 2. Call /api/create-order with optional coupon
 * 3. Open Razorpay popup (supports UPI, cards, netbanking, wallets)
 * 4. On success → POST to /api/verify-payment with signature
 * 5. On verification success → reload page to reflect Pro status
 */
export default function PayButton({ className, children, couponCode, finalAmount }: PayButtonProps) {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Dynamically load Razorpay checkout script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    // Redirect to login if not authenticated
    if (!session?.user) {
      router.push('/login')
      return
    }

    setLoading(true)

    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        alert('Failed to load payment gateway. Please try again.')
        setLoading(false)
        return
      }

      // 2. Create order on server (with optional coupon)
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponCode || null }),
      })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to create order')
        setLoading(false)
        return
      }

      // Handle 100% discount (0 amount) where Razorpay is bypassed
      if (data.isZeroAmount) {
        alert('🎉 Plan activated successfully! Welcome to Pro.')
        await update() // Force NextAuth to fetch fresh Pro status from DB
        window.location.reload()
        return
      }

      // 3. Open Razorpay checkout popup
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Swaseekh',
        description: 'Pro Plan — 30 Days Access',
        order_id: data.orderId,
        prefill: {
          name: session.user.name || '',
          email: session.user.email || '',
        },
        theme: {
          color: '#4A235A',
        },
        handler: async (response: any) => {
          // 4. Verify payment on server
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyData.success) {
              alert('🎉 Payment successful! Your plan has been upgraded to Pro.')
              await update() // Force NextAuth to fetch fresh Pro status from DB
              // Force full page reload to refresh session with updated plan
              window.location.reload()
            } else {
              alert('Payment verification failed. Please contact yourgirinaik@gmail.com')
            }
          } catch {
            alert('Payment verification error. Contact yourgirinaik@gmail.com')
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const displayAmount = finalAmount ? `₹${finalAmount}` : '₹999'

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={className || `w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 cursor-pointer
        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4A235A] hover:bg-[#5B2C6F] hover:shadow-lg active:scale-[0.98]'}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        children || `Upgrade to Pro — ${displayAmount}`
      )}
    </button>
  )
}
