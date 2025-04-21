import { XDC_MAINNET, FUSE_EMBER, SUPPORTED_CHAINS, MANTA_TESTNET, CHILIZ_MAINNET, FUSE_SPARK } from './networks';

type ContractAddresses = {
  ROLE_MANAGER: `0x${string}`;
  PROFILE_NFT_MINTER: `0x${string}`;
  TRIBE_CONTROLLER: `0x${string}`;
  COLLECTIBLE_CONTROLLER: `0x${string}`;
  EVENT_CONTROLLER: `0x${string}`;
  SUPER_COMMUNITY_CONTROLLER: `0x${string}`;
  COMMUNITY_POINTS: `0x${string}`;
  VOTING: `0x${string}`;
  CONTENT_MANAGER: `0x${string}`;
  POST_MINTER: `0x${string}`;
};

type ChainAddresses = {
  [key: number]: ContractAddresses;
};

// Contract Addresses by Chain
export const CONTRACT_ADDRESSES: ChainAddresses = {
  
  [MANTA_TESTNET.id]: {
    ROLE_MANAGER: '0x2F86722E927f1f080AF80E943eaE45fa28C7C296',
    PROFILE_NFT_MINTER: '0xc7B5f9BE4F716eE179674E2f055d866a797D1126',
    TRIBE_CONTROLLER: '0x575Cc6B211b33aDA87C075AfE3bB878f6B0a8984',
    COLLECTIBLE_CONTROLLER: '0xD750B3e3A361B701c6C53B86A425F4CC345f142d',
    EVENT_CONTROLLER: '0x03f8E7E304dB8615207a0b6fdd02Eb2e30e89557',
    SUPER_COMMUNITY_CONTROLLER: '0x9814514576184fB43AAD956873AE806AA811851E',
    COMMUNITY_POINTS: '0xE05022e242778c50Be3f6b4DD156ac222A311eEb',
    VOTING: '0x1E644d081E2a702A6D4e816D8dc04A9DBaa12Acc',
    CONTENT_MANAGER: '0x4DAD0f1E02374CB221E8822787bbdb0b0b18B9Fb',
    POST_MINTER: '0xA1c3162cE3515bb876Ee4928fB0FD0B20bC37f34'
  },
  [CHILIZ_MAINNET.id]: {
    ROLE_MANAGER: '0x2F86722E927f1f080AF80E943eaE45fa28C7C296',
    PROFILE_NFT_MINTER: '0xc7B5f9BE4F716eE179674E2f055d866a797D1126',
    TRIBE_CONTROLLER: '0x575Cc6B211b33aDA87C075AfE3bB878f6B0a8984',
    COLLECTIBLE_CONTROLLER: '0xD750B3e3A361B701c6C53B86A425F4CC345f142d',
    EVENT_CONTROLLER: '0x03f8E7E304dB8615207a0b6fdd02Eb2e30e89557',
    SUPER_COMMUNITY_CONTROLLER: '0x9814514576184fB43AAD956873AE806AA811851E',
    COMMUNITY_POINTS: '0xE05022e242778c50Be3f6b4DD156ac222A311eEb',
    VOTING: '0x1E644d081E2a702A6D4e816D8dc04A9DBaa12Acc',
    CONTENT_MANAGER: '0x4DAD0f1E02374CB221E8822787bbdb0b0b18B9Fb',
    POST_MINTER: '0xA1c3162cE3515bb876Ee4928fB0FD0B20bC37f34'
  },
  [XDC_MAINNET.id]: {
    ROLE_MANAGER: "0xE05022e242778c50Be3f6b4DD156ac222A311eEb",
    CONTENT_MANAGER: '0x4DAD0f1E02374CB221E8822787bbdb0b0b18B9Fb',
    PROFILE_NFT_MINTER: "0x03f8E7E304dB8615207a0b6fdd02Eb2e30e89557",
    TRIBE_CONTROLLER: "0x9814514576184fB43AAD956873AE806AA811851E",
    COLLECTIBLE_CONTROLLER: "0x0B3fb91Eb48738B1c4b69515725265a9A2aA1B15",
    POST_MINTER: "0x66F934e70c461275F839c3C2A90d4335f0F6A831",
    VOTING: "0x8CA09E8f73D5e7A3c7F1fC6eD6424C4038898374",
    COMMUNITY_POINTS: "0x167a86743515eb502a0aA5468EB6e6B47902132b",
    EVENT_CONTROLLER: "0xf232333F5E29C4943A671f25A4FCC21E520784C1",
    SUPER_COMMUNITY_CONTROLLER: "0x6bB93C749d973aA7B868356c88D180CBE04de091",
  },
  [FUSE_EMBER.id]: {
    ROLE_MANAGER: '0x661C2B7f1C3EC1ACEeA2c02818459061D40823bD',
    PROFILE_NFT_MINTER: '0x6fB6B1DDD4EA6640e04D70979C57E9C01c7b974a',
    TRIBE_CONTROLLER: '0x54812005171F747f5E69afA08989F41Cf06eeE48',
    COLLECTIBLE_CONTROLLER: '0xFD4E7c9AbEab99C9d23605519A883F1a3814595b',
    EVENT_CONTROLLER: '0xF4515E673EF9ED006dbFAF702A87Cd579b128f37',
    SUPER_COMMUNITY_CONTROLLER: '0x214653d9Cc9bbd148B0A1Fc833867c2cE8A0e609',
    COMMUNITY_POINTS: '0xdcF66412c2F2E76938Ed4F991f350Eb4CEA0c377',
    VOTING: '0xFCF9C955fB3A4B137E9526E1De979c67c9a7b45B',
    CONTENT_MANAGER: '0x8fa7A72aAB8595E0EA48bDd0A26e7c1b7F72B362',
    POST_MINTER: '0x58a1F6A010Eb711f5e564C073fC24bDa4AFA2392'
  },
  [FUSE_SPARK.id]: {
    // ROLE_MANAGER: "0x2F86722E927f1f080AF80E943eaE45fa28C7C296",
    // PROFILE_NFT_MINTER: "0xc7B5f9BE4F716eE179674E2f055d866a797D1126",
    // TRIBE_CONTROLLER: "0x6bB93C749d973aA7B868356c88D180CBE04de091",
    // COLLECTIBLE_CONTROLLER: "0xD750B3e3A361B701c6C53B86A425F4CC345f142d",
    // EVENT_CONTROLLER: "0x03f8E7E304dB8615207a0b6fdd02Eb2e30e89557",
    // SUPER_COMMUNITY_CONTROLLER: "0x9814514576184fB43AAD956873AE806AA811851E",
    // COMMUNITY_POINTS: "0xE05022e242778c50Be3f6b4DD156ac222A311eEb",
    // VOTING: "0x1E644d081E2a702A6D4e816D8dc04A9DBaa12Acc",
    // CONTENT_MANAGER: "0x4DAD0f1E02374CB221E8822787bbdb0b0b18B9Fb",
    // POST_MINTER: "0xA1c3162cE3515bb876Ee4928fB0FD0B20bC37f34"
    // PointSystem: "0x67Ad9dC8dAc464421A3eF4c034c2e7fab8eefE4c",
    // PostFeedManager: "0x4DAD0f1E02374CB221E8822787bbdb0b0b18B9Fb",
    ROLE_MANAGER: "0x0b8407c77dAE049AA28E07869c7E83C77fA1035b",
    PROFILE_NFT_MINTER: "0x060D385635dcFafed24F9CB856686A0559c47460",
    TRIBE_CONTROLLER: "0x5827dC1103E19442e1A24B8c86058b451f8D4636",
    COLLECTIBLE_CONTROLLER: "0x237158228d81A3c4A364665933A46F4F27F73b91",
    POST_MINTER: "0xB95FC9E7d44efc87e09E93c9BBD29b76118216aB",
    VOTING: "0xc3dFaF58092A3b55aD60873D3001A592cfA888b0",
    COMMUNITY_POINTS: "0x8189df5982aAE7ae004745D3BB6EE7B1D15C7DF9",
    EVENT_CONTROLLER: "0x7a030dBCf08CE46b4BC869f31972b450fBe1070f",
    SUPER_COMMUNITY_CONTROLLER: "0xa4C82C32bbb7D0e158C3f91912628a09a85F1006",
    CONTENT_MANAGER: "0x4DAD0f1E02374CB221E8822787bbdb0b0b18B9Fb",
    // PointSystem: "0x4cB431f8851A8BB26b70A60FF674CA37BbBE71E6",
    // PostFeedManager: "0x9585f7328E0c1fedF6c3C3f13d93AB7795Be7d60",
  }

} as const;

// Helper to get contract addresses for current chain
export const getContractAddresses = (chainId: number): ContractAddresses => {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    console.warn(`No contract addresses found for chain ${chainId}, falling back to Monad Devnet`);
    return CONTRACT_ADDRESSES[XDC_MAINNET.id];
  }
  return addresses;
};

// Get the current chain configuration
export const getCurrentChain = (chainId: number) => {
  const chain = SUPPORTED_CHAINS.find(chain => chain.id === chainId);
  if (!chain) {
    console.warn(`Chain ${chainId} not supported, falling back to Monad Devnet`);
    return XDC_MAINNET;
  }
  return chain;
};

// Profile NFT Minter ABI
export const PROFILE_NFT_MINTER_ABI = [
  // Profile Creation
  {
    inputs: [
      { internalType: "string", name: "username", type: "string" },
      { internalType: "string", name: "metadataURI", type: "string" }
    ],
    name: "createProfile",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Username Checks
  {
    inputs: [{ internalType: "string", name: "username", type: "string" }],
    name: "usernameExists",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  // Profile Updates
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "string", name: "newMetadataURI", type: "string" }
    ],
    name: "updateProfileMetadata",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Profile Queries
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getProfileByTokenId",
    outputs: [
      { internalType: "string", name: "username", type: "string" },
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "address", name: "owner", type: "address" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "username", type: "string" }],
    name: "getTokenIdByUsername",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const; 