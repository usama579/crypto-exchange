import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TradingService, createFuturesTradeSchema } from '@/lib/trading';
import { rateLimit } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { symbol, side, margin, leverage } = body;

    const tradeData = {
      userId: session.user.id,
      symbol,
      side,
      margin,
      leverage: Number(leverage)
    };

    // Validate the data
    try {
      createFuturesTradeSchema.parse(tradeData);
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: 'Invalid trade parameters' },
        { status: 400 }
      );
    }

    const result = await TradingService.createFuturesTrade(tradeData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      position: result.position
    });

  } catch (error) {
    console.error('Futures trading API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await TradingService.getUserPositions(session.user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      positions: result.tradingPositions?.filter(p => p.type === 'FUTURES') || []
    });

  } catch (error) {
    console.error('Get futures positions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}