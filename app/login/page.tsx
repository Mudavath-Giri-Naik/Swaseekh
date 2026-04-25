'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // If already authenticated, redirect to /gate
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/gate')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#4A235A] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black text-white text-2xl font-bold mb-4">
            S
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome to Swaseekh
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Sign in to access your exam preparation dashboard
          </p>
        </div>

        {/* Google Sign-in Button */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/gate' })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 
                     border-2 border-gray-200 rounded-xl bg-white 
                     hover:border-gray-300 hover:shadow-md 
                     transition-all duration-200 cursor-pointer group"
        >
          {/* Google Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
            Continue with Google
          </span>
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
