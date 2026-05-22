'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { QrCode, Copy, X } from 'lucide-react';
import QRCodeGenerator from './QRCodeGenerator';

interface WalletConnectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset: {
    symbol: string;
    name: string;
  } | null;
}

export default function WalletConnector({ isOpen, onClose, selectedAsset }: WalletConnectorProps) {
  const { data: session } = useSession();
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAddress, setDepositAddress] = useState('');

  // Generate deposit address for selected asset
  useEffect(() => {
    if (selectedAsset && session) {
      const depositAddresses = {
        'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Bitcoin network
        'ETH': '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97', // ERC20 network
        'BNB': '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97', // BEP20 network
        'USDT': '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97', // ERC20/BEP20 network
        'SOL': 'J6aeP19UrwvWFDGorWADYqnA2BNw97fp4DT3KCaGEksn', // Solana network
        'POL': '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97', // Polygon network
        'TON': 'UQCBIV4LfX01corjV1n3ubL2rwWKnUZxAR5cchsSvARhCUyq', // TON network
        'TRX': 'TYDyM9dgAdYXYGfBgezCzxHpLYaPdFYtxr' // TRC20 network
      };
      setDepositAddress(depositAddresses[selectedAsset.symbol as keyof typeof depositAddresses] || '');
    }
  }, [selectedAsset, session]);

  const copyAddress = () => {
    if (depositAddress) {
      navigator.clipboard.writeText(depositAddress);

      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center';
      notification.innerHTML = `
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        Address copied to clipboard
      `;
      document.body.appendChild(notification);
      setTimeout(() => document.body.contains(notification) && document.body.removeChild(notification), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-auto transform transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <QrCode size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Deposit {selectedAsset?.symbol}</h2>
              <p className="text-sm text-gray-500">Scan QR code or copy address to deposit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Deposit Address Section */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <QrCode size={16} className="text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-900">Deposit Address</span>
                </div>
                <div className="flex items-center text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {selectedAsset?.symbol || 'BTC'} Network
                </div>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                <div className="font-mono text-sm text-gray-800 break-all leading-relaxed">
                  {depositAddress}
                </div>
              </div>

              <button
                onClick={copyAddress}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Copy size={16} className="mr-2" />
                Copy Address
              </button>
            </div>

            {/* QR Code Section */}
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (Optional)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={`Enter ${selectedAsset?.symbol} amount`}
                  step="0.000001"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for address-only QR code
                </p>
              </div>

              <QRCodeGenerator
                address={depositAddress}
                amount={depositAmount}
                symbol={selectedAsset?.symbol || 'BTC'}
                label={`Deposit to ${selectedAsset?.name || 'Bitcoin'} wallet`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}