import { NextRequest, NextResponse } from 'next/server';
import { blockchainMonitor } from '@/lib/blockchain-monitor';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.ADMIN_SECRET || 'admin-secret';

    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    if (action === 'start') {
      await blockchainMonitor.startMonitoring();
      return NextResponse.json(
        { message: 'Blockchain monitoring started' },
        { status: 200 }
      );
    } else if (action === 'stop') {
      await blockchainMonitor.stopMonitoring();
      return NextResponse.json(
        { message: 'Blockchain monitoring stopped' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Monitor control error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}