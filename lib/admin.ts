/**
 * Admin allow-list helper.
 *
 * Admin access is granted by email match against the `ADMIN_EMAILS`
 * environment variable (comma-separated). This keeps things schema-free
 * — no new field on the User collection, no migration.
 *
 * Example:
 *   ADMIN_EMAILS=mudavathgirinaik444@gmail.com,co-founder@example.com
 */

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? ''
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.trim().toLowerCase())
}
