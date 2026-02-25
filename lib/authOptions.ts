import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SignJWT, jwtVerify } from 'jose';

const SECRET = process.env.NEXTAUTH_SECRET || 'trading-copilot-secret-change-in-production';
const JOSE_SECRET = new TextEncoder().encode(SECRET);

// Simple email verification code store (in production, use Redis/DB)
const verificationCodes = new Map<string, { code: string; expires: number }>();

export function generateVerifyCode(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes.set(email.toLowerCase(), {
    code,
    expires: Date.now() + 10 * 60 * 1000, // 10 min
  });
  return code;
}

export function verifyCode(email: string, code: string): boolean {
  const entry = verificationCodes.get(email.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expires) {
    verificationCodes.delete(email.toLowerCase());
    return false;
  }
  if (entry.code !== code) return false;
  verificationCodes.delete(email.toLowerCase());
  return true;
}

export const authOptions: NextAuthOptions = {
  secret: SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // Email verification code login
    CredentialsProvider({
      id: 'email-code',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Verification Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) return null;
        const valid = verifyCode(credentials.email, credentials.code);
        if (!valid) return null;
        return {
          id: credentials.email.toLowerCase(),
          email: credentials.email.toLowerCase(),
          name: credentials.email.split('@')[0],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.plan = 'free'; // Default plan, updated on Stripe webhook
        token.provider = account?.provider || 'email';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).plan = token.plan || 'free';
        (session.user as any).provider = token.provider;
      }
      return session;
    },
  },
};
