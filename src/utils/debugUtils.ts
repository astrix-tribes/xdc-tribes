import { ethers } from 'ethers';

/**
 * Logs detailed information about a contract interaction to diagnose issues
 * 
 * @param method The contract method name being called
 * @param params The parameters to the method
 * @param contract The contract instance
 * @param signer The signer instance
 */
export const debugContractCall = async (
  method: string,
  params: any[],
  contract: ethers.Contract,
  signer: ethers.Signer
) => {
  try {
    console.group(`Debug Contract Call - ${method}`);
    
    // Contract address
    console.log('Contract Address:', contract.target);
    
    // Signer information
    const signerAddress = await signer.getAddress();
    console.log('Signer Address:', signerAddress);
    
    // Chain ID check
    let chainId: string | undefined;
    try {
      if (signer.provider) {
        const network = await signer.provider.getNetwork();
        chainId = network.chainId.toString();
        console.log('Chain ID (from provider):', chainId);
      }
    } catch (error) {
      console.error('Failed to get chain ID:', error);
    }
    
    // Method information
    console.log('Method Name:', method);
    console.log('Method Parameters:', params);
    
    // Check if method exists
    if (typeof contract[method] !== 'function') {
      console.error(`❌ Method ${method} does not exist on contract`);
    } else {
      console.log(`✅ Method ${method} exists on contract`);
    }
    
    // Gas information
    try {
      const gasEstimate = await contract[method].estimateGas(...params);
      console.log('Gas Estimate:', gasEstimate.toString());
    } catch (error) {
      console.error('Gas estimation failed:', error);
      console.log('❌ Gas estimation failed - this suggests the transaction would fail');
    }
    
    // Balance check
    try {
      if (signer.provider) {
        const balance = await signer.provider.getBalance(signerAddress);
        console.log('Signer Balance:', ethers.formatEther(balance), 'ETH');
      }
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
    
    console.groupEnd();
  } catch (error) {
    console.error('Error in debugContractCall:', error);
    console.groupEnd();
  }
};

/**
 * Returns a modified contract with enhanced debugging for all its functions
 * 
 * @param contract The contract to enhance with debugging
 * @param signer The signer to use when making calls
 */
export const createDebugContract = <T extends ethers.Contract>(
  contract: T,
  signer: ethers.Signer
): T => {
  const contractWithSigner = contract.connect(signer);
  const enhancedContract = { ...contractWithSigner } as T;
  
  // Get all function properties of the contract
  const functionProps = Object.getOwnPropertyNames(Object.getPrototypeOf(contractWithSigner))
    .filter(prop => {
      return typeof contractWithSigner[prop] === 'function' && 
             !['constructor', 'connect', 'attach'].includes(prop);
    });
  
  // Override each function with a debugging version
  for (const prop of functionProps) {
    const originalFn = contractWithSigner[prop];
    
    enhancedContract[prop] = async (...args: any[]) => {
      await debugContractCall(prop, args, contractWithSigner, signer);
      return originalFn.apply(contractWithSigner, args);
    };
  }
  
  return enhancedContract;
};

/**
 * Enhanced version of the try-catch wrapper for contract calls that provides better error details
 */
export const tryContractCall = async <T>(
  fn: () => Promise<T>,
  actionName: string
): Promise<T> => {
  try {
    console.log(`🔄 Attempting ${actionName}...`);
    const result = await fn();
    console.log(`✅ ${actionName} successful!`);
    return result;
  } catch (error) {
    console.error(`❌ ${actionName} failed:`);
    
    // Try to extract more useful information from the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      
      // Check for common error types
      if (error.message.includes('insufficient funds')) {
        console.error('💰 This appears to be an insufficient funds error. Check your wallet balance.');
      } else if (error.message.includes('user rejected')) {
        console.error('👤 The user rejected the transaction.');
      } else if (error.message.includes('yParity mismatch')) {
        console.error('🔑 Signature error with yParity mismatch. This is often related to compatibility issues with Web3Auth and ethers.js v6.');
        console.error('   Try using a direct contract call approach instead of safeContractCall.');
      } else if (error.message.includes('gas required exceeds allowance')) {
        console.error('⛽ Gas estimation issues. Try increasing the gas limit.');
      } else if (error.message.includes('nonce too low')) {
        console.error('🔢 Nonce too low. The transaction may have already been sent.');
      }
      
      // Log any other properties that might help debugging
      if ('data' in error) {
        console.error('Error data:', (error as any).data);
      }
      if ('code' in error) {
        console.error('Error code:', (error as any).code);
      }
      if ('reason' in error) {
        console.error('Error reason:', (error as any).reason);
      }
    } else {
      console.error('Unknown error type:', error);
    }
    
    throw error;
  }
}; 