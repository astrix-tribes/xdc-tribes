'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../app/components/Web3AuthProvider';
import { useFuseBox } from './FuseBoxContext';
import TribeControllerABI from '../abi/TribeController.json';
import { getContractAddresses } from '../constants/contracts';
import {  XDC_MAINNET_ID } from '../constants/networks';
import ProfileNFTMinterABI from '../abi/ProfileNFTMinter.json';
import { safeContractCall } from '../utils/ethereum';
import EthereumRpc from '../utils/web3RPC';
import { SafeEventEmitterProvider } from '@web3auth/base';

// Profile metadata interface
export interface ProfileMetadata {
  name: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  socialLinks?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
  };
}

// Profile data interface
export interface ProfileData {
  tokenId: string;
  username: string;
  metadata: ProfileMetadata;
  owner: string;
}

interface ProfileContextType {
  profile: ProfileData | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
  createProfile: (name: string, metadata: string) => Promise<boolean>;
  updateProfile: (name: string, metadata: string) => Promise<boolean>;
  getSmartWalletBalance: () => Promise<string>;
  smartWalletAddress: string | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { account, isConnected, provider: web3AuthProvider } = useWallet();
  const { executeTransaction, getBalance, smartWalletAddress } = useFuseBox();
  
  // Fixed chainId for contract interactions
  const chainId = parseInt(XDC_MAINNET_ID, 16);
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize provider
  useEffect(() => {
    // First try to use Web3Auth provider if available
    if (web3AuthProvider && isConnected) {
      console.log("Using Web3Auth provider for ProfileContext");
      try {
        const ethersProvider = new ethers.BrowserProvider(web3AuthProvider as SafeEventEmitterProvider);
        setProvider(ethersProvider);
        
        // Fall back to window.ethereum if Web3Auth fails
        ethersProvider.getSigner().catch(err => {
          console.error('Error getting signer from Web3Auth:', err);
          fallbackToWindowEthereum();
        });
      } catch (error) {
        console.error("Error initializing Web3Auth provider in ProfileContext:", error);
        // Fall back to window.ethereum
        fallbackToWindowEthereum();
      }
    } else {
      // Fall back to window.ethereum if Web3Auth is not available
      fallbackToWindowEthereum();
    }
  }, [web3AuthProvider, isConnected]);

  const fallbackToWindowEthereum = async () => {
    console.log("inside the falback To windows",typeof window,window.ethereum)
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const ethersProvider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
        setProvider(ethersProvider);
      } catch (error: unknown) {
        console.error("Error initializing window.ethereum provider:", error);
        setProvider(null);
      }
    } else {
      console.error("No provider available in ProfileContext");
      setProvider(null);
    }
  };

  // Debug log to verify chain ID
  useEffect(() => {
    if (web3AuthProvider) {
      const rpc = new EthereumRpc(web3AuthProvider);
      rpc.getChainId().then(connectedChainId => {
        console.log(`ProfileContext - Connected chain ID: ${connectedChainId} (${parseInt(connectedChainId, 16)})`);
        console.log(`ProfileContext - Using chainId for contracts: ${chainId}`);
      }).catch(err => {
        console.error("Error getting chain ID in ProfileContext:", err);
      });
    }
  }, [web3AuthProvider]);

  // Get ProfileNFTMinter contract
  const getProfileNFTMinterContract = (provider: ethers.Provider) => {
    const addresses = getContractAddresses(chainId);
    return new ethers.Contract(addresses.PROFILE_NFT_MINTER, ProfileNFTMinterABI, provider);
  };

  // Parse metadata from string to object
  const parseMetadata = (metadataStr: string): ProfileMetadata => {
    try {
      return JSON.parse(metadataStr);
    } catch (e) {
      console.error('Error parsing profile metadata:', e);
      return { name: 'Unknown' };
    }
  };

  // Get profile by address
  const getProfileByAddress = async (address: string): Promise<ProfileData | null> => {
    if (!provider) return null;
    
    console.log(`Getting profile for address: ${address}`);
    try {
      const contract = getProfileNFTMinterContract(provider);
      
      // First check if the address has a profile NFT
      const balance = await safeContractCall<bigint>(
        contract,
        'balanceOf',
        address
      );
      
      console.log(`Profile NFT balance for ${address}: ${balance}`);
      
      if (!balance || balance === BigInt(0)) {
        console.log(`No profile found for address ${address}`);
        return null;
      }
      
      // Find the token ID by checking ownership
      let userTokenId: bigint | null = null;
      for (let i = 0; i < 10; i++) {
        try {
          const owner = await safeContractCall<string>(
            contract,
            'ownerOf',
            BigInt(i)
          );
          
          if (owner.toLowerCase() === address.toLowerCase()) {
            userTokenId = BigInt(i);
            break;
          }
        } catch {
          continue;
        }
      }
      
      if (userTokenId === null) {
        console.log(`Could not find token ID for address ${address}`);
        return null;
      }
      
      // Get profile data using token ID
      const result = await safeContractCall<[string, string, string]>(
        contract,
        'getProfileByTokenId',
        userTokenId
      );
      
      const [username, metadataStr] = result;
      const metadata = parseMetadata(metadataStr);
      
      console.log(`Found profile for ${address}: ${username}`);
      
      return {
        tokenId: userTokenId.toString(),
        username,
        metadata,
        owner: address
      };
    } catch (error) {
      console.error(`Error getting profile for ${address}:`, error);
      return null;
    }
  };

  // Refresh user's profile
  const refreshProfile = async () => {
    if (!provider || !account) {
      setProfile(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const userProfile = await getProfileByAddress(account);
      setProfile(userProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Check if a username already exists
  const checkUsername = async (username: string): Promise<boolean> => {
    if (!provider) return false;
    
    try {
      const contract = getProfileNFTMinterContract(provider);
      const exists = await safeContractCall<boolean>(
        contract,
        'usernameExists',
        username
      );
      
      return exists;
    } catch (error) {
      console.error(`Error checking username ${username}:`, error);
      return false;
    }
  };

  // Create a new profile
  const createProfile = async (name: string, metadata: string): Promise<boolean> => {
    if (!provider || !account) {
      console.error("Provider or account not initialized");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get contract addresses
      const addresses = getContractAddresses(chainId);
      if (!addresses) {
        throw new Error(`No contract addresses found for chain ID: ${chainId}`);
      }

      // Encode the function call
      const iface = new ethers.Interface(TribeControllerABI);
      const data = iface.encodeFunctionData("createProfile", [name, metadata]);

      // Execute transaction through FuseBox SDK
      const txHash = await executeTransaction(
        addresses.TRIBE_CONTROLLER,
        data,
        "0" // No value needed for profile creation
      );

      console.log("Profile creation transaction hash:", txHash);
      return true;
    } catch (err) {
      console.error("Error creating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to create profile");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile metadata
  const updateProfile = async (name: string, metadata: string): Promise<boolean> => {
    if (!provider || !account) {
      console.error("Provider or account not initialized");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get contract addresses
      const addresses = getContractAddresses(chainId);
      if (!addresses) {
        throw new Error(`No contract addresses found for chain ID: ${chainId}`);
      }

      // Encode the function call
      const iface = new ethers.Interface(TribeControllerABI);
      const data = iface.encodeFunctionData("updateProfile", [name, metadata]);

      // Execute transaction through FuseBox SDK
      const txHash = await executeTransaction(
        addresses.TRIBE_CONTROLLER,
        data,
        "0" // No value needed for profile update
      );

      console.log("Profile update transaction hash:", txHash);
      return true;
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to get smart wallet balance
  const getSmartWalletBalance = async (): Promise<string> => {
    try {
      return await getBalance();
    } catch (err) {
      console.error("Error getting smart wallet balance:", err);
      return "0";
    }
  };

  // Load profile on connection
  useEffect(() => {
    if (provider && account) {
      refreshProfile();
    }
  }, [provider, account]);

  const value = {
    profile,
    loading,
    error,
    isLoading,
    refreshProfile,
    checkUsername,
    createProfile,
    updateProfile,
    getSmartWalletBalance,
    smartWalletAddress,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}; 