# VIYEKO Julia Backend Schema

This document defines the JSON payloads for the Julia backend to handle the dynamic reverse-bidding marketplace.

## 1. Breakdown Request (Broadcast)
**Path:** `POST /requests/broadcast`
**Origin:** Driver's App

```json
{
  "request_id": "string (unique)",
  "user_id": "uuid",
  "service_type": "breakdown | tire | fuel | wash",
  "location": {
    "lat": 0.000,
    "lng": 0.000,
    "address": "string"
  },
  "vehicle": {
    "make": "string",
    "model": "string",
    "plate": "string",
    "color": "string"
  },
  "notes": "string",
  "timestamp": "int64 (ms)",
  "status": "searching"
}
```

## 2. Mechanic/Garage Bid (Offer)
**Path:** `POST /requests/{id}/bids`
**Origin:** Garage/Provider App

```json
{
  "bid_id": "string (unique)",
  "provider_id": "uuid",
  "provider_name": "string",
  "provider_rating": 0.0,
  "price_tzs": 45000,
  "eta_minutes": 20,
  "timestamp": "int64 (ms)"
}
```

## 3. Bid Acceptance
**Path:** `POST /requests/{id}/accept`
**Origin:** Driver's App

```json
{
  "accepted_bid_id": "string",
  "provider_id": "uuid",
  "final_price_tzs": 45000,
  "estimated_arrival": 20,
  "status": "assigned"
}
```

## 4. Live Updates (Real-time Stream)
The backend should emit these payloads via WebSockets or Supabase Realtime to keep the UI updated.

- **On New Bid:** Append to `bids` array.
- **On Status Change:** Update `status` field.
