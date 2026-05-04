import { prisma } from '@/lib/prisma';

interface BlockchainConfig {
  rpcUrl: string;
  apiKey?: string;
  confirmationsRequired: number;
}

interface TransactionData {
  hash: string;
  to: string;
  from: string;
  value: string;
  symbol: string;
  blockNumber: number;
  confirmations: number;
}

export class BlockchainMonitor {
  private configs: Map<string, BlockchainConfig>;
  private isRunning: boolean = false;
  private monitorInterval: number = 30000; // 30 seconds

  constructor() {
    this.configs = new Map([
      ['BTC', {
        rpcUrl: process.env.BTC_RPC_URL || 'https://blockstream.info/api',
        confirmationsRequired: 3
      }],
      ['ETH', {
        rpcUrl: process.env.ETH_RPC_URL || 'https://api.etherscan.io/api',
        apiKey: process.env.ETHERSCAN_API_KEY,
        confirmationsRequired: 12
      }],
      ['BNB', {
        rpcUrl: process.env.BNB_RPC_URL || 'https://api.bscscan.com/api',
        apiKey: process.env.BSCSCAN_API_KEY,
        confirmationsRequired: 15
      }],
      ['USDT', {
        rpcUrl: process.env.ETH_RPC_URL || 'https://api.etherscan.io/api',
        apiKey: process.env.ETHERSCAN_API_KEY,
        confirmationsRequired: 12
      }]
    ]);
  }

  async startMonitoring() {
    if (this.isRunning) {
      console.log('Blockchain monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting blockchain monitoring...');

    // Monitor each supported cryptocurrency
    for (const [symbol] of this.configs) {
      this.scheduleAddressMonitoring(symbol);
    }
  }

  async stopMonitoring() {
    this.isRunning = false;
    console.log('Stopping blockchain monitoring...');
  }

  private scheduleAddressMonitoring(symbol: string) {
    setInterval(async () => {
      if (!this.isRunning) return;

      try {
        await this.monitorAddressesForSymbol(symbol);
      } catch (error) {
        console.error(`Error monitoring ${symbol}:`, error);
      }
    }, this.monitorInterval);
  }

  private async monitorAddressesForSymbol(symbol: string) {
    // Get all wallet addresses for this symbol
    const wallets = await prisma.wallet.findMany({
      where: { symbol },
      select: { id: true, address: true, userId: true }
    });

    if (wallets.length === 0) return;

    console.log(`Monitoring ${wallets.length} ${symbol} addresses...`);

    for (const wallet of wallets) {
      try {
        await this.checkAddressTransactions(wallet.address, symbol, wallet.id, wallet.userId);
      } catch (error) {
        console.error(`Error checking address ${wallet.address}:`, error);
      }
    }
  }

  private async checkAddressTransactions(
    address: string,
    symbol: string,
    walletId: string,
    userId: string
  ) {
    const config = this.configs.get(symbol);
    if (!config) return;

    let transactions: TransactionData[] = [];

    switch (symbol) {
      case 'BTC':
        transactions = await this.getBitcoinTransactions(address, config);
        break;
      case 'ETH':
      case 'USDT':
        transactions = await this.getEthereumTransactions(address, config, symbol);
        break;
      case 'BNB':
        transactions = await this.getBNBTransactions(address, config);
        break;
    }

    // Process incoming transactions
    for (const tx of transactions) {
      if (tx.to.toLowerCase() === address.toLowerCase()) {
        await this.processIncomingTransaction(tx, walletId, userId);
      }
    }
  }

  private async getBitcoinTransactions(address: string, config: BlockchainConfig): Promise<TransactionData[]> {
    try {
      const response = await fetch(`${config.rpcUrl}/address/${address}/txs`);
      const data = await response.json();

      return data.map((tx: any) => ({
        hash: tx.txid,
        to: address,
        from: tx.vin[0]?.prevout?.scriptpubkey_address || 'unknown',
        value: (tx.vout.find((out: any) => out.scriptpubkey_address === address)?.value || 0).toString(),
        symbol: 'BTC',
        blockNumber: tx.status.block_height || 0,
        confirmations: tx.status.confirmed ? 6 : 0
      })).filter((tx: TransactionData) => parseFloat(tx.value) > 0);
    } catch (error) {
      console.error('Error fetching Bitcoin transactions:', error);
      return [];
    }
  }

  private async getEthereumTransactions(address: string, config: BlockchainConfig, symbol: string): Promise<TransactionData[]> {
    try {
      const isUSDT = symbol === 'USDT';
      const contractAddress = isUSDT ? '0xdAC17F958D2ee523a2206206994597C13D831ec7' : undefined;

      const action = isUSDT ? 'tokentx' : 'txlist';
      const url = `${config.rpcUrl}?module=account&action=${action}&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${config.apiKey}${contractAddress ? `&contractaddress=${contractAddress}` : ''}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== '1') return [];

      return data.result.map((tx: any) => ({
        hash: tx.hash,
        to: tx.to,
        from: tx.from,
        value: isUSDT ?
          (parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal))).toString() :
          (parseFloat(tx.value) / Math.pow(10, 18)).toString(),
        symbol,
        blockNumber: parseInt(tx.blockNumber),
        confirmations: tx.confirmations ? parseInt(tx.confirmations) : 0
      })).filter((tx: TransactionData) => parseFloat(tx.value) > 0);
    } catch (error) {
      console.error(`Error fetching ${symbol} transactions:`, error);
      return [];
    }
  }

  private async getBNBTransactions(address: string, config: BlockchainConfig): Promise<TransactionData[]> {
    try {
      const url = `${config.rpcUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${config.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== '1') return [];

      return data.result.map((tx: any) => ({
        hash: tx.hash,
        to: tx.to,
        from: tx.from,
        value: (parseFloat(tx.value) / Math.pow(10, 18)).toString(),
        symbol: 'BNB',
        blockNumber: parseInt(tx.blockNumber),
        confirmations: tx.confirmations ? parseInt(tx.confirmations) : 0
      })).filter((tx: TransactionData) => parseFloat(tx.value) > 0);
    } catch (error) {
      console.error('Error fetching BNB transactions:', error);
      return [];
    }
  }

  private async processIncomingTransaction(tx: TransactionData, walletId: string, userId: string) {
    try {
      // Check if transaction already exists
      const existingTx = await prisma.transaction.findUnique({
        where: {
          txHash_symbol: {
            txHash: tx.hash,
            symbol: tx.symbol
          }
        }
      });

      const requiredConfirmations = this.configs.get(tx.symbol)?.confirmationsRequired || 3;
      const isConfirmed = tx.confirmations >= requiredConfirmations;

      if (existingTx) {
        // Update confirmations if needed
        if (tx.confirmations > existingTx.confirmations) {
          const shouldUpdateBalance = !existingTx.status.includes('COMPLETED') && isConfirmed;

          await prisma.$transaction([
            prisma.transaction.update({
              where: { id: existingTx.id },
              data: {
                confirmations: tx.confirmations,
                status: isConfirmed ? 'COMPLETED' : 'CONFIRMING'
              }
            }),
            // Update wallet balance only when confirmed for the first time
            ...(shouldUpdateBalance ? [
              prisma.wallet.update({
                where: { id: walletId },
                data: {
                  balance: {
                    increment: parseFloat(tx.value)
                  }
                }
              })
            ] : [])
          ]);

          if (shouldUpdateBalance) {
            console.log(`✅ Deposit confirmed: ${tx.value} ${tx.symbol} | TxHash: ${tx.hash}`);
          }
        }
        return;
      }

      // Create new transaction
      const status = isConfirmed ? 'COMPLETED' : 'CONFIRMING';

      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            userId,
            walletId,
            txHash: tx.hash,
            type: 'DEPOSIT',
            status,
            amount: tx.value,
            symbol: tx.symbol,
            fromAddress: tx.from,
            toAddress: tx.to,
            confirmations: tx.confirmations
          }
        }),
        // Update wallet balance only if confirmed
        ...(isConfirmed ? [
          prisma.wallet.update({
            where: { id: walletId },
            data: {
              balance: {
                increment: parseFloat(tx.value)
              }
            }
          })
        ] : [])
      ]);

      console.log(`🔄 New ${status.toLowerCase()} deposit: ${tx.value} ${tx.symbol} | TxHash: ${tx.hash}`);

    } catch (error) {
      console.error('Error processing transaction:', error);
    }
  }
}

// Singleton instance
export const blockchainMonitor = new BlockchainMonitor();