import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Roughly cap a single base64 image at ~4MB of encoded text to avoid
// oversized DB rows. (4MB base64 ~= 3MB binary.)
const MAX_IMAGE_CHARS = 4 * 1024 * 1024;

function isValidImageDataUrl(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^data:image\/(png|jpe?g|webp);base64,/.test(value) &&
    value.length <= MAX_IMAGE_CHARS
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      mobileNumber: true,
      idCardFront: true,
      idCardBack: true,
      isProfileCompleted: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Don't ship the full base64 back to the client; just whether each part exists.
  return NextResponse.json({
    mobileNumber: user.mobileNumber,
    hasIdCardFront: !!user.idCardFront,
    hasIdCardBack: !!user.idCardBack,
    isProfileCompleted: user.isProfileCompleted,
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { mobileNumber, idCardFront, idCardBack } = body ?? {};

    // Validate mobile number: digits, optional leading +, 7–15 digits.
    const normalizedMobile = typeof mobileNumber === 'string' ? mobileNumber.trim() : '';
    if (!/^\+?\d{7,15}$/.test(normalizedMobile)) {
      return NextResponse.json(
        { error: 'Please enter a valid mobile number (7–15 digits).' },
        { status: 400 }
      );
    }

    if (!isValidImageDataUrl(idCardFront)) {
      return NextResponse.json(
        { error: 'ID card (front) is missing or not a valid image (max 4MB).' },
        { status: 400 }
      );
    }

    if (!isValidImageDataUrl(idCardBack)) {
      return NextResponse.json(
        { error: 'ID card (back) is missing or not a valid image (max 4MB).' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        mobileNumber: normalizedMobile,
        idCardFront,
        idCardBack,
        isProfileCompleted: true,
      },
      select: {
        id: true,
        mobileNumber: true,
        isProfileCompleted: true,
      },
    });

    return NextResponse.json({
      message: 'Profile completed successfully',
      user: updated,
    });
  } catch (error) {
    console.error('KYC submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
