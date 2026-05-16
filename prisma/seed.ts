import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const proTradersData = [
  // ── Category 1 ── ~60% monthly return | Medium risk | $300 min (3 traders)
  {
    name: 'SteadyBull_Alex',
    email: 'alex@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=SteadyBullAlex',
    verified: true,
    followers: 11200,
    totalReturn: '720.00',
    monthlyReturn: '60.00',
    winRate: '78.5',
    riskLevel: 'Medium',
    minCopyAmount: '300',
    description: 'Disciplined swing trader delivering consistent 60% monthly returns. Medium risk, ideal for growing portfolios.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT'])
  },
  {
    name: 'TrendRider_Maya',
    email: 'maya@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=TrendRiderMaya',
    verified: true,
    followers: 8700,
    totalReturn: '700.00',
    monthlyReturn: '59.80',
    winRate: '76.2',
    riskLevel: 'Medium',
    minCopyAmount: '300',
    description: 'Technical trend-follower achieving ~60% monthly returns across major crypto pairs with balanced risk.',
    tradingPairs: JSON.stringify(['ETH/USDT', 'SOL/USDT', 'BNB/USDT'])
  },
  {
    name: 'PrecisionPro_James',
    email: 'james@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=PrecisionJames',
    verified: true,
    followers: 7400,
    totalReturn: '715.00',
    monthlyReturn: '60.20',
    winRate: '77.0',
    riskLevel: 'Medium',
    minCopyAmount: '300',
    description: 'Precision entry/exit trader maintaining ~60% monthly returns with medium-risk exposure.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ADA/USDT', 'DOT/USDT'])
  },

  // ── Category 2 ── 60–80% monthly return | Medium risk | $300 min (4 traders)
  {
    name: 'MomentumElite_Sofia',
    email: 'sofia@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=MomentumSofia',
    verified: true,
    followers: 13500,
    totalReturn: '860.00',
    monthlyReturn: '70.00',
    winRate: '73.1',
    riskLevel: 'Medium',
    minCopyAmount: '300',
    description: 'Momentum-based strategy achieving 60–80% monthly returns with diversified crypto pairs.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'SOL/USDT'])
  },
  {
    name: 'BreakoutPro_Omar',
    email: 'omar@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=BreakoutOmar',
    verified: true,
    followers: 10200,
    totalReturn: '780.00',
    monthlyReturn: '63.50',
    winRate: '71.8',
    riskLevel: 'Medium',
    minCopyAmount: '300',
    description: 'Breakout trading specialist delivering 60–80% monthly profits at medium risk.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'BNB/USDT', 'LINK/USDT'])
  },
  {
    name: 'SwingMaster_Priya',
    email: 'priya@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=SwingPriya',
    verified: true,
    followers: 8900,
    totalReturn: '940.00',
    monthlyReturn: '77.80',
    winRate: '70.5',
    riskLevel: 'Medium',
    minCopyAmount: '300',
    description: 'Swing trading specialist leveraging indicator confluence for 70–80% monthly returns.',
    tradingPairs: JSON.stringify(['ETH/USDT', 'ADA/USDT', 'SOL/USDT', 'MATIC/USDT'])
  },
  {
    name: 'ChartKing_Carlos',
    email: 'carlos@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ChartCarlos',
    verified: true,
    followers: 11800,
    totalReturn: '820.00',
    monthlyReturn: '66.40',
    winRate: '74.3',
    riskLevel: 'Medium',
    minCopyAmount: '300',
    description: 'Chart pattern specialist capturing 60–80% monthly returns with medium-risk multi-pair strategies.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'DOT/USDT'])
  },

  // ── Category 3 ── 100–110% monthly return | Low risk | $300–400 min (4 traders)
  {
    name: 'ArbitrageAce_Lena',
    email: 'lena@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ArbitrageLena',
    verified: true,
    followers: 17400,
    totalReturn: '1250.00',
    monthlyReturn: '104.00',
    winRate: '89.7',
    riskLevel: 'Low',
    minCopyAmount: '300',
    description: 'Arbitrage and market-making specialist delivering 100–110% monthly returns with low-risk strategies.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'SOL/USDT'])
  },
  {
    name: 'QuantEdge_Felix',
    email: 'felix@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=QuantFelix',
    verified: true,
    followers: 14100,
    totalReturn: '1310.00',
    monthlyReturn: '109.20',
    winRate: '88.3',
    riskLevel: 'Low',
    minCopyAmount: '350',
    description: 'Quantitative low-risk strategies achieving 100–110% monthly returns through algorithmic precision.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT'])
  },
  {
    name: 'AlgoSafe_Nadia',
    email: 'nadia@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=AlgoNadia',
    verified: true,
    followers: 12600,
    totalReturn: '1200.00',
    monthlyReturn: '100.50',
    winRate: '87.0',
    riskLevel: 'Low',
    minCopyAmount: '300',
    description: 'Algorithm-based safe trader consistently hitting 100% monthly returns with minimal drawdown.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'DOT/USDT'])
  },
  {
    name: 'StealthPro_Diana',
    email: 'diana@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=StealthDiana',
    verified: true,
    followers: 9800,
    totalReturn: '1320.00',
    monthlyReturn: '110.00',
    winRate: '86.5',
    riskLevel: 'Low',
    minCopyAmount: '400',
    description: 'Stealth arbitrage and delta-neutral strategies delivering up to 110% monthly with low risk.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'LINK/USDT'])
  },

  // ── Category 4 ── 200–250% monthly return | $1000 min (3 traders: High / Medium / Low)
  {
    name: 'EliteHawk_Victor',
    email: 'victor@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=EliteVictor',
    verified: true,
    followers: 24000,
    totalReturn: '3000.00',
    monthlyReturn: '250.00',
    winRate: '68.5',
    riskLevel: 'High',
    minCopyAmount: '1000',
    description: 'Aggressive high-risk specialist targeting 200–250% monthly returns through leveraged volatility strategies.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'DOGE/USDT', 'SHIB/USDT'])
  },
  {
    name: 'BalancedLion_Rachel',
    email: 'rachel@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=BalancedRachel',
    verified: true,
    followers: 19500,
    totalReturn: '2700.00',
    monthlyReturn: '225.00',
    winRate: '76.2',
    riskLevel: 'Medium',
    minCopyAmount: '1000',
    description: 'Medium-risk elite trader delivering 200–250% monthly returns with balanced exposure across pairs.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'SOL/USDT'])
  },
  {
    name: 'SafeGiant_Marcus',
    email: 'marcus@protraders.com',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=SafeMarcus',
    verified: true,
    followers: 21300,
    totalReturn: '2400.00',
    monthlyReturn: '200.00',
    winRate: '91.8',
    riskLevel: 'Low',
    minCopyAmount: '1000',
    description: 'Institutional-grade low-risk trader achieving 200% monthly through market-making and arbitrage at scale.',
    tradingPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT'])
  }
];

async function main() {
  console.log('Seeding pro traders...');

  // Clear all existing traders and their trades first
  await prisma.proTraderTrade.deleteMany({});
  await prisma.proTrader.deleteMany({});

  for (const trader of proTradersData) {
    await prisma.proTrader.create({ data: trader });
  }

  console.log(`Seeded ${proTradersData.length} pro traders successfully!`);

  // Create sample trades for each trader
  console.log('Creating sample trades...');

  const traders = await prisma.proTrader.findMany();
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
  const sides = ['BUY', 'SELL', 'LONG', 'SHORT'];

  for (const trader of traders) {
    const numTrades = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < numTrades; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const side = sides[Math.floor(Math.random() * sides.length)];
      const amount = (Math.random() * 10 + 0.1).toFixed(6);
      const entryPrice = (Math.random() * 50000 + 1000).toFixed(2);
      const isOpen = Math.random() > 0.7;

      let exitPrice = null;
      let profit = '0';
      let profitPercent = '0';
      let status = 'OPEN';

      if (!isOpen) {
        const priceChange = (Math.random() - 0.5) * 0.1;
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
          openedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          closedAt: !isOpen ? new Date() : null
        }
      });
    }
  }

  console.log('Created sample trades for all traders!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
