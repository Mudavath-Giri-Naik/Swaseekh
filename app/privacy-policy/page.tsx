import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Swaseekh collects, uses and protects your data while you prepare for GATE CS.',
  alternates: { canonical: '/privacy-policy' },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: April 25, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>When you sign in with Google, we collect your name, email address, and profile picture. We also collect payment information when you purchase a subscription, which is processed securely by Razorpay.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide and improve our services, manage your account and subscription, send important service-related communications, and track your learning progress within the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Data Storage</h2>
            <p>Your data is stored securely on MongoDB Atlas cloud servers. We do not sell, trade, or share your personal information with third parties, except as required to process payments through Razorpay.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Cookies</h2>
            <p>We use essential cookies to manage your authentication session. No third-party tracking cookies are used.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Your Rights</h2>
            <p>You may request deletion of your account and associated data at any time by contacting us at yourgirinaik@gmail.com.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Contact</h2>
            <p>For privacy-related inquiries, contact us at <a href="mailto:yourgirinaik@gmail.com" className="text-[#4A235A] underline">yourgirinaik@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
