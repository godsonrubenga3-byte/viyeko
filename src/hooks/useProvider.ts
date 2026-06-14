import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface ProviderProfile {
  id: string;
  is_online: boolean;
  full_name: string;
  rating: number;
  total_jobs: number;
  current_location?: { lat: number; lng: number };
}

export function useProvider(userId: string | undefined) {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          return createProfile();
        }
        throw error;
      }
      setProfile(data);
    } catch (err) {
      console.error('Error fetching provider profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createProfile() {
    if (!userId) return;
    const { data: session } = await supabase.auth.getSession();
    const newProfile = {
      id: userId,
      full_name: session.session?.user.user_metadata.full_name || 'New Provider',
      is_online: false,
      rating: 5.0,
      total_jobs: 0
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (!error) setProfile(data);
  }

  const toggleOnlineStatus = async () => {
    if (!profile) return;
    const nextStatus = !profile.is_online;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_online: nextStatus })
        .eq('id', userId);

      if (error) throw error;
      setProfile({ ...profile, is_online: nextStatus });
      toast.success(nextStatus ? "You are now ONLINE" : "You are now OFFLINE");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const updateLocation = async (lat: number, lng: number) => {
    if (!profile || !profile.is_online) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ current_location: { lat, lng } })
        .eq('id', userId);
    } catch (err) {
      // Silent fail for location heartbeats
    }
  };

  return {
    profile,
    loading,
    toggleOnlineStatus,
    updateLocation,
    refresh: fetchProfile
  };
}
