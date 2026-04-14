# Project Guidelines

## Build and Test
- Install dependencies with `npm install`.
- Run web development with `npm run dev` (Vite on port `3000`).
- Run production build with `npm run build` before mobile deploys.
- Run lint checks with `npm run lint`.
- **Android deploy flow:** `npm run build`, `npx cap sync android`, then `npx cap run android --target <device-id>`.
- **iOS deploy flow:** `npm run build`, `npx cap sync ios`, then use Xcode or `npm run ios:release` for IPA.
- **iOS builds:** IPA builds are automated via GitHub Actions (`ios-build.yml` on main push, `ios-release.yml` for manual releases).
- For iOS local development setup and troubleshooting: see [iOS Build Setup Guide](../docs/ios-build-setup.md).
- GitHub Actions uses macOS runner for iOS builds; secrets needed: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and optionally code signing secrets for CI/CD.

## Architecture
- Customer app shell and global state live in [src/App.jsx](../src/App.jsx).
- Owner booking and turf management flows live in [src/components/OwnerDashboard.jsx](../src/components/OwnerDashboard.jsx).
- Supabase access helpers are centralized in [src/lib/supabase.js](../src/lib/supabase.js).
- Cancellation UX is shared in [src/components/CancellationModal.jsx](../src/components/CancellationModal.jsx).
- Database source of truth (tables, constraints, RLS) is [supabase_schema.sql](../supabase_schema.sql).

## Booking and Cancellation Rules
- Treat `status` and `booking_status` as separate but synchronized fields.
- Keep this mapping consistent: `pending|confirmed -> booked`, `cancelled -> cancelled`, `ended active slot -> time is gone`.
- On cancellation requests (customer or owner), always update the `bookings` row first by `id` and set: `status='cancelled'`, `booking_status='cancelled'`, `cancelled_by`, reason/notes, refund, and rotate `qr_token`.
- After booking row update, insert one audit row in `booking_cancellations`.
- After cancellation, refresh booking lists and slot availability (`fetchUserBookings`, `fetchOwnerBookings`, `fetchBookedSlots`) so stale `BOOKED` badges and `Cancel` buttons disappear immediately.
- Show cancel actions only when booking is still actionable: `booking_status === 'booked'` and slot start time is in the future.

## Supabase Conventions
- Use `.single()` only when exactly one row must exist.
- Use `.maybeSingle()` when `0 rows` is a valid branch and handle null explicitly.
- Keep writes resilient to stale client state. Avoid over-filtered update queries that can skip valid rows.
- Keep realtime subscriptions for booking-dependent UI and always clean up channels in effect cleanup.

## QR and Anti-Scam Safety
- Booking QR payloads should include both `bookingId` and `qrToken`.
- If payload has a `qrToken`, scanner validation must resolve by token and enforce token/id consistency.
- A cancelled booking must invalidate prior QR scans by rotating `qr_token` during cancellation.

## Link, Don’t Embed
- Product and setup overview: [README.md](../README.md).
- Database schema and RLS details: [supabase_schema.sql](../supabase_schema.sql).
- Firebase deploy scripts and CI helpers: [scripts/firebase-deploy-ci.js](../scripts/firebase-deploy-ci.js), [scripts/firebase-deploy-sa.js](../scripts/firebase-deploy-sa.js).- iOS build setup and code signing guide: [docs/ios-build-setup.md](../docs/ios-build-setup.md).