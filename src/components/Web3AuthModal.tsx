'use client';

import React, { useState } from 'react';
import { useWallet } from '../app/components/Web3AuthProvider';
import NextImageWrapper from './NextImageWrapper';

interface Web3AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Web3AuthModal: React.FC<Web3AuthModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet, isConnected, account, userData, balance, disconnectWallet, isLoading } = useWallet();
  const [activeTab, setActiveTab] = useState<'social' | 'wallet'>('social');

  if (!isOpen) return null;

  const handleConnect = async (provider?: string) => {
    try {
      await connectWallet(provider);
      if (!isLoading && isConnected) {
        onClose();
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  // Format address for display (e.g., 0x1234...5678)
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 m-4 border border-gray-700 text-gray-100">
        {!isConnected ? (
          // Login view
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-100">Connect to Monad Tribe</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="flex border-b border-gray-700">
                <button
                  className={`py-2 px-4 ${activeTab === 'social' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('social')}
                >
                  Social Login
                </button>
                <button
                  className={`py-2 px-4 ${activeTab === 'wallet' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('wallet')}
                >
                  Wallet
                </button>
              </div>
            </div>

            {activeTab === 'social' ? (
              // Social Login Tab
              <div className="space-y-4">
                <button
                  onClick={() => handleConnect('google')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white">
                      <NextImageWrapper src="/icons/google.svg" alt="Google" width={24} height={24} />
                    </div>
                    <span className="font-medium">Google</span>
                  </div>
                  <span className="text-sm text-gray-400">Popular</span>
                </button>
                
                <button
                  onClick={() => handleConnect('facebook')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600">
                      <NextImageWrapper src="/icons/facebook.svg" alt="Facebook" width={24} height={24} />
                    </div>
                    <span className="font-medium">Facebook</span>
                  </div>
                  <span className="text-sm text-gray-400">Social</span>
                </button>
                
                <button
                  onClick={() => handleConnect('twitter')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-400">
                      <NextImageWrapper src="/icons/twitter.svg" alt="Twitter" width={24} height={24} />
                    </div>
                    <span className="font-medium">Twitter</span>
                  </div>
                  <span className="text-sm text-gray-400">Social</span>
                </button>
                
                <button
                  onClick={() => handleConnect('email_passwordless')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-medium">Email</span>
                  </div>
                  <span className="text-sm text-gray-400">Passwordless</span>
                </button>
              </div>
            ) : (
              // Wallet Tab
              <div className="space-y-4">
                <button
                  onClick={() => handleConnect('metamask')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                      <NextImageWrapper src="/metamask-fox.svg" alt="MetaMask" width={32} height={32} />
                    </div>
                    <span className="font-medium">MetaMask</span>
                  </div>
                  <span className="text-sm text-gray-400">Popular</span>
                </button>
                
                <button
                  onClick={() => handleConnect('walletconnect')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                      <NextImageWrapper src="/walletconnect-logo.svg" alt="WalletConnect" width={32} height={32} />
                    </div>
                    <span className="font-medium">WalletConnect</span>
                  </div>
                  <span className="text-sm text-gray-400">Multi-device</span>
                </button>
              </div>
            )}

            <div className="mt-6 text-center text-xs text-gray-400">
              By connecting your wallet or social account, you agree to our Terms of Service and Privacy Policy.
            </div>
          </>
        ) : (
          // Connected account view
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-100">Connected account</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 bg-gray-700 rounded-lg mb-6">
              {userData && userData.profileImage && (
                <div className="flex justify-center mb-4">
                  <NextImageWrapper 
                    src={userData.profileImage} 
                    alt={userData.name || "Profile"} 
                    width={80} 
                    height={80} 
                    className="rounded-full"
                  />
                </div>
              )}
              
              {userData && (
                <div className="text-center mb-4">
                  <p className="text-lg font-medium text-gray-200">{userData.name}</p>
                  <p className="text-sm text-gray-400">{userData.email}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                <div className="font-mono text-sm text-purple-300">{formatAddress(account)}</div>
                <button 
                  onClick={() => navigator.clipboard.writeText(account)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-300"
                  title="Copy address"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-4">
              <div className="flex flex-col">
                <h3 className="text-lg mb-2 text-gray-200">Wallet</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-xl">
                  <div className="bg-purple-900 w-12 h-12 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-purple-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <div className="text-xl font-bold text-gray-100">Fuse Token</div>
                        <div className="text-gray-400">FUSE</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl text-gray-100">{balance || '0.0000'}</div>
                        <div className="text-gray-400">$0</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center mt-6">
              <button
                onClick={disconnectWallet}
                className="flex items-center justify-center gap-2 w-full p-4 border border-gray-600 rounded-xl hover:bg-gray-700 text-red-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Disconnect</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Web3AuthModal; 