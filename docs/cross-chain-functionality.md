# Cross-Chain Functionality

One of the most distinctive features of the Tribes platform is its ability to operate across multiple EVM-compatible blockchains. This document explains how this cross-chain functionality works and how to leverage it effectively.

## Supported Networks

The Tribes platform currently supports the following blockchain networks:

| Network | Chain ID | Description |
|---------|----------|-------------|
| Flash Testnet | 1264453517 | High-performance EVM-compatible testnet |
| Monad Testnet | 10143 | Layer 1 blockchain with high throughput |
| Chiliz Chain | 88888 | Sports and entertainment blockchain |
| Manta Pacific Sepolia | 3441006 | Privacy-focused L2 testnet on Sepolia |
| Arbitrum Sepolia | 421614 | Layer 2 scaling solution testnet |
| Somnia Testnet | 50312 | Gaming-focused EVM-compatible testnet |
| Abstract Testnet | 11124 | Research-oriented blockchain testnet |

Additional networks may be added in future updates.

## Chain-Specific Content

### How Chain Specificity Works

In Tribes, content (posts, tribes, events) is chain-specific, meaning:

1. **Content Creation**: When you create content, it's created on the blockchain network you're currently connected to
2. **Content Visibility**: Content is only visible when you're connected to the same blockchain where it was created
3. **Data Isolation**: Each blockchain maintains its own separate data store

This design enables:

- Network-specific communities and discussions
- Targeted content for particular blockchain ecosystems
- Reduced cross-chain complexity
- Chain-optimized features and performance

### Technical Implementation

Chain specificity is implemented through:

1. **Smart Contract Deployment**: Identical contracts are deployed on each supported chain
2. **Chain ID Tracking**: The application tracks the current chain ID from the connected wallet
3. **Chain-Based Storage**: Local storage is partitioned by chain ID
4. **Cache Management**: Cache clearing when switching chains

## Network Switching

### User Interface

Users can switch networks through:

1. **Network Selector**: UI dropdown to select different chains
2. **Wallet Integration**: Direct switching through MetaMask or other wallets
3. **Automatic Detection**: Application detection of wallet network changes

### Switching Process

When a user switches networks, the following happens:

1. **Request Chain Switch**: Application requests the wallet to switch chains
   ```javascript
   await window.ethereum.request({
     method: 'wallet_switchEthereumChain',
     params: [{ chainId: `0x${chainId.toString(16)}` }]
   });
   ```

2. **Clear Chain-Specific Cache**: Remove cached data for the previous chain
   ```javascript
   localStorage.removeItem('tribes_posts_cache');
   localStorage.removeItem('tribes_current_posts');
   ```

3. **Update Auth State**: Update the chain ID in authentication state
   ```javascript
   const authState = localStorage.getItem('tribes_auth_state');
   if (authState) {
     const parsedState = JSON.parse(authState);
     parsedState.chainId = chainId;
     localStorage.setItem('tribes_auth_state', JSON.stringify(parsedState));
   }
   ```

4. **Fetch Fresh Data**: Retrieve content for the new chain
   ```javascript
   await fetchPostsForCurrentChain();
   ```

5. **Update UI**: Update interface to reflect chain-specific content

### Adding a New Network

Users can add unsupported networks:

```javascript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: `0x${network.chainId.toString(16)}`,
    chainName: network.name,
    nativeCurrency: {
      name: network.currencySymbol,
      symbol: network.currencySymbol,
      decimals: 18
    },
    rpcUrls: [network.rpcUrl],
    blockExplorerUrls: [network.blockExplorer]
  }]
});
```

## Data Management

### Chain-Specific Data Fetching

The platform fetches data based on the current chain:

```javascript
const fetchPostsForCurrentChain = async () => {
  if (address && chainId) {
    console.log(`Fetching feed for address: ${address} on chain: ${chainId}`);
    
    // Clear cache if chain changed
    if (lastFetchedChainId !== null && lastFetchedChainId !== chainId) {
      localStorage.removeItem('tribes_posts_cache');
    }
    
    try {
      await fetchFeed();
      setLastFetchedChainId(chainId);
    } catch (error) {
      console.error('Error fetching feed:', error);
    }
  }
};
```

### Chain-Specific Data Filtering

Content is filtered based on the current chain:

```javascript
const filteredFeedItems = useMemo(() => {
  if (!posts) return [];
  
  let items = Object.values(posts);
  
  // Filter posts by chain ID
  if (chainId) {
    items = items.filter(post => post.chainId === chainId);
  }
  
  // Additional filtering logic...
  
  return items;
}, [posts, chainId]);
```

## Contract Interactions

### Chain-Specific Contract Addresses

Contract addresses are tracked per chain:

```javascript
const getContractAddress = (contractName, chainId) => {
  const contractAddresses = {
    'TribeController': {
      '1264453517': '0x1234...',  // Flash Testnet
      '10143': '0x5678...',       // Monad Testnet
      // Other chains...
    },
    'PostMinter': {
      '1264453517': '0xabcd...',  // Flash Testnet
      '10143': '0xef01...',       // Monad Testnet
      // Other chains...
    },
    // Other contracts...
  };
  
  return contractAddresses[contractName][chainId];
};
```

### Creating Contract Instances

Contract instances are created based on the current chain:

```javascript
const getContract = (contractName, provider, chainId) => {
  const address = getContractAddress(contractName, chainId);
  const abi = getContractABI(contractName);
  
  return new ethers.Contract(address, abi, provider);
};
```

## User Experience Considerations

### Chain Switching UX

The platform provides several UX enhancements for chain switching:

1. **Clear Network Indicator**: Users always know which chain they're using
2. **Loading States**: Displayed during chain switching and data fetching
3. **Error Handling**: Helpful error messages for network switch failures
4. **Chain-Specific UI Themes**: Visual cues about the current network

### Common Chain Switching Issues

Users may encounter these issues when switching chains:

1. **Unsupported Network**: Wallet doesn't recognize the network
   - Solution: Offer to add the network to the wallet

2. **RPC Errors**: Network connection issues
   - Solution: Provide alternative RPC URLs or retry options

3. **Transaction Fees**: Different chains have different fee structures
   - Solution: Display estimated transaction costs before actions

## Multi-Chain Identity

### Cross-Chain Profile Handling

The platform manages user identity across chains:

1. **Single Authentication**: One login works across all chains
2. **Per-Chain Profiles**: Profile data specific to each chain
3. **Address Consistency**: Same wallet address across networks
4. **Network-Specific Reputation**: Activity metrics tracked per chain

### Profile Data Across Chains

```javascript
const fetchProfileForChain = async (address, chainId) => {
  const contract = getProfileRegistryContract(provider, chainId);
  try {
    const profile = await contract.getProfile(address);
    return {
      name: profile.name,
      bio: profile.bio,
      avatar: profile.avatar,
      chainId: chainId,
      // Other profile data...
    };
  } catch (error) {
    console.error(`Error fetching profile for chain ${chainId}:`, error);
    return null;
  }
};
```

## Developer Notes

### Implementing Chain-Aware Features

When developing new features, ensure they're chain-aware:

1. **Check Current Chain**: Always verify the current chain ID
   ```javascript
   if (chainId !== targetChainId) {
     // Prompt user to switch chains or handle accordingly
   }
   ```

2. **Chain-Specific Data Storage**: Store data with chain identifiers
   ```javascript
   const storeItem = (key, value, chainId) => {
     localStorage.setItem(`${key}_${chainId}`, JSON.stringify(value));
   };
   
   const getItem = (key, chainId) => {
     return JSON.parse(localStorage.getItem(`${key}_${chainId}`));
   };
   ```

3. **Clear Caches on Chain Switch**: Remove cached data when chains change
   ```javascript
   useEffect(() => {
     // Clear cache when chainId changes
     return () => {
       if (chainIdRef.current !== chainId) {
         clearCacheForChain(chainIdRef.current);
       }
       chainIdRef.current = chainId;
     };
   }, [chainId]);
   ```

### Testing Cross-Chain Features

To test cross-chain functionality:

1. **Multi-Network Testing**: Test on all supported networks
2. **Chain Switching Tests**: Verify behavior when switching chains
3. **Network Simulation**: Use local hardhat networks to simulate different chains
4. **Edge Cases**: Test behavior when networks are unavailable or have errors

## Future Enhancements

### Planned Cross-Chain Features

1. **Cross-Chain Messaging**: Allow messages between users on different chains
2. **Chain Bridging**: Bridge content between different blockchains
3. **Multi-Chain Actions**: Perform actions that span multiple chains
4. **Chain Analytics**: Metrics comparing activity across different networks

### Potential Challenges

1. **Chain Synchronization**: Keeping data consistent across chains
2. **Network Differences**: Handling varying capabilities and limitations
3. **Gas Costs**: Managing transaction costs on expensive networks
4. **Chain Reliability**: Handling network outages or congestion

## Summary

The cross-chain functionality of the Tribes platform provides a unique ability to create and engage with communities across multiple blockchain networks. This design enables specialized communities for different blockchain ecosystems while maintaining a unified user experience.