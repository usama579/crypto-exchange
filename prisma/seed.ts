import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const proTradersData = [
  {
    name: 'CryptoPro_Alex',
    email: 'alex@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    verified: true,
    followers: 12420,
    totalReturn: '245.60',
    monthlyReturn: '18.30',
    winRate: '78.5',
    riskLevel: 'Medium',
    minCopyAmount: '100',
    description: 'Professional trader with 5+ years experience in crypto markets. Specializing in swing trading and technical analysis.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT'])
  },
  {
    name: 'DefiMaster_Sarah',
    email: 'sarah@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    verified: true,
    followers: 8745,
    totalReturn: '189.20',
    monthlyReturn: '15.70',
    winRate: '72.1',
    riskLevel: 'Low',
    minCopyAmount: '50',
    description: 'Conservative trader focused on long-term growth. Expert in DeFi protocols and fundamental analysis.',
    tradingPairs: JSON.stringify(['ETH/USDT', 'ADA/USDT', 'SOL/USDT'])
  },
  {
    name: 'RiskTaker_Mike',
    email: 'mike@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    verified: false,
    followers: 5230,
    totalReturn: '412.80',
    monthlyReturn: '28.50',
    winRate: '65.3',
    riskLevel: 'High',
    minCopyAmount: '200',
    description: 'High-risk high-reward trading strategy. Perfect for experienced traders looking for aggressive growth.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'DOGE/USDT'])
  },
  {
    name: 'TechAnalyst_Emma',
    email: 'emma@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    verified: true,
    followers: 15680,
    totalReturn: '167.30',
    monthlyReturn: '12.90',
    winRate: '81.2',
    riskLevel: 'Medium',
    minCopyAmount: '75',
    description: 'Technical analysis expert with consistent profits. Known for precise entry and exit points.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT'])
  },
  {
    name: 'ScalpMaster_John',
    email: 'john@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    verified: true,
    followers: 9876,
    totalReturn: '298.45',
    monthlyReturn: '22.10',
    winRate: '75.8',
    riskLevel: 'High',
    minCopyAmount: '150',
    description: 'Scalping specialist making quick profits from small price movements. High frequency trading expert.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT'])
  },
  {
    name: 'AltcoinHunter_Lisa',
    email: 'lisa@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
    verified: true,
    followers: 7432,
    totalReturn: '356.70',
    monthlyReturn: '25.40',
    winRate: '68.9',
    riskLevel: 'High',
    minCopyAmount: '100',
    description: 'Altcoin specialist with exceptional ability to identify undervalued tokens before major pumps.',
    tradingPairs: JSON.stringify(['SOL/USDT', 'ADA/USDT', 'DOT/USDT', 'LINK/USDT'])
  },
  {
    name: 'StableGains_Robert',
    email: 'robert@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert',
    verified: true,
    followers: 11250,
    totalReturn: '134.20',
    monthlyReturn: '8.90',
    winRate: '84.3',
    riskLevel: 'Low',
    minCopyAmount: '50',
    description: 'Conservative approach with steady gains. Perfect for risk-averse investors seeking consistent returns.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT'])
  },
  {
    name: 'QuantTrader_Amy',
    email: 'amy@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amy',
    verified: true,
    followers: 6789,
    totalReturn: '423.10',
    monthlyReturn: '31.20',
    winRate: '71.5',
    riskLevel: 'High',
    minCopyAmount: '250',
    description: 'Quantitative trading strategies using advanced algorithms and market indicators.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'])
  },
  {
    name: 'SwingKing_David',
    email: 'david@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    verified: false,
    followers: 4567,
    totalReturn: '278.90',
    monthlyReturn: '19.80',
    winRate: '76.2',
    riskLevel: 'Medium',
    minCopyAmount: '100',
    description: 'Swing trading master capturing multi-day trends. Excellent at timing market cycles.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT'])
  },
  {
    name: 'FuturesPro_Nina',
    email: 'nina@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nina',
    verified: true,
    followers: 13456,
    totalReturn: '512.30',
    monthlyReturn: '34.50',
    winRate: '62.8',
    riskLevel: 'High',
    minCopyAmount: '300',
    description: 'Futures trading specialist with exceptional leverage management. High reward potential.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'SOL/USDT'])
  },
  {
    name: 'AITrader_Marcus',
    email: 'marcus@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    verified: true,
    followers: 8901,
    totalReturn: '203.45',
    monthlyReturn: '14.20',
    winRate: '79.1',
    riskLevel: 'Medium',
    minCopyAmount: '100',
    description: 'AI-powered trading strategies with machine learning algorithms for market prediction.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT'])
  },
  {
    name: 'CryptoWhale_Victoria',
    email: 'victoria@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=victoria',
    verified: true,
    followers: 16789,
    totalReturn: '189.70',
    monthlyReturn: '11.30',
    winRate: '82.7',
    riskLevel: 'Low',
    minCopyAmount: '500',
    description: 'Large volume trader with institutional-level strategies. Minimum investment required.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT'])
  },
  {
    name: 'MomentumHawk_Chris',
    email: 'chris@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chris',
    verified: false,
    followers: 3456,
    totalReturn: '345.60',
    monthlyReturn: '26.70',
    winRate: '69.4',
    riskLevel: 'High',
    minCopyAmount: '150',
    description: 'Momentum trading expert catching strong price breakouts and trend reversals.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOGE/USDT'])
  },
  {
    name: 'StableStrategy_Helen',
    email: 'helen@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=helen',
    verified: true,
    followers: 9234,
    totalReturn: '156.80',
    monthlyReturn: '10.40',
    winRate: '85.6',
    riskLevel: 'Low',
    minCopyAmount: '75',
    description: 'Risk management focused approach with capital preservation as priority.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT'])
  },
  {
    name: 'GridBot_Kevin',
    email: 'kevin@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kevin',
    verified: true,
    followers: 5678,
    totalReturn: '234.90',
    monthlyReturn: '17.60',
    winRate: '74.3',
    riskLevel: 'Medium',
    minCopyAmount: '100',
    description: 'Grid trading bot strategies profiting from market volatility and sideways movements.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT'])
  },
  {
    name: 'ArbitrageExpert_Maria',
    email: 'maria@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    verified: true,
    followers: 7890,
    totalReturn: '98.70',
    monthlyReturn: '7.20',
    winRate: '91.2',
    riskLevel: 'Low',
    minCopyAmount: '200',
    description: 'Arbitrage specialist exploiting price differences across exchanges with minimal risk.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT'])
  },
  {
    name: 'VolatilityMaster_Tom',
    email: 'tom@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom',
    verified: false,
    followers: 4321,
    totalReturn: '467.80',
    monthlyReturn: '35.90',
    winRate: '58.7',
    riskLevel: 'High',
    minCopyAmount: '250',
    description: 'Volatility trading specialist thriving in high-movement market conditions.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOGE/USDT'])
  },
  {
    name: 'PatternSeeker_Julia',
    email: 'julia@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=julia',
    verified: true,
    followers: 10567,
    totalReturn: '312.40',
    monthlyReturn: '21.80',
    winRate: '73.9',
    riskLevel: 'Medium',
    minCopyAmount: '125',
    description: 'Chart pattern recognition expert with deep understanding of market psychology.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT'])
  },
  {
    name: 'NewsTrader_Ryan',
    email: 'ryan@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan',
    verified: true,
    followers: 6543,
    totalReturn: '289.30',
    monthlyReturn: '20.40',
    winRate: '71.6',
    riskLevel: 'Medium',
    minCopyAmount: '100',
    description: 'Fundamental analysis and news-based trading strategies. Quick reaction to market events.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT'])
  },
  {
    name: 'HodlAndGrow_Elena',
    email: 'elena@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena',
    verified: true,
    followers: 12890,
    totalReturn: '178.50',
    monthlyReturn: '9.60',
    winRate: '88.4',
    riskLevel: 'Low',
    minCopyAmount: '50',
    description: 'Long-term holding strategy with strategic buying during market dips.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT'])
  }
];

async function main() {
  console.log('🌱 Seeding pro traders...');

  // Clear existing pro traders
  await prisma.proTrader.deleteMany({});

  // Create 20 pro traders
  for (const trader of proTradersData) {
    await prisma.proTrader.create({
      data: trader
    });
  }

  console.log('✅ Seeded 20 pro traders successfully!');

  // Create some sample trades for each trader
  console.log('🌱 Creating sample trades...');

  const traders = await prisma.proTrader.findMany();
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
  const sides = ['BUY', 'SELL', 'LONG', 'SHORT'];

  for (const trader of traders) {
    // Create 3-5 recent trades per trader
    const numTrades = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < numTrades; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const side = sides[Math.floor(Math.random() * sides.length)];
      const amount = (Math.random() * 10 + 0.1).toFixed(6);
      const entryPrice = (Math.random() * 50000 + 1000).toFixed(2);
      const isOpen = Math.random() > 0.7; // 30% chance trade is still open

      let exitPrice = null;
      let profit = '0';
      let profitPercent = '0';
      let status = 'OPEN';

      if (!isOpen) {
        const priceChange = (Math.random() - 0.5) * 0.1; // -5% to +5% change
        exitPrice = (parseFloat(entryPrice) * (1 + priceChange)).toFixed(2);
        const pnl = (parseFloat(exitPrice) - parseFloat(entryPrice)) * parseFloat(amount);
        profit = pnl.toFixed(2);
        profitPercent = ((pnl / (parseFloat(entryPrice) * parseFloat(amount))) * 100).toFixed(2);
        status = 'CLOSED';
      }

      await prisma.proTraderTrade.create({
        data: {
          traderId: trader.id,
          symbol,
          side,
          amount,
          entryPrice,
          exitPrice,
          profit,
          profitPercent,
          status,
          openedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
          closedAt: !isOpen ? new Date() : null
        }
      });
    }
  }

  console.log('✅ Created sample trades for all traders!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });