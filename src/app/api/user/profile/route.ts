import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { nameSchema, emailSchema, validateInput, ValidationError } from '@/lib/validation';

const updateProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
}).strict();

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email } = validateInput(updateProfileSchema, body);

    // Check if email is being changed and if it's already taken by another user
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
          NOT: {
            id: session.user.id
          }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email address is already in use' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        firstName,
        lastName,
        email,
        // If email is changed, mark it as unverified
        ...(email !== session.user.email && { isEmailVerified: false })
      },
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

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isEmailVerified: true,
        referralCode: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Profile fetch error:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}