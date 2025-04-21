# Authentication

This document provides information about the authentication system used in the Tribes platform.

## Overview

Tribes uses a hybrid authentication system that combines Web3 wallet-based authentication with traditional social login options. This approach makes the platform accessible to both blockchain enthusiasts and mainstream users who may not be familiar with cryptocurrency wallets.

## Authentication Methods

### Social Login

- **Google**: Sign in with existing Google accounts
- **Facebook**: Connect using Facebook credentials
- **Twitter**: Authenticate with Twitter accounts
- **Email Passwordless**: Login with email verification (no password required)

Social logins are implemented through Web3Auth's OpenLogin, which creates and manages a blockchain wallet on behalf of the user. This allows users to interact with the blockchain without having to manage a seed phrase or private key.

### Wallet Connection

- **MetaMask**: Connect with the popular browser extension wallet
- **WalletConnect**: Use mobile wallets through QR code scanning

Direct wallet connections provide more control for users who already have wallets and are familiar with Web3 technologies. These connections use the standard Ethereum provider interface.

## Authentication Flow

The authentication flow in Tribes follows these steps:

### Social Login Flow

1. **Initiation**: User clicks on a social login option in the Web3AuthModal component
2. **Provider Authentication**: 
   - User is redirected to the selected provider's authentication page
   - User grants permission to the application
3. **Wallet Creation**: 
   - Web3Auth creates or retrieves an Ethereum wallet for the user
   - A private key is derived from the social authentication
   - The private key is encrypted and stored securely by Web3Auth
4. **Session Establishment**:
   - A wallet provider is created in the application
   - The user's wallet address is retrieved
   - A session is established in the application
5. **Profile Check**:
   - The application checks if the user has an existing profile on the current blockchain
   - If no profile exists, the user is prompted to create one
   - If a profile exists, the user is directed to the dashboard

```javascript
// Example social login flow implementation
const handleSocialLogin = async (provider) => {
  try {
    // Initialize Web3Auth with configuration
    const web3auth = new Web3Auth({
      clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
      chainConfig: {
        chainId: `0x${chainId.toString(16)}`,
        chainNamespace: "eip155",
        rpcTarget: rpcUrl
      }
    });
    
    await web3auth.initModal();
    
    // Connect with the selected provider
    const web3authProvider = await web3auth.connect(provider);
    
    // Create an Ethereum provider
    const ethersProvider = new ethers.BrowserProvider(web3authProvider);
    
    // Get the signer and address
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();
    
    // Check for existing profile
    const hasProfile = await checkProfileExists(address);
    
    // Store auth state
    localStorage.setItem('tribes_auth_state', JSON.stringify({
      address,
      chainId,
      authType: 'social',
      provider,
      timestamp: Date.now()
    }));
    
    // Navigate based on profile existence
    if (hasProfile) {
      navigate('/dashboard');
    } else {
      navigate('/create-profile');
    }
  } catch (error) {
    console.error('Social login error:', error);
    setAuthError(error.message);
  }
};
```

### Wallet Connection Flow

1. **Initiation**: User clicks on a wallet connection option (MetaMask, WalletConnect)
2. **Wallet Prompt**:
   - The wallet extension or app shows a connection request
   - User approves the connection
3. **Address Access**:
   - The application requests access to the user's wallet addresses
   - Wallet provides the address upon user approval
4. **Chain Verification**:
   - The application checks if the wallet is connected to a supported blockchain
   - If not, it prompts the user to switch networks
5. **Profile Check**:
   - Same profile verification as with social login
   - Profile creation or dashboard navigation based on result

```javascript
// Example wallet connection flow implementation
const connectWallet = async (walletType) => {
  try {
    let walletProvider;
    let address;
    
    if (walletType === 'metamask') {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      address = accounts[0];
      walletProvider = window.ethereum;
    } else if (walletType === 'walletconnect') {
      // Initialize WalletConnect
      const walletConnectProvider = new WalletConnectProvider({
        rpc: supportedNetworks.reduce((acc, network) => {
          acc[network.chainId] = network.rpcUrl;
          return acc;
        }, {})
      });
      
      // Enable session (triggers QR Code modal)
      await walletConnectProvider.enable();
      address = walletConnectProvider.accounts[0];
      walletProvider = walletConnectProvider;
    }
    
    // Check current network
    const chainIdHex = await walletProvider.request({ method: 'eth_chainId' });
    const walletChainId = parseInt(chainIdHex, 16);
    
    // Switch network if needed
    if (!supportedChainIds.includes(walletChainId)) {
      await switchToSupportedNetwork(walletProvider);
    }
    
    // Profile check and navigation
    const hasProfile = await checkProfileExists(address);
    
    // Store auth state
    localStorage.setItem('tribes_auth_state', JSON.stringify({
      address,
      chainId: walletChainId,
      authType: 'wallet',
      walletType,
      timestamp: Date.now()
    }));
    
    if (hasProfile) {
      navigate('/dashboard');
    } else {
      navigate('/create-profile');
    }
  } catch (error) {
    console.error('Wallet connection error:', error);
    setAuthError(error.message);
  }
};
```

## Security Considerations

The Tribes authentication system implements several security measures:

### Private Key Management

- **Social Login**: Private keys are managed by Web3Auth with industry-standard encryption
- **Wallet Connection**: Private keys never leave the user's wallet
- **No Backend Storage**: Tribes never stores private keys on servers

### Session Security

- **Local Storage**: Authentication state is stored in localStorage with encryption
- **Session Expiry**: Sessions expire after a configurable period (default: 24 hours)
- **Chain ID Validation**: Sessions are bound to specific blockchain networks
- **Connection Monitoring**: Active monitoring for wallet disconnections or changes

### Transaction Signing

- **Explicit Approval**: All blockchain transactions require explicit user approval
- **Clear Transaction Info**: Transaction details are clearly displayed before signing
- **Gas Estimation**: Users are informed of estimated gas costs before actions
- **Error Handling**: Comprehensive error handling for failed transactions

### User Privacy

- **Minimal Data Collection**: Only essential data is collected during authentication
- **Optional Profile Information**: Users control what profile data they share
- **Transparent Data Usage**: Clear documentation on how data is used
- **Social Account Linking**: Optional linking of social accounts

```javascript
// Example of secure transaction handling
const secureTransactionExecution = async (transactionFunction, params) => {
  try {
    // Clear any previous errors
    setTransactionError(null);
    
    // Start loading state
    setTransactionPending(true);
    
    // Estimate gas to inform user
    const gasEstimate = await transactionFunction.estimateGas(...params);
    
    // Get user confirmation with gas information
    const userConfirmed = await confirmTransaction({
      description: `This action will require approximately ${ethers.utils.formatUnits(gasEstimate, 'gwei')} gwei in gas fees.`,
      actionName: transactionFunction.name
    });
    
    if (!userConfirmed) {
      // User rejected the transaction
      setTransactionPending(false);
      return null;
    }
    
    // Execute the transaction
    const transaction = await transactionFunction(...params);
    
    // Wait for confirmation
    const receipt = await transaction.wait();
    
    // Transaction successful
    setTransactionPending(false);
    return receipt;
  } catch (error) {
    // Handle errors
    setTransactionPending(false);
    
    // Parse error to user-friendly message
    const userErrorMessage = parseTransactionError(error);
    setTransactionError(userErrorMessage);
    
    console.error('Transaction error:', error);
    return null;
  }
};
```

## Integration Guide

To integrate with the Tribes authentication system:

### Prerequisites

1. Set up Web3Auth:
   - Create a Web3Auth account at https://web3auth.io/
   - Create a project and get client ID
   - Configure allowed domains and redirect URLs

2. Configure environment variables:
   ```
   NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_client_id
   NEXT_PUBLIC_SUPPORTED_CHAINS=1264453517,10143,88888,3441006,421614
   ```

### Component Integration

1. Import the authentication context:
   ```javascript
   import { useAuth } from '../context/AuthContext';
   ```

2. Use the authentication hooks in your components:
   ```javascript
   const MyComponent = () => {
     const { 
       isAuthenticated, 
       address, 
       connectWallet, 
       disconnectWallet, 
       authError
     } = useAuth();
     
     // Component logic using auth state
     return (
       <div>
         {isAuthenticated ? (
           <button onClick={disconnectWallet}>Disconnect</button>
         ) : (
           <button onClick={() => connectWallet()}>Connect</button>
         )}
         {authError && <p className="error">{authError}</p>}
       </div>
     );
   };
   ```

3. Add the authentication modal:
   ```javascript
   import Web3AuthModal from '../components/Web3AuthModal';
   
   const MyPage = () => {
     const [isModalOpen, setIsModalOpen] = useState(false);
     
     return (
       <div>
         <button onClick={() => setIsModalOpen(true)}>
           Connect Wallet
         </button>
         
         <Web3AuthModal 
           isOpen={isModalOpen}
           onClose={() => setIsModalOpen(false)}
         />
       </div>
     );
   };
   ```

4. Access user data in protected components:
   ```javascript
   const ProtectedComponent = () => {
     const { profile, isLoadingProfile } = useAuth();
     
     if (isLoadingProfile) {
       return <LoadingSpinner />;
     }
     
     if (!profile) {
       return <Navigate to="/create-profile" />;
     }
     
     return (
       <div>
         <h1>Welcome, {profile.name}</h1>
         <img src={profile.profileImage} alt="Profile" />
       </div>
     );
   };
   ```

### Authentication Listeners

Set up event listeners to handle authentication state changes:

```javascript
useEffect(() => {
  // Handle MetaMask account changes
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else if (accounts[0] !== address) {
      // User switched accounts
      refreshSession(accounts[0]);
    }
  };

  // Handle chain changes
  const handleChainChanged = (chainIdHex) => {
    const newChainId = parseInt(chainIdHex, 16);
    
    if (!supportedChainIds.includes(newChainId)) {
      // Alert user they've switched to an unsupported network
      setAuthError('You have switched to an unsupported network.');
    } else {
      // Update chainId in the auth state
      updateChainId(newChainId);
    }
  };

  if (window.ethereum) {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
  }

  return () => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };
}, [address, disconnectWallet, refreshSession, updateChainId]);
```

The Tribes authentication system prioritizes security, user experience, and cross-chain compatibility, making it accessible to both crypto-native users and newcomers to blockchain technology. 