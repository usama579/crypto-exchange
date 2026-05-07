import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ReferralService } from '@/lib/referral';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, referralCode } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const verificationToken = crypto.randomUUID();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user in database
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: normalizedEmail,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: verificationExpires,
      }
    });

    // Process referral and bonuses
    const referralResult = await ReferralService.processNewUserReferral(
      user.id,
      referralCode
    );

    // Generate referral code for new user
    const userReferralCode = await ReferralService.createOrGetReferralCode(
      user.id,
      normalizedEmail
    );

    // Send verification email
    const emailSent = await sendVerificationEmail(user.email, verificationToken);

    if (!emailSent) {
      // If email fails, still log the verification URL for development
      console.log(`Failed to send email to ${user.email}, verification token: ${verificationToken}`);
      console.log(`Verification URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`);
    } else {
      console.log(`Verification email sent successfully to ${user.email}`);
    }

    console.log('User created successfully:', {
      email: user.email,
      name: `${firstName} ${lastName}`,
      referralCode: userReferralCode,
      referralProcessed: referralResult.success,
      emailVerified: false
    });

    return NextResponse.json(
      {
        message: 'Account created successfully. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          referralCode: userReferralCode,
          isEmailVerified: false,
        },
        referral: {
          processed: referralResult.success,
          message: referralResult.message,
          bonus: 100
        },
        verification: {
          required: true,
          message: 'Please check your email for verification link'
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}