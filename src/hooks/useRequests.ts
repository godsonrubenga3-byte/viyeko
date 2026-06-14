import { useState, useEffect, useCallback, useRef } from 'react';
import { Request } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  // Helper to check if credentials are valid (not placeholders)
  const hasValidCreds = useCallback(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    return url && key && !url.includes('YOUR_SUPABASE_URL') && !key.includes('YOUR_PUBLISHABLE_KEY');
  }, []);

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
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      const saved = localStorage.getItem('viyeko_requests');
      if (saved) setRequests(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  }, [hasValidCreds]);

  // Initial fetch
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Real-time subscription hardening
  useEffect(() => {
    if (!hasValidCreds()) return;

    // Create a unique channel ID to avoid collisions during HMR/Strict Mode
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
            return [payload.new as Request, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setRequests(prev => prev.map(req => req.id === payload.new.id ? (payload.new as Request) : req));
          toast.info(`Request updated: ${payload.new.status}`);
        }
      });

    // Store in ref and subscribe
    channelRef.current = channel;
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to assistance_requests');
      }
    });

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
      toast.success('Mock Mode: Request saved locally');
      return;
    }

    try {
      const { error } = await supabase
        .from('assistance_requests')
        .insert([newRequest]);

      if (error) throw error;
    } catch (err) {
      console.error('Error adding request:', err);
      setRequests(prev => [newRequest, ...prev]);
      localStorage.setItem('viyeko_requests', JSON.stringify([newRequest, ...requests]));
      toast.warning('Offline: Request saved locally.');
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
          estimatedArrival: nextStatus === 'completed' ? 0 : Math.max(0, (req.estimatedArrival || 0) - 3)
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
