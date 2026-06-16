# VIYEKO PWA: Production Readiness Audit

**Date:** June 15, 2026
**Framework:** React (Vite) + Supabase (Edge Functions + Postgres) + Ably
**Target Environment:** Vercel (Production)

---

## 1. DATA INTEGRITY & SECURITY
*Question: If thousands of users hit this database, what breaks?*

| Risk Level | Issue | Description | Mitigation Strategy to reach "NONE" |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | JSONB Race Conditions | Bids are stored as a `JSONB` array in the `assistance_requests` table. If two garages submit a bid at the exact same millisecond, one write will overwrite the other (Lost Update Anomaly). | Move `bids` to a dedicated PostgreSQL table (`assistance_bids`) with a foreign key to `requests`. Use standard SQL inserts rather than array appending. |
| **HIGH** | Client-Side Pricing Trust | The `total_cost` and `accepted_bid_id` are accepted directly from the client. A malicious user could alter the payload to accept a bid with a manipulated `total_cost: 0`. | Move the "Accept Bid" logic to a **Supabase Edge Function**. The server should verify the bid ID and price before locking the contract. |
| **MEDIUM** | Unbounded Table Growth | Completed `assistance_requests` will sit in the active table forever, eventually slowing down real-time active query subscriptions. | Implement a Supabase `cron` job to archive `completed` or `cancelled` requests older than 30 days to a cold-storage table. |

---

## 2. UI/UX RESILIENCE
*Question: When a user is stressed in an emergency, how does the UI fail them?*

| Risk Level | Issue | Description | Mitigation Strategy to reach "NONE" |
| :--- | :--- | :--- | :--- |
| **HIGH** | Stale Service Worker Cache | PWA users might get stuck on an old version of the app. If the backend schema changes, their old cached UI will crash with 400 errors. | Implement `vite-plugin-pwa` auto-update prompts. Force a hard refresh if an API mismatch is detected. |
| **MEDIUM** | Mocked Map Component | `MapContainer.tsx` uses a simulated CSS 100x100 grid. It provides zero geographical context for the driver or the mechanic. | Integrate Mapbox GL JS or Leaflet for actual geolocation rendering and route mapping. |
| **LOW** | Missing Error Boundaries | If a specific component (e.g., LiveTracking) fails due to corrupted state, the entire screen goes blank. | Wrap individual modular components in React Error Boundaries to display localized fallback UIs. |

---

## 3. CONNECTIVITY & NETWORKING
*Question: How does the app behave on a spotty 3G connection in rural Tanzania?*

| Risk Level | Issue | Description | Mitigation Strategy to reach "NONE" |
| :--- | :--- | :--- | :--- |
| **HIGH** | Silent WebSocket Failures | If the Ably connection drops, the user is not explicitly notified. A driver might sit for hours waiting for a bid because their phone disconnected. | Implement an Ably `connection.on` state listener. Display a prominent, red "Offline - Reconnecting..." sticky banner. |
| **MEDIUM** | Split-Brain State | If `addRequest` fails due to network loss, it falls back to `localStorage`. When the network returns, there is no automatic synchronization queue to push that request to Supabase. | Implement a Background Sync API via the Service Worker, or a queue-processing hook that flushes pending `localStorage` writes upon reconnection. |

---

## 4. REACHABILITY & SEO (Vercel Production)
*Question: Can search engines and social media crawlers understand what VIYEKO is?*

| Risk Level | Issue | Description | Mitigation Strategy to reach "NONE" |
| :--- | :--- | :--- | :--- |
| **HIGH** | CSR Blank Page | Vite generates a Single Page Application (SPA). Search crawlers (like Googlebot) may struggle to index the app because the initial HTML is essentially empty (`<div id="root"></div>`). | Implement Prerendering for public routes (like the Auth/Landing page) using `vite-plugin-prerender`, or migrate to SSR if content becomes highly dynamic. |
| **HIGH** | Missing Open Graph Data | Sharing the `viyeko.vercel.app` link on WhatsApp or Twitter will result in a generic, ugly link preview without images or context. | Add strict `og:title`, `og:description`, `og:image`, and `twitter:card` meta tags to the `index.html`. |
| **MEDIUM** | Missing iOS PWA Assets | iOS Safari requires explicit `<link rel="apple-touch-icon">` tags. Without them, the "Add to Home Screen" icon will be a blurry screenshot. | Generate and link Apple Touch icons and a valid Safari pinned tab SVG in `index.html`. |
| **LOW** | No Crawl Directives | Missing `robots.txt` and `sitemap.xml`. | Generate static `robots.txt` and `sitemap.xml` in the `public/` directory pointing to the main landing page. |

---
**Status:** Audit Complete. The architecture is functional, but mitigation of the High/Critical risks above is required before declaring the app "Zero-Risk" for production scaling.
