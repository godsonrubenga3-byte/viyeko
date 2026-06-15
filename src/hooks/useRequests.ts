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
      r.status === 'searching' || 
      r.status === 'bidding' || 
      r.status === 'assigned' || 
      r.status === 'on-the-way'
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
        const { status } = message.data;
        setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status } : r));
      };
      statusChannel.subscribe('status-change', statusCallback);
      activeChannels.push({ channel: statusChannel, event: 'status-change', callback: statusCallback });
    });

    return () => {
      activeChannels.forEach(({ channel, event, callback }) => {
        channel.unsubscribe(event, callback);
      });
    };
  }, [requests.length]); 

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
    bids: dbReq.bids || [],
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
      user_id: req.userId || '00000000-0000-0000-0000-000000000000'
    };
    if (req.bids && req.bids.length > 0) data.bids = req.bids;
    if (req.acceptedBidId) data.accepted_bid_id = req.acceptedBidId;
    if (req.providerId) data.provider_id = req.providerId;
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
      const { data, error } = await supabase
        .from('assistance_requests')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setRequests((data || []).map(mapToFrontend));
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      const saved = localStorage.getItem('viyeko_requests');
      if (saved) setRequests(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  }, [hasValidCreds]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const addRequest = async (newRequest: Request) => {
    const preparedReq = { ...newRequest, status: 'searching' as const };
    
    if (ably) {
      const channel = ably.channels.get(ABLY_CHANNELS.regionBroadcast('Tanzania'));
      channel.publish('new-breakdown', preparedReq);
    }

    if (!hasValidCreds()) {
      const updated = [preparedReq, ...requests];
      setRequests(updated);
      localStorage.setItem('viyeko_requests', JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase
        .from('assistance_requests')
        .insert([mapToDatabase(preparedReq)]);
      
      if (error) throw error;
    } catch (err: any) {
      console.error('Error adding request:', err);
      setRequests(prev => [preparedReq, ...prev]);
    }
  };

  const submitBid = async (requestId: string, bid: Bid) => {
    if (ably) {
      ably.channels.get(ABLY_CHANNELS.requestBids(requestId)).publish('new-bid', bid);
    }

    // Persist to DB with fresh state check
    try {
      const { data } = await supabase
        .from('assistance_requests')
        .select('bids')
        .eq('id', requestId)
        .single();
      
      const currentBids = data?.bids || [];
      const updatedBids = [...currentBids, bid];

      await supabase
        .from('assistance_requests')
        .update({ bids: updatedBids, status: 'bidding' })
        .eq('id', requestId);
    } catch (err) {
      console.error('Bid submission failed:', err);
    }
  };

  const acceptBid = async (requestId: string, bid: Bid) => {
    if (ably) {
      const channel = ably.channels.get(ABLY_CHANNELS.requestStatus(requestId));
      channel.publish('status-change', { status: 'assigned' });
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

    try {
      await supabase
        .from('assistance_requests')
        .update({ 
          status: 'assigned',
          provider_id: bid.providerId,
          accepted_bid_id: bid.id,
          total_cost: bid.price,
          estimated_arrival: bid.eta
        })
        .eq('id', requestId);
      toast.success(`Rescue confirmed with ${bid.providerName}`);
    } catch (err) {
      console.error('Accept error:', err);
    }
  };

  const advanceStatus = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const statusOrder: Request['status'][] = ['searching', 'bidding', 'assigned', 'on-the-way', 'arrived', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(req.status);
    const nextStatus = statusOrder[currentIndex + 1] || 'completed';

    if (ably) {
      const channel = ably.channels.get(ABLY_CHANNELS.requestStatus(requestId));
      channel.publish('status-change', { status: nextStatus });
    }

    if (!hasValidCreds()) {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: nextStatus } : r));
      return;
    }

    try {
      await supabase
        .from('assistance_requests')
        .update({ status: nextStatus })
        .eq('id', requestId);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const cancelRequest = async (requestId: string) => {
    if (ably) {
      ably.channels.get(ABLY_CHANNELS.requestStatus(requestId)).publish('status-change', { status: 'completed' });
    }

    if (!hasValidCreds()) {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'completed' as const } : r));
      return;
    }

    try {
      await supabase
        .from('assistance_requests')
        .update({ status: 'completed' })
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
