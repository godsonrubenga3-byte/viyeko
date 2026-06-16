# VIYEKO PWA & Offline Strategy

Mission-critical apps must work in "Dead Zones" (low signal) and always remain up-to-date.

## 1. Caching Policy & Updates (Production Risk Mitigation)

- **Core UI (Shell):** Handled via `CacheFirst`. All HTML, JS, and CSS are cached locally. The app will boot instantly even with zero signal.
- **Dynamic Assets:** Handled via `NetworkFirst`. Avatars and external maps will attempt to fetch live data but fall back to the last cached version if the request times out.
- **Stale Cache Prevention:** Using `vite-plugin-pwa`, the service worker is configured to actively check for updates. If a new deployment is detected (e.g., a backend schema change), the UI must prompt the user with a "New Version Available" toast, forcing a hard refresh to prevent API mismatch crashes.

## 2. Low Bandwidth Optimization

- **WebSocket Throttling:** The Supabase Realtime client is configured for `10 events/sec` to prevent data saturation on slow 2G/EDGE networks.
- **Lazy Loading:** Large images (like maps) are lazy-loaded to prioritize emergency buttons.

## 3. Local Persistence & Split-Brain State

- **Request Sync:** If a driver submits a request while offline, the `useRequests` hook saves the payload to `localStorage` and alerts the user. 
- **Production Target:** Implement a Background Sync API queue. When the network returns, a synchronization hook must automatically flush pending `localStorage` writes to Supabase, resolving any split-brain state between the client and server.
