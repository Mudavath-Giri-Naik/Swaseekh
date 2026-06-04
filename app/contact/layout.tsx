import { AppShell } from '@/components/app-shell'

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
