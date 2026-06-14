import { useState, useEffect } from 'react';
import { Request } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial requests and subscribe to changes
  useEffect(() => {
    fetchRequests();

    const subscription = supabase
      .channel('assistance_requests_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'assistance_requests' 
      }, (payload) => {
        handleRealtimeUpdate(payload);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from('assistance_requests')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      // Fallback to local storage if DB is unreachable
      const saved = localStorage.getItem('viyeko_requests');
      if (saved) setRequests(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  }

  const handleRealtimeUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setRequests(prev => [payload.new, ...prev]);
    } else if (payload.eventType === 'UPDATE') {
      setRequests(prev => prev.map(req => req.id === payload.new.id ? payload.new : req));
      
      // Notify user of status changes
      const oldReq = requests.find(r => r.id === payload.new.id);
      if (oldReq && oldReq.status !== payload.new.status) {
        toast.info(`Request status updated: ${payload.new.status}`);
      }
    }
  };

  const addRequest = async (newRequest: Request) => {
    try {
      const { error } = await supabase
        .from('assistance_requests')
        .insert([newRequest]);

      if (error) throw error;
      // Real-time listener will update the state
    } catch (err) {
      console.error('Error adding request:', err);
      // Fallback for offline mode
      setRequests(prev => [newRequest, ...prev]);
      localStorage.setItem('viyeko_requests', JSON.stringify([newRequest, ...requests]));
      toast.warning('Offline: Request saved locally and will sync when online.');
    }
  };

  const advanceStatus = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const statusOrder: Request['status'][] = ['searching', 'assigned', 'on-the-way', 'arrived', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(req.status);
    const nextStatus = statusOrder[currentIndex + 1] || 'completed';

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
