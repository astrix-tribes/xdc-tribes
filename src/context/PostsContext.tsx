'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../app/components/Web3AuthProvider';
import { Post, getAllPosts, createTextPost, createImagePost } from '../utils/contracts/postMinter';
import { 
  Tribe, 
  getAllTribes, 
  createTribe, 
  joinTribe, 
  getTribeControllerContract, 
  JoinType,
  rejectMember,
  getNextTribeId
} from '../utils/contracts/tribeController';
import {  XDC_MAINNET_DECIMAL } from '../constants/networks';
import { safeContractCall } from '../utils/ethereum';

interface PostsContextType {
  // Posts
  posts: Post[];
  loading: boolean;
  error: string | null;
  tribesCount: number;
  
  // Tribes
  tribes: Tribe[];
  tribesLoading: boolean;
  tribesError: string | null;

  // Actions
  refreshPosts: () => Promise<void>;
  refreshTribes: () => Promise<void>;
  createNewTextPost: (tribeId: string, title: string, content: string) => Promise<void>;
  createNewImagePost: (tribeId: string, title: string, content: string, imageUrl: string) => Promise<void>;
  createNewTribe: (name: string, description: string, joinType?: JoinType) => Promise<void>;
  joinExistingTribe: (tribeId: string) => Promise<void>;
  leaveTribe: (tribeId: string) => Promise<void>;
  checkTribeMembership: (tribeId: string, address: string) => Promise<boolean>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const usePosts = () => {
  const context = useContext(PostsContext);
  console.log("the context ....",context)
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};

interface PostsProviderProps {
  children: ReactNode;
}

export const PostsProvider: React.FC<PostsProviderProps> = ({ children }) => {
  const { account, isConnected, provider: web3AuthProvider } = useWallet();
  
  // Fixed chainId for contract interactions
  const chainId = XDC_MAINNET_DECIMAL;
  
  // Setup provider and signer
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tribesCount, setTribeCount] = useState<number>(0);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [tribesLoading, setTribesLoading] = useState(true);
  const [tribesError, setTribesError] = useState<string | null>(null);

  // Initialize provider and signer
  useEffect(() => {
    const initializeProvider = async () => {
      if (web3AuthProvider && isConnected) {
        try {
          const ethersProvider = new ethers.BrowserProvider(web3AuthProvider);
          setProvider(ethersProvider);
          
          const ethersSigner = await ethersProvider.getSigner();
          setSigner(ethersSigner);
        } catch (error) {
          console.error("Error initializing Web3Auth provider:", error);
          // Fall back to window.ethereum
          fallbackToWindowEthereum();
        }
      } else {
        // Fall back to window.ethereum if Web3Auth is not available
        fallbackToWindowEthereum();
      }
    };

    const fallbackToWindowEthereum = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);
          
          if (isConnected && account) {
            const ethersSigner = await ethersProvider.getSigner();
            setSigner(ethersSigner);
          } else {
            setSigner(null);
          }
        } catch (error) {
          console.error("Error initializing window.ethereum provider:", error);
          setProvider(null);
          setSigner(null);
        }
      } else {
        setProvider(null);
        setSigner(null);
      }
    };

    initializeProvider();
  }, [isConnected, account, web3AuthProvider]);

  // Fetch all tribes
  const refreshTribes = async () => {
    if (!provider) return;
    
    setTribesLoading(true);
    setTribesError(null);
    
    try {
      const alltribes = await getNextTribeId(provider, chainId);
      setTribeCount(alltribes);
      const fetchedTribes = await getAllTribes(provider, chainId);
      setTribes(fetchedTribes);
    } catch (err) {
      console.error('Error fetching tribes:', err);
      setTribesError('Failed to load tribes');
    } finally {
      setTribesLoading(false);
    }
  };

  // Fetch all posts from all tribes
  const refreshPosts = async () => {
    if (!provider || tribesCount === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const totalTribes = await getNextTribeId(provider, chainId);
      //remove
      const tribeIds = [];
      for (let i=0; i<=totalTribes; i++){
        tribeIds.push(i.toString());
      }
      const fetchedPosts = await getAllPosts(provider, chainId, tribeIds);
      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Create a new text post
  const createNewTextPost = async (tribeId: string, title: string, content: string) => {
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      await createTextPost(signer, chainId, tribeId, title, content);
      console.log('Text post created successfully');
      await refreshPosts();
    } catch (err) {
      console.error('Error creating text post:', err);
      throw err;
    }
  };

  // Create a new image post
  const createNewImagePost = async (tribeId: string, title: string, content: string, imageUrl: string) => {
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      await createImagePost(signer, chainId, tribeId, title, content, imageUrl);
      await refreshPosts();
    } catch (err) {
      console.error('Error creating image post:', err);
      throw err;
    }
  };

  // Create a new tribe
  const createNewTribe = async (name: string, description: string) => {
    if (!signer || !isConnected || !provider) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setTribesLoading(true);
      await createTribe(signer, chainId, name, description);
      
      // Force a refresh of the tribes list
      const alltribes = await getNextTribeId(provider, chainId);
      setTribeCount(alltribes);
      const fetchedTribes = await getAllTribes(provider, chainId);
      setTribes(fetchedTribes);
    } catch (err) {
      console.error('Error creating tribe:', err);
      setTribesError('Failed to create tribe');
      throw err;
    } finally {
      setTribesLoading(false);
    }
  };

  // Join an existing tribe
  const joinExistingTribe = async (tribeId: string) => {
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      await joinTribe(signer, chainId, tribeId);
    } catch (err) {
      console.error('Error joining tribe:', err);
      throw err;
    }
  };

  // Leave a tribe
  const leaveTribe = async (tribeId: string) => {
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      await rejectMember(signer, chainId, tribeId);
      
      // Refresh tribes data after leaving
      await refreshTribes();
    } catch (err) {
      console.error('Error leaving tribe:', err);
      throw err;
    }
  };

  // Check tribe membership
  const checkTribeMembership = async (tribeId: string, address: string) => {
    if (!provider) {
      throw new Error('Provider not available');
    }
    
    try {
      const contract = getTribeControllerContract(provider, chainId);
      return await safeContractCall<boolean>(contract, 'isMember', tribeId, address);
    } catch (err) {
      console.error('Error checking tribe membership:', err);
      throw err;
    }
  };

  // Initial load
  useEffect(() => {
    if (provider) {
      refreshTribes();
    }
  }, [provider]);

  // Load posts after tribes are loaded
  useEffect(() => {
    if (provider && tribes.length > 0) {
      refreshPosts();
    }
  }, [provider, tribes.length]);

  const value = {
    posts,
    loading,
    error,
    tribes,
    tribesLoading,
    tribesError,
    tribesCount,
    refreshPosts,
    refreshTribes,
    createNewTextPost,
    createNewImagePost,
    createNewTribe,
    joinExistingTribe,
    leaveTribe,
    checkTribeMembership,
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}; 