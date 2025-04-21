# API Reference

This document provides reference information for the APIs used in the Tribes platform.

## Overview

Tribes uses a combination of smart contract APIs and frontend utility functions to enable its functionality.

## Smart Contract APIs

### TribeController API

The TribeController smart contract manages all tribe-related operations:

#### Key Methods

```typescript
// Create a new tribe
createTribe(
  name: string,
  description: string,
  joinType: JoinType = JoinType.Open,
  entryFee: string = "0"
): Promise<TransactionReceipt>

// Join an existing tribe
joinTribe(
  tribeId: string
): Promise<TransactionReceipt>

// Leave a tribe
rejectMember(
  tribeId: string
): Promise<TransactionReceipt>

// Get tribe details
getTribeDetails(
  provider: ethers.Provider,
  chainId: number,
  tribeId: string
): Promise<Tribe | null>

// Get all tribes
getAllTribes(
  provider: ethers.Provider,
  chainId: number
): Promise<Tribe[]>

// Check if user is a member
isMemberOfTribe(
  provider: ethers.Provider,
  chainId: number,
  tribeId: string,
  address: string
): Promise<boolean>

// Get tribe member count
getTribeMemberCount(
  provider: ethers.Provider,
  chainId: number,
  tribeId: string
): Promise<number>
```

#### Data Structures

```typescript
// Enum for join types
enum JoinType {
  Open = 0,
  Approval = 1,
  Invite = 2,
  NFTGated = 3
}

// Interface for Tribe data
interface Tribe {
  id: string;
  name: string;
  description: string;
  joinType: JoinType;
  entryFee: string;
  memberCount: number;
  canMerge: boolean;
  admin?: string;
  isActive?: boolean;
}

// Interface for NFT requirement
interface NFTRequirement {
  contractAddress: string;
  tokenId: string;
}

// Interface for Tribe configuration
interface TribeConfig {
  joinType: JoinType;
  entryFee: string;
  nftRequirements: NFTRequirement[];
  canMerge: boolean;
}
```

### PostMinter API

The PostMinter smart contract manages content creation and retrieval:

#### Key Methods

```typescript
// Create a text post
createTextPost(
  signer: ethers.Signer,
  chainId: number,
  tribeId: string,
  title: string,
  content: string
): Promise<TransactionReceipt>

// Create an image post
createImagePost(
  signer: ethers.Signer,
  chainId: number,
  tribeId: string,
  title: string,
  content: string,
  imageUrl: string
): Promise<TransactionReceipt>

// Get all posts
getAllPosts(
  provider: ethers.Provider,
  chainId: number,
  tribeIds: string[]
): Promise<Post[]>
```

#### Data Structures

```typescript
// Interface for Post data
interface Post {
  id: string;
  tribeId: string;
  author: string;
  title: string;
  content: string;
  imageUrl?: string;
  timestamp: number;
  likes: number;
  comments: number;
  type: PostType;
}

// Enum for post types
enum PostType {
  Text = 0,
  Image = 1,
  Event = 2
}
```

### ProfileRegistry API

The ProfileRegistry smart contract manages user profiles:

#### Key Methods

```typescript
// Create a new profile
createProfile(
  signer: ethers.Signer,
  chainId: number,
  username: string,
  metadata: ProfileMetadata
): Promise<boolean>

// Update an existing profile
updateProfile(
  signer: ethers.Signer,
  chainId: number,
  metadata: ProfileMetadata
): Promise<boolean>

// Get profile information
getProfile(
  provider: ethers.Provider,
  chainId: number,
  address: string
): Promise<Profile | null>

// Check if a profile exists
profileExists(
  provider: ethers.Provider,
  chainId: number,
  address: string
): Promise<boolean>
```

#### Data Structures

```typescript
// Interface for Profile data
interface Profile {
  address: string;
  username: string;
  metadata: ProfileMetadata;
  creation: number;
  lastUpdate: number;
}

// Interface for Profile metadata
interface ProfileMetadata {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  coverImage?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    website?: string;
  };
}
```

## Frontend APIs

### Context APIs

The application uses React Context API for state management:

#### Web3AuthProvider

Manages authentication and wallet connections:

```typescript
// Context Hook
const useWallet = () => {
  // Returns wallet context
  return {
    isConnected: boolean;
    account: string | null;
    provider: any;
    balance: string;
    chainId: number;
    connect(): Promise<void>;
    disconnect(): void;
    switchNetwork(chainId: number): Promise<void>;
  }
}

// Provider Component
<Web3AuthProvider>
  <App />
</Web3AuthProvider>
```

#### PostsContext

Manages tribe and post data:

```typescript
// Context Hook
const usePosts = () => {
  // Returns posts context
  return {
    // Posts
    posts: Post[];
    loading: boolean;
    error: string | null;
    
    // Tribes
    tribes: Tribe[];
    tribesLoading: boolean;
    tribesError: string | null;

    // Actions
    refreshPosts(): Promise<void>;
    refreshTribes(): Promise<void>;
    createNewTextPost(tribeId: string, title: string, content: string): Promise<void>;
    createNewImagePost(tribeId: string, title: string, content: string, imageUrl: string): Promise<void>;
    createNewTribe(name: string, description: string, joinType?: JoinType): Promise<void>;
    joinExistingTribe(tribeId: string): Promise<void>;
    leaveTribe(tribeId: string): Promise<void>;
    checkTribeMembership(tribeId: string, address: string): Promise<boolean>;
  }
}

// Provider Component
<PostsProvider>
  <Component />
</PostsProvider>
```

#### ProfileContext

Manages user profile information:

```typescript
// Context Hook
const useProfile = () => {
  // Returns profile context
  return {
    profile: Profile | null;
    loading: boolean;
    error: string | null;
    createProfile(username: string, metadata: ProfileMetadata): Promise<boolean>;
    updateProfile(metadata: ProfileMetadata): Promise<boolean>;
    refreshProfile(): Promise<void>;
  }
}

// Provider Component
<ProfileProvider>
  <Component />
</ProfileProvider>
```

### Utility Functions

The platform includes various utility functions for common operations:

#### Ethereum Utilities

```typescript
// Safe contract call with better error handling
safeContractCall<T>(
  contract: ContractWithMethods,
  method: string,
  ...args: any[]
): Promise<T>

// Format wallet address for display
formatAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string

// Format date from timestamp
formatDate(
  timestamp: number,
  format: string = 'MMM DD, YYYY'
): string

// Get contract addresses based on chain ID
getContractAddresses(
  chainId: number
): {
  TRIBE_CONTROLLER: string;
  POST_MINTER: string;
  PROFILE_REGISTRY: string;
}
```

#### Content Utilities

```typescript
// Truncate long text
truncateText(
  text: string,
  maxLength: number = 100
): string

// Format markdown content
formatMarkdownContent(
  content: string
): React.ReactNode

// Validate image URL
validateImageUrl(
  url: string
): boolean

// Generate post preview
generatePostPreview(
  content: string,
  maxChars: number = 150
): string
```

### Hook APIs

The platform provides custom React hooks for common functionality:

#### useLocalStorage

```typescript
// Store and retrieve data from localStorage
const [value, setValue] = useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void]
```

#### useContractCall

```typescript
// Execute contract calls with loading and error states
const { data, loading, error, execute } = useContractCall<T>(
  contractFunction: (...args: any[]) => Promise<T>,
  dependencies: any[] = []
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
}
```

#### useChainSwitch

```typescript
// Handle chain switching with better UX
const { switchChain, isSupported, isSwitching, error } = useChainSwitch(): {
  switchChain: (chainId: number) => Promise<boolean>;
  isSupported: (chainId: number) => boolean;
  isSwitching: boolean;
  error: string | null;
}
```

#### useTribeMembership

```typescript
// Check and manage tribe membership
const { 
  isMember, 
  checkMembership, 
  joinTribe, 
  leaveTribe, 
  isLoading, 
  error 
} = useTribeMembership(
  tribeId: string
): {
  isMember: boolean;
  checkMembership: () => Promise<boolean>;
  joinTribe: () => Promise<boolean>;
  leaveTribe: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}
```

These APIs form the core functionality of the Tribes platform, enabling decentralized community creation and engagement. 