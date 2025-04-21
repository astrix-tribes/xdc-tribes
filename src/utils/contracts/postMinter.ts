import { ethers } from 'ethers';
import { getContractAddresses } from '../../constants/contracts';
import PostMinterABI from '../../abi/PostMinter.json';
// We're not using these utilities due to gas estimation issues
// import { debugContractCall, tryContractCall } from '../debugUtils';

// Types for post data
export interface PostMetadata {
  title: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'EVENT';
  createdAt: string;
  imageUrl?: string; // Optional for image posts
}

export interface Post {
  id: string;
  creator: string;
  tribeId: string;
  metadata: PostMetadata;
  isGated: boolean;
  collectibleContract: string;
  collectibleId: string;
  isEncrypted: boolean;
  accessSigner: string;
  // Derived fields (not from contract)
  likes?: number;
  replies?: number;
}

// Initialize contract
export const getPostMinterContract = (
  provider: ethers.Provider,
  chainId: number
) => {
  const addresses = getContractAddresses(chainId);
  return new ethers.Contract(addresses.POST_MINTER, PostMinterABI, provider);
};

// Create a text post
export const createTextPost = async (
  signer: ethers.Signer,
  chainId: number,
  tribeId: string,
  title: string,
  content: string
) => {
  try {
    // First verify that the user is a member of the tribe
    const signerAddress = await signer.getAddress();
    console.log(`Creating text post as ${signerAddress} for tribe ${tribeId}`);
    
    const provider = signer.provider as ethers.Provider;
    if (!provider) {
      throw new Error("No provider available");
    }

    
    // Create post metadata
    const metadata: PostMetadata = {
      title,
      content,
      type: 'TEXT',
      createdAt: new Date().toISOString(),
    };
    
    // Prepare the metadata JSON
    const metadataJson = JSON.stringify(metadata);
    
    // Log the parameters we're sending to help debug
    console.log(`Creating text post with parameters:`, {
      tribeId,
      metadataLength: metadataJson.length,
      metadata: {
        title,
        type: 'TEXT',
        contentLength: content.length
      },
      isGated: false,
      collectibleContract: ethers.ZeroAddress,
      collectibleId: 0
    });
    
    // Check contract and parameters
    try {
      // Verify tribe exists
      const tribeControllerAddress = getContractAddresses(chainId).TRIBE_CONTROLLER;
      const tribeControllerContract = new ethers.Contract(
        tribeControllerAddress,
        ['function isMember(uint256,address) view returns (bool)'],
        provider
      );
      
      const isMember = await tribeControllerContract.isMember(tribeId, signerAddress);
      console.log(`User ${signerAddress} is member of tribe ${tribeId}: ${isMember}`);
      
      if (!isMember) {
        throw new Error(`You must be a member of tribe ${tribeId} to create posts`);
      }
    } catch (checkError) {
      console.error("Pre-transaction check failed:", checkError);
      if (checkError instanceof Error) {
        throw new Error(`Cannot create post: ${checkError.message}`);
      }
      throw checkError;
    }
    
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
    const contractAddress = getContractAddresses(chainId).POST_MINTER;
    
    // Encode the function call
    const iface = new ethers.Interface(PostMinterABI);
    const data = iface.encodeFunctionData('createPost', [
      tribeId,
      metadataJson,
      false,
      ethers.ZeroAddress,
      0
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
    // const receipt = await txResponse.wait();
    // console.log('Transaction confirmed:', receipt);
    
    // Try to extract the post ID from the event logs
    // try {
    //   const abi = new ethers.Interface(PostMinterABI);
    //   if (receipt && receipt.logs) {
    //     for (const log of receipt.logs) {
    //       try {
    //         const topicsArray = Array.from(log.topics || []);
    //         const data = log.data || '0x';
    //         const parsedLog = abi.parseLog({ topics: topicsArray, data });
            
    //         if (parsedLog && parsedLog.name === 'PostCreated') {
    //           const postId = parsedLog.args[0];
    //           console.log('Created post with ID:', postId);
    //           return {
    //             receipt,
    //             postId: postId.toString()
    //           };
    //         }
    //       } catch (parseError) {
    //         // Skip logs that can't be parsed
    //         console.debug('Could not parse log entry:', parseError instanceof Error ? parseError.message : String(parseError));
    //         continue;
    //       }
    //     }
    //   }
    // } catch (error) {
    //   console.error('Error extracting post ID from logs:', error);
    // }
    
    // return { receipt };
  } catch (error) {
    console.error('Error creating text post:', error);
    
    // Provide more helpful error information
    if (error instanceof Error) {
      if (error.message.includes('execution reverted')) {
        // Find the reason if possible
        const reasonMatch = error.message.match(/reason="([^"]+)"/);
        const reason = reasonMatch ? reasonMatch[1] : "Unknown reason";
        console.error(`Contract reverted: ${reason}`);
        throw new Error(`Contract error: ${reason}`);
      } else if (error.message.includes('gas required exceeds')) {
        console.error('Transaction requires too much gas. The post may be too large or there might be a problem with the contract.');
        throw new Error('Transaction requires too much gas. Please try with a smaller post or contact support.');
      }
    }
    
    throw error;
  }
};

// Create an image post
export const createImagePost = async (
  signer: ethers.Signer,
  chainId: number,
  tribeId: string,
  title: string,
  content: string,
  imageUrl: string
) => {
  try {
    // First verify that the user is a member of the tribe
    const signerAddress = await signer.getAddress();
    console.log(`Creating image post as ${signerAddress} for tribe ${tribeId}`);
    
    const provider = signer.provider as ethers.Provider;
    if (!provider) {
      throw new Error("No provider available");
    }
    
    // Create post metadata
    const metadata: PostMetadata = {
      title,
      content,
      type: 'IMAGE',
      imageUrl,
      createdAt: new Date().toISOString(),
    };
    
    // Prepare the metadata JSON
    const metadataJson = JSON.stringify(metadata);
    
    // Log the parameters we're sending to help debug
    console.log(`Creating image post with parameters:`, {
      tribeId,
      metadataLength: metadataJson.length,
      metadata: {
        title,
        type: 'IMAGE',
        contentLength: content.length,
        imageUrl: imageUrl ? `${imageUrl.substring(0, 30)}...` : undefined
      },
      isGated: false,
      collectibleContract: ethers.ZeroAddress,
      collectibleId: 0
    });
    
    // Check contract and parameters
    try {
      // Verify tribe exists
      const tribeControllerAddress = getContractAddresses(chainId).TRIBE_CONTROLLER;
      const tribeControllerContract = new ethers.Contract(
        tribeControllerAddress,
        ['function isMember(uint256,address) view returns (bool)'],
        provider
      );
      
      const isMember = await tribeControllerContract.isMember(tribeId, signerAddress);
      console.log(`User ${signerAddress} is member of tribe ${tribeId}: ${isMember}`);
      
      if (!isMember) {
        throw new Error(`You must be a member of tribe ${tribeId} to create posts`);
      }
      
      // Verify image URL isn't too long
      if (imageUrl && imageUrl.length > 1000) {
        throw new Error("Image URL is too long. Please use a shorter URL.");
      }
    } catch (checkError) {
      console.error("Pre-transaction check failed:", checkError);
      if (checkError instanceof Error) {
        throw new Error(`Cannot create post: ${checkError.message}`);
      }
      throw checkError;
    }
    
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
    const contractAddress = getContractAddresses(chainId).POST_MINTER;
    
    // Encode the function call
    const iface = new ethers.Interface(PostMinterABI);
    const data = iface.encodeFunctionData('createPost', [
      tribeId,
      metadataJson,
      false,
      ethers.ZeroAddress,
      0
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
    console.error('Error creating image post:', error);
    
    // Provide more helpful error information
    if (error instanceof Error) {
      if (error.message.includes('execution reverted')) {
        // Find the reason if possible
        const reasonMatch = error.message.match(/reason="([^"]+)"/);
        const reason = reasonMatch ? reasonMatch[1] : "Unknown reason";
        console.error(`Contract reverted: ${reason}`);
        throw new Error(`Contract error: ${reason}`);
      } else if (error.message.includes('gas required exceeds')) {
        console.error('Transaction requires too much gas. The image or post content may be too large.');
        throw new Error('Transaction requires too much gas. Please try with a smaller image or post content.');
      }
    }
    
    throw error;
  }
};

// Get posts by tribe
export const getPostsByTribe = async (
  provider: ethers.Provider,
  chainId: number,
  tribeId: string,
  offset = 0,
  limit = 20
) => {
  try {
    // console.log(`[getPostsByTribe] Starting fetch for tribe ${tribeId}`);
    // console.log(`[getPostsByTribe] Chain ID: ${chainId}`);
    // console.log(`[getPostsByTribe] Provider: ${provider.constructor.name}`);
    
  // Validate inputs
    if (!tribeId) {
      console.warn('[getPostsByTribe] Invalid tribe ID provided');
      return {
        postIds: [],
        total: 0
      };
    }

    const contract = getPostMinterContract(provider, chainId);
    
    // Convert tribeId to BigNumber since the contract expects a uint256
    const tribeIdBN = ethers.toBigInt(tribeId);
    // console.log(`[getPostsByTribe] Tribe ID (BigInt): ${tribeIdBN}`);
    
    // Check if contract is paused
    try {
      const isPaused = await contract.paused();
      if (isPaused) {
        // console.warn('[getPostsByTribe] Contract is paused');
        return {
          postIds: [],
          total: 0
        };
      }
    } catch (pauseError) {
      console.warn('[getPostsByTribe] Could not check pause status:', pauseError);
    }

    // Validate offset and limit
    if (offset < 0 || limit < 1) {
      console.warn('[getPostsByTribe] Invalid offset or limit');
      return {
        postIds: [],
        total: 0
      };
    }

    // Make the contract call with proper error handling
    let result;
    try {
      result = await contract.getPostsByTribe(tribeIdBN, offset, limit);
      // console.log(`[getPostsByTribe] Raw result:`, result);
    } catch (callError) {
      console.error('[getPostsByTribe] Contract call failed:', callError);
      return {
        postIds: [],
        total: 0
      };
    }

    // Validate result structure
    if (!result || !Array.isArray(result.postIds) || typeof result.total === 'undefined') {
      console.error('[getPostsByTribe] Invalid result structure:', result);
      return {
        postIds: [],
        total: 0
      };
    }
    
    // Convert BigNumber IDs to strings for consistency
    const postIds = result.postIds.map((id: ethers.BigNumberish) => id.toString());
    const total = Number(result.total);
    
    // console.log(`[getPostsByTribe] Successfully fetched ${postIds.length} posts out of ${total} total`);
    
    return {
      postIds,
      total
    };
  } catch (error) {
    console.error(`[getPostsByTribe] Error fetching posts for tribe ${tribeId}:`, error);
    // Return empty array instead of throwing to make UI more resilient
    return {
      postIds: [],
      total: 0
    };
  }
};

// Get a single post by ID
export const getPost = async (
  provider: ethers.Provider,
  chainId: number,
  postId: string
): Promise<Post | null> => {
  try {
    console.log(`[getPost] Fetching post ${postId}`);
    const contract = getPostMinterContract(provider, chainId);
    
    const postData = await contract.getPost(postId);
    console.log(`[getPost] Raw post data for ${postId}:`, {
      id: postId,
      creator: postData.creator,
      tribeId: postData.tribeId.toString(),
      isGated: postData.isGated,
      collectibleContract: postData.collectibleContract,
      collectibleId: postData.collectibleId.toString(),
      isEncrypted: postData.isEncrypted,
      accessSigner: postData.accessSigner
      // metadata is not logged as it might be too large
    });
    
    let metadata: PostMetadata;
    
    try {
      metadata = JSON.parse(postData.metadata);
      console.log(`[getPost] Parsed metadata for post ${postId}:`, {
        title: metadata.title,
        type: metadata.type,
        createdAt: metadata.createdAt
        // content is not logged as it might be too large
      });
    } catch (error) {
      console.error(`Error parsing metadata for post ${postId}:`, error);
      // Provide a fallback metadata object if parsing fails
      metadata = {
        title: 'Error: Could not parse metadata',
        content: 'The metadata for this post could not be parsed correctly.',
        type: 'TEXT',
        createdAt: new Date().toISOString(),
      };
    }
    
    // Get interaction counts (likes)
    let likes = 0;
    try {
      likes = Number(await contract.getInteractionCount(postId, 0)); // 0 = Like
      console.log(`[getPost] Post ${postId} has ${likes} likes`);
    } catch (error) {
      console.error(`Error fetching like count for post ${postId}:`, error);
    }
    
    // Get reply count
    let replies = 0;
    try {
      const replyIds = await contract.getPostReplies(postId);
      replies = replyIds.length;
      console.log(`[getPost] Post ${postId} has ${replies} replies`);
    } catch (error) {
      console.error(`Error fetching replies for post ${postId}:`, error);
    }
    
    return {
      id: postId,
      creator: postData.creator,
      tribeId: postData.tribeId.toString(),
      metadata,
      isGated: postData.isGated,
      collectibleContract: postData.collectibleContract,
      collectibleId: postData.collectibleId.toString(),
      isEncrypted: postData.isEncrypted,
      accessSigner: postData.accessSigner,
      likes,
      replies
    };
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    return null; // Return null instead of throwing to make UI more resilient
  }
};

// Get interaction count (likes, etc.)
export const getInteractionCount = async (
  provider: ethers.Provider,
  chainId: number,
  postId: string,
  interactionType: number // 0 = Like, 1 = Dislike, etc.
) => {
  try {
    const contract = getPostMinterContract(provider, chainId);
    
    const count = await contract.getInteractionCount(postId, interactionType);
    return count;
  } catch (error) {
    console.error(`Error fetching interaction count for post ${postId}:`, error);
    throw error;
  }
};

// Interact with a post (like, etc.)
export const interactWithPost = async (
  signer: ethers.Signer,
  chainId: number,
  postId: string,
  interactionType: number // 0 = Like, 1 = Dislike, etc.
) => {
  try {
    const signerAddress = await signer.getAddress();
    console.log(`User ${signerAddress} interacting with post ${postId}, interaction type: ${interactionType}`);
    
    const provider = signer.provider as ethers.Provider;
    if (!provider) {
      throw new Error("No provider available");
    }
    
    // Get the post minter contract
    const contract = getPostMinterContract(provider, chainId);
    
    // Validate interaction type
    if (interactionType < 0 || interactionType > 2) {
      throw new Error("Invalid interaction type. Must be 0 (Like), 1 (Dislike), or 2 (Report)");
    }
    
    // Type assertion with proper interface
    const contractWithSigner = contract.connect(signer) as ethers.Contract & {
      interactWithPost: (
        postId: string,
        interactionType: number,
        options: { gasLimit: number }
      ) => Promise<ethers.TransactionResponse>
    };
    
    // Skip debug call that might fail estimation and go straight to the transaction
    console.log("Submitting interaction directly, bypassing gas estimation");
    
    // For Web3Auth compatibility: Use a direct method call with high gas limit
    // This avoids the gas estimation that might fail
    const tx = await contractWithSigner.interactWithPost(
      postId, 
      interactionType,
      { gasLimit: 500000 } // Use a sufficient gas limit to ensure the transaction can proceed
    );
    
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    
    return receipt;
  } catch (error) {
    console.error(`Error interacting with post ${postId}:`, error);
    
    // Provide more helpful error information
    if (error instanceof Error) {
      if (error.message.includes('yParity mismatch')) {
        console.error('Web3Auth signature compatibility issue detected. Please try using a different wallet connection method or contact support.');
      } else if (error.message.includes('AlreadyInteracted')) {
        console.error(`You have already ${interactionType === 0 ? 'liked' : 'interacted with'} this post.`);
        throw new Error(`You have already ${interactionType === 0 ? 'liked' : 'interacted with'} this post.`);
      } else if (error.message.includes('CannotInteractWithOwnPost')) {
        console.error('You cannot interact with your own post.');
        throw new Error('You cannot interact with your own post.');
      } else if (error.message.includes('execution reverted')) {
        // Find the reason if possible
        const reasonMatch = error.message.match(/reason="([^"]+)"/);
        const reason = reasonMatch ? reasonMatch[1] : "Unknown reason";
        console.error(`Contract reverted: ${reason}`);
        throw new Error(`Contract error: ${reason}`);
      }
    }
    
    throw error;
  }
};

// Get all posts from all tribes
export const getAllPosts = async (
  provider: ethers.Provider,
  chainId: number,
  tribeIds: string[],
  limit = 10
): Promise<Post[]> => {
  try {
    const allPosts: Post[] = [];
    const fetchPromises: Promise<Post | null>[] = [];
    
    // First get post IDs from each tribe
    for (const tribeId of tribeIds) {
      try {
        const { postIds } = await getPostsByTribe(provider, chainId, tribeId, 0, limit);
        console.log(`[getAllPosts] Found ${postIds.length} posts for tribe ${tribeId}`);
        
        // For each post ID, create a promise to fetch the post
        for (const postId of postIds) {
          fetchPromises.push(getPost(provider, chainId, postId.toString()));
        }
      } catch (error) {
        console.error(`Error fetching posts for tribe ${tribeId}:`, error);
        // Continue with other tribes if one fails
      }
    }
    
    // Resolve all promises and filter out null values
    const posts = await Promise.all(fetchPromises);
    for (const post of posts) {
      if (post !== null) {
        allPosts.push(post);
      }
    }
    
    console.log(`[getAllPosts] Successfully fetched ${allPosts.length} posts from ${fetchPromises.length} total post IDs`);
    
    // Sort by creation date (newest first)
    return allPosts.sort((a, b) => {
      return new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime();
    });
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return []; // Return empty array instead of throwing to make UI more resilient
  }
}; 