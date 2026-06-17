import * as Ably from 'ably';

// SECURE AUTHENTICATION: Using Token Requests via Node.js Backend
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://viyeko.onrender.com';

export const ably = new Ably.Realtime({
  authUrl: `${backendUrl}/auth/ably`,
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
