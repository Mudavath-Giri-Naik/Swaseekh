import type { Metadata } from 'next'
import { AppShell } from '@/components/app-shell'
import JsonLd from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Pricing — GATE CS Prep for ₹999/year',
  description:
    'Unlock all GATE CS PYQs, year-wise mock tests and step-by-step solutions for ₹999/year on Swaseekh. Free to start; upgrade to Pro for full access.',
  alternates: { canonical: '/pricing' },
}

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Swaseekh Pro — GATE CS Preparation (1 Year)',
  description:
    'Full access to all GATE CS previous year questions, mock tests and solutions for one year.',
  brand: { '@type': 'Brand', name: 'Swaseekh' },
  offers: {
    '@type': 'Offer',
    price: '999',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    url: 'https://swaseekh.in/pricing',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell>
      <JsonLd data={productSchema} />
      {children}
    </AppShell>
  )
}
