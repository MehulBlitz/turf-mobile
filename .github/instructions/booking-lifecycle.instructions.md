---
description: "Use when editing booking/cancellation logic in customer and owner flows; enforces status invariants, update-before-audit ordering, and realtime refresh expectations."
name: "Booking Lifecycle Invariants"
applyTo:
  - "src/App.jsx"
  - "src/components/OwnerDashboard.jsx"
---
# Booking Lifecycle Rules

- Treat `status` and `booking_status` as separate but synchronized.
- Keep mapping strict: `pending|confirmed -> booked`, `cancelled -> cancelled`, past completed slot -> `time is gone`.
- Cancellation sequence is mandatory:
  1. Update `bookings` row by `id` first.
  2. Only after successful booking update, insert `booking_cancellations` audit row.
  3. Then notify affected users and refresh booking/slot lists.
- Cancellation updates must rotate `qr_token` to invalidate previous QRs.
- Show cancel action only for actionable records: `booking_status === 'booked'` and future slot start time.
- On owner/customer views, prefer rendering lifecycle badges from `booking_status`.
- If an update returns no rows but the booking is visible, treat this as a policy/state mismatch and refresh from source.
- Keep optimistic UI updates small and always follow with server re-fetch (`fetchUserBookings`, `fetchOwnerBookings`, `fetchBookedSlots`).
- For Supabase responses where zero rows is valid, use `.maybeSingle()` and handle `null` explicitly.
