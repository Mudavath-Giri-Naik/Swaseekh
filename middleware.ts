import { withAuth } from 'next-auth/middleware'

/**
 * Route protection:
 *  - The syllabus browse pages and the previous-year-question (PYQ) pages are
 *    public and crawlable, so search engines and first-time visitors can index
 *    the GATE CS syllabus, concept notes, and previous year questions:
 *      /gate, /gate/questions                       → browse hubs
 *      /gate/<subject>[/<topic>/<concept>]          → subject & concept notes
 *      /gate/questions/.../<questionId>             → individual PYQ pages
 *    (The content APIs these pages call are already public, so logged-out
 *     users get the full interactive experience too.)
 *  - Any other route matched below still requires authentication and bounces
 *    unauth users to sign-in with a callbackUrl.
 *
 * next-auth's `withAuth` reads `pages.signIn` from authOptions, so unauth
 * requests automatically redirect to /login?callbackUrl=<original-path>.
 */
export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname

      // Public browse hubs
      if (path === '/gate' || path === '/gate/questions') return true

      // Individual PYQ question pages:
      // /gate/questions/<subject>/<topic>/<concept>/<questionId>
      if (/^\/gate\/questions\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/.test(path)) return true

      // Subject / topic / concept notes (the /gate/[...slug] catch-all),
      // i.e. anything under /gate that is NOT part of /gate/questions.
      if (path.startsWith('/gate/') && !path.startsWith('/gate/questions')) {
        return true
      }

      // Anything else under /gate (e.g. the bare /gate/questions/<subject>
      // redirect stub) still requires a session.
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
