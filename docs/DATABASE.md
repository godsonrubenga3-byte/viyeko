# VIYEKO Database Schema (Supabase)

This document outlines the PostgreSQL structure required for the VIYEKO emergency platform. 

## Quick Setup
For a full automated setup, refer to the `FINAL_DATABASE_SETUP.sql` script located in the project root.

## Tables

### 1. `profiles`
Stores extended user information and provider status.
- `id` (UUID, PK): References `auth.users`.
- `full_name` (Text): Legal name or Garage name.
- `phone` (Text): Normalized TZ Phone (+255).
- `role` (Text): `driver` or `provider`. Drives UI routing.
- `vehicles` (JSONB): Array of registered vehicles.
- `is_online` (Boolean): Current availability for emergency response.
- `rating` (Decimal): Average user rating (1.0 - 5.0).
- `total_jobs` (Integer): Count of completed rescues.
- `current_location` (JSONB): `{ lat: number, lng: number }`.

### 2. `assistance_requests`
The core ledger for emergency services.
- `id` (Text, PK): Unique request ID.
- `user_id` (UUID): The driver needing help.
- `service_id` (Text): Type of service (breakdown, tire, etc.).
- `addon_ids` (JSONB): Array of selected add-ons.
- `status` (Text): `searching` | `bidding` | `assigned` | `on-the-way` | `arrived` | `in-progress` | `completed`.
- `location` (JSONB): Target destination/breakdown point.
- `timestamp` (BigInt): Epoch time of request.
- `vehicle_info` (Text): Description of the stranded vehicle.
- `bids` (JSONB): Array of live quotes from Garages. *(See Production Risks)*
- `accepted_bid_id` (Text): ID of the winning bid.
- `estimated_arrival` (Integer): Remaining minutes.
- `total_cost` (Integer): Final price in TZS.
- `provider_id` (UUID): The mechanic responding to the call.

## Production Risks & Mitigations (🚨 ACTION REQUIRED)

- **JSONB Race Condition:** Currently, `bids` are stored as a JSONB array. If two garages bid simultaneously, a "Lost Update" anomaly will occur. **Mitigation:** Move bids to a dedicated `assistance_bids` relational table.
- **Client-Side Pricing:** The `total_cost` and winning bid are currently accepted directly from the client. **Mitigation:** Move the "Accept Bid" logic to a Supabase Edge Function to securely verify the transaction.
- **Unbounded Growth:** Implement a Supabase cron job to archive old `completed` requests.

## Security (RLS Policies)

- **Assistance Requests:** Drivers can only see their own requests. Providers can see all "searching" and "bidding" requests in their region.
- **Profiles:** Publicly readable (for dispatching), but only editable by the owner.
