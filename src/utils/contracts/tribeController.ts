import { ethers } from 'ethers';
import { getContractAddresses } from '../../constants/contracts';
import TribeControllerABI from '../../abi/TribeController.json';
import { safeContractCall } from '../ethereum';
import { debugContractCall, tryContractCall } from '../debugUtils';

// Enum for join types
export enum JoinType {
  Open = 0,
  Approval = 1,
  Invite = 2,
  NFTGated = 3,
}

// Interface for Tribe data
export interface Tribe {
  id: string;
  name: string;
  description: string; // Extracted from metadata
  joinType: JoinType;
  entryFee: string;
  memberCount: number;
  canMerge: boolean;
  admin?: string;
  isActive?: boolean;
  nftRequirements?: NFTRequirement[]; // Make it optional since it might not be available
}

// Interface for NFT requirement
export interface NFTRequirement {
  contractAddress: string;
  tokenId: string;
}

// Interface for Tribe configuration
export interface TribeConfig {
  joinType: JoinType;
  entryFee: string;
  nftRequirements: NFTRequirement[];
  canMerge: boolean;
}

// Initialize contract
export const getTribeControllerContract = (
  provider: ethers.Provider,
  chainId: number
) => {
  const addresses = getContractAddresses(chainId);
  return new ethers.Contract(addresses.TRIBE_CONTROLLER, TribeControllerABI, provider);
};

// Get next tribe ID
export const getNextTribeId = async (
  provider: ethers.Provider,
  chainId: number
): Promise<number> => {
  try {
    const contract = getTribeControllerContract(provider, chainId);
    const nextId = await contract.nextTribeId();
    console.log(`[nextId]:`, nextId);
    return Number(nextId);
  } catch (error) {
    console.error('Error fetching next tribe ID:', error);
    throw error;
  }
};

// Get tribe config
export const getTribeConfig = async (
  provider: ethers.Provider,
  chainId: number,
  tribeId: string
): Promise<TribeConfig> => {
  try {
    const contract = getTribeControllerContract(provider, chainId);
    const config = await contract.getTribeConfigView(tribeId);
    
    return {
      joinType: config.joinType,
      entryFee: config.entryFee.toString(),
      nftRequirements: config.nftRequirements,
      canMerge: config.canMerge,
    };
  } catch (error) {
    console.error(`Error fetching config for tribe ${tribeId}:`, error);
    throw error;
  }
};

// Get tribe member count
export const getTribeMemberCount = async (
  provider: ethers.Provider,
  chainId: number,
  tribeId: string
): Promise<number> => {
  try {
    const contract = getTribeControllerContract(provider, chainId);
    const count = await contract.getMemberCount(tribeId);
    return Number(count);
  } catch (error) {
    console.error(`Error fetching member count for tribe ${tribeId}:`, error);
    throw error;
  }
};

// Get tribe details
export const getTribeDetails = async (
  provider: ethers.Provider,
  chainId: number,
  tribeId: string
): Promise<Tribe | null> => {
  try {
    const contract = getTribeControllerContract(provider, chainId);
    const details = await contract.getTribeDetails(tribeId);
    console.log(`[getTribeDetails] Details for tribe ${tribeId}:`, details);
    
    // Parse metadata to get description
    let description = "";
    try {
      const metadataObj = JSON.parse(details.metadata);
      description = metadataObj.description || "";
    } catch (error) {
      console.warn(`Error parsing metadata for tribe ${tribeId}:`, error);
    }
    
    return {
      id: tribeId,
      name: details.name,
      description,
      joinType: details.joinType,
      entryFee: details.entryFee.toString(),
      memberCount: Number(details.memberCount),
      canMerge: details.canMerge,
      admin: details.admin,
      isActive: details.isActive,
    };
  } catch (error) {
    console.error(`Error fetching details for tribe ${tribeId}:`, error);
    return null; // Return null instead of throwing to handle non-existent tribes
  }
};


// Get all tribes
export const getAllTribes = async (
  provider: ethers.Provider,
  chainId: number
): Promise<Tribe[]> => {
  try {
    const nextTribeId = await getNextTribeId(provider, chainId);
    // console.log(`[getAllTribes] Next tribe ID: ${nextTribeId}`);
    const tribes: Tribe[] = [];

    // Fetch all tribes from 0 to nextTribeId - 1
    const tribePromises: Promise<Tribe | null>[] = [];
    
    // Log that we're starting to fetch tribes
    console.log(`[getAllTribes] Fetching details for ${nextTribeId} tribes...`);
    
    for (let i = 0; i < nextTribeId; i++) {
      tribePromises.push(getTribeDetails(provider, chainId, i.toString())
        .catch(error => {
          console.error(`[getAllTribes] Error fetching tribe ${i}:`, error);
          return null; // Return null for failed fetches
        })
      );
    }

    const results = await Promise.all(tribePromises);
    
    // Log the number of successful fetches
    const successfulFetches = results.filter(Boolean).length;
    console.log(`[getAllTribes] Successfully fetched ${successfulFetches} out of ${nextTribeId} tribes`);
    
    // Filter out null results (non-existent tribes)
    for (const tribe of results) {
      if (tribe) {
        tribes.push(tribe);
      }
    }
    
    return tribes;
  } catch (error) {
    console.error('[getAllTribes] Error fetching all tribes:', error);
    // Return empty array instead of throwing to be more resilient
    return [];
  }
};

// Check if user is a member of a tribe
export const isMemberOfTribe = async (
  provider: ethers.Provider,
  chainId: number,
  tribeId: string,
  address: string
): Promise<boolean> => {
  try {
    const contract = getTribeControllerContract(provider, chainId);
    return await safeContractCall<boolean>(contract, 'isMember', tribeId, address);
  } catch (error) {
    console.error(`Error checking membership for tribe ${tribeId}:`, error);
    throw error;
  }
};

// Join a tribe
export const joinTribe = async (
  signer: ethers.Signer,
  chainId: number,
  tribeId: string
) => {
  try {
    const contract = getTribeControllerContract(signer.provider as ethers.Provider, chainId);
    // Type assertion to make TypeScript happy
    const contractWithSigner = contract.connect(signer) as ethers.Contract & {
      joinTribe: (tribeId: string, options: { gasLimit: number }) => Promise<ethers.TransactionResponse>
    };
    
    const signerAddress = await signer.getAddress();
    console.log(`Joining tribe ${tribeId} with address ${signerAddress}`);
    
    // Debug the contract call first
    await debugContractCall(
      'joinTribe',
      [tribeId, { gasLimit: 500000 }],
      contractWithSigner,
      signer
    );
    
    // For Web3Auth compatibility: Use direct method call
    const tx = await tryContractCall(
      async () => contractWithSigner.joinTribe(
        tribeId, 
        { gasLimit: 500000 }
      ),
      'Join Tribe Transaction'
    );
    
    console.log('Join tribe transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Join tribe transaction confirmed:', receipt);
    
    return receipt;
  } catch (error) {
    console.error(`Error joining tribe ${tribeId}:`, error);
    
    // Provide more helpful error information
    if (error instanceof Error) {
      if (error.message.includes('yParity mismatch')) {
        console.error('Web3Auth signature compatibility issue detected. This is a known issue with certain wallet connections. Please try:\n1. Using a different wallet connection method\n2. Clearing your browser cache and reconnecting\n3. Using a different browser\n4. Contacting support if the issue persists.');
      } else if (error.message.includes('already a member')) {
        console.error('You are already a member of this tribe.');
      }
    }
    
    throw error;
  }
};

// Create a new tribe - uses direct contract call for Web3Auth compatibility
export const createTribe = async (
  signer: ethers.Signer,
  chainId: number,
  name: string,
  description: string,
  joinType: JoinType = JoinType.Open,
  entryFee: string = "0",
  nftRequirements: NFTRequirement[] = []
) => {
  try {
    const signerAddress = await signer.getAddress();
    console.log(`Creating tribe with signer: ${signerAddress}`);
    
    const provider = signer.provider as ethers.Provider;
    if (!provider) {
      throw new Error("No provider available");
    }
    
    // Create metadata
    const metadata = JSON.stringify({
      description,
      createdAt: new Date().toISOString(),
    });
    
    console.log('Creating tribe with parameters:', {
      name,
      metadata,
      admins: [],
      joinType,
      entryFee,
      nftRequirements,
      chainId
    });
    
    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || await provider.getFeeData().then(fee => fee.gasPrice);
    
    // Prepare transaction parameters
    const txParams = {
      gasLimit: 1000000,
      gasPrice: gasPrice,
      type: 0 // Use legacy transaction type
    };
    
    // Create the transaction using the raw transaction approach
    const nonce = await provider.getTransactionCount(signerAddress);
    const contractAddress = getContractAddresses(chainId).TRIBE_CONTROLLER;
    
    // Encode the function call
    const iface = new ethers.Interface(TribeControllerABI);
    const data = iface.encodeFunctionData('createTribe', [
      name,
      metadata,
      [], // admins (empty array means caller is the only admin)
      joinType,
      entryFee,
      nftRequirements
    ]);
    
    // Create the transaction
    const tx = {
      to: contractAddress,
      data,
      nonce,
      ...txParams
    };
    
    // Sign and send the transaction
    const signedTx = await signer.signTransaction(tx);
    const txResponse = await provider.broadcastTransaction(signedTx);
    
    console.log('Transaction sent:', txResponse.hash);
    return txResponse;
  } catch (error) {
    console.error('Error creating tribe:', error);
    
    // Provide more helpful error information
    if (error instanceof Error) {
      if (error.message.includes('execution reverted')) {
        // Find the reason if possible
        const reasonMatch = error.message.match(/reason="([^"]+)"/);
        const reason = reasonMatch ? reasonMatch[1] : "Unknown reason";
        console.error(`Contract reverted: ${reason}`);
        throw new Error(`Contract error: ${reason}`);
      } else if (error.message.includes('gas required exceeds')) {
        console.error('Transaction requires too much gas. The tribe data may be too large or there might be a problem with the contract.');
        throw new Error('Transaction requires too much gas. Please try with smaller data or contact support.');
      }
    }
    
    throw error;
  }
};

// Leave a tribe
export const rejectMember = async (
  signer: ethers.Signer,
  chainId: number,
  tribeId: string
) => {
  try {
    const contract = getTribeControllerContract(signer.provider as ethers.Provider, chainId);
    // Type assertion to make TypeScript happy
    const contractWithSigner = contract.connect(signer) as ethers.Contract & {
      leaveTribe: (tribeId: string, options: { gasLimit: number }) => Promise<ethers.TransactionResponse>
    };
    
    // For Web3Auth compatibility: Use direct method call
    console.log(`Leaving tribe ${tribeId} with address ${await signer.getAddress()}`);
    const tx = await contractWithSigner.leaveTribe(tribeId, { 
      gasLimit: 300000 
    });
    
    console.log('Leave tribe transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Leave tribe transaction confirmed:', receipt);
    
    return receipt;
  } catch (error) {
    console.error(`Error leaving tribe ${tribeId}:`, error);
    throw error;
  }
};

// Get comprehensive details about a tribe by ID
export const getTribeFullDetails = async (
  provider: ethers.Provider,
  chainId: number,
  tribeId: string
): Promise<Tribe | null> => {
  try {
    console.log(`[getTribeFullDetails] Fetching comprehensive details for tribe ${tribeId}`);
    
    // Get basic tribe details
    const tribeDetails = await getTribeDetails(provider, chainId, tribeId);
    if (!tribeDetails) {
      console.log(`Tribe ${tribeId} does not exist or is not active`);
      return null;
    }
    
    // Get member count 
    try {
      const memberCount = await getTribeMemberCount(provider, chainId, tribeId);
      tribeDetails.memberCount = memberCount;
    } catch (memberCountError) {
      console.error(`Error fetching member count for tribe ${tribeId}:`, memberCountError);
      // Keep existing member count if available
    }
    
    // Get additional config details if not already included
    if (!tribeDetails.nftRequirements) {
      try {
        const config = await getTribeConfig(provider, chainId, tribeId);
        tribeDetails.nftRequirements = config.nftRequirements;
        // Update canMerge from config if needed
        tribeDetails.canMerge = config.canMerge;
      } catch (configError) {
        console.error(`Error fetching config for tribe ${tribeId}:`, configError);
        // Keep existing data
      }
    }
    
    console.log(`[getTribeFullDetails] Complete details for tribe ${tribeId}:`, tribeDetails);
    return tribeDetails;
  } catch (error) {
    console.error(`Error in getTribeFullDetails for tribe ${tribeId}:`, error);
    return null;
  }
}; 