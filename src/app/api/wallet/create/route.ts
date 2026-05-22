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

    // Generate deposit address for the symbol
    const getDepositAddress = (symbol: string) => {
      const addresses: { [key: string]: string } = {
        'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Bitcoin network
        'ETH': '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97', // ERC20 network
        'BNB': '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97', // BEP20 network
        'USDT': '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97', // ERC20/BEP20 network
        'SOL': 'J6aeP19UrwvWFDGorWADYqnA2BNw97fp4DT3KCaGEksn', // Solana network
        'POL': '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97', // Polygon network
        'TON': 'UQCBIV4LfX01corjV1n3ubL2rwWKnUZxAR5cchsSvARhCUyq', // TON network
        'TRX': 'TYDyM9dgAdYXYGfBgezCzxHpLYaPdFYtxr' // TRC20 network
      };
      return addresses[symbol] || `fallback_address_${symbol}_${Date.now()}`;
    };

    // Create new wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId: session.user.id,
        symbol: symbol.toUpperCase(),
        name,
        address: getDepositAddress(symbol.toUpperCase()),
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