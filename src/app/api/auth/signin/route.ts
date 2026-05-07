import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = signinSchema.parse(body);

    // Find user in database
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Generate new verification token
      const verificationToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with new verification token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: verificationToken,
          emailVerificationTokenExpires: expiresAt,
        },
      });

      // Send verification email
      const emailSent = await sendVerificationEmail(user.email, verificationToken);

      return NextResponse.json(
        {
          error: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email before signing in. We have sent you a new verification email.',
          emailSent,
        },
        { status: 403 }
      );
    }

    // If we reach here, the user is verified and can sign in
    return NextResponse.json(
      {
        success: true,
        message: 'Credentials verified. Please use NextAuth signIn for session management.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signin API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}