'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { EventsProvider, useEvents } from '../../../context/EventsContext';
import { useWallet } from '../../components/Web3AuthProvider';
import Header from '../../components/Header';
import { formatAddress } from '../../../utils/ethereum';
import { Event, EventMetadata } from '../../../utils/contracts/eventController';
import EventTicketPurchaseModal from '../../../components/events/EventTicketPurchaseModal';
import EventCancelModal from '../../../components/events/EventCancelModal';
import EventUpdateModal from '../../../components/events/EventUpdateModal';
import NextImageWrapper from '../../../components/NextImageWrapper';

const EventDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { account, isConnected } = useWallet();
  const { 
    allEvents, 
    refreshEvents, 
    cancelUserEvent, 
    purchaseEventTickets, 
    updateEvent,
    userTickets,
    checkUserTickets
  } = useEvents();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const [userTicketCount, setUserTicketCount] = useState<number>(0);
  const [checkingTickets, setCheckingTickets] = useState<boolean>(false);
  
  // Get the event ID from the route params
  const eventId = params.id as string;
  
  // Find the event from the context
  useEffect(() => {
    if (allEvents.length > 0) {
      const foundEvent = allEvents.find(e => e.id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
        setError(null);
      } else {
        setError('Event not found');
      }
      setLoading(false);
    }
  }, [allEvents, eventId]);
  
  // Check if the user has tickets for this event
  useEffect(() => {
    if (isConnected && account && eventId) {
      // Only start checking if we don't already have the value
      if (userTickets[eventId] === undefined) {
        setCheckingTickets(true);
        
        checkUserTickets(eventId)
          .then(count => {
            setUserTicketCount(count);
          })
          .catch(error => {
            console.error("Error checking user tickets:", error);
          })
          .finally(() => {
            setCheckingTickets(false);
          });
      } else {
        // If we already have the ticket count in the context, use it without showing loading
        setUserTicketCount(userTickets[eventId]);
        setCheckingTickets(false);
      }
    }
  }, [isConnected, account, eventId, userTickets, checkUserTickets]);
  
  // Update the user ticket count when userTickets changes
  useEffect(() => {
    if (eventId && userTickets[eventId] !== undefined) {
      setUserTicketCount(userTickets[eventId]);
    }
  }, [userTickets, eventId]);
  
  // Parse event metadata
  const eventData = event?.metadataURI ? JSON.parse(event.metadataURI) : null;
  
  // Check if the current user is the organizer
  const isOrganizer = isConnected && account && event?.organizer.toLowerCase() === account.toLowerCase();
  
  // Handle cancel event
  const handleCancelEvent = async () => {
    if (!event) return;
    
    setProcessing(true);
    setTransactionStatus(null);
    
    try {
      // Check if anyone has bought tickets
      if (Number(event.ticketsSold) > 0) {
        setTransactionStatus({
          success: false,
          message: 'Cannot cancel event because tickets have already been sold.'
        });
        setProcessing(false);
        return;
      }
      
      const success = await cancelUserEvent(event.id);
      
      if (success) {
        setTransactionStatus({
          success: true,
          message: 'Event cancelled successfully!'
        });
        // Refresh events after a short delay
        setTimeout(() => {
          refreshEvents();
          router.push('/events');
        }, 2000);
      } else {
        setTransactionStatus({
          success: false,
          message: 'Failed to cancel event. Please try again.'
        });
      }
    } catch (err) {
      console.error('Error cancelling event:', err);
      setTransactionStatus({
        success: false,
        message: err instanceof Error ? err.message : 'An unknown error occurred'
      });
    } finally {
      setProcessing(false);
      setShowCancelModal(false);
    }
  };
  
  // Handle purchase tickets
  const handlePurchaseTickets = async (quantity: number) => {
    if (!event) return;
    
    setProcessing(true);
    setTransactionStatus(null);
    
    try {
      // Calculate total price
      const totalPrice = (parseFloat(event.price) * quantity).toString();
      
      const success = await purchaseEventTickets(event.id, quantity, totalPrice);
      
      if (success) {
        setTransactionStatus({
          success: true,
          message: `Successfully purchased ${quantity} ticket${quantity !== 1 ? 's' : ''}!`
        });
        // Refresh events after a short delay
        setTimeout(() => {
          refreshEvents();
        }, 2000);
      } else {
        setTransactionStatus({
          success: false,
          message: 'Failed to purchase tickets. Please try again.'
        });
      }
    } catch (err) {
      console.error('Error purchasing tickets:', err);
      setTransactionStatus({
        success: false,
        message: err instanceof Error ? err.message : 'An unknown error occurred'
      });
    } finally {
      setProcessing(false);
      setShowPurchaseModal(false);
    }
  };
  
  // Handle update event
  const handleUpdateEvent = async (eventData: EventMetadata) => {
    if (!event) return;
    
    setProcessing(true);
    setTransactionStatus(null);
    
    try {
      const result = await updateEvent(event.id, eventData);
      
      if (result.success) {
        setTransactionStatus({
          success: true,
          message: 'Event updated successfully!'
        });
        
        // Close the modal
        setShowUpdateModal(false);
        
        // Refresh events after a short delay
        setTimeout(() => {
          refreshEvents();
          
          // Stay on the same page since the ID remains the same
          // Update the UI to show new event data
        }, 2000);
      } else {
        setTransactionStatus({
          success: false,
          message: 'Failed to update event. Please try again.'
        });
      }
    } catch (err) {
      console.error('Error updating event:', err);
      setTransactionStatus({
        success: false,
        message: err instanceof Error ? err.message : 'An unknown error occurred'
      });
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
        <Header />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center py-8 text-gray-300">Loading event details...</div>
        </div>
      </div>
    );
  }
  
  if (error || !event || !eventData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
        <Header />
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error || 'Event details not available'}</p>
            <Link 
              href="/events"
              className="bg-[#244B81] text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Format dates
  const startDate = eventData.startDate 
    ? new Date(eventData.startDate * 1000).toLocaleString() 
    : 'Unknown date';
  
  const endDate = eventData.endDate 
    ? new Date(eventData.endDate * 1000).toLocaleString() 
    : 'Unknown date';
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Header />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/events" className="text-purple-400 hover:text-purple-300 mr-4">
              ← Back to Events
            </Link>
          </div>
          
          {/* Status messages */}
          {transactionStatus && (
            <div className={`mb-6 p-4 rounded-lg ${transactionStatus.success ? 'bg-green-900/30 border border-green-700 text-green-400' : 'bg-red-900/30 border border-red-700 text-red-400'}`}>
              {transactionStatus.message}
            </div>
          )}
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
            {eventData.imageUrl && (
              <div className="relative h-64 overflow-hidden">
                <NextImageWrapper 
                  src={eventData.imageUrl} 
                  alt={eventData.title}
                  fill={true}
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4 text-gray-100">{eventData.title}</h1>
              
              <div className="flex flex-wrap justify-between mb-6">
                <div className="mb-4 mr-6">
                  <h2 className="text-lg font-semibold mb-2 text-gray-200">Event Details</h2>
                  <p className="text-gray-400 mb-1">
                    <span className="font-medium">Start:</span> {startDate}
                  </p>
                  <p className="text-gray-400 mb-1">
                    <span className="font-medium">End:</span> {endDate}
                  </p>
                  <p className="text-gray-400 mb-1">
                    <span className="font-medium">Location Type:</span> {eventData.location.type}
                  </p>
                  {eventData.location.physical && (
                    <p className="text-gray-400 mb-1">
                      <span className="font-medium">Venue:</span> {eventData.location.physical}
                    </p>
                  )}
                  {eventData.location.virtual && (
                    <p className="text-gray-400 mb-1">
                      <span className="font-medium">Virtual Link:</span> {eventData.location.virtual}
                    </p>
                  )}
                </div>
                
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2 text-gray-200">Ticket Information</h2>
                  <p className="text-gray-400 mb-1">
                    <span className="font-medium">Price:</span> <span className="text-purple-300 font-semibold">{event.price} ETH</span>
                  </p>
                  <p className="text-gray-400 mb-1">
                    <span className="font-medium">Available:</span> {Number(event.maxTickets) - Number(event.ticketsSold)} / {event.maxTickets}
                  </p>
                  <p className="text-gray-400 mb-1">
                    <span className="font-medium">Organizer:</span> {formatAddress(event.organizer)}
                  </p>
                  <p className="text-gray-400 mb-1">
                    <span className="font-medium">Status:</span> {event.active ? (
                      <span className="text-green-400">Active</span>
                    ) : (
                      <span className="text-red-400">Cancelled</span>
                    )}
                  </p>
                </div>
              </div>
              
              {/* User's Tickets Section */}
              {isConnected && (
                <div className="border-t border-gray-700 pt-6 mb-6">
                  <h2 className="text-lg font-semibold mb-3 text-gray-200">Your Tickets</h2>
                  
                  {checkingTickets ? (
                    <p className="text-gray-400">Checking your ticket balance...</p>
                  ) : userTicketCount > 0 ? (
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-300 text-xl font-bold">{userTicketCount}</p>
                          <p className="text-gray-300">{userTicketCount === 1 ? 'Ticket' : 'Tickets'} Purchased</p>
                        </div>
                        
                        <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-3">
                          <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                        </div>
                      </div>
                      
                      <p className="mt-2 text-gray-400 text-sm">
                        Thank you for your purchase! You will need to present these tickets when attending the event.
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400">
                      You haven&apos;t purchased any tickets for this event yet. Purchase tickets below to attend!
                    </p>
                  )}
                </div>
              )}
              
              <div className="border-t border-gray-700 pt-6 mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-200">Description</h2>
                <p className="text-gray-300 whitespace-pre-line">{eventData.description}</p>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <div className="flex flex-wrap gap-4">
                  {isConnected && event.active && (
                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      disabled={processing || Number(event.maxTickets) <= Number(event.ticketsSold)}
                      className="bg-[#244B81] text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processing ? 'Processing...' : (userTicketCount > 0 ? 'Purchase More Tickets' : 'Purchase Tickets')}
                    </button>
                  )}
                  
                  {isOrganizer && event.active && (
                    <>
                      <button
                        onClick={() => setShowUpdateModal(true)}
                        disabled={processing}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processing ? 'Processing...' : 'Update Event'}
                      </button>
                      
                      <button
                        onClick={() => setShowCancelModal(true)}
                        disabled={processing}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processing ? 'Processing...' : 'Cancel Event'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Purchase Modal */}
      {showPurchaseModal && (
        <EventTicketPurchaseModal
          event={event}
          onClose={() => setShowPurchaseModal(false)}
          onPurchase={handlePurchaseTickets}
          processing={processing}
        />
      )}
      
      {/* Cancel Modal */}
      {showCancelModal && (
        <EventCancelModal
          event={event}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelEvent}
          processing={processing}
        />
      )}
      
      {/* Update Modal */}
      {showUpdateModal && (
        <EventUpdateModal
          event={event}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={handleUpdateEvent}
          processing={processing}
        />
      )}
    </div>
  );
};

const EventDetailPage = () => {
  return (
    <EventsProvider>
      <EventDetail />
    </EventsProvider>
  );
};

export default EventDetailPage; 