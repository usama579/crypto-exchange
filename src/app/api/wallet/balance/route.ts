import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { isProfileCompleted, PROFILE_INCOMPLETE_MESSAGE } from '@/lib/requireProfile';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Withdrawals and trade-driven balance changes require a completed profile.
    if (!(await isProfileCompleted(session.user.id))) {
      return NextResponse.json({ success: false, error: PROFILE_INCOMPLETE_MESSAGE }, { status: 403 });
    }

    const body = await request.json();
    const { walletId, amount, type } = body;

    if (!walletId || !amount || !type) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId: session.user.id }
    });

    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }

    const currentBalance = parseFloat(wallet.balance);
    const tradeAmount = parseFloat(amount);

    if (type === 'WITHDRAW' && currentBalance < tradeAmount) {
      return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
    }

    const newBalance = type === 'WITHDRAW'
      ? currentBalance - tradeAmount
      : currentBalance + tradeAmount;

    const updatedWallet = await prisma.wallet.update({
      where: { id: walletId },
      data: { balance: newBalance.toString() }
    });

    return NextResponse.json({ success: true, wallet: updatedWallet });

  } catch (error) {
    console.error('Error updating wallet balance:', error);
    return NextResponse.json({ success: false, error: 'Failed to update wallet balance' }, { status: 500 });
  }
}

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
