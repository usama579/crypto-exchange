import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TradingService } from '@/lib/trading';
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
    const { positionId, type } = body;

    if (!positionId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let result;
    if (type === 'copy') {
      result = await TradingService.stopCopyTrading(session.user.id, positionId);
    } else {
      result = await TradingService.closePosition(session.user.id, positionId);
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const response: any = {
      success: true,
      message: type === 'copy' ? 'Copy trading stopped' : 'Position closed'
    };

    if ('pnl' in result) {
      response.pnl = result.pnl;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Close position API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}