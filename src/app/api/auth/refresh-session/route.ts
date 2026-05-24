import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Session data refreshed',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`,
          isEmailVerified: user.isEmailVerified,
          referralCode: user.referralCode,
          createdAt: user.createdAt?.toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Refresh session error:', error);
    return NextResponse.json(
      { message: 'An error occurred while refreshing session' },
      { status: 500 }
    );
  }
}