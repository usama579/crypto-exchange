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

    const positions = await prisma.copyTradingPosition.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['ACTIVE', 'PAUSED'] }
      },
      include: {
        proTrader: {
          select: {
            name: true,
            totalReturn: true,
            monthlyReturn: true
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    const transformedPositions = positions.map(position => {
      // Calculate simulated profit based on trader's performance
      const daysSinceStart = Math.floor((Date.now() - position.startedAt.getTime()) / (1000 * 60 * 60 * 24));
      const monthlyReturn = position.proTrader?.monthlyReturn ? parseFloat(position.proTrader.monthlyReturn) : 0;
      const dailyReturn = monthlyReturn / 30; // Approximate daily return
      const totalProfitPercent = (dailyReturn * daysSinceStart) / 100;
      const profit = parseFloat(position.copyAmount) * totalProfitPercent;

      return {
        id: position.id,
        traderId: position.traderId,
        traderName: position.traderName,
        amount: parseFloat(position.copyAmount),
        profit: profit,
        profitPercent: totalProfitPercent * 100,
        startDate: position.startedAt.toISOString().split('T')[0],
        status: position.status.toLowerCase()
      };
    });

    return NextResponse.json({
      success: true,
      positions: transformedPositions
    });

  } catch (error) {
    console.error('Error fetching copy positions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch copy positions' },
      { status: 500 }
    );
  }
}