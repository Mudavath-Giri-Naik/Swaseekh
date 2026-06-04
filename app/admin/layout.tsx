import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'
import { AppShell } from '@/components/app-shell'

/**
 * Admin layout — gates the entire /admin tree behind an email-allowlist
 * check, then renders the same icon-collapsible sidebar shell used on
 * /dashboard and /gate. Non-admins (including signed-out visitors) get
 * bounced.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect('/login')
  }
  if (!isAdminEmail(session.user.email)) {
    redirect('/dashboard')
  }
  return <AppShell>{children}</AppShell>
}
