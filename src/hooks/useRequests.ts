import { useState, useEffect, useCallback, useRef } from 'react';
import { Request } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

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
    providerId: dbReq.provider_id
  });

  const mapToDatabase = (req: Request) => ({
    id: req.id,
    service_id: req.serviceId,
    addon_ids: req.addOnIds,
    status: req.status,
    location: req.location,
    timestamp: req.timestamp,
    vehicle_info: req.vehicleInfo,
    notes: req.notes,
    estimated_arrival: req.estimatedArrival,
    total_cost: req.totalCost,
    user_id: req.userId || '00000000-0000-0000-0000-000000000000'
  });

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
    } catch (err) {
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

  useEffect(() => {
    if (!hasValidCreds()) return;

    const channelId = `reqs_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'assistance_requests' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRequests(prev => {
            if (prev.some(r => r.id === payload.new.id)) return prev;
            return [mapToFrontend(payload.new), ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setRequests(prev => prev.map(req => req.id === payload.new.id ? mapToFrontend(payload.new) : req));
          toast.info(`Request status updated: ${payload.new.status}`);
        }
      });

    channelRef.current = channel;
    channel.subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [hasValidCreds]);

  const addRequest = async (newRequest: Request) => {
    if (!hasValidCreds()) {
      const updated = [newRequest, ...requests];
      setRequests(updated);
      localStorage.setItem('viyeko_requests', JSON.stringify(updated));
      toast.success('Offline mode: Request saved');
      return;
    }

    try {
      const { error } = await supabase
        .from('assistance_requests')
        .insert([mapToDatabase(newRequest)]);

      if (error) throw error;
    } catch (err) {
      console.error('Error adding request:', err);
      setRequests(prev => [newRequest, ...prev]);
      localStorage.setItem('viyeko_requests', JSON.stringify([newRequest, ...requests]));
    }
  };

  const advanceStatus = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const statusOrder: Request['status'][] = ['searching', 'assigned', 'on-the-way', 'arrived', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(req.status);
    const nextStatus = statusOrder[currentIndex + 1] || 'completed';

    if (!hasValidCreds()) {
      const updated = requests.map(r => r.id === requestId ? { 
        ...r, 
        status: nextStatus,
        estimatedArrival: nextStatus === 'completed' ? 0 : Math.max(0, (r.estimatedArrival || 0) - 3)
      } : r);
      setRequests(updated);
      localStorage.setItem('viyeko_requests', JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase
        .from('assistance_requests')
        .update({ 
          status: nextStatus,
          estimated_arrival: nextStatus === 'completed' ? 0 : Math.max(0, (req.estimatedArrival || 0) - 3)
        })
        .eq('id', requestId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const cancelRequest = async (requestId: string) => {
    if (!hasValidCreds()) {
      const updated = requests.map(r => r.id === requestId ? { ...r, status: 'completed' as const } : r);
      setRequests(updated);
      localStorage.setItem('viyeko_requests', JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase
        .from('assistance_requests')
        .update({ status: 'completed' })
        .eq('id', requestId);

      if (error) throw error;
      toast.error('Request cancelled');
    } catch (err) {
      console.error('Error cancelling request:', err);
    }
  };

  return {
    requests,
    loading,
    addRequest,
    advanceStatus,
    cancelRequest,
    refresh: fetchRequests
  };
}
