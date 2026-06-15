import * as Ably from 'ably';

// SECURE AUTHENTICATION: Using Token Requests via Supabase Edge Function
// This replaces the Julia backend for easier deployment.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

export const ably = new Ably.Realtime({
  authUrl: `${supabaseUrl}/functions/v1/ably-auth`,
  authMethod: 'GET',
});

export const ABLY_CHANNELS = {
  // Regional broadcast for mechanics to see new local breakdowns
  regionBroadcast: (region: string) => `viyeko:region:${region.toLowerCase().replace(/\s+/g, '-')}:broadcast`,
  
  // Private channel for a specific driver to receive bids
  requestBids: (requestId: string) => `viyeko:request:${requestId}:bids`,
  
  // Status updates (assigned, on-the-way, etc.)
  requestStatus: (requestId: string) => `viyeko:request:${requestId}:status`
};
