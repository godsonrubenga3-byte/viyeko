# VIYEKO Database Schema (Supabase)

This document outlines the PostgreSQL structure required for the VIYEKO emergency platform. 

## Quick Setup
For a full automated setup, copy the contents of **[SCHEMA.sql](./SCHEMA.sql)** directly into your Supabase SQL Editor.

## Tables

### 1. `profiles`
Stores extended user information and provider status.
- `id` (UUID, PK): References `auth.users`.
- `full_name` (Text): Legal name for dispatch.
- `is_online` (Boolean): Current availability for emergency response.
- `rating` (Decimal): Average user rating (1.0 - 5.0).
- `total_jobs` (Integer): Count of completed rescues.
- `current_location` (JSONB): `{ lat: number, lng: number }`.
- `updated_at` (Timestamp): Auto-update on location change.

### 2. `assistance_requests`
The core ledger for emergency services.
- `id` (Text, PK): Unique request ID.
- `user_id` (UUID): The driver needing help.
- `serviceId` (Text): Type of service (breakdown, tire, etc.).
- `addOnIds` (JSONB): Array of selected add-ons.
- `status` (Text): `searching` | `assigned` | `on-the-way` | `arrived` | `in-progress` | `completed`.
- `location` (JSONB): Target destination/breakdown point.
- `timestamp` (BigInt): Epoch time of request.
- `vehicleInfo` (Text): Description of the stranded vehicle.
- `notes` (Text): Emergency notes/instructions.
- `estimatedArrival` (Integer): Remaining minutes.
- `totalCost` (Integer): Final price in INR.
- `provider_id` (UUID): The mechanic responding to the call.

## Security (RLS Policies)

- **Assistance Requests:** Drivers can only see their own requests. Providers can see all "searching" requests in their region.
- **Profiles:** Publicly readable (for dispatching), but only editable by the owner.

## Real-time Requirements
Real-time MUST be enabled for both `profiles` and `assistance_requests` to ensure ETAs and mechanic movements are reflected instantly on the driver's map.
