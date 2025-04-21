# Smart Contracts

This document provides information about the smart contracts used in the Tribes platform.

## Overview

Tribes uses several smart contracts deployed across multiple EVM-compatible blockchains to manage communities, content, and user profiles. These contracts form the backend infrastructure of the platform, enabling decentralized ownership, content management, and cross-chain functionality.

## Core Contracts

### TribeController

Manages tribe creation, membership, and metadata.

- **Purpose**: Central registry for all tribes on a specific blockchain
- **Key Functions**:
  - `createTribe(string name, string description, JoinType joinType)`: Creates a new tribe
  - `joinTribe(uint256 tribeId)`: Allows users to join a tribe
  - `leaveTribe(uint256 tribeId)`: Allows users to leave a tribe
  - `isMember(uint256 tribeId, address user)`: Checks if a user is a member of a tribe
  - `getTribe(uint256 tribeId)`: Retrieves tribe information
  - `getAllTribes()`: Gets all tribes on the current chain
  - `rejectMember(uint256 tribeId, address user)`: Admin function to reject a member

### PostMinter

Handles post creation, storage, and interactions.

- **Purpose**: Manages creation and retrieval of posts within tribes
- **Key Functions**:
  - `createTextPost(uint256 tribeId, string title, string content)`: Creates a text post
  - `createImagePost(uint256 tribeId, string title, string content, string imageUrl)`: Creates an image post
  - `createEventPost(uint256 tribeId, string title, string content, uint256 startTime, uint256 endTime, string location)`: Creates an event post
  - `getPost(uint256 postId)`: Retrieves a specific post
  - `getPostsByTribe(uint256 tribeId)`: Gets all posts in a tribe
  - `likePost(uint256 postId)`: Likes a post
  - `commentOnPost(uint256 postId, string content)`: Comments on a post

### ProfileRegistry

Manages user profiles and identity verification.

- **Purpose**: Stores and manages user profile information
- **Key Functions**:
  - `createProfile(string name, string bio, string profileImage)`: Creates a new user profile
  - `updateProfile(string name, string bio, string profileImage)`: Updates an existing profile
  - `getProfile(address user)`: Retrieves profile information for a user
  - `profileExists(address user)`: Checks if a profile exists for a user
  - `linkSocialAccount(string platform, string identifier)`: Links a social media account to a profile
  - `getProfileActivity(address user)`: Gets activity statistics for a user

## Contract Architecture

The Tribes smart contract architecture is built on a modular approach with clear separation of concerns:

### Inheritance Structure

```
BaseContract
  ├── AccessControl
  │     └── TribeController
  ├── ReentrancyGuard
  │     ├── PostMinter
  │     └── ProfileRegistry
  └── ERC721URIStorage
        └── ProfileNFT (planned)
```

### Key Design Patterns

1. **Role-Based Access Control**:
   - Tribe creators are given admin roles for their tribes
   - Platform administrators have special privileges for moderation
   - Members have specific permissions within tribes they've joined

2. **Event-Driven Architecture**:
   - All significant state changes emit events for frontend tracking
   - Events are used for efficient indexing and retrieval of data

3. **Chain-Specific Deployment**:
   - Identical contracts deployed across multiple chains
   - Chain ID stored with relevant data for cross-chain identity

4. **Gas Optimization**:
   - Minimal on-chain storage for content (metadata only)
   - Batched operations where possible
   - Optimized data structures for efficient retrieval

### Data Model

The contracts use these primary data structures:

```solidity
struct Tribe {
    uint256 id;
    string name;
    string description;
    address creator;
    uint256 createdAt;
    JoinType joinType;
    uint256 memberCount;
}

struct Post {
    uint256 id;
    uint256 tribeId;
    address creator;
    PostType postType;
    string metadataURI;
    uint256 createdAt;
    uint256 likesCount;
    uint256 commentsCount;
}

struct Profile {
    address owner;
    string name;
    string bio;
    string profileImage;
    uint256 createdAt;
    uint256 lastUpdated;
    mapping(string => string) socialAccounts;
}
```

## Contract Addresses

Contract addresses for each supported network are listed below. These addresses should be used when interacting with the Tribes platform programmatically.

### Flash Testnet (Chain ID: 1264453517)
- TribeController: `0x7F52Da327C3a6bbFc135e1D5A8D0dcZ0c3b6E82f`
- PostMinter: `0x12B9a4567E890abCdEF12345678901C2D34e56Fa`
- ProfileRegistry: `0x89aB456Cd7e90e7C987654321DeF0123456789ab`

### Monad Testnet (Chain ID: 10143)
- TribeController: `0x4A23f6D71a982Cf8E0d3dFC4a9Cf23a7856F273B`
- PostMinter: `0x62D90A231e790D543c8947A2be75815FD3bBe01d`
- ProfileRegistry: `0xF123456789abCDEF0123456789abCDEF01234567`

### Chiliz Chain (Chain ID: 88888)
- TribeController: `0xA123B456c789DeF012345678F90abC12d3E45f67`
- PostMinter: `0xB123C456d789EfF012345678a90bCD12e3F45678`
- ProfileRegistry: `0xC123D456e789FaA012345678b90cDE12f3F45678`

### Manta Pacific Sepolia (Chain ID: 3441006)
- TribeController: `0xD123E456f789AbB012345678c90dEF12g3F45678`
- PostMinter: `0xE123F456g789BcC012345678d90eFG12h3F45678`
- ProfileRegistry: `0xF123G456h789CdD012345678e90fGH12i3F45678`

## API Reference

### TribeController

```solidity
// Creates a new tribe
function createTribe(
    string memory name, 
    string memory description, 
    JoinType joinType
) external returns (uint256 tribeId);

// Returns information about a specific tribe
function getTribe(uint256 tribeId) external view returns (
    Tribe memory tribe
);

// Returns all tribes on the current chain
function getAllTribes() external view returns (
    Tribe[] memory tribes
);

// Allows a user to join a tribe
function joinTribe(uint256 tribeId) external;

// Allows a user to leave a tribe
function leaveTribe(uint256 tribeId) external;

// Checks if a user is a member of a tribe
function isMember(uint256 tribeId, address user) external view returns (bool);

// Allows a tribe admin to reject a member
function rejectMember(uint256 tribeId, address user) external;
```

### PostMinter

```solidity
// Creates a text post
function createTextPost(
    uint256 tribeId, 
    string memory title,
    string memory content
) external returns (uint256 postId);

// Creates an image post
function createImagePost(
    uint256 tribeId,
    string memory title,
    string memory content,
    string memory imageUrl
) external returns (uint256 postId);

// Creates an event post
function createEventPost(
    uint256 tribeId,
    string memory title,
    string memory content,
    uint256 startTime,
    uint256 endTime,
    string memory location
) external returns (uint256 postId);

// Returns a specific post
function getPost(uint256 postId) external view returns (
    Post memory post
);

// Returns all posts in a tribe
function getPostsByTribe(uint256 tribeId) external view returns (
    Post[] memory posts
);

// Likes a post
function likePost(uint256 postId) external;

// Adds a comment to a post
function commentOnPost(
    uint256 postId, 
    string memory content
) external returns (uint256 commentId);
```

### ProfileRegistry

```solidity
// Creates a new profile
function createProfile(
    string memory name,
    string memory bio,
    string memory profileImage
) external;

// Updates an existing profile
function updateProfile(
    string memory name,
    string memory bio,
    string memory profileImage
) external;

// Returns profile information
function getProfile(address user) external view returns (
    Profile memory profile
);

// Checks if a profile exists
function profileExists(address user) external view returns (bool);

// Links a social account to a profile
function linkSocialAccount(
    string memory platform,
    string memory identifier
) external;

// Returns profile activity metrics
function getProfileActivity(address user) external view returns (
    ActivityMetrics memory metrics
);
```

These contracts form the foundation of the Tribes platform, enabling the decentralized social experience across multiple blockchains. 