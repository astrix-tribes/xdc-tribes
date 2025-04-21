# Tribes Platform Architecture

## System Overview

The Tribes platform is built using a modern web architecture with blockchain integration. The system is designed to be:

- **Scalable**: Able to handle growing user bases across multiple chains
- **Modular**: Components can be updated or replaced independently
- **Cross-Chain**: Works across multiple EVM-compatible blockchains
- **User-Friendly**: Abstracts blockchain complexity while preserving benefits

## Technology Stack

### Frontend

- **Next.js 15**: React framework with server-side rendering
- **React**: Component-based UI library
- **TypeScript**: Type-safe JavaScript superset
- **Tailwind CSS**: Utility-first CSS framework
- **ethers.js**: Ethereum library for blockchain interactions
- **viem**: Modern Ethereum library with TypeScript support
- **wagmi**: React hooks for Ethereum
- **Web3Auth**: Authentication service for social and wallet logins

### Backend

The platform uses a primarily decentralized architecture with blockchain as the backend:

- **Smart Contracts**: Solidity contracts deployed on EVM-compatible chains
- **IPFS** (planned): Decentralized storage for media content
- **The Graph** (planned): Indexing protocol for querying blockchain data

### Authentication

- **Web3Auth**: Provides social login with wallet creation
- **MetaMask**: Browser extension wallet integration
- **WalletConnect**: Protocol for connecting mobile wallets

## System Components

### Core Components

![Tribes Architecture Diagram](../public/architecture-diagram.png)

#### 1. Next.js Web Application

The user-facing application built with Next.js that includes:

- **Pages**: Route-based UI screens
- **Components**: Reusable UI elements
- **Context Providers**: State management
- **Hooks**: Custom logic for component functionality
- **Utilities**: Helper functions and services

#### 2. Blockchain Integration Layer

Handles interaction with multiple blockchain networks:

- **Provider Management**: Creating and maintaining connections to different chains
- **Contract Interfaces**: TypeScript wrappers for smart contract interactions
- **Transaction Handling**: Creating, signing, and monitoring blockchain transactions
- **Gas Optimization**: Strategies for efficient transaction execution

#### 3. Authentication System

Manages user identity and wallet connections:

- **Social Auth**: Integration with Web3Auth for social logins
- **Wallet Connectors**: Components for connecting various wallets
- **Session Management**: Maintaining authenticated sessions
- **Identity Linking**: Connecting social profiles with blockchain addresses

#### 4. Smart Contracts

On-chain logic deployed to multiple EVM-compatible blockchains:

- **TribeController**: Manages tribe creation and membership
- **PostMinter**: Handles post creation and interaction
- **ProfileRegistry**: Stores user profile information
- **EventManager**: Manages event creation and participation

### Data Flow

1. **User Authentication Flow**:
   - User authenticates via social login or wallet
   - Authentication system creates/retrieves wallet credentials
   - User session established with wallet connection
   - Profile data fetched from on-chain storage

2. **Content Creation Flow**:
   - User creates content in the web interface
   - Content formatted and prepared for on-chain storage
   - Transaction created and signed by user's wallet
   - Transaction confirmed and UI updated with new content

3. **Chain Switching Flow**:
   - User selects a different blockchain network
   - Wallet network switched (or user prompted to switch)
   - Cached data cleared for chain-specific content
   - New data fetched from selected chain
   - UI updated to reflect chain-specific content

## Cross-Chain Architecture

The platform's cross-chain functionality is implemented through:

### Chain-Specific Contracts

- **Identical Contracts**: Same contract code deployed on multiple chains
- **Chain-Specific Addresses**: Tracking contract addresses per chain
- **Deployment Scripts**: Tools for consistent multi-chain deployment

### Network Switching

- **Chain Detection**: Identifying current blockchain network
- **Provider Management**: Creating appropriate providers for each chain
- **Data Isolation**: Keeping chain-specific data separate
- **Cache Management**: Clearing and rebuilding caches on chain switch

### Data Consistency

- **Local Storage**: Caching data for performance
- **Chain-Specific Storage Keys**: Separating data by chain ID
- **Invalidation Strategies**: Rules for when to refresh data

## State Management

The application uses React Context API for state management:

### Key Contexts

- **ProfileContext**: User profile and authentication state
- **PostsContext**: Posts and tribes data management
- **EventsContext**: Event-related state and actions

### State Structure

Each context typically includes:

- **Data State**: Current data (posts, tribes, etc.)
- **Loading State**: Indicates when operations are in progress
- **Error State**: Captures and exposes errors
- **Action Methods**: Functions to modify state

## Security Considerations

### Wallet Security

- **No Private Key Storage**: Private keys never stored in the application
- **Delegated Signing**: Transactions crafted by the app but signed by wallets
- **Transaction Confirmation**: Clear confirmation steps for all blockchain actions

### Data Protection

- **Minimal On-Chain Data**: Only necessary data stored on blockchain
- **Content Verification**: Validation before on-chain storage
- **Access Controls**: Permission checks for sensitive operations

### User Privacy

- **Optional Social Linking**: Users can choose how to link identities
- **Configurable Privacy**: Control over profile visibility
- **Transparent Data Usage**: Clear explanations of how data is used

## Development Architecture

### Project Structure

```
/src
  /app            # Next.js app router pages
  /components     # Reusable UI components
  /context        # React context providers
  /utils          # Utility functions and helpers
    /contracts    # Contract interfaces
    /ethereum     # Blockchain utilities
  /constants      # Constants and configuration
  /abi            # Contract ABIs
  /styles         # Global styles
  /hooks          # Custom React hooks
  /types          # TypeScript type definitions
```

### Development Workflow

1. **Local Development**:
   - Next.js development server
   - Connection to testnet contracts
   - Hot module reloading

2. **Testing**:
   - Component testing with React Testing Library
   - Contract testing with Hardhat
   - End-to-end testing with Cypress

3. **Deployment**:
   - Static site generation with Next.js
   - Deployment to Vercel/Netlify
   - Contract deployment with Hardhat scripts

## Scalability Considerations

### Frontend Scalability

- **Static Generation**: Pre-rendered pages for performance
- **Edge Caching**: CDN distribution of static assets
- **Code Splitting**: Optimized bundle loading
- **Image Optimization**: Next.js image optimization

### Blockchain Scalability

- **Efficient Contract Design**: Minimized on-chain storage
- **Batch Operations**: Grouping transactions when possible
- **Gas Optimization**: Strategies to reduce transaction costs
- **Chain Selection**: Using appropriate chains for different needs

## Future Architecture Enhancements

### Planned Improvements

- **Decentralized Storage Integration**: IPFS for media content
- **Indexing Layer**: The Graph for efficient data queries
- **Cross-Chain Messaging**: Protocols for cross-chain content sharing
- **Layer 2 Integration**: Scaling solutions for reduced costs
- **Mobile Application**: Native mobile apps using the same backend

This architecture document provides a comprehensive overview of the Tribes platform's technical design, illustrating how the system combines modern web technologies with blockchain capabilities to create a cross-chain social experience. 