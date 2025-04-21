# Developer Guide

This document provides instructions for developers who want to work with or contribute to the Tribes platform.

<a id="setup"></a>
## Setup & Installation

Before you begin development, you'll need to set up your environment with the necessary tools and dependencies.

### Prerequisites

- **Node.js**: Version 16.x or later
- **npm**: Version 8.x or later
- **Git**: Latest version recommended
- **MetaMask**: Browser extension for testing wallet connections
- **Foundry**: For smart contract development and testing (optional)

### Repository Setup

1. Clone the repository:
```bash
git clone https://github.com/fuse-tribes/tribes.git
cd tribes
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Edit your `.env.local` file to add the necessary configuration values:
```
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
NEXT_PUBLIC_SUPPORTED_CHAINS=1264453517,10143,88888,3441006,421614
NEXT_PUBLIC_RPC_TARGETS={"1264453517":"https://rpc.flash.io",...}
```

<a id="local-development"></a>
## Local Development

### Running the Frontend

To start the development server:

```bash
npm run dev
```

This will start the Next.js development server at http://localhost:3000.

### Smart Contract Development

If you're working on smart contracts:

1. Navigate to the contracts directory:
```bash
cd contracts
```

2. Install Foundry if you haven't already:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

3. Compile the contracts:
```bash
forge build
```

4. Run tests:
```bash
forge test
```

### Working with Multiple Chains

To test cross-chain functionality locally:

1. Update your `.env.local` file with local network configurations:
```
NEXT_PUBLIC_SUPPORTED_CHAINS=1337,1338
NEXT_PUBLIC_RPC_TARGETS={"1337":"http://localhost:8545","1338":"http://localhost:8546"}
```

2. Run multiple local blockchain nodes using Anvil:
```bash
# Terminal 1 - Chain 1
anvil --chain-id 1337 --port 8545

# Terminal 2 - Chain 2
anvil --chain-id 1338 --port 8546
```

3. Deploy contracts to local chains:
```bash
# Deploy to Chain 1
forge create --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 src/TribeController.sol:TribeController

# Deploy to Chain 2
forge create --rpc-url http://localhost:8546 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 src/TribeController.sol:TribeController
```

<a id="testing"></a>
## Testing

### Frontend Testing

We use Jest and React Testing Library for frontend testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run a specific test file
npm test -- components/TribeList.test.tsx
```

### Smart Contract Testing

For smart contract testing:

```bash
# Run all tests
forge test

# Run a specific test
forge test --match-contract TribeControllerTest

# Run tests with verbosity
forge test -vv
```

### End-to-End Testing

For end-to-end testing, we use Playwright:

```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run specific test
npx playwright test tests/e2e/tribe-creation.spec.ts
```

<a id="deployment"></a>
## Deployment

### Smart Contract Deployment

To deploy contracts to a live network:

1. Create a `.env` file in the contracts directory:
```
PRIVATE_KEY=your_private_key
FLASH_RPC_URL=https://rpc.flash.io
MONAD_RPC_URL=https://rpc.monad.xyz/testnet
```

2. Deploy using the deployment script:
```bash
forge script script/DeployTribeController.s.sol --rpc-url $FLASH_RPC_URL --broadcast
```

### Frontend Deployment

The frontend can be deployed to Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Alternatively, you can build the application for production:

```bash
npm run build
npm start
```

### CI/CD Pipeline

We use GitHub Actions for our CI/CD pipeline:

1. Pull requests trigger test runs
2. Merges to main trigger deployment to staging
3. Tagged releases deploy to production

The workflow configurations are in the `.github/workflows` directory.

## Troubleshooting

### Common Issues

- **MetaMask not connecting**: Make sure you're using the correct chainId in the frontend
- **Contract transactions failing**: Verify you have enough funds for gas
- **RPC errors**: Check that the RPC URL for your chain is correct and responsive

### Debugging Tools

- Browser console for frontend issues
- Forge's verbosity flags (`-vvv`) for contract debugging
- Etherscan for monitoring transactions on public networks

## Additional Resources

- [Ethers.js Documentation](https://docs.ethers.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Foundry Book](https://book.getfoundry.sh/)
- [Web3Auth Documentation](https://web3auth.io/docs/)

## Contributing

Please see our [Contributing Guidelines](./contributing.md) for information on how to contribute to the project.

## Support

If you need help or have questions:

- Create an issue on GitHub
- Join our [Discord server](https://discord.gg/fusetribes)
- Reach out to the team at developers@fusetribes.io 