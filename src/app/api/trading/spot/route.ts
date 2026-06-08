import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TradingService } from '@/lib/trading';
import { rateLimit } from '@/lib/rate-limiter';
import { isProfileCompleted, PROFILE_INCOMPLETE_MESSAGE } from '@/lib/requireProfile';

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

    if (!(await isProfileCompleted(session.user.id))) {
      return NextResponse.json({ error: PROFILE_INCOMPLETE_MESSAGE }, { status: 403 });
    }

    const body = await request.json();
    const { symbol, side, amount, price } = body;

    if (!symbol || !side || !amount || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await TradingService.createSpotTrade({
      userId: session.user.id,
      symbol,
      side,
      amount,
      price
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      position: result.position
    });

  } catch (error) {
    console.error('Spot trading API error:', error);
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
      positions: result.tradingPositions?.filter(p => p.type === 'SPOT') || []
    });

  } catch (error) {
    console.error('Get spot positions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}