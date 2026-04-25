export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: April 25, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Swaseekh ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Account Registration</h2>
            <p>You must sign in using a valid Google account. You are responsible for maintaining the confidentiality of your account. You agree to provide accurate information during registration.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Subscriptions & Payments</h2>
            <p>The Pro plan is available for ₹799 for 30 days of access. Payments are processed securely via Razorpay. Your subscription begins immediately upon successful payment and expires after 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Content Usage</h2>
            <p>All content on Swaseekh, including questions, explanations, and study materials, is for personal educational use only. You may not redistribute, copy, or resell any content from the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Limitation of Liability</h2>
            <p>Swaseekh provides educational content on an "as is" basis. We do not guarantee exam results or outcomes. Our liability is limited to the amount paid for your subscription.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms. You may cancel your account at any time by contacting support.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Contact</h2>
            <p>Questions about these terms? Contact us at <a href="mailto:yourgirinaik@gmail.com" className="text-[#4A235A] underline">yourgirinaik@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
