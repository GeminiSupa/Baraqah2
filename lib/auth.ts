import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseAdmin } from './supabase'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Auth: Missing email or password')
          throw new Error('Email and password are required')
        }

        // Normalize email to lowercase for case-insensitive matching
        const normalizedEmail = credentials.email.toLowerCase().trim()
        
        console.log('Auth: Attempting login for:', normalizedEmail)
        
        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('id, email, password, email_verified, phone_verified, id_verified, profile_active, is_admin')
          .ilike('email', normalizedEmail)
          .single()

        if (error) {
          console.error('Auth: Database error:', error)
          if (error.code === 'PGRST116') {
            console.error('Auth: User not found:', normalizedEmail)
          }
          throw new Error('Invalid email or password')
        }

        if (!user) {
          console.error('Auth: User not found:', normalizedEmail)
          throw new Error('Invalid email or password')
        }

        if (!user.password) {
          console.error('Auth: User has no password set:', normalizedEmail)
          throw new Error('Invalid email or password')
        }

        console.log('Auth: User found, checking password...')
        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          console.error('Auth: Password mismatch for:', normalizedEmail)
          throw new Error('Invalid email or password')
        }

        console.log('Auth: Login successful for:', normalizedEmail, 'Admin:', user.is_admin)

        return {
          id: user.id,
          email: user.email,
          emailVerified: user.email_verified,
          phoneVerified: user.phone_verified,
          idVerified: user.id_verified,
          profileActive: user.profile_active,
          isAdmin: user.is_admin || false,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial login - set user data
      if (user) {
        token.id = user.id
        token.emailVerified = user.emailVerified
        token.phoneVerified = user.phoneVerified
        token.idVerified = user.idVerified
        token.profileActive = user.profileActive
        token.isAdmin = user.isAdmin
      }
      
      // Refresh user data from database on each request (to get latest verification status)
      if (token.id) {
        try {
          const { data: currentUser } = await supabaseAdmin
            .from('users')
            .select('email_verified, phone_verified, id_verified, profile_active, is_admin')
            .eq('id', token.id)
            .single()
          
          if (currentUser) {
            token.emailVerified = currentUser.email_verified
            token.phoneVerified = currentUser.phone_verified
            token.idVerified = currentUser.id_verified
            token.profileActive = currentUser.profile_active
            token.isAdmin = currentUser.is_admin || false
          }
        } catch (error) {
          console.error('Error refreshing user data in JWT:', error)
          // Continue with existing token data if refresh fails
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.emailVerified = token.emailVerified as boolean
        session.user.phoneVerified = token.phoneVerified as boolean
        session.user.idVerified = token.idVerified as boolean
        session.user.profileActive = token.profileActive as boolean
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

declare module 'next-auth' {
  interface User {
    id: string
    emailVerified: boolean
    phoneVerified: boolean
    idVerified: boolean
    profileActive: boolean
    isAdmin: boolean
  }
  interface Session {
    user: {
      id: string
      email: string
      emailVerified: boolean
      phoneVerified: boolean
      idVerified: boolean
      profileActive: boolean
      isAdmin: boolean
    }
  }
}