import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filterBy = searchParams.get('filterBy') || 'all';

    let traders = await prisma.proTrader.findMany({
      where: {
        isActive: true,
        OR: search ? [
          { name: { contains: search } },
          { description: { contains: search } }
        ] : undefined
      },
      include: {
        trades: {
          where: { status: 'CLOSED' },
          orderBy: { closedAt: 'desc' },
          take: 5
        },
        _count: {
          select: { copyPositions: true }
        }
      }
    });

    // Sort based on filter
    if (filterBy === 'performance') {
      traders.sort((a, b) => parseFloat(b.totalReturn) - parseFloat(a.totalReturn));
    } else if (filterBy === 'followers') {
      traders.sort((a, b) => b.followers - a.followers);
    }

    // Transform data for frontend
    const transformedTraders = traders.map(trader => ({
      id: trader.id,
      name: trader.name,
      avatar: trader.avatar,
      verified: trader.verified,
      followers: trader.followers,
      totalReturn: parseFloat(trader.totalReturn),
      monthlyReturn: parseFloat(trader.monthlyReturn),
      winRate: parseFloat(trader.winRate),
      tradingPairs: JSON.parse(trader.tradingPairs),
      riskLevel: trader.riskLevel,
      minCopy: parseFloat(trader.minCopyAmount),
      description: trader.description,
      joinedDate: trader.joinedDate.toISOString().split('T')[0],
      recentTrades: trader.trades.map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        side: trade.side.toLowerCase(),
        amount: parseFloat(trade.amount),
        price: parseFloat(trade.entryPrice),
        profit: parseFloat(trade.profit),
        date: trade.closedAt?.toISOString().split('T')[0] || trade.openedAt.toISOString().split('T')[0]
      }))
    }));

    return NextResponse.json({
      success: true,
      traders: transformedTraders
    });

  } catch (error) {
    console.error('Error fetching pro traders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pro traders' },
      { status: 500 }
    );
  }
}