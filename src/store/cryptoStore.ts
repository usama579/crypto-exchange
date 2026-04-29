import { create } from 'zustand';
import { CryptoPrice } from '@/lib/websocket';

interface CryptoStore {
  prices: CryptoPrice[];
  selectedCrypto: CryptoPrice | null;
  isConnected: boolean;
  currentPage: number;
  itemsPerPage: number;
  setPrices: (prices: CryptoPrice[]) => void;
  setSelectedCrypto: (crypto: CryptoPrice) => void;
  setIsConnected: (connected: boolean) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
}

export const useCryptoStore = create<CryptoStore>((set) => ({
  prices: [],
  selectedCrypto: null,
  isConnected: false,
  currentPage: 1,
  itemsPerPage: 50,
  setPrices: (prices) => set({ prices }),
  setSelectedCrypto: (crypto) => set({ selectedCrypto: crypto }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setItemsPerPage: (items) => set({ itemsPerPage: items }),
}));