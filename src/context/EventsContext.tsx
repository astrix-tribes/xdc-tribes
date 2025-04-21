'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../app/components/Web3AuthProvider';
import { XDC_MAINNET_DECIMAL } from '../constants/networks';
import { 
  Event, 
  EventMetadata,
  purchaseTickets, 
  cancelEvent,
  createEvent,
  getAllEvents,
  getUserEvents,
  getEvent,
  updateEvent,
  getTicketBalance,
  getEventControllerContract
} from '../utils/contracts/eventController';
import { ROLES, hasRole, assignRole, grantRole } from '../utils/contracts/roleManager';
import { getServerProvider } from '../utils/server';
import type { SafeEventEmitterProvider } from '@web3auth/base';

interface EventsContextType {
  // Events
  userEvents: Event[];
  allEvents: Event[];
  loading: boolean;
  error: string | null;
  
  // User role
  isOrganizer: boolean;
  loadingRole: boolean;
  
  // Tickets
  userTickets: Record<string, number>; // Record of eventId to ticket count
  checkUserTickets: (eventId: string) => Promise<number>;
  
  // Actions
  refreshEvents: () => Promise<void>;
  checkOrganizerRole: () => Promise<boolean>;
  becomeOrganizer: () => Promise<boolean>;
  createNewEvent: (eventData: EventMetadata, maxTickets: number, price: string) => Promise<{ success: boolean; eventId: number }>;
  updateEvent: (eventId: string, eventData: EventMetadata) => Promise<{ success: boolean }>;
  purchaseEventTickets: (eventId: string, amount: number, price: string) => Promise<boolean>;
  cancelUserEvent: (eventId: string) => Promise<boolean>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

interface EventsProviderProps {
  children: ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const { account, isConnected, provider: web3AuthProvider } = useWallet();
  
  // Fixed chainId for contract interactions
  const chainId = XDC_MAINNET_DECIMAL;
  
  // Setup provider and signer
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);
  
  const [userTickets, setUserTickets] = useState<Record<string, number>>({});

  // Initialize provider and signer
  useEffect(() => {
    // First try to use Web3Auth provider if available
    if (web3AuthProvider && isConnected) {
      console.log("Using Web3Auth provider for EventsContext");
      try {
        const ethersProvider = new ethers.BrowserProvider(web3AuthProvider as SafeEventEmitterProvider);
        setProvider(ethersProvider);
        
        ethersProvider.getSigner().then(signer => {
          setSigner(signer);
        }).catch(err => {
          console.error('Error getting signer from Web3Auth:', err);
          // Fall back to window.ethereum if Web3Auth fails
          fallbackToWindowEthereum();
        });
      } catch (error) {
        console.error("Error initializing Web3Auth provider in EventsContext:", error);
        // Fall back to window.ethereum
        fallbackToWindowEthereum();
      }
    } else {
      // Fall back to window.ethereum if Web3Auth is not available
      fallbackToWindowEthereum();
    }
    
    // Fallback function to use window.ethereum
    function fallbackToWindowEthereum() {
      if (typeof window !== 'undefined' && window.ethereum) {
        console.log("Falling back to window.ethereum for EventsContext");
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);
        
        if (isConnected && account) {
          ethersProvider.getSigner().then(signer => {
            setSigner(signer);
          }).catch(err => {
            console.error('Error getting signer from window.ethereum:', err);
            setSigner(null);
          });
        } else {
          setSigner(null);
        }
      } else {
        console.log("No provider available in EventsContext", error);
        setProvider(null);
        setSigner(null);
      }
    }
  }, [isConnected, account, web3AuthProvider]);

  // Check if the user has the organizer role
  const checkOrganizerRole = async (): Promise<boolean> => {
    if (!provider || !account) {
      setIsOrganizer(false);
      setLoadingRole(false);
      return false;
    }
    console.log('Checking organizer role for account:', account);
    
    setLoadingRole(true);
    
    try {
      const hasOrganizerRole = await hasRole(
        provider,
        chainId,
        account,
        ROLES.ORGANIZER_ROLE
      );
      console.log("hasOrganizerRole consoling...",hasOrganizerRole)
      setIsOrganizer(hasOrganizerRole);
      setLoadingRole(false);
      console.log("hasOrganizerRole consoling...",hasOrganizerRole)
      return hasOrganizerRole;
    } catch (err) {
      console.error('Error checking organizer role:', err);
      setIsOrganizer(false);
      setLoadingRole(false);
      return false;
    }
  };

  // Become an organizer using admin key directly
  const becomeOrganizer = async (): Promise<boolean> => {
    if (!isConnected || !account) {
      return false;
    }
    
    try {
      // First try to assign role using assignRole function
      let success = await assignRole(
        getServerProvider(),
        chainId,
        account,
        ROLES.ORGANIZER_ROLE
      );
      console.log("success role status... using assignRole.",success)
      if (!success) {
        console.log('assignRole failed, trying grantRole as fallback');
        // If assignRole fails, try grantRole as a fallback
        success = await grantRole(
          getServerProvider(), 
          chainId,
          account,
          ROLES.ORGANIZER_ROLE
        );
        
        if (!success) {
          throw new Error('Failed to assign organizer role via both methods');
        }
      }
      
      // Wait a bit for the blockchain to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh the role status
      const updated = await checkOrganizerRole();
      console.log("updated role status....",updated)
      return updated;
    } catch (err) {
      console.error('Error becoming organizer:', err);
      return false;
    }
  };

  // Fetch all events
  const refreshEvents = async () => {
    if (!provider) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use our utility functions to get events
      const fetchedEvents = await getAllEvents(provider, chainId);
      setAllEvents(fetchedEvents);
      
      // Get user events if account is connected
      if (account) {
        const userEvts = await getUserEvents(provider, chainId, account);
        setUserEvents(userEvts);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Create a new event directly with contract
  const createNewEvent = async (
    eventData: EventMetadata,
    maxTickets: number,
    price: string
  ): Promise<{ success: boolean; eventId: number }> => {
    if (!isConnected || !account || !signer || !isOrganizer) {
      throw new Error('Must be connected and have organizer role');
    }
    
    try {
      // Call the contract directly
      const eventId = await createEvent(
        signer,
        chainId,
        eventData,
        maxTickets,
        price
      );
      
      // Refresh events list
      await refreshEvents();
      
      return { success: true, eventId };
    } catch (err) {
      console.error('Error creating event:', err);
      return { success: false, eventId: 0 };
    }
  };

  // Update an event
  const updateEventFunc = async (
    eventId: string,
    eventData: EventMetadata
  ): Promise<{ success: boolean }> => {
    if (!isConnected || !account || !signer || !isOrganizer) {
      throw new Error('Must be connected and have organizer role');
    }
    
    try {
      // Call the contract directly
      const success = await updateEvent(
        signer,
        chainId,
        eventId,
        eventData
      );
      
      // Refresh events list
      await refreshEvents();
      
      return { success };
    } catch (err) {
      console.error('Error updating event:', err);
      return { success: false };
    }
  };

  // Purchase tickets for an event - directly using contract call
  const purchaseEventTickets = async (
    eventId: string,
    amount: number,
    price: string
  ): Promise<boolean> => {
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // First get the event directly to verify it exists and is valid
      const event = await getEvent(signer.provider as ethers.Provider, chainId, eventId);
      
      if (!event) {
        throw new Error(`Event ${eventId} does not exist or is invalid`);
      }
      
      if (!event.active) {
        throw new Error(`Event ${eventId} is not active`);
      }
      
      const success = await purchaseTickets(
        signer,
        chainId,
        eventId,
        amount,
        price
      );
      
      await refreshEvents();
      return success;
    } catch (err) {
      console.error('Error purchasing tickets:', err);
      return false;
    }
  };

  // Cancel an event (organizer only) - directly using contract call
  const cancelUserEvent = async (eventId: string): Promise<boolean> => {
    if (!signer || !isConnected || !isOrganizer) {
      throw new Error('Must be connected and have organizer role');
    }
    
    try {
      // First get the event directly to verify it exists and is valid
      const event = await getEvent(signer.provider as ethers.Provider, chainId, eventId);
      
      if (!event) {
        throw new Error(`Event ${eventId} does not exist or is invalid`);
      }
      
      // Verify the user is the organizer of this event
      if (event.organizer.toLowerCase() !== account?.toLowerCase()) {
        throw new Error('You are not the organizer of this event');
      }
      
      const success = await cancelEvent(
        signer,
        chainId,
        eventId
      );
      
      await refreshEvents();
      return success;
    } catch (err) {
      console.error('Error canceling event:', err);
      return false;
    }
  };

  // Check role and load events when connected
  useEffect(() => {
    if (provider && account) {
      checkOrganizerRole();
      refreshEvents();
    }
  }, [provider, account]);

  // Check the user's ticket balance for a specific event
  const checkUserTickets = async (eventId: string): Promise<number> => {
    if (!provider || !account) return 0;
    
    try {
      const balance = await getTicketBalance(provider, chainId, account, eventId);
      
      // Update the userTickets state
      setUserTickets(prev => ({
        ...prev,
        [eventId]: balance
      }));
      
      return balance;
    } catch (error) {
      console.error("Error checking user tickets:", error);
      return 0;
    }
  };

  // Set up listener for TicketPurchased events
  const setupTicketPurchasedListener = async () => {
    if (!provider || !account) return;
    
    try {
      const contract = getEventControllerContract(provider, chainId);
      
      // Create filter for TicketPurchased events where the buyer is the current user
      const filter = contract.filters.TicketPurchased(null, account);
      
      // Remove any existing listeners to avoid duplicates
      contract.removeAllListeners(filter);
      
      // Listen for ticket purchases by the current user
      contract.on(filter, (eventId: string, buyer: string, amount: bigint) => {
        console.log(`🎟 Ticket Purchased!`);
        console.log(`Event ID: ${eventId}`);
        console.log(`Buyer: ${buyer}`);
        console.log(`Amount: ${amount}`);
        
        // Update the ticket balance for this event
        setUserTickets(prev => ({
          ...prev,
          [eventId.toString()]: (prev[eventId.toString()] || 0) + Number(amount)
        }));
      });
      
      return () => {
        contract.removeAllListeners(filter);
      };
    } catch (error) {
      console.error("Error setting up ticket purchase listener:", error);
      return undefined;
    }
  };
  
  // Check ticket balances for all events the user has joined
  const checkAllUserTickets = async () => {
    if (!provider || !account || allEvents.length === 0) return;
    
    try {
      const ticketBalances: Record<string, number> = {};
      
      // Check ticket balance for each event
      for (const event of allEvents) {
        const balance = await getTicketBalance(provider, chainId, account, event.id);
        if (balance > 0) {
          ticketBalances[event.id] = balance;
        }
      }
      
      setUserTickets(ticketBalances);
    } catch (error) {
      console.error("Error checking all user tickets:", error);
    }
  };
  
  // Set up ticket purchase listener when provider and account are available
  useEffect(() => {
    if (provider && account) {
      const cleanupPromise = setupTicketPurchasedListener();
      checkAllUserTickets();
      
      return () => {
        cleanupPromise.then(cleanup => {
          if (cleanup) cleanup();
        }).catch(error => {
          console.error("Error during cleanup:", error);
        });
      };
    }
  }, [provider, account, allEvents.length]);

  const value = {
    userEvents,
    allEvents,
    loading,
    error,
    isOrganizer,
    loadingRole,
    userTickets,
    checkUserTickets,
    refreshEvents,
    checkOrganizerRole,
    becomeOrganizer,
    createNewEvent,
    updateEvent: updateEventFunc,
    purchaseEventTickets,
    cancelUserEvent,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
}; 