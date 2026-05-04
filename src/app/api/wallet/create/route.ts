import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { symbol, name } = await request.json();

    if (!symbol || !name) {
      return NextResponse.json(
        { message: 'Symbol and name are required' },
        { status: 400 }
      );
    }

    // Check if wallet already exists for this user and symbol
    const existingWallet = await prisma.wallet.findUnique({
      where: {
        userId_symbol: {
          userId: session.user.id,
          symbol: symbol.toUpperCase()
        }
      }
    });

    if (existingWallet) {
      return NextResponse.json(
        { wallet: existingWallet },
        { status: 200 }
      );
    }

    // Generate a mock deposit address (in production, use proper address generation)
    const generateMockAddress = (symbol: string) => {
      const addresses: { [key: string]: string } = {
        'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        'ETH': '0x742d35Cc6636Cc1C99C3C3C0C8d4e3d3e5d5a7e8',
        'BNB': 'bnb1grpf0955h0ykzuews8sqzkrsflf29z4xdz8y8v',
        'USDT': '0x742d35Cc6636Cc1C99C3C3C0C8d4e3d3e5d5a7e8'
      };
      return addresses[symbol] || `mock_address_${symbol}_${Date.now()}`;
    };

    // Create new wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId: session.user.id,
        symbol: symbol.toUpperCase(),
        name,
        address: generateMockAddress(symbol.toUpperCase()),
        balance: '0'
      }
    });

    return NextResponse.json(
      { wallet },
      { status: 201 }
    );

  } catch (error) {
    console.error('Wallet creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}