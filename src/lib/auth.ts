import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase()
            }
          });

          if (!user) {
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            return null;
          }

          // Check if email is verified
          if (!user.isEmailVerified) {
            // Throw a specific error that NextAuth can handle
            throw new Error('EMAIL_NOT_VERIFIED');
          }

          // Return user data for session
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            isEmailVerified: user.isEmailVerified,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          // Re-throw the error so NextAuth can handle it
          if (error instanceof Error) {
            throw error;
          }
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days default
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isEmailVerified = user.isEmailVerified;
      }

      // Refresh user data on session update trigger
      if (trigger === 'update' && token.email) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              isEmailVerified: true,
              referralCode: true,
              createdAt: true
            }
          });

          if (freshUser) {
            token.id = freshUser.id;
            token.firstName = freshUser.firstName;
            token.lastName = freshUser.lastName;
            token.isEmailVerified = freshUser.isEmailVerified;
            token.name = `${freshUser.firstName} ${freshUser.lastName}`;
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.isEmailVerified = token.isEmailVerified as boolean;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
};