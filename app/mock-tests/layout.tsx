import { AppShell } from '@/components/app-shell'

export default function MockTestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
