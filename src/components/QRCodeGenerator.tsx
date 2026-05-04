'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Copy, Download, ExternalLink } from 'lucide-react';

interface QRCodeGeneratorProps {
  address: string;
  amount?: string;
  symbol: string;
  label?: string;
}

export default function QRCodeGenerator({ address, amount, symbol, label }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate payment URI based on cryptocurrency
  const generatePaymentURI = () => {
    let uri = '';

    switch (symbol.toLowerCase()) {
      case 'btc':
      case 'bitcoin':
        uri = `bitcoin:${address}`;
        if (amount) uri += `?amount=${amount}`;
        if (label) uri += `${amount ? '&' : '?'}label=${encodeURIComponent(label)}`;
        break;

      case 'eth':
      case 'ethereum':
      case 'usdt':
        uri = `ethereum:${address}`;
        if (amount) uri += `@1?value=${parseFloat(amount) * 1e18}`;
        break;

      case 'bnb':
        uri = `binance:${address}`;
        if (amount) uri += `?amount=${amount}`;
        break;

      default:
        uri = address;
    }

    return uri;
  };

  // Generate QR code
  useEffect(() => {
    if (!canvasRef.current || !address) return;

    const paymentURI = generatePaymentURI();

    QRCode.toCanvas(
      canvasRef.current,
      paymentURI,
      {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      },
      (error) => {
        if (error) console.error('QR Code generation error:', error);
      }
    );
  }, [address, amount, symbol, label]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);

      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center';
      notification.innerHTML = `
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        Copied to clipboard!
      `;
      document.body.appendChild(notification);
      setTimeout(() => document.body.contains(notification) && document.body.removeChild(notification), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `${symbol}-deposit-qr.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const openInWallet = () => {
    const paymentURI = generatePaymentURI();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // On mobile, try to open the wallet app directly
      window.location.href = paymentURI;
    } else {
      // On desktop, copy the URI to clipboard
      copyToClipboard(paymentURI);
    }
  };

  return (
    <div className="text-center space-y-4">
      {/* QR Code */}
      <div className="inline-block p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <canvas
          ref={canvasRef}
          className="block mx-auto"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Payment Info */}
      <div className="space-y-3">
        {/* Address */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Deposit Address</p>
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm text-gray-800 break-all flex-1 mr-2">
              {address}
            </p>
            <button
              onClick={() => copyToClipboard(address)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        {/* Amount */}
        {amount && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-600 mb-1">Amount</p>
            <p className="font-semibold text-blue-800">{amount} {symbol}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={openInWallet}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <ExternalLink size={16} className="mr-2" />
          Open in Wallet
        </button>

        <button
          onClick={downloadQRCode}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          <Download size={16} className="mr-2" />
          Download QR
        </button>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Scan this QR code with your {symbol} wallet app</p>
        <p>• Or copy the address and send manually</p>
        {amount && <p>• Amount is pre-filled for your convenience</p>}
        <p>• Only send {symbol} to this address</p>
      </div>
    </div>
  );
}