import { withAuth } from 'next-auth/middleware'

/**
 * Route protection:
 *  - Top-level browse pages (/gate, /gate/questions) are public — anyone can
 *    see the syllabus list and the PYQ list without signing in.
 *  - Anything deeper (a specific subject, topic, concept, or question) requires
 *    authentication and bounces unauth users to /login with a callbackUrl.
 *
 * next-auth's `withAuth` reads `pages.signIn` from authOptions, so unauth
 * requests automatically redirect to /login?callbackUrl=<original-path>.
 */
export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname

      // Publicly browsable top-level pages
      const publicPaths = new Set<string>(['/gate', '/gate/questions'])
      if (publicPaths.has(path)) return true

      // Everything else matched below needs a session
      return !!token
    },
  },
})

export const config = {
  // Match all paths under /gate. The matcher must be a literal string array
  // (Next.js parses these at build time), so the public-path check above
  // handles the allow-list at runtime.
  matcher: ['/gate/:path*'],
}
