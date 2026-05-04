import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all wallets for the user
    const wallets = await prisma.wallet.findMany({
      where: { userId: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    return NextResponse.json({ wallets }, { status: 200 });

  } catch (error) {
    console.error('Wallet balance error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { walletId, amount, type = 'DEPOSIT' } = await request.json();

    if (!walletId || !amount) {
      return NextResponse.json(
        { message: 'Wallet ID and amount are required' },
        { status: 400 }
      );
    }

    // Get the wallet
    const wallet = await prisma.wallet.findUnique({
      where: {
        id: walletId,
        userId: session.user.id
      }
    });

    if (!wallet) {
      return NextResponse.json(
        { message: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Calculate new balance
    const currentBalance = parseFloat(wallet.balance);
    const changeAmount = parseFloat(amount);
    const newBalance = type === 'DEPOSIT' ? currentBalance + changeAmount : currentBalance - changeAmount;

    if (newBalance < 0) {
      return NextResponse.json(
        { message: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Update wallet balance and create transaction
    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance.toString() }
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          walletId,
          type,
          status: 'COMPLETED',
          amount: amount.toString(),
          symbol: wallet.symbol
        }
      })
    ]);

    return NextResponse.json(
      {
        wallet: updatedWallet,
        transaction
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Balance update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}