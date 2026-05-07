import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const createSpotTradeSchema = z.object({
  userId: z.string(),
  symbol: z.string(),
  side: z.enum(['BUY', 'SELL']),
  amount: z.string().refine(val => parseFloat(val) > 0, "Amount must be positive"),
  price: z.string().refine(val => parseFloat(val) > 0, "Price must be positive"),
});

export const createFuturesTradeSchema = z.object({
  userId: z.string(),
  symbol: z.string(),
  side: z.enum(['LONG', 'SHORT']),
  margin: z.string().refine(val => parseFloat(val) >= 1, "Minimum margin is $1"),
  leverage: z.number().min(1).max(100),
});

export const createCopyTradeSchema = z.object({
  userId: z.string(),
  traderId: z.string(),
  traderName: z.string(),
  copyAmount: z.string().refine(val => parseFloat(val) >= 50, "Minimum copy amount is $50"),
});

export class TradingService {
  static async createSpotTrade(data: z.infer<typeof createSpotTradeSchema>) {
    const validated = createSpotTradeSchema.parse(data);

    try {
      const position = await prisma.tradingPosition.create({
        data: {
          userId: validated.userId,
          type: 'SPOT',
          symbol: validated.symbol,
          side: validated.side,
          amount: validated.amount,
          entryPrice: validated.price,
          status: 'OPEN'
        }
      });

      await this.updateUserBalance(validated.userId, validated.symbol, validated.amount, validated.side);

      return { success: true, position };
    } catch (error) {
      console.error('Spot trade error:', error);
      return { success: false, error: 'Failed to execute spot trade' };
    }
  }

  static async createFuturesTrade(data: z.infer<typeof createFuturesTradeSchema>) {
    const validated = createFuturesTradeSchema.parse(data);

    try {
      const currentPrice = await this.getCurrentPrice(validated.symbol);
      if (!currentPrice) {
        return { success: false, error: 'Unable to get current price' };
      }

      const size = (parseFloat(validated.margin) * validated.leverage) / currentPrice;
      const liquidationPrice = validated.side === 'LONG'
        ? currentPrice * (1 - (1 / validated.leverage) * 0.9)
        : currentPrice * (1 + (1 / validated.leverage) * 0.9);

      const position = await prisma.tradingPosition.create({
        data: {
          userId: validated.userId,
          type: 'FUTURES',
          symbol: validated.symbol,
          side: validated.side,
          amount: size.toString(),
          entryPrice: currentPrice.toString(),
          margin: validated.margin,
          leverage: validated.leverage,
          liquidationPrice: liquidationPrice.toString(),
          status: 'OPEN'
        }
      });

      await this.deductMargin(validated.userId, parseFloat(validated.margin));

      return { success: true, position };
    } catch (error) {
      console.error('Futures trade error:', error);
      return { success: false, error: 'Failed to execute futures trade' };
    }
  }

  static async createCopyTrade(data: z.infer<typeof createCopyTradeSchema>) {
    const validated = createCopyTradeSchema.parse(data);

    try {
      // Check if trader exists and get their minimum copy amount
      const trader = await prisma.proTrader.findUnique({
        where: { id: validated.traderId }
      });

      if (!trader) {
        return { success: false, error: 'Trader not found' };
      }

      if (!trader.isActive) {
        return { success: false, error: 'Trader is not currently accepting copy trades' };
      }

      const copyAmount = parseFloat(validated.copyAmount);
      const minCopyAmount = parseFloat(trader.minCopyAmount);

      if (copyAmount < minCopyAmount) {
        return { success: false, error: `Minimum copy amount for ${trader.name} is $${minCopyAmount}` };
      }

      // Check user's USDT balance
      const userWallet = await prisma.wallet.findFirst({
        where: { userId: validated.userId, symbol: 'USDT' }
      });

      if (!userWallet || parseFloat(userWallet.balance) < copyAmount) {
        return { success: false, error: 'Insufficient USDT balance' };
      }

      // Deduct balance first
      await this.deductBalance(validated.userId, copyAmount);

      // Create copy trading position
      const position = await prisma.copyTradingPosition.create({
        data: {
          userId: validated.userId,
          traderId: validated.traderId,
          traderName: validated.traderName,
          copyAmount: validated.copyAmount,
          status: 'ACTIVE'
        }
      });

      // Update trader's followers count
      await prisma.proTrader.update({
        where: { id: validated.traderId },
        data: { followers: { increment: 1 } }
      });

      return { success: true, position };
    } catch (error) {
      console.error('Copy trade error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to start copy trading' };
    }
  }

  static async closePosition(userId: string, positionId: string) {
    try {
      const position = await prisma.tradingPosition.findFirst({
        where: { id: positionId, userId, status: 'OPEN' }
      });

      if (!position) {
        return { success: false, error: 'Position not found' };
      }

      const currentPrice = await this.getCurrentPrice(position.symbol);
      if (!currentPrice) {
        return { success: false, error: 'Unable to get current price' };
      }

      const pnl = this.calculatePnL(position, currentPrice);

      await prisma.tradingPosition.update({
        where: { id: positionId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          currentPrice: currentPrice.toString(),
          pnl: pnl.toString()
        }
      });

      if (position.type === 'FUTURES' && position.margin) {
        const totalReturn = parseFloat(position.margin) + pnl;
        await this.addBalance(userId, totalReturn);
      }

      return { success: true, pnl };
    } catch (error) {
      console.error('Close position error:', error);
      return { success: false, error: 'Failed to close position' };
    }
  }

  static async stopCopyTrading(userId: string, positionId: string) {
    try {
      const position = await prisma.copyTradingPosition.findFirst({
        where: { id: positionId, userId, status: 'ACTIVE' }
      });

      if (!position) {
        return { success: false, error: 'Copy position not found' };
      }

      await prisma.copyTradingPosition.update({
        where: { id: positionId },
        data: { status: 'PAUSED' }
      });

      return { success: true };
    } catch (error) {
      console.error('Stop copy trading error:', error);
      return { success: false, error: 'Failed to stop copy trading' };
    }
  }

  static async getUserPositions(userId: string) {
    try {
      const [tradingPositions, copyPositions] = await Promise.all([
        prisma.tradingPosition.findMany({
          where: { userId, status: 'OPEN' },
          orderBy: { openedAt: 'desc' }
        }),
        prisma.copyTradingPosition.findMany({
          where: { userId, status: { in: ['ACTIVE', 'PAUSED'] } },
          orderBy: { startedAt: 'desc' }
        })
      ]);

      return { success: true, tradingPositions, copyPositions };
    } catch (error) {
      console.error('Get positions error:', error);
      return { success: false, error: 'Failed to get positions' };
    }
  }

  private static calculatePnL(position: any, currentPrice: number): number {
    const entryPrice = parseFloat(position.entryPrice);
    const amount = parseFloat(position.amount);

    if (position.type === 'SPOT') {
      return position.side === 'BUY'
        ? (currentPrice - entryPrice) * amount
        : (entryPrice - currentPrice) * amount;
    } else if (position.type === 'FUTURES') {
      return position.side === 'LONG'
        ? (currentPrice - entryPrice) * amount
        : (entryPrice - currentPrice) * amount;
    }

    return 0;
  }

  private static async getCurrentPrice(symbol: string): Promise<number | null> {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error('Failed to get current price:', error);
      return null;
    }
  }

  private static async updateUserBalance(userId: string, symbol: string, amount: string, side: string) {
    const currency = symbol.replace('USDT', '');
    const amountNum = parseFloat(amount);

    if (side === 'BUY') {
      await this.deductBalance(userId, amountNum, 'USDT');
      await this.addBalance(userId, amountNum, currency);
    } else {
      await this.deductBalance(userId, amountNum, currency);
      await this.addBalance(userId, amountNum, 'USDT');
    }
  }

  private static async addBalance(userId: string, amount: number, currency: string = 'USDT') {
    const wallet = await prisma.wallet.findFirst({
      where: { userId, symbol: currency }
    });

    if (wallet) {
      const newBalance = parseFloat(wallet.balance) + amount;
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance.toString() }
      });
    }
  }

  private static async deductBalance(userId: string, amount: number, currency: string = 'USDT') {
    const wallet = await prisma.wallet.findFirst({
      where: { userId, symbol: currency }
    });

    if (wallet && parseFloat(wallet.balance) >= amount) {
      const newBalance = parseFloat(wallet.balance) - amount;
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance.toString() }
      });
    } else {
      throw new Error('Insufficient balance');
    }
  }

  private static async deductMargin(userId: string, margin: number) {
    await this.deductBalance(userId, margin, 'USDT');
  }
}