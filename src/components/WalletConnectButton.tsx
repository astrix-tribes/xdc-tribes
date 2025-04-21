'use client';

import React, { useState } from 'react';
import { useWallet } from '../app/components/Web3AuthProvider';
import NextImageWrapper from './NextImageWrapper';

interface WalletConnectButtonProps {
  className?: string;
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ className = '' }) => {
  const { connectWallet, isLoading, isConnected } = useWallet();
  const [showOptions, setShowOptions] = useState(false);

  const handleConnect = async (provider?: string) => {
    try {
      await connectWallet(provider);
      setShowOptions(false);
    } catch (error) {
      console.error("Error connecting:", error);
    }
  };

  const handleClick = () => {
    if (isConnected) {
      return; // Already connected
    }
    
    setShowOptions(!showOptions);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isLoading || isConnected}
        className={`flex items-center justify-center px-4 py-2 space-x-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 ${className}`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </>
        ) : isConnected ? (
          <span>Connected</span>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Connect Wallet</span>
          </>
        )}
      </button>

      {showOptions && !isConnected && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20 border border-gray-200 dark:border-gray-700">
          <div className="py-1">
            <button
              onClick={() => handleConnect('google')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              onClick={() => handleConnect('facebook')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            <button
              onClick={() => handleConnect('twitter')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.027 10.027 0 01-3.127 1.195A4.92 4.92 0 0012.034 8.09a13.958 13.958 0 01-10.13-5.138 4.917 4.917 0 001.524 6.57 4.884 4.884 0 01-2.23-.616v.06a4.926 4.926 0 003.95 4.827 4.912 4.912 0 01-2.224.085 4.93 4.93 0 004.6 3.42 9.868 9.868 0 01-6.115 2.108c-.398 0-.79-.023-1.175-.068a13.936 13.936 0 007.548 2.212c9.057 0 14.01-7.502 14.01-14.01 0-.213-.005-.425-.014-.636A10.008 10.008 0 0024 4.57h-.047z"/>
              </svg>
              Twitter
            </button>
            <button
              onClick={() => handleConnect('email_passwordless')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <button
              onClick={() => handleConnect()}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Web3Auth
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton; 