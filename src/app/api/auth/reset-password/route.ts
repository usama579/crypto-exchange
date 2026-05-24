import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const user = await prisma.user.findUnique({
      where: {
        passwordResetToken: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (!user.passwordResetTokenExpires || user.passwordResetTokenExpires < new Date()) {
      return NextResponse.json(
        { message: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpires: null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
      select: {
        id: true,
        passwordResetTokenExpires: true
      },
    });

    if (!user) {
      return NextResponse.json(
        { valid: false, message: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (!user.passwordResetTokenExpires || user.passwordResetTokenExpires < new Date()) {
      return NextResponse.json(
        { valid: false, message: 'Reset token has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { valid: true, message: 'Token is valid' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'An error occurred while validating the token' },
      { status: 500 }
    );
  }
}