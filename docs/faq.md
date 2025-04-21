# Frequently Asked Questions (FAQ)

## General Questions

### What is Tribes?

Tribes is a decentralized social platform that enables users to create and join interest-based communities (tribes) across multiple blockchain networks. It combines traditional social media features with Web3 capabilities, allowing for community ownership, tokenized interactions, and blockchain-based content management.

### Which blockchains does Tribes support?

Tribes currently supports several EVM-compatible blockchains:

- Flash Testnet (Chain ID: 1264453517)
- Monad Testnet (Chain ID: 10143)
- Chiliz Chain (Chain ID: 88888)
- Manta Pacific Sepolia Testnet (Chain ID: 3441006)
- Arbitrum Sepolia Testnet (Chain ID: 421614)
- Somnia Testnet (Chain ID: 50312)
- Abstract Testnet (Chain ID: 11124)

Support for additional networks will be added in future updates.

### Do I need a cryptocurrency wallet to use Tribes?

No, you don't necessarily need to have a pre-existing cryptocurrency wallet. Tribes offers two authentication options:

1. **Social Login**: You can sign in using Google, Facebook, Twitter, or Email. A wallet will be automatically created for you behind the scenes.

2. **Wallet Connection**: If you already have a wallet like MetaMask or a WalletConnect-compatible wallet, you can connect directly with it.

### Are posts chain-specific?

Yes, posts are specific to the blockchain where they were created. When you switch to a different chain, you'll see posts that were created on that particular blockchain. This design allows for communities and discussions specific to each blockchain ecosystem.

### How do I switch between different blockchains?

You can switch between blockchains in several ways:

1. Use the network selector in the Tribes interface
2. Switch networks directly in your connected wallet (like MetaMask)
3. Accept a network switch prompt when interacting with chain-specific content

### What types of content can I share on Tribes?

Currently, Tribes supports:

- Text posts with formatted content
- Image posts with captions
- Event announcements with details and scheduling

Future updates will add support for videos, polls, and other rich media types.

## Account Management

### How do I create an account?

1. Visit the Tribes platform
2. Click on "Connect" or "Sign In"
3. Choose either:
   - A social login option (Google, Facebook, Twitter, Email)
   - A wallet connection option (MetaMask, WalletConnect)
4. Complete the authentication process
5. Create your profile with a username and optional details

### Can I use the same account across different blockchains?

Yes, your Tribes account works across all supported blockchains. However, your profile data and content may be different on each chain. Your wallet address remains consistent across networks, providing a unified identity.

### How do I reset my password?

If you're using social login, password management is handled by the social provider (Google, Facebook, etc.). If you're using a wallet connection, you manage your wallet's security according to the wallet provider's procedures.

### How do I delete my account?

Currently, blockchain data is immutable, so profile information that has been stored on-chain cannot be fully deleted. However, you can:

1. Disconnect your wallet from the platform
2. Stop using the account
3. Contact support for assistance with removing personal information where possible

## Tribes (Communities)

### How do I create a tribe?

1. Log in to your Tribes account
2. Navigate to the "Tribes" section
3. Click on "Create New Tribe"
4. Fill in the tribe details:
   - Name
   - Description
   - Join settings (open or approval required)
5. Submit the creation transaction through your wallet
6. Wait for blockchain confirmation

### How do I join a tribe?

1. Browse or search for tribes
2. Select the tribe you want to join
3. Click the "Join" button
4. Approve the transaction if required
5. For tribes requiring approval, wait for the tribe creator/admin to approve your request

### Can I belong to multiple tribes?

Yes, you can join as many tribes as you want across different blockchains. Each tribe exists on a specific blockchain, so you'll need to switch networks to interact with tribes on different chains.

### How do I leave a tribe?

1. Navigate to the tribe page
2. Click on "Leave Tribe" in the tribe settings or member options
3. Confirm the action
4. Approve the transaction through your wallet

## Content Management

### Why can't I see my posts after switching chains?

Posts are chain-specific, meaning they exist only on the blockchain where they were created. When you switch networks, you'll only see posts created on that particular network. To view posts from another chain, you need to switch back to that chain.

### How do I create a post?

1. Navigate to your feed or a specific tribe
2. Click on the "Create Post" button
3. Select the post type (text, image, event)
4. Fill in the content details
5. Select which tribe(s) to post in
6. Submit the post
7. Approve the transaction through your wallet

### Can I edit or delete my posts?

Due to the immutable nature of blockchain data:

- **Editing**: Limited editing capabilities may be available depending on how the post data is stored
- **Deletion**: Full deletion is generally not possible, but posts can be hidden from view in the user interface

### How do I like or comment on posts?

- **Liking**: Click the like/heart icon on a post
- **Commenting**: Click the comment icon or area, type your comment, and submit

Each of these actions may require a blockchain transaction to be confirmed.

## Technical Questions

### What happens if I lose access to my wallet?

If you created your account with:

- **Social Login**: You can log in again with the same social account, and your wallet will be recovered automatically
- **Direct Wallet Connection**: You'll need to use your wallet's recovery methods (seed phrase, private key, etc.)

### Do I need cryptocurrency to use Tribes?

For basic browsing and viewing, no cryptocurrency is required. However, for actions that require blockchain transactions (creating tribes, posting, etc.), you'll need a small amount of the native token for the blockchain you're using to cover transaction fees (gas costs).

### How are gas fees handled?

Each action that modifies data on the blockchain requires a transaction fee (gas):

1. The fee is paid in the native token of the current blockchain
2. Fee amounts vary based on network congestion and complexity of the operation
3. Some operations may be batched to reduce total fees
4. Future updates may include gas optimization features and potential gas subsidies

### Is my data secure and private?

Tribes implements several security measures:

- Authentication uses industry-standard protocols
- Wallet connections never expose private keys to the application
- Profile data visibility can be controlled by users
- On-chain data is publicly visible as with all blockchain applications
- Sensitive data should never be posted on-chain

### How do I report a bug or suggest a feature?

You can:

1. Submit an issue on the [GitHub repository](https://github.com/astrix-tribes/Tribes/issues)
2. Reach out to the team on [Discord](https://discord.gg/tribes)
3. Use the feedback form within the application

## Troubleshooting

### My wallet won't connect. What should I do?

1. Ensure your wallet (like MetaMask) is unlocked
2. Check that you're not in a private/incognito browsing session
3. Try refreshing the page
4. Check if your wallet needs to be updated
5. Try a different browser
6. Clear your browser cache

### I switched chains but don't see any tribes or posts

1. Verify you've successfully switched to the intended chain (check your wallet)
2. Refresh the page
3. Try clearing local storage (if you're technically inclined)
4. It's possible that no tribes have been created yet on that specific chain

### Transaction failed or is pending for a long time

1. Check your wallet for error messages
2. Ensure you have enough of the native token to cover gas fees
3. For pending transactions, you may need to speed up or cancel the transaction in your wallet
4. Network congestion can cause delays - try again later

### My profile isn't showing up correctly

1. Make sure your profile creation transaction was successful
2. Verify you're on the correct blockchain network
3. Try refreshing the page
4. Check if your wallet is correctly connected

### I can't see images in posts

1. Check your internet connection
2. Verify that the image source is still available
3. Some browser extensions or privacy settings might block image loading
4. Try clearing your browser cache

## Future Plans

### Will Tribes support more blockchains in the future?

Yes, the platform is designed to be blockchain-agnostic, and we plan to add support for more EVM-compatible chains as well as potentially non-EVM chains in the future.

### Are there plans for a mobile app?

Yes, a mobile application is on our roadmap. In the meantime, the web application is designed to be responsive and mobile-friendly.

### Will there be a token for Tribes?

A native token for the Tribes ecosystem is under consideration for future development. This could enable additional functionality like governance, rewards, and premium features.

### How can I get involved with the development?

You can contribute to the Tribes platform by:

1. Forking the repository on GitHub and submitting pull requests
2. Reporting bugs and suggesting features
3. Creating documentation or tutorials
4. Joining the community and providing feedback

### Is Tribes open source?

Yes, Tribes is an open-source project. You can view and contribute to the code on the [GitHub repository](https://github.com/astrix-tribes/Tribes). 