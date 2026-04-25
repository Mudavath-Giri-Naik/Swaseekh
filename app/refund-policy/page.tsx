export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Refund & Cancellation Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: April 25, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Refund Eligibility</h2>
            <p>If you are unsatisfied with your Pro plan purchase, you may request a full refund within <strong>7 days</strong> of payment. After 7 days, no refunds will be issued.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. How to Request a Refund</h2>
            <p>To request a refund, email us at <a href="mailto:support@swaseekh.com" className="text-[#4A235A] underline">support@swaseekh.com</a> with your registered email address and payment details. Refunds will be processed within 5–7 business days to the original payment method.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Cancellation</h2>
            <p>Your Pro plan subscription is valid for 30 days from the date of purchase. There is no auto-renewal — your access will simply expire after 30 days. No cancellation is needed.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Non-Refundable Cases</h2>
            <p>Refunds will not be issued for requests made after the 7-day window, change of mind after significant usage of Pro features, or violation of our Terms of Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Contact</h2>
            <p>For refund inquiries, reach out to <a href="mailto:support@swaseekh.com" className="text-[#4A235A] underline">support@swaseekh.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
