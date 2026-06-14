# VIYEKO PWA & Offline Strategy

Mission-critical apps must work in "Dead Zones" (low signal). 

## 1. Caching Policy

- **Core UI (Shell):** Handled via `CacheFirst`. All HTML, JS, and CSS are cached locally. The app will boot instantly even with zero signal.
- **Dynamic Assets:** Handled via `NetworkFirst`. Avatars and external maps will attempt to fetch live data but fall back to the last cached version if the request times out.

## 2. Low Bandwidth Optimization

- **WebSocket Throttling:** The Supabase Realtime client is configured for `10 events/sec` to prevent data saturation on slow 2G/EDGE networks.
- **Lazy Loading:** Large images (like maps) are lazy-loaded to prioritize emergency buttons.

## 3. Local Persistence

- **Request Sync:** If a driver submits a request while offline, the `useRequests` hook saves the payload to `localStorage` and alerts the user. The app will retry synchronization once a heartbeat to Supabase is successful.
