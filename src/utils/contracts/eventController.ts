import { ethers } from 'ethers';
import { getContractAddresses } from '../../constants/contracts';
import { XDC_MAINNET_ID as CHAIN_ID } from '../../constants/networks';
import EventControllerABI from '../../abi/EventController.json';
import { safeContractCall } from '../ethereum';

// Add a helper function to check if event filtering is supported
const isEventFilteringSupported = async (provider: ethers.Provider): Promise<boolean> => {
  try {
    // Use the correct method to check for event filtering support
    const filter = await provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      address: getContractAddresses(parseInt(CHAIN_ID, 16)).EVENT_CONTROLLER
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Event interface
export interface Event {
  id: string;
  metadataURI: string;
  organizer: string;
  maxTickets: number;
  ticketsSold: number;
  price: string;
  active: boolean;
  
  // Helper method to check if the event is valid
  isValid(): boolean;
  
  // For better serialization support
  toJSON(): Record<string, unknown>;
}

// Event implementation
export class EventImpl implements Event {
  id: string;
  metadataURI: string;
  organizer: string;
  maxTickets: number;
  ticketsSold: number;
  price: string;
  active: boolean;
  
  constructor(
    id: string,
    metadataURI: string,
    organizer: string,
    maxTickets: number,
    ticketsSold: number,
    price: string,
    active: boolean
  ) {
    this.id = id;
    this.metadataURI = metadataURI;
    this.organizer = organizer;
    this.maxTickets = maxTickets;
    this.ticketsSold = ticketsSold;
    this.price = price;
    this.active = active;
  }
  
  isValid(): boolean {
    return this.maxTickets > 0;
  }
  
  // For better serialization support
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      metadataURI: this.metadataURI,
      organizer: this.organizer,
      maxTickets: this.maxTickets,
      ticketsSold: this.ticketsSold,
      price: this.price,
      active: this.active,
      isValid: true // Include a flag for validity
    };
  }
}

// Event metadata interface
export interface EventMetadata {
  title: string;
  description: string;
  startDate: number; // UNIX timestamp
  endDate: number; // UNIX timestamp
  location: {
    type: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
    physical?: string;
    virtual?: string;
    address?: string;
    coordinates?: {
      latitude: string;
      longitude: string;
    }
  };
  capacity: number | {
    physical: number;
    virtual: number;
  };
  ticketTypes?: Array<{
    name: string;
    type?: 'PHYSICAL' | 'VIRTUAL';
    price: string;
    supply: number;
    perWalletLimit: number;
  }>;
  imageUrl?: string;
}

// Initialize contract
export const getEventControllerContract = (
  provider: ethers.Provider,
  chainId: number
) => {
  const addresses = getContractAddresses(chainId);
  return new ethers.Contract(addresses.EVENT_CONTROLLER, EventControllerABI, provider);
};

// Check if an event exists
export const eventExists = async (
  provider: ethers.Provider,
  chainId: number,
  eventId: string
): Promise<boolean> => {
  try {
    // Use getEvent to check if the event exists
    const event = await getEvent(provider, chainId, eventId);
    return event !== null && event.isValid();
  } catch (error) {
    console.error(`Error checking if event ${eventId} exists:`, error);
    return false;
  }
};

// Create a new event
export const createEvent = async (
  signer: ethers.Signer,
  chainId: number,
  eventData: EventMetadata,
  maxTickets: number,
  price: string
): Promise<number> => {
  try {
    const signerAddress = await signer.getAddress();
    console.log(`Creating event as ${signerAddress}`);
    
    const provider = signer.provider as ethers.Provider;
    if (!provider) {
      throw new Error("No provider available");
    }

    // Convert event data to JSON string
    const metadataURI = JSON.stringify(eventData);
    console.log('Creating event with metadata:', metadataURI);
    
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
    const contractAddress = getContractAddresses(chainId).EVENT_CONTROLLER;
    
    // Encode the function call
    const iface = new ethers.Interface(EventControllerABI);
    const data = iface.encodeFunctionData('createEvent', [
      metadataURI,
      maxTickets,
      ethers.parseEther(price)
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
    return 0; // Note: We're not waiting for the event ID since we're using raw transactions
    
    // The following code is commented out since we're using raw transactions
    // const receipt = await txResponse.wait();
    // if (!receipt) {
    //   console.warn('No transaction receipt received');
    //   return 0;
    // }
    
    // // Extract event ID from logs
    // // Look for EventCreated event and get the id from it
    // const abi = new ethers.Interface(EventControllerABI);
    
    // for (const log of receipt.logs) {
    //   try {
    //     // Use a more compatible parsing approach
    //     const topicsArray = Array.from(log.topics || []);
    //     const data = log.data || '0x';
    //     const parsedLog = abi.parseLog({ topics: topicsArray, data });
    //     if (parsedLog && parsedLog.name === 'EventCreated') {
    //       const eventId = parsedLog.args[0];
    //       console.log('Created event with ID:', eventId);
    //       return Number(eventId);
    //     }
    //   } catch (e) {
    //     console.log('Error parsing log:', e);
    //     // Skip logs that can't be parsed
    //     continue;
    //   }
    // }
    
    // // If we couldn't find the event ID, return a placeholder
    // console.warn('Could not determine created event ID from logs');
    // return 0;
  } catch (error) {
    console.error('Error creating event:', error);
    if (error instanceof Error) {
      if (error.message.includes('execution reverted')) {
        // Find the reason if possible
        const reasonMatch = error.message.match(/reason="([^"]+)"/);
        const reason = reasonMatch ? reasonMatch[1] : "Unknown reason";
        console.error(`Contract reverted: ${reason}`);
        throw new Error(`Contract error: ${reason}`);
      } else if (error.message.includes('gas required exceeds')) {
        console.error('Transaction requires too much gas. The event data may be too large.');
        throw new Error('Transaction requires too much gas. Please try with smaller event data or contact support.');
      }
    }
    throw error;
  }
};

// Get an event by ID
export const getEvent = async (
  provider: ethers.Provider,
  chainId: number,
  eventId: string
): Promise<Event | null> => {
  try {
    const contract = getEventControllerContract(provider, chainId);
    
    // Directly call the events function on the contract
    const eventData = await safeContractCall<[string, string, bigint, bigint, bigint, boolean]>(
      contract,
      'events',
      eventId
    );
    
    // Create an EventImpl instance
    const event = new EventImpl(
      eventId,
      eventData[0],
      eventData[1],
      Number(eventData[2]),
      Number(eventData[3]),
      ethers.formatEther(eventData[4]),
      eventData[5]
    );
    
    // Check if this is a valid event (maxTickets > 0)
    if (!event.isValid()) {
      console.log(`Event ${eventId} has maxTickets=0, considered invalid`);
      return null;
    }
    
    return event;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    return null;
  }
};

// Purchase tickets for an event
export const purchaseTickets = async (
  signer: ethers.Signer,
  chainId: number,
  eventId: string,
  amount: number,
  price: string
): Promise<boolean> => {
  try {
    const signerAddress = await signer.getAddress();
    console.log(`Purchasing ${amount} tickets for event ${eventId} as ${signerAddress}`);
    
    const provider = signer.provider as ethers.Provider;
    if (!provider) {
      throw new Error("No provider available");
    }

    // First get the event directly to verify it exists and is valid
    const event = await getEvent(provider, chainId, eventId);
    
    if (!event) {
      throw new Error(`Event ${eventId} does not exist or is invalid`);
    }
    
    if (!event.active) {
      throw new Error(`Event ${eventId} is not active`);
    }

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || await provider.getFeeData().then(fee => fee.gasPrice);
    
    // Prepare transaction parameters
    const txParams = {
      gasLimit: 500000,
      gasPrice: gasPrice,
      type: 0, // Use legacy transaction type
      value: ethers.parseEther(price) * BigInt(amount) // Calculate total value to send
    };
    
    // Create the transaction using the raw transaction approach
    const nonce = await provider.getTransactionCount(signerAddress);
    const contractAddress = getContractAddresses(chainId).EVENT_CONTROLLER;
    
    // Encode the function call
    const iface = new ethers.Interface(EventControllerABI);
    const data = iface.encodeFunctionData('purchaseTickets', [
      eventId,
      amount
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
    return true;
  } catch (error) {
    console.error(`Error purchasing tickets for event ${eventId}:`, error);
    if (error instanceof Error) {
      if (error.message.includes('execution reverted')) {
        // Find the reason if possible
        const reasonMatch = error.message.match(/reason="([^"]+)"/);
        const reason = reasonMatch ? reasonMatch[1] : "Unknown reason";
        console.error(`Contract reverted: ${reason}`);
        throw new Error(`Contract error: ${reason}`);
      } else if (error.message.includes('gas required exceeds')) {
        console.error('Transaction requires too much gas.');
        throw new Error('Transaction requires too much gas. Please try again or contact support.');
      }
    }
    return false;
  }
};

// Cancel an event
export const cancelEvent = async (
  signer: ethers.Signer,
  chainId: number,
  eventId: string
): Promise<boolean> => {
  try {
    const contract = getEventControllerContract(signer.provider as ethers.Provider, chainId);
    // Type assertion to make TypeScript happy
    const contractWithSigner = contract.connect(signer) as ethers.Contract & {
      cancelEvent: (eventId: string, options: { gasLimit: number }) => Promise<ethers.TransactionResponse>
    };
    
    // Direct contract call to avoid Web3Auth compatibility issues with ethers.js v6
    const tx = await contractWithSigner.cancelEvent(
      eventId,
      { gasLimit: 300000 }
    );
    
    await tx.wait();
    return true;
  } catch (error) {
    console.error(`Error canceling event ${eventId}:`, error);
    return false;
  }
};

// Check ticket balance for an address
export const getTicketBalance = async (
  provider: ethers.Provider,
  chainId: number,
  address: string,
  eventId: string
): Promise<number> => {
  try {
    const contract = getEventControllerContract(provider, chainId);
    const balance = await safeContractCall<bigint>(
      contract,
      'balanceOf',
      address,
      eventId
    );
    
    return Number(balance);
  } catch (error) {
    console.error(`Error checking ticket balance for event ${eventId}:`, error);
    return 0;
  }
};

// Modify the getAllEvents function to use polling when event filtering is not supported
export const getAllEvents = async (
  provider: ethers.Provider,
  chainId: number,
  maxEvents: number = 20
): Promise<Event[]> => {
  try {
    const events: Event[] = [];
    const contract = getEventControllerContract(provider, chainId);
    
    // Check if event filtering is supported
    const filteringSupported = await isEventFilteringSupported(provider);
    
    if (filteringSupported) {
      // Use event filtering if supported
      const filter = contract.filters.EventCreated();
      const logs = await contract.queryFilter(filter, 0, 'latest');
      
      for (const log of logs) {
        if (events.length >= maxEvents) break;
        
        if ('args' in log) {
          const eventId = log.args[0].toString();
          const event = await getEvent(provider, chainId, eventId);
          if (event) events.push(event);
        }
      }
    } else {
      // Fallback to polling if event filtering is not supported
      let eventId = 0;
      while (eventId < maxEvents) {
        try {
          const event = await getEvent(provider, chainId, eventId.toString());
          if (event && event.isValid()) {
            events.push(event);
          } else {
            break; // Stop if we hit an invalid event
          }
        } catch (error) {
          break; // Stop if we hit an error
        }
        eventId++;
      }
    }
    
    return events;
  } catch (error) {
    console.error('Error fetching all events:', error);
    return [];
  }
};

// Get events created by a specific address
export const getUserEvents = async (
  provider: ethers.Provider,
  chainId: number,
  userAddress: string,
  maxEvents: number = 20
): Promise<Event[]> => {
  try {
    const allEvents = await getAllEvents(provider, chainId, maxEvents);
    
    // Filter to include only events organized by the user
    return allEvents.filter(event => 
      event.organizer.toLowerCase() === userAddress.toLowerCase()
    );
  } catch (error) {
    console.error(`Error fetching events for user ${userAddress}:`, error);
    return [];
  }
};

// Update an existing event's metadata
export const updateEvent = async (
  signer: ethers.Signer,
  chainId: number,
  eventId: string,
  eventData: EventMetadata
): Promise<boolean> => {
  try {
    const signerAddress = await signer.getAddress();
    console.log(`Updating event ${eventId} as ${signerAddress}`);
    
    const provider = signer.provider as ethers.Provider;
    if (!provider) {
      throw new Error("No provider available");
    }

    // Get the current event to ensure we can only update valid events
    const currentEvent = await getEvent(provider, chainId, eventId);
    
    if (!currentEvent) {
      throw new Error(`Event ${eventId} does not exist or is invalid`);
    }
    
    // Verify the signer is the organizer
    if (currentEvent.organizer.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error('Only the event organizer can update this event');
    }
    
    // Check if event is active
    if (!currentEvent.active) {
      throw new Error('Cannot update an inactive or cancelled event');
    }
    
    // Convert updated event data to JSON string
    const metadataURI = JSON.stringify(eventData);
    console.log('Updating event with metadata:', metadataURI);
    
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
    const contractAddress = getContractAddresses(chainId).EVENT_CONTROLLER;
    
    // Encode the function call
    const iface = new ethers.Interface(EventControllerABI);
    const data = iface.encodeFunctionData('updateEventMetadata', [
      eventId,
      metadataURI
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
    return true;
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    if (error instanceof Error) {
      if (error.message.includes('execution reverted')) {
        // Find the reason if possible
        const reasonMatch = error.message.match(/reason="([^"]+)"/);
        const reason = reasonMatch ? reasonMatch[1] : "Unknown reason";
        console.error(`Contract reverted: ${reason}`);
        throw new Error(`Contract error: ${reason}`);
      } else if (error.message.includes('gas required exceeds')) {
        console.error('Transaction requires too much gas. The event data may be too large.');
        throw new Error('Transaction requires too much gas. Please try with smaller event data or contact support.');
      }
    }
    return false;
  }
};  