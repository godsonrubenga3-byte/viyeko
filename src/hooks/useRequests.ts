import { useState, useEffect, useCallback, useRef } from 'react';
import { Request, Bid } from '../types';
import { supabase } from '../lib/supabase';
import { ably, ABLY_CHANNELS } from '../lib/ably';
import { toast } from 'sonner';

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ABLY INTEGRATION: Private Bid & Status Subscriptions
  useEffect(() => {
    if (!ably) return;

    const activeRequests = requests.filter(r => 
      r.status !== 'completed' && 
      r.status !== 'canceled'
    );
    
    const activeChannels: { channel: any; event: string; callback: any }[] = [];

    activeRequests.forEach(req => {
      // 1. Subscribe to Bids
      const bidChannel = ably.channels.get(ABLY_CHANNELS.requestBids(req.id));
      const bidCallback = (message: any) => {
        const bid: Bid = message.data;
        setRequests(prev => prev.map(r => {
          if (r.id === req.id) {
            if (r.bids?.some(b => b.id === bid.id)) return r;
            return { ...r, bids: [...(r.bids || []), bid], status: 'bidding' };
          }
          return r;
        }));
        toast.success(`New bid for ${req.id.slice(0,4)}: TZS ${bid.price.toLocaleString()}`);
      };
      bidChannel.subscribe('new-bid', bidCallback);
      activeChannels.push({ channel: bidChannel, event: 'new-bid', callback: bidCallback });

      // 2. Subscribe to Status Updates
      const statusChannel = ably.channels.get(ABLY_CHANNELS.requestStatus(req.id));
      const statusCallback = (message: any) => {
        const { status, lastUpdatedBy } = message.data;
        setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status, lastUpdatedBy } : r));
      };
      statusChannel.subscribe('status-change', statusCallback);
      activeChannels.push({ channel: statusChannel, event: 'status-change', callback: statusCallback });
    });

    return () => {
      activeChannels.forEach(({ channel, event, callback }) => {
        channel.unsubscribe(event, callback);
      });
    };
    }, [requests.map(r => `${r.id}-${r.status}`).join(',')]); 

    // HELPER: Check credentials
  const hasValidCreds = useCallback(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    return url && key && !url.includes('YOUR_SUPABASE_URL') && !key.includes('YOUR_PUBLISHABLE_KEY');
  }, []);

  const mapToFrontend = (dbReq: any): Request => ({
    id: dbReq.id,
    serviceId: dbReq.service_id,
    addOnIds: dbReq.addon_ids,
    status: dbReq.status,
    location: dbReq.location,
    timestamp: dbReq.timestamp,
    vehicleInfo: dbReq.vehicle_info,
    notes: dbReq.notes,
    estimatedArrival: dbReq.estimated_arrival,
    totalCost: dbReq.total_cost,
    userId: dbReq.user_id,
    providerId: dbReq.provider_id,
    lastUpdatedBy: dbReq.last_updated_by,
    // Map relational bids or fallback to empty array
    bids: (dbReq.bids || []).map((b: any) => ({
      id: b.id,
      providerId: b.provider_id,
      providerName: b.provider_name,
      price: b.price,
      eta: b.eta,
      rating: b.rating,
      timestamp: b.timestamp
    })),
    acceptedBidId: dbReq.accepted_bid_id
  });

  const mapToDatabase = (req: Request) => {
    const data: any = {
      id: req.id,
      service_id: req.serviceId,
      addon_ids: req.addOnIds || [],
      status: req.status,
      location: req.location,
      timestamp: req.timestamp,
      vehicle_info: req.vehicleInfo,
      notes: req.notes,
      estimated_arrival: req.estimatedArrival || 15,
      total_cost: req.totalCost || 0,
      last_updated_by: req.lastUpdatedBy
    };

    // Use current user ID for the request
    if (req.userId && req.userId !== '00000000-0000-0000-0000-000000000000') {
      data.user_id = req.userId;
    }

    // Note: We no longer send 'bids' here as they live in their own table
    return data;
  };

  const fetchRequests = useCallback(async () => {
    if (!hasValidCreds()) {
      const saved = localStorage.getItem('viyeko_requests');
      if (saved) setRequests(JSON.parse(saved));
      setLoading(false);
      return;
    }

    try {
      // Fetch ALL requests for the user (or open ones for providers)
      // The filtering for 'History' vs 'Active' happens in the UI components
      const { data, error } = await supabase
        .from('assistance_requests')
        .select('*, bids:assistance_bids(*)')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setRequests((data || []).map(mapToFrontend));
    } catch (err: any) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  }, [hasValidCreds]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const addRequest = async (newRequest: Request) => {
    const preparedReq = { ...newRequest, status: 'searching' as const };
    
    // 1. Optimistic Update
    setRequests(prev => [preparedReq, ...prev]);

    // 2. Real-time Broadcast
    if (ably) {
      const channel = ably.channels.get(ABLY_CHANNELS.regionBroadcast('Tanzania'));
      channel.publish('new-breakdown', preparedReq);
    }

    // 3. Persistence
    if (!hasValidCreds()) {
      const saved = localStorage.getItem('viyeko_requests') || '[]';
      const updated = [preparedReq, ...JSON.parse(saved)];
      localStorage.setItem('viyeko_requests', JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase
        .from('assistance_requests')
        .insert([mapToDatabase(preparedReq)]);
      
      if (error) throw error;
      
      // Refresh to get the server-side state (including proper IDs)
      fetchRequests();
    } catch (err: any) {
      console.error('Error adding request:', err);
      toast.error("Connection error: Request not saved to cloud.");
      // Rollback optimistic update on error
      setRequests(prev => prev.filter(r => r.id !== preparedReq.id));
    }
  };

  const submitBid = async (requestId: string, bid: Bid) => {
    if (ably) {
      ably.channels.get(ABLY_CHANNELS.requestBids(requestId)).publish('new-bid', bid);
    }

    try {
      // 1. Insert into relational bids table
      const { error: bidError } = await supabase
        .from('assistance_bids')
        .insert([{
          id: bid.id,
          request_id: requestId,
          // provider_id is handled by database default (auth.uid())
          provider_name: bid.providerName,
          price: bid.price,
          eta: bid.eta,
          rating: bid.rating,
          timestamp: bid.timestamp
        }]);

      if (bidError) throw bidError;

      // 2. Update status and track that a provider made the change
      await supabase
        .from('assistance_requests')
        .update({ 
          status: 'bidding',
          last_updated_by: 'provider'
        })
        .eq('id', requestId);
        
    } catch (err) {
      console.error('Bid submission failed:', err);
      toast.error("Failed to submit bid.");
    }
  };

  const acceptBid = async (requestId: string, bid: Bid) => {
    if (ably) {
      const channel = ably.channels.get(ABLY_CHANNELS.requestStatus(requestId));
      channel.publish('status-change', { status: 'assigned', lastUpdatedBy: 'driver' });
    }

    if (!hasValidCreds()) {
      setRequests(prev => prev.map(r => r.id === requestId ? { 
        ...r, 
        status: 'assigned',
        providerId: bid.providerId,
        acceptedBidId: bid.id,
        totalCost: bid.price,
        estimatedArrival: bid.eta
      } : r));
      return;
    }

    // MITIGATION: Client-Side Pricing Trust
    // Call the secure Edge Function to lock the contract
    try {
      const { data, error } = await supabase.functions.invoke('accept-bid', {
        body: { requestId, bidId: bid.id }
      });

      if (error) throw error;
      toast.success(`Rescue confirmed with ${bid.providerName}`);
      fetchRequests(); // Ensure we have the latest state from server
    } catch (err: any) {
      console.error('Accept error:', err);
      toast.error('Failed to securely confirm rescue. Please try again.');
    }
  };


  const advanceStatus = async (requestId: string, updaterRole: 'driver' | 'provider' = 'provider') => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const statusOrder: Request['status'][] = ['searching', 'bidding', 'assigned', 'on-the-way', 'arrived', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(req.status);
    const nextStatus = statusOrder[currentIndex + 1] || 'completed';

    if (ably) {
      const channel = ably.channels.get(ABLY_CHANNELS.requestStatus(requestId));
      channel.publish('status-change', { status: nextStatus, lastUpdatedBy: updaterRole });
    }

    if (!hasValidCreds()) {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: nextStatus, lastUpdatedBy: updaterRole } : r));
      return;
    }

    try {
      await supabase
        .from('assistance_requests')
        .update({ 
          status: nextStatus,
          last_updated_by: updaterRole
        })
        .eq('id', requestId);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const cancelRequest = async (requestId: string, updaterRole: 'driver' | 'provider' = 'driver') => {
    if (ably) {
      const channel = ably.channels.get(ABLY_CHANNELS.requestStatus(requestId));
      channel.publish('status-change', { status: 'canceled', lastUpdatedBy: updaterRole });
    }

    if (!hasValidCreds()) {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'canceled' as const, lastUpdatedBy: updaterRole } : r));
      return;
    }

    try {
      await supabase
        .from('assistance_requests')
        .update({ 
          status: 'canceled',
          last_updated_by: updaterRole
        })
        .eq('id', requestId);
      toast.error('Rescue Request Cancelled');
    } catch (err) {
      console.error('Cancellation failed:', err);
    }
  };

  return {
    requests,
    loading,
    addRequest,
    submitBid,
    acceptBid,
    advanceStatus,
    cancelRequest,
    refresh: fetchRequests
  };
}
