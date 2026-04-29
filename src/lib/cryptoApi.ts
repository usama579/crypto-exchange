// Fallback REST API for crypto data
import { CryptoPrice } from './websocket';

export async function fetchCryptoData(): Promise<CryptoPrice[]> {
  try {
    // Use Binance REST API as fallback
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    const data = await response.json();

    const formattedData: CryptoPrice[] = data
      .filter((ticker: any) => ticker.symbol && ticker.symbol.includes('USDT'))
      .map((ticker: any) => ({
        symbol: ticker.symbol,
        price: parseFloat(ticker.lastPrice).toString(),
        change: ticker.priceChange,
        changePercent: ticker.priceChangePercent,
        volume: ticker.volume,
        high: ticker.highPrice,
        low: ticker.lowPrice,
      }))
      .slice(0, 100);

    return formattedData;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return [];
  }
}