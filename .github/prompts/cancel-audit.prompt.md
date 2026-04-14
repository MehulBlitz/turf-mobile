---
description: "Trace cancellation end-to-end and verify bookings update, booking_cancellations audit insert, notifications, and UI state refresh."
name: "Cancel Audit"
argument-hint: "scope: customer|owner|both, and optional booking id"
agent: "agent"
---
Run a cancellation audit for this workspace with focus on Supabase and UI consistency.

Inputs:
- Scope: `${input:scope}`
- Optional booking id: `${input:bookingId}`

Checklist:
1. Locate cancellation entry points in customer and owner flows.
2. Verify update order: `bookings` row update happens before `booking_cancellations` insert.
3. Verify `status` and `booking_status` are synchronized.
4. Verify `qr_token` rotates on cancellation.
5. Verify notifications are inserted for relevant recipients.
6. Verify booking lists and slot availability refresh after cancellation.
7. Verify owner/customer UI hides cancel button for cancelled bookings.
8. Verify scanner behavior rejects old/invalid token scenarios.
9. Identify gaps with file links and propose minimal patches.

Output format:
- Findings (severity-ordered)
- Exact file changes needed
- Validation commands to run
