# VIYEKO Documentation

Welcome to the technical documentation for the VIYEKO emergency roadside assistance platform.

## Architecture & Systems

- **[Production Audit](./researches/PRODUCTION_AUDIT.md):** 🔴 **START HERE.** Exhaustive breakdown of Data, UI/UX, Connectivity, and SEO risks for the Vercel production environment.
- **[Architecture Mapping](./architecture.json):** High-level view of the React + Supabase + Ably stack.
- **[Database Schema (Supabase)](./DATABASE.md):** PostgreSQL table structures, RLS policies, and Realtime configuration.
- **[Theme System](./THEME_SYSTEM.md):** Semantic variable architecture for Light/Dark mode resilience.
- **[PWA & Offline Strategy](./PWA_STRATEGY.md):** Caching logic and low-bandwidth optimizations for mission-critical reliability.

## Project Structure

- `src/layouts/`: Main app shell and navigation.
- `src/pages/`: Discrete views (Home, History, Profile).
- `src/hooks/`: Business logic and data fetching (useRequests, useProvider).
- `src/context/`: Global state management (Theme, Auth).
- `supabase/functions/`: Serverless Edge Functions (Ably Token Auth).

## Emergency Hardening Status

1. **Auth & Routing:** Strict role-based routing (Driver vs Provider) with Supabase Google OAuth.
2. **Real-time Marketplace:** Synced via Ably WebSockets (Sub-second bidding) and Supabase DB (Ledger).
3. **PWA:** Full offline manifest and service worker integration.
4. **Backend:** 100% Serverless (Vercel + Supabase + Deno Edge Functions).
