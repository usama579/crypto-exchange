import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Wallet {
  id: string;
  symbol: string;
  name: string;
  address: string;
  balance: string;
  transactions?: Transaction[];
}

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE';
  status: 'PENDING' | 'CONFIRMING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount: string;
  symbol: string;
  txHash?: string;
  confirmations: number;
  createdAt: string;
}

export function useWallet() {
  const { data: session } = useSession();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWallet = async (symbol: string, name: string) => {
    if (!session) return null;

    try {
      const response = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create wallet');
      }

      // Refresh wallets after creation
      fetchWallets();
      return data.wallet;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
      return null;
    }
  };

  const fetchWallets = async () => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wallet/balance');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch wallets');
      }

      setWallets(data.wallets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallets');
    } finally {
      setLoading(false);
    }
  };

  const getWalletBySymbol = (symbol: string): Wallet | undefined => {
    return wallets.find(wallet => wallet.symbol === symbol.toUpperCase());
  };

  const getTotalBalance = (): number => {
    // Mock price calculation - in production, fetch real prices
    const mockPrices = {
      BTC: 45000,
      ETH: 3000,
      BNB: 300,
      USDT: 1
    };

    return wallets.reduce((total, wallet) => {
      const price = mockPrices[wallet.symbol as keyof typeof mockPrices] || 0;
      const balance = parseFloat(wallet.balance);
      return total + (balance * price);
    }, 0);
  };

  const refreshWalletData = () => {
    fetchWallets();
  };

  // Auto-refresh wallets periodically
  useEffect(() => {
    if (session) {
      fetchWallets();

      // Refresh every 30 seconds
      const interval = setInterval(fetchWallets, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  return {
    wallets,
    loading,
    error,
    createWallet,
    getWalletBySymbol,
    getTotalBalance,
    refreshWalletData
  };
}