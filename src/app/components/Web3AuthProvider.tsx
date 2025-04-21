'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from '@web3auth/base';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import EthereumRpc from '../../utils/web3RPC';
import { 
  XDC_MAINNET,
  XDC_MAINNET_ID
} from '../../constants/networks';
import { EthereumEventListener } from '../../utils/ethereum';
import { useFuseBox } from '../../context/FuseBoxContext';

// Get this from https://dashboard.web3auth.io
const clientId = "BI9Qml8CzWUHwoHFhte03VshPCiXx-tq4aSDjTYd9ru0xSl1g_VvWsofebOwGV7tlr0hdz0Mc6F3HGj0oHfhOIY";

// Chain ID for Fuse Spark Mainnet
const CHAIN_ID = XDC_MAINNET_ID;

// Converted to decimal for comparisons (122)
const CHAIN_ID_DECIMAL = parseInt(CHAIN_ID, 16);

// Known issue: Web3Auth sometimes connects to chain ID 290 instead of 122
// No need for a separate constant, we handle this in the code

interface UserData {
  name?: string;
  email?: string;
  profileImage?: string;
  typeOfLogin?: string;
  aggregateVerifier?: string;
  verifier?: string;
  verifierId?: string;
  dappShare?: string;
}

interface Web3AuthContextType {
  web3auth: Web3Auth | null;
  provider: SafeEventEmitterProvider | null;
  account: string;
  chainId: string;
  isConnected: boolean;
  isLoading: boolean;
  userData: UserData | null;
  balance: string;
  connectWallet: (loginProvider?: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: () => Promise<void>;
  getPrivateKey: () => Promise<string>;
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error('useWallet must be used within a Web3AuthProvider');
  }
  return context;
};

interface Web3AuthProviderProps {
  children: ReactNode;
}

export const Web3AuthProvider: React.FC<Web3AuthProviderProps> = ({ children }) => {
  const { initializeFuseBox, smartWalletAddress, getBalance } = useFuseBox();
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  const [account, setAccount] = useState<string>('');
  const [chainId, setChainId] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [balance, setBalance] = useState<string>('0');

  // Initialize Web3Auth - Avoiding ReactDOM.findDOMNode error with a more stable approach
  useEffect(() => {
    let isSubscribed = true;
    let web3authInstance: Web3Auth | null = null;

    const init = async () => {
      try {
        if (typeof window === 'undefined') return; // SSR check
        
        // Create Web3Auth instance with Fuse Spark configuration
        web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: "sapphire_devnet",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: CHAIN_ID,
            rpcTarget: "https://rpc.ankr.com/xdc",
            displayName: XDC_MAINNET.name,
            blockExplorer: XDC_MAINNET.blockExplorers.default.url,
            ticker: XDC_MAINNET.nativeCurrency.symbol,
            tickerName: XDC_MAINNET.nativeCurrency.name,
          },
          // Use simple UI configuration to avoid ReactDOM.findDOMNode error
          uiConfig: {
            theme: {
              primary: "#6366f1",
              gray: "#374151"
            },
            loginMethodsOrder: ["google", "facebook", "twitter", "email_passwordless"]
          }
        });

        // Configure OpenLogin adapter
        const openloginAdapter = new OpenloginAdapter({
          loginSettings: {
            mfaLevel: 'none',
          },
          adapterSettings: {
            network: 'sapphire_devnet',
            clientId,
            uxMode: 'popup',
          },
        });

        web3authInstance.configureAdapter(openloginAdapter);

        try {
          // Initialize modal with a simpler configuration
          await web3authInstance.initModal();
          
          if (isSubscribed) {
            setWeb3auth(web3authInstance);
            
            // Check if user is already connected
            if (web3authInstance.status === "connected" && web3authInstance.provider) {
              setProvider(web3authInstance.provider);
              setIsConnected(true);
              
              try {
                const user = await web3authInstance.getUserInfo();
                setUserData(user as UserData);
                
                const rpc = new EthereumRpc(web3authInstance.provider);
                const address = await rpc.getAccounts();
                setAccount(address);
                
                const chainIdResult = await rpc.getChainId();
                setChainId(chainIdResult);
                
                // Log chain ID to verify connection
                console.log(`Connected to chain ID: ${chainIdResult}`);
                console.log(`Expected chain ID: ${CHAIN_ID}`);
                console.log(`Using Fuse Mainnet RPC: ${XDC_MAINNET.rpcUrls.default.http[0]}`);
                
                const balanceResult = await rpc.getBalance();
                setBalance(balanceResult);

                // Initialize FuseBox SDK with the user's address if we have a persisted smart wallet
                const persistedSmartWallet = localStorage.getItem('smartWalletAddress');
                if (persistedSmartWallet) {
                  console.log("Found persisted smart wallet address:", persistedSmartWallet);
                  try {
                    await initializeFuseBox(address);
                    console.log("FuseBox SDK initialized successfully with persisted smart wallet");
                    
                    // Get smart wallet balance
                    try {
                      const smartWalletBalance = await getBalance();
                      setBalance(smartWalletBalance);
                      console.log("Smart wallet balance:", smartWalletBalance);
                    } catch (balanceError) {
                      console.error("Error getting smart wallet balance:", balanceError);
                    }
                  } catch (fuseError) {
                    console.error("Error initializing FuseBox SDK with persisted smart wallet:", fuseError);
                  }
                }
              } catch (err) {
                console.error("Error getting user details:", err);
              }
            }
          }
        } catch (modalError) {
          console.error("Error initializing modal:", modalError);
        }
        
        if (isSubscribed) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    init();

    // Cleanup function
    return () => {
      isSubscribed = false;
      // Additional cleanup if needed
      if (web3authInstance && web3authInstance.status === "connected") {
        try {
          // Proper cleanup to avoid ReactDOM issues on re-render
          web3authInstance.clearCache();
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }
    };
  }, []);

  const connectWallet = async (loginProvider?: string) => {
    if (!web3auth) {
      console.log("Web3Auth not initialized yet");
      return;
    }

    try {
      setIsLoading(true);
      
      // Handle MetaMask connection
      if (loginProvider === 'metamask') {
        // Check if MetaMask is installed
        if (typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask) {
          try {
            // Request accounts directly from MetaMask
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
            
            if (accounts && accounts.length > 0) {
              setAccount(accounts[0]);
              setIsConnected(true);
              
              // Get chain ID
              const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
              setChainId(chainId);
              
              console.log(`Connected to MetaMask on chain: ${chainId}`);
              console.log(`Expected chain ID: ${CHAIN_ID}`);
              
              // If not on the correct network, switch to it
              if (chainId !== CHAIN_ID) {
                try {
                  await switchNetwork();
                } catch (switchError) {
                  console.error("Error switching network:", switchError);
                }
              }
              
              // Get balance
              const balanceWei = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [accounts[0], 'latest'],
              }) as string;
              
              // Convert balance from wei to ether
              const balanceEth = (parseInt(balanceWei, 16) / 1e18).toFixed(4);
              setBalance(balanceEth);
              
              // Initialize FuseBox SDK with the user's address
              try {
                const res = await initializeFuseBox(accounts[0]);
                console.log("FuseBox SDK initialized successfully", res);
              } catch (fuseError) {
                console.error("Error initializing FuseBox SDK:", fuseError);
              }
              
              // Set up event listeners for account and chain changes
              const handleAccountsChanged = ((newAccounts: unknown) => {
                const accounts = newAccounts as string[];
                if (accounts.length === 0) {
                  // User disconnected their wallet
                  disconnectWallet();
                } else {
                  setAccount(accounts[0]);
                  // Reinitialize FuseBox SDK with new address
                  initializeFuseBox(accounts[0]).catch(console.error);
                }
              }) as EthereumEventListener;
              
              const handleChainChanged = ((newChainId: unknown) => {
                setChainId(newChainId as string);
                console.log(`Chain changed to: ${newChainId}`);
              }) as EthereumEventListener;
              
              window.ethereum.on('accountsChanged', handleAccountsChanged);
              window.ethereum.on('chainChanged', handleChainChanged);
              
              setIsLoading(false);
              return;
            }
          } catch (metamaskError) {
            console.error("MetaMask connection error:", metamaskError);
            setIsLoading(false);
            return;
          }
        } else {
          // MetaMask not installed, show install prompt
          window.open('https://metamask.io/download/', '_blank');
          setIsLoading(false);
          return;
        }
      }
      
      // Handle social login through Web3Auth
      if (loginProvider) {
        // Original Web3Auth connection flow for other providers
        let web3authProvider;
        try {
          web3authProvider = await web3auth.connectTo("openlogin", { loginProvider });
        } catch (connectionError) {
          console.error("Connection error:", connectionError);
          setIsLoading(false);
          return;
        }
        
        if (web3authProvider) {
          setProvider(web3authProvider);
          setIsConnected(true);
          
          try {
            const user = await web3auth.getUserInfo();
            setUserData(user as UserData);
            
            const rpc = new EthereumRpc(web3authProvider);
            const address = await rpc.getAccounts();
            setAccount(address);
            
            const chainIdResult = await rpc.getChainId();
            setChainId(chainIdResult);
            
            // Debug logging
            console.log(`Connected to chain ID: ${chainIdResult}`);
            console.log(`Chain ID decimal: ${parseInt(chainIdResult, 16)}`);
            console.log(`Expected chain ID: ${CHAIN_ID} (${CHAIN_ID_DECIMAL})`);
            console.log(`Using Fuse Mainnet RPC: ${XDC_MAINNET.rpcUrls.default.http[0]}`);
            
            // Initialize FuseBox SDK with the user's address
            try {
              await initializeFuseBox(address);
              console.log("FuseBox SDK initialized successfully for social login");
              
              // Wait for smart wallet to be ready
              if (smartWalletAddress) {
                console.log("Using smart wallet address as main account:", smartWalletAddress);
                setAccount(smartWalletAddress);
                
                // Get smart wallet balance
                try {
                  const smartWalletBalance = await getBalance();
                  setBalance(smartWalletBalance);
                  console.log("Smart wallet balance:", smartWalletBalance);
                } catch (balanceError) {
                  console.error("Error getting smart wallet balance:", balanceError);
                }
              } else {
                console.error("Smart wallet address not available after initialization");
              }
            } catch (fuseError) {
              console.error("Error initializing FuseBox SDK for social login:", fuseError);
            }
            
            // Explicit handling for network #290
            const chainIdDecimal = parseInt(chainIdResult, 16);
            if (chainIdDecimal === 290) {
              console.log("Connected to Web3Auth's default network (290) - This is the Fuse Mainnet despite the ID mismatch");
              // This is actually Fuse Network despite the ID mismatch
              // No need to switch networks
            }
            // Otherwise check if we need to switch networks
            else if (chainIdResult.toLowerCase() !== CHAIN_ID.toLowerCase()) {
              console.log(`Connected to wrong network. Expected: ${CHAIN_ID}, Got: ${chainIdResult}`);
              try {
                await switchNetwork();
              } catch (switchError) {
                console.error("Error switching network:", switchError);
              }
            }
            
            const balanceResult = await rpc.getBalance();
            setBalance(balanceResult);
          } catch (err) {
            console.error("Error getting user details after connection:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
    setIsLoading(false);
  };

  const disconnectWallet = async () => {
    if (!web3auth) {
      console.log("Web3Auth not initialized yet");
      return;
    }

    try {
      await web3auth.logout();
      setProvider(null);
      setAccount('');
      setChainId('');
      setIsConnected(false);
      setUserData(null);
      setBalance('');
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const switchNetwork = async () => {
    if (!provider) {
      console.log("Provider not initialized yet");
      return;
    }

    try {
      // Check if this is a direct MetaMask connection
      const isDirectMetaMask = typeof window !== 'undefined' && 
                             window.ethereum && 
                             window.ethereum.isMetaMask;

      // Log the chain details for debugging
      console.log("Attempting to switch to network with chainId:", CHAIN_ID);
      console.log("Network details:", XDC_MAINNET);
      
      if (isDirectMetaMask && window.ethereum) {
        // For direct MetaMask connection, use window.ethereum directly
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: CHAIN_ID }],
          });
          
          // Update chain ID after switch
          const newChainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
          setChainId(newChainId);
          console.log(`Network switched to: ${newChainId} (using MetaMask)`);
          
          // Refresh balance after network switch
          if (account) {
            const balanceWei = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [account, 'latest'],
            }) as string;
            const balanceEth = (parseInt(balanceWei, 16) / 1e18).toFixed(4);
            setBalance(balanceEth);
          }
          
          return;
        } catch (error) {
          // Define error interface
          interface MetaMaskError extends Error {
            code: number;
          }
          
          // If chain doesn't exist, try to add it
          const metamaskError = error as MetaMaskError;
          if (metamaskError && metamaskError.code === 4902) {
            console.log("Chain not found in MetaMask, attempting to add it");
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: CHAIN_ID,
                    chainName: XDC_MAINNET.name,
                    nativeCurrency: {
                      name: XDC_MAINNET.nativeCurrency.name,
                      symbol: XDC_MAINNET.nativeCurrency.symbol,
                      decimals: XDC_MAINNET.nativeCurrency.decimals
                    },
                    rpcUrls: [XDC_MAINNET.rpcUrls.default.http[0]],
                    blockExplorerUrls: [XDC_MAINNET.blockExplorers.default.url]
                  },
                ],
              });
              
              // Try switching again after adding
              await switchNetwork();
            } catch (addError) {
              console.error("Error adding chain to MetaMask:", addError);
              throw addError;
            }
          } else {
            console.error("Error switching network in MetaMask:", error);
            throw error;
          }
        }
      }
      
      // Default Web3Auth provider approach for other providers
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_ID }],
      });
      
      // Update chain ID
      if (provider) {
        const rpc = new EthereumRpc(provider);
        const newChainId = await rpc.getChainId();
        setChainId(newChainId);
        
        console.log(`Network switched to: ${newChainId} (${XDC_MAINNET.name})`);
        
        // Refresh balance after network switch
        const newBalance = await rpc.getBalance();
        setBalance(newBalance);
      }
    } catch (error) {
      console.error("Error switching network:", error);
      
      // Define a proper error type with code property
      interface EthereumRpcError extends Error {
        code: number;
        data?: unknown;
      }
      
      // If chain doesn't exist, try to add it
      if (error && (error as EthereumRpcError).code === 4902) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: CHAIN_ID,
                chainName: XDC_MAINNET.name,
                nativeCurrency: {
                  name: XDC_MAINNET.nativeCurrency.name,
                  symbol: XDC_MAINNET.nativeCurrency.symbol,
                  decimals: XDC_MAINNET.nativeCurrency.decimals
                },
                rpcUrls: [XDC_MAINNET.rpcUrls.default.http[0]],
                blockExplorerUrls: [XDC_MAINNET.blockExplorers.default.url]
              },
            ],
          });
          
          // Try switching again after adding
          await switchNetwork();
        } catch (addError) {
          console.error("Error adding chain:", addError);
          throw addError;
        }
      } else {
        throw error;
      }
    }
  };

  const getPrivateKey = async (): Promise<string> => {
    if (!provider) {
      throw new Error("Provider not initialized");
    }
    
    try {
      const rpc = new EthereumRpc(provider);
      return await rpc.getPrivateKey();
    } catch (error) {
      console.error("Error getting private key:", error);
      throw error;
    }
  };

  return (
    <Web3AuthContext.Provider
      value={{
        web3auth,
        provider,
        account,
        chainId,
        isConnected,
        isLoading,
        userData,
        balance,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        getPrivateKey,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
};