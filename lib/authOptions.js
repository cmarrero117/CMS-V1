import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connectDB from './db'
import User from './models/User'
import Tenant from './models/Tenant'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectDB()
        const user = await User.findOne({ email: credentials.email })
        if (!user) return null
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        // Look up the tenant slug so it can be stored in the session
        let siteSlug = null
        if (user.tenantId) {
          const tenant = await Tenant.findById(user.tenantId).lean()
          siteSlug = tenant?.slug || null
        }

        return {
          id:       user._id.toString(),
          email:    user.email,
          role:     user.role,
          tenantId: user.tenantId?.toString() || null,
          siteSlug,
        }
      },
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role     = user.role
        token.tenantId = user.tenantId
        token.siteSlug = user.siteSlug
      }
      return token
    },
    async session({ session, token }) {
      session.user.role     = token.role
      session.user.tenantId = token.tenantId
      session.user.siteSlug = token.siteSlug
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
