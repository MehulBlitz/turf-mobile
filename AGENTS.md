# Turf Mobile Agent Guidelines

## Build, Lint, and Test Commands

### Development
- `npm run dev` - Start Vite dev server on port 3000
- `npm run preview` - Preview production build locally
- `npm run build` - Create production-optimized bundle
- `npm run clean` - Remove dist directory
- `npm run lint` - Run ESLint on src directory with strict warnings

### Android Deployment
- `npm run android:build` - Build web assets and sync with Capacitor Android
- `npm run android:open` - Open Android project in Android Studio
- `npm run android:debug` / `android:release` - Assemble debug/release APK
- `npm run android:bundle` - Generate release AAB
- `npm run android:install` - Install debug APK on connected device
- `npm run android:run` - Run app on connected Android device
- `npm run android:sync` / `android:copy` - Sync/copy web assets to Android
- Full deploy flow: `npm run build` → `npx cap sync android` → `npx cap run android --target <device-id>`

### iOS Deployment
- `npm run ios:build` - Build web assets and sync with Capacitor iOS
- `npm run ios:open` - Open Xcode workspace
- `npm run ios:prebuild` - Add iOS platform (run once to initialize)
- `npm run ios:sync` / `ios:copy` - Sync/copy web assets to iOS
- `npm run ios:debug` / `ios:release` - Build debug/release configuration
- **GitHub Actions:** Automatic debug IPA on main push; `ios-release.yml` for TestFlight uploads

### Firebase Deployment
- `npm run firebase:login` - Authenticate with Firebase CLI
- `npm run firebase:deploy` - Build and deploy to Firebase Hosting
- `npm run firebase:deploy:ci` / `firebase:deploy:sa` - Deploy via CI or service account script

### Test Execution (Future)
*No test framework configured yet.* To implement:
1. Install: `npm install -D vitest @vitest/ui jsdom`
2. Create `vitest.config.js`
3. Scripts: `"test": "vitest"`, `"test:watch": "vitest --watch"`
4. Single test: `npx vitest run testName.test.js` | Coverage: `npm run test -- --coverage`

## Code Style Guidelines

### File Organization
- Components: `src/components/` (feature-grouped: `[Feature]/[Component].jsx`)
- Shared/base: `src/components/common/`, `src/components/base/`
- Hooks: `src/hooks/` | Utilities: `src/lib/` | Styles: `src/styles/` | Context: `src/context/`
- Desktop-specific: `src-desktop/` (parallel structure)

### Import Order
1. React imports → 2. Third-party libs → 3. Relative imports → 4. Style imports

```javascript
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from './lib/supabase';
import { cn } from './lib/utils';
import './Component.css';
```

### Formatting
- 2-space indentation, semicolons required, trailing commas in multi-line structures
- Max line length: 100 chars, curly braces always for blocks, empty lines between sections

### JavaScript Standards
- ES6+ features (arrow functions, destructuring), `const` > `let`, no `var`
- Default parameters for optional values, explicit returns in arrow functions
- No `any` type; use specific types or `unknown` with guards

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `TurfCard.jsx` |
| Functions/variables | camelCase | `fetchUserBookings` |
| Constants | UPPER_SNAKE_CASE | `MAX_SLOTS_PER_DAY` |
| Files (non-components) | kebab-case | `user-profile.js` |
| CSS classes | kebab-case | `turf-card` |
| Event handlers | handle[Event] | `handleSubmit` |
| Boolean variables | is/has/can[State] | `isLoading` |

### Error Handling
- Wrap async operations in try/catch; show user-friendly errors via toast/alert
- Log detailed errors to console; validate data before use (null/undefined checks)
- Use optional chaining (`?.`), nullish coalescing (`??`), and loading states

### React-Specific Guidelines
- Functional components with hooks; custom hooks in `src/hooks/` with `use` prefix
- `useCallback` for props-passed functions, `useMemo` for expensive computations
- Stable IDs for keys (never array indices), no inline object/array creation in JSX
- Fragments (`<>...</>`) for wrapper-less elements, early returns for conditional rendering

### Supabase Patterns
**Queries:**
- `.single()` only when exactly one row must exist; `.maybeSingle()` when 0 rows is valid — handle `null` explicitly
- `.select('*')` or specific columns; chain `.eq()`, `.gt()`, `.lt()`, `.in()` for filters; `.order()` for sorting
- Always handle errors from Supabase responses

**Realtime Subscriptions:**
- Subscribe in `useEffect` for booking-dependent UI; always cleanup in return function
- Pattern: `channel.on('postgres_changes', ...).subscribe()` / Cleanup: `supabase.removeChannel(channel)`

### Styling (Tailwind CSS)
- Utility-first; responsive: `sm:`, `md:`, `lg:`, `xl:` | State: `hover:`, `focus:`, `active:`, `disabled:`
- Use `cn()` (clsx + tailwind-merge) for conditional classes
- Custom styles in `src/styles/globals.css`; extract repeated patterns to shared CSS

### Performance
- Lazy load with `React.lazy()` + `<Suspense>`; virtualize long lists
- Debounce search inputs and resize listeners; optimize images (WebP)
- `React.memo` for expensive re-renders

### Git Commits
- Format: `type(scope): description` — types: feat, fix, docs, style, refactor, perf, test, chore
- Example: `feat(bookings): add cancellation flow` — keep atomic, reference issues in body

## Project-Specific Architecture & Rules

### Key Files
- **App Shell**: `src/App.jsx` — customer app shell and global state
- **Owner Dashboard**: `src/components/OwnerDashboard.jsx` — booking and turf management
- **Supabase Helpers**: `src/lib/supabase.js` — centralized database access
- **Cancellation Modal**: `src/components/CancellationModal.jsx` — shared cancellation UX
- **Database Schema**: `supabase_schema.sql` — tables, constraints, RLS policies

### Booking Lifecycle Rules
- Treat `status` and `booking_status` as separate but synchronized
- Mapping: `pending|confirmed → booked`, `cancelled → cancelled`, past completed slot → `time is gone`
- **Cancellation sequence (mandatory):**
  1. Update `bookings` row by `id` first
  2. After success, insert `booking_cancellations` audit row
  3. Notify affected users and refresh booking/slot lists
- Cancellation must rotate `qr_token` to invalidate previous QRs
- Show cancel action only when `booking_status === 'booked'` AND future slot start time
- Render lifecycle badges from `booking_status` on owner/customer views
- If update returns no rows but booking is visible → policy/state mismatch; refresh from source
- Keep optimistic UI small; always follow with server re-fetch (`fetchUserBookings`, `fetchOwnerBookings`, `fetchBookedSlots`)

### QR and Anti-Scam Safety
- QR payloads must include both `bookingId` and `qrToken`
- Scanner must resolve by token and enforce token/id consistency
- Cancelled bookings invalidate prior QR scans via `qr_token` rotation

### Available Agents & Skills
- **Booking Regression Checker**: `.github/agents/booking-regression-checker.agent.md` — read-only scans for booking regressions, cancellation drift, stale badges, QR gaps
- **Supabase Booking Ops**: `.github/skills/supabase-booking-ops/SKILL.md` — schema updates, cancellation safety, status invariants, QR invalidation
- **Dashboard Motion States**: `.github/skills/dashboard-motion-states/SKILL.md`
- **UI Visuals**: `.github/skills/ui-visuals/SKILL.md`

### Documentation References
- [README.md](./README.md) — product and setup overview
- [supabase_schema.sql](./supabase_schema.sql) — database schema and RLS details
- [scripts/firebase-deploy-ci.js](./scripts/firebase-deploy-ci.js) / [firebase-deploy-sa.js](./scripts/firebase-deploy-sa.js) — Firebase deploy scripts
- [docs/ios-build-setup.md](./docs/ios-build-setup.md) — iOS build setup and code signing
