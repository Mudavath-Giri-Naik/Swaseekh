export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>

        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
          <p>We&apos;d love to hear from you. Whether you have a question about our plans, features, or anything else, our team is ready to help.</p>

          <div className="bg-gray-50 rounded-2xl p-8 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
              <a href="mailto:support@swaseekh.com" className="text-[#4A235A] underline">support@swaseekh.com</a>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Response Time</h3>
              <p>We typically respond within 24–48 hours on business days.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">For Payment Issues</h3>
              <p>Please include your registered email address, transaction ID, and a brief description of the issue.</p>
            </div>
          </div>

          <div className="pt-4 text-xs text-gray-400 space-x-4">
            <a href="/terms" className="hover:underline">Terms</a>
            <a href="/privacy-policy" className="hover:underline">Privacy</a>
            <a href="/refund-policy" className="hover:underline">Refund Policy</a>
          </div>
        </div>
      </div>
    </div>
  )
}
