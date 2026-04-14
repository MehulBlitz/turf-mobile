---
name: supabase-booking-ops
description: "Use for Supabase booking lifecycle operations: schema updates, cancellation safety fixes, status invariant enforcement, QR invalidation, and verification."
argument-hint: "task: migration|cancellation-fix|booking-status-sync|qr-hardening"
---
# Supabase Booking Operations

## When to Use
- Implement booking schema changes.
- Fix cancellation bugs where UI and DB diverge.
- Enforce `status` and `booking_status` invariants.
- Harden QR token invalidation after cancellation.

## Procedure
1. Inspect source-of-truth schema in [supabase_schema.sql](../../../supabase_schema.sql).
2. Confirm RLS policies for `bookings` and `booking_cancellations` permit required operations.
3. Patch app flows in [src/App.jsx](../../../src/App.jsx) and [src/components/OwnerDashboard.jsx](../../../src/components/OwnerDashboard.jsx):
   - update bookings row first
   - then insert cancellation audit
   - then refresh booking and slot data
4. Patch scanner/token logic in [src/components/QRScanner.jsx](../../../src/components/QRScanner.jsx) and Supabase helpers in [src/lib/supabase.js](../../../src/lib/supabase.js).
5. Validate via build and a customer+owner cancellation walkthrough.
6. If DB policy/schema changed, apply migration to target Supabase project.

## Guardrails
- Never insert cancellation audit before booking update success.
- Never leave cancelled bookings with `booking_status='booked'`.
- Never allow a token-missing/invalid QR to be treated as check-in-ready.
