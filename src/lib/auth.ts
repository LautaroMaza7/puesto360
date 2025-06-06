import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import Auth0Provider from "next-auth/providers/auth0"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: `https://${process.env.AUTH0_DOMAIN}`,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Aquí deberías validar las credenciales contra tu base de datos
        // Por ahora, usaremos credenciales hardcodeadas para el admin
        if (credentials.email === 'mazalautaro.dev@gmail.com' && credentials.password === 'admin123') {
          return {
            id: '1',
            email: credentials.email,
            name: 'Admin',
            role: 'admin'
          }
        }

        return null
      }
    })
  ],
  pages: {
    // signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && typeof token.role === 'string') {
        session.user.role = token.role
      }
      return session
    }
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
} 