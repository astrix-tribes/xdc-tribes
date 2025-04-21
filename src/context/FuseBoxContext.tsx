'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ethers } from 'ethers';
import { FuseSDK } from '@fuseio/fusebox-web-sdk';

interface FuseBoxContextType {
  fuseSDK: FuseSDK | null;
  smartWalletAddress: string | null;
  isLoading: boolean;
  error: string | null;
  initializeFuseBox: (userAddress: string) => Promise<void>;
  getBalance: () => Promise<string>;
  transferFUSE: (to: string, amount: string) => Promise<string>;
  executeTransaction: (to: string, data: string, value: string) => Promise<string>;
}

const FuseBoxContext = createContext<FuseBoxContextType | undefined>(undefined);

export const useFuseBox = () => {
  const context = useContext(FuseBoxContext);
  if (!context) {
    throw new Error('useFuseBox must be used within a FuseBoxProvider');
  }
  return context;
};

interface FuseBoxProviderProps {
  children: ReactNode;
}

export const FuseBoxProvider: React.FC<FuseBoxProviderProps> = ({ children }) => {
  const [fuseSDK, setFuseSDK] = useState<FuseSDK | null>(null);
  const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('smartWalletAddress');
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update localStorage when smartWalletAddress changes
  useEffect(() => {
    if (smartWalletAddress) {
      localStorage.setItem('smartWalletAddress', smartWalletAddress);
    } else {
      localStorage.removeItem('smartWalletAddress');
    }
  }, [smartWalletAddress]);

  const initializeFuseBox = async (userAddress: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Get private key from environment variable
      const privateKey = process.env.NEXT_PUBLIC_FUSEBOX_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('FuseBox private key not found in environment variables');
      }

      // Initialize credentials with the private key
      const credentials = new ethers.Wallet(privateKey);
      
      // Initialize FuseSDK with API key and credentials
      const apiKey = 'pk_ibnKBaeo2aCvQjNa0nynuAoM';
      console.log('Initializing FuseSDK with API key:', apiKey);
      try {
        // TODO: The FuseSDK types are incomplete. We need to update them to properly
        // type the wallet and smart wallet methods. For now, we're using a type assertion
        // with a specific interface that matches the SDK's actual structure.
        interface FuseSDKWithWallet extends FuseSDK {
          wallet: {
            getSender: () => Promise<string>;
          } & FuseSDK['wallet'];
        }
        
        console.log('Getting smart wallet address for user:', userAddress);
        const sdk = await FuseSDK.init(apiKey, credentials) as FuseSDKWithWallet;
        console.log('FuseSDK initialized successfully');
        
        // Log available methods on SDK
        console.log('Available SDK methods:', Object.keys(sdk));
        
        // Get the smart wallet address
        const smartWalletAddress = await sdk.wallet.getSender();
        console.log('Smart wallet address retrieved:', smartWalletAddress);
        
        // Set the smart wallet address and SDK instance
        setSmartWalletAddress(smartWalletAddress);
        setFuseSDK(sdk);
        
        console.log('FuseBox SDK initialized successfully');
        console.log('Smart Wallet Address:', smartWalletAddress);
        console.log('User Address:', userAddress);
      } catch (error) {
        console.error('Error getting smart wallet address:', error);
        throw error;
      }
    } catch (err) {
      console.error('Error initializing FuseBox SDK:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize FuseBox SDK');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getBalance = async (): Promise<string> => {
    if (!fuseSDK || !smartWalletAddress) {
      throw new Error('FuseBox SDK not initialized');
    }

    try {
      // Get FUSE token balance (native token)
      const balance = await fuseSDK.explorerModule.getTokenBalance(
        '0x0000000000000000000000000000000000000000', // Native token address
        smartWalletAddress
      );
      
      // Convert from wei to FUSE
      return ethers.formatEther(balance);
    } catch (err) {
      console.error('Error getting balance:', err);
      throw err;
    }
  };

  const transferFUSE = async (to: string, amount: string): Promise<string> => {
    if (!fuseSDK) {
      throw new Error('FuseBox SDK not initialized');
    }

    try {
      // Convert amount to wei
      const amountWei = ethers.parseEther(amount);
      
      // Transfer FUSE (native token)
      const res = await fuseSDK.transferToken(
        '0x0000000000000000000000000000000000000000', // Native token address
        to,
        amountWei.toString()
      );

      console.log(`UserOpHash: ${res?.userOpHash}`);
      
      // Wait for transaction
      const receipt = await res?.wait();
      return receipt?.transactionHash || '';
    } catch (err) {
      console.error('Error transferring FUSE:', err);
      throw err;
    }
  };

  const executeTransaction = async (to: string, data: string, value: string): Promise<string> => {
    if (!fuseSDK) {
      throw new Error('FuseBox SDK not initialized');
    }

    try {
      // Convert value to wei
      const valueWei = ethers.parseEther(value);
      
      // Execute transaction
      const res = await fuseSDK.executeBatch([
        {
          to,
          value: valueWei,
          data: Uint8Array.from(Buffer.from(data.slice(2), 'hex'))
        }
      ]);

      console.log(`UserOpHash: ${res?.userOpHash}`);
      
      // Wait for transaction
      const receipt = await res?.wait();
      return receipt?.transactionHash || '';
    } catch (err) {
      console.error('Error executing transaction:', err);
      throw err;
    }
  };

  return (
    <FuseBoxContext.Provider
      value={{
        fuseSDK,
        smartWalletAddress,
        isLoading,
        error,
        initializeFuseBox,
        getBalance,
        transferFUSE,
        executeTransaction
      }}
    >
      {children}
    </FuseBoxContext.Provider>
  );
}; 