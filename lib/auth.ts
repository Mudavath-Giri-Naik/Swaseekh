import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB()
          await UserModel.findOneAndUpdate(
            { googleId: account.providerAccountId },
            {
              name: user.name,
              email: user.email,
              image: user.image,
              googleId: account.providerAccountId,
              provider: 'google',
              lastLoginAt: new Date(),
            },
            { upsert: true, new: true }
          )
          return true
        } catch (error) {
          console.error('[NextAuth] signIn error:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        // Attach MongoDB _id and plan info to session
        (session.user as any).id = token.dbUserId || token.sub
        ;(session.user as any).plan = token.plan || 'free'
        ;(session.user as any).subscriptionStatus = token.subscriptionStatus || 'inactive'
      }
      return session
    },
    async jwt({ token, account, trigger }) {
      if (account) {
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
      }

      // On sign-in or session update, fetch the real MongoDB user _id and plan
      if (account || trigger === 'update') {
        try {
          await connectDB()
          const googleId = token.providerAccountId || token.sub
          const dbUser = await UserModel.findOne({ googleId }).lean()
          if (dbUser) {
            token.dbUserId = (dbUser._id as any).toString()
            token.plan = dbUser.plan || 'free'
            token.subscriptionStatus = dbUser.subscriptionStatus || 'inactive'
          }
        } catch (err) {
          console.error('[NextAuth] jwt lookup error:', err)
        }
      }

      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
}
