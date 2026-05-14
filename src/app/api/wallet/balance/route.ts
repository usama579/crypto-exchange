import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const wallets = await prisma.wallet.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        symbol: true,
        name: true,
        address: true,
        balance: true
      }
    });

    const balances = wallets.reduce((acc, wallet) => {
      acc[wallet.symbol] = {
        balance: parseFloat(wallet.balance),
        name: wallet.name
      };
      return acc;
    }, {} as Record<string, { balance: number; name: string }>);

    return NextResponse.json({
      success: true,
      wallets,
      balances
    });

  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet balance' },
      { status: 500 }
    );
  }
}
