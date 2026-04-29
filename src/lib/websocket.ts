// Free Binance WebSocket API integration
export interface CryptoPrice {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  volume: string;
  high: string;
  low: string;
}

class CryptoWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private subscribers: Map<string, (data: CryptoPrice[]) => void> = new Map();
  private statusSubscribers: Map<string, (connected: boolean) => void> = new Map();
  private isConnecting = false;

  connect() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;

    try {
      // Use the correct Binance WebSocket URL (without port for better connectivity)
      this.ws = new WebSocket('wss://stream.binance.com/ws/!ticker@arr');

      this.ws.onopen = () => {
        console.log('Connected to Binance WebSocket');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        // Notify status subscribers
        this.statusSubscribers.forEach((callback) => callback(true));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Check if data is an array (ticker array format)
          if (Array.isArray(data)) {
            const formattedData: CryptoPrice[] = data
              .filter((ticker: any) => ticker.s && ticker.s.includes('USDT')) // Filter for USDT pairs
              .map((ticker: any) => ({
                symbol: ticker.s,
                price: parseFloat(ticker.c).toString(),
                change: ticker.P,
                changePercent: ticker.P,
                volume: ticker.v,
                high: ticker.h,
                low: ticker.l,
              }))
              .slice(0, 100); // Limit to top 100

            console.log(`Received ${formattedData.length} crypto prices`);

            // Notify all subscribers
            this.subscribers.forEach((callback) => callback(formattedData));
          }
        } catch (error) {
          console.error('Error parsing WebSocket data:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        this.isConnecting = false;
        // Notify status subscribers
        this.statusSubscribers.forEach((callback) => callback(false));
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        // Notify status subscribers
        this.statusSubscribers.forEach((callback) => callback(false));
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.isConnecting = false;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(2000 * this.reconnectAttempts, 10000);
      console.log(`Reconnecting in ${delay}ms... Attempt ${this.reconnectAttempts}`);

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribe(id: string, callback: (data: CryptoPrice[]) => void) {
    this.subscribers.set(id, callback);
    // If already connected, try to get initial data
    if (this.ws?.readyState === WebSocket.OPEN) {
      // Connection is open but we need to wait for data
    }
  }

  unsubscribe(id: string) {
    this.subscribers.delete(id);
  }

  subscribeToStatus(id: string, callback: (connected: boolean) => void) {
    this.statusSubscribers.set(id, callback);
  }

  unsubscribeFromStatus(id: string) {
    this.statusSubscribers.delete(id);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
    // Notify status subscribers
    this.statusSubscribers.forEach((callback) => callback(false));
  }
}

export const cryptoWebSocket = new CryptoWebSocket();