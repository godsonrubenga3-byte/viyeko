# VIYEKO Documentation

Welcome to the technical documentation for the VIYEKO emergency roadside assistance platform.

## Architecture & Systems

- **[Database Schema (Supabase)](./DATABASE.md):** PostgreSQL table structures, RLS policies, and Realtime configuration.
- **[Theme System](./THEME_SYSTEM.md):** Semantic variable architecture for Light/Dark mode resilience.
- **[PWA & Offline Strategy](./PWA_STRATEGY.md):** Caching logic and low-bandwidth optimizations for mission-critical reliability.

## Project Structure

- `src/layouts/`: Main app shell and navigation.
- `src/pages/`: Discrete views (Home, History, Profile).
- `src/hooks/`: Business logic and data fetching (useRequests, useProvider).
- `src/context/`: Global state management (Theme).

## Emergency Hardening (Objectives 1-5)

1. **Routing:** Hardened via `react-router-dom` for persistent state.
2. **Theme:** Saved locally with zero-flash head scripts.
3. **Flexibility:** Global `ErrorBoundary` with persistent "Call 112" accessibility.
4. **PWA:** Full offline manifest and service worker integration.
5. **Database:** Migrated to real-time Supabase cloud infrastructure.
