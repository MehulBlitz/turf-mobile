# Turf Mobile Agent Guidelines

## Build, Lint, and Test Commands

### Development Server
- `npm run dev` - Start Vite development server on port 3000
- `npm run preview` - Preview production build locally

### Production Build
- `npm run build` - Create production-optimized bundle
- `npm run clean` - Remove dist directory

### Linting
- `npm run lint` - Run ESLint on src directory with strict warnings

### Android Deployment
- `npm run android:build` - Build web assets and sync with Capacitor Android
- `npm run android:open` - Open Android project in Android Studio
- `npm run android:debug` - Assemble debug APK
- `npm run android:release` - Assemble release APK
- `npm run android:bundle` - Generate release AAB
- `npm run android:install` - Install debug APK on connected device
- `npm run android:run` - Run app on connected Android device
- `npm run android:sync` - Sync web changes with Capacitor Android
- `npm run android:copy` - Copy web assets to Android native project

### iOS Deployment
- `npm run ios:build` - Build web assets and sync with Capacitor iOS
- `npm run ios:open` - Open Xcode workspace
- `npm run ios:prebuild` - Add iOS platform (run once to initialize)
- `npm run ios:sync` - Sync web assets to iOS platform
- `npm run ios:copy` - Copy web assets to iOS native project
- `npm run ios:debug` - Build debug configuration
- `npm run ios:release` - Build release configuration
- **GitHub Actions:** Automatic debug IPA builds on main push; use `ios-release.yml` workflow for manual TestFlight uploads

### Firebase Deployment
- `npm run firebase:login` - Authenticate with Firebase CLI
- `npm run firebase:deploy` - Build and deploy to Firebase Hosting
- `npm run firebase:deploy:ci` - Deploy using CI script
- `npm run firebase:deploy:sa` - Deploy using service account script

### Test Execution (Future Implementation)
*Note: No test framework configured yet*
To implement tests:
1. Install Vitest: `npm install -D vitest @vitest/ui jsdom`
2. Create `vitest.config.js`
3. Add test scripts: `"test": "vitest"`, `"test:watch": "vitest --watch"`
4. Run single test: `npx vitest run testName.test.js`
5. Run tests with coverage: `npm run test -- --coverage`

## Code Style Guidelines

### File Organization
- React components: `src/components/`
- Feature-based grouping: `components/[FeatureName]/[ComponentName].jsx`
- Shared components: `src/components/common/`
- Base components: `src/components/base/`
- Hooks: `src/hooks/`
- Utilities: `src/lib/`
- Styles: `src/styles/`
- Context: `src/context/`
- Desktop-specific: `src-desktop/` (parallel structure)

### Import Order
1. React imports (useState, useEffect, etc.)
2. Third-party libraries (motion, lucide-react, etc.)
3. Relative imports (local components, hooks, libs)
4. Style imports (CSS, SCSS)

```javascript
// Correct import order
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from './lib/supabase';
import { cn } from './lib/utils';
import './Component.css';
```

### Formatting Conventions
- 2-space indentation
- Semicolons required
- Trailing commas in multi-line objects/arrays
- Max line length: 100 characters
- Empty lines between logical sections
- Curly braces always for blocks (even single-line)

### JavaScript Standards
- Use ES6+ features (arrow functions, destructuring)
- Prefer `const` over `let`, avoid `var`
- Use default parameters for optional values
- Prefer explicit returns in arrow functions
- Avoid `any` type; use specific types or `unknown` with guards

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
- Wrap async operations in try/catch blocks
- Show user-friendly errors via toast/alert
- Log detailed errors to console for debugging
- Validate data before use (null/undefined checks)
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Implement loading states for async operations

### React-Specific Guidelines
- Use functional components with hooks
- Custom hooks in `src/hooks/` with `use` prefix
- Use `useCallback` for functions passed as props
- Use `useMemo` for expensive computations
- Key props should be stable IDs, never array indices
- Avoid inline object/array creation in JSX
- Use fragments (`<>...</>`) for wrapper-less elements
- Early returns for conditional rendering (guards)

### Supabase Query Patterns
- Use `.single()` only when exactly one row must exist
- Use `.maybeSingle()` when 0 rows is valid and handle null explicitly
- Use `.select('*')` or specific columns for projections
- Chain `.eq()`, `.gt()`, `.lt()`, `.in()` for filters
- Use `.order()` for sorting results
- Always handle errors from Supabase responses

### Realtime Subscriptions
- Subscribe in useEffect for booking-dependent UI
- Always cleanup subscriptions in useEffect return function
- Pattern: `channel.on('postgres_changes', ...).subscribe()`
- Cleanup: `supabase.removeChannel(channel)`

### Styling (Tailwind CSS)
- Use utility-first approach with Tailwind classes
- Responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- State variants: `hover:`, `focus:`, `active:`, `disabled:`
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes
- Extract repeated patterns to shared CSS if needed
- Keep custom styles in `src/styles/globals.css`

### Performance Optimization
- Lazy load heavy components with `React.lazy()` + `<Suspense>`
- Virtualize long lists with virtualization library
- Debounce search inputs and resize listeners
- Optimize images (proper sizing, modern formats like WebP)
- Use React.memo for expensive component re-renders

### Git Commit Conventions
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, perf, test, chore
- Example: `feat(bookings): add cancellation flow`
- Keep commits atomic and focused
- Reference issues in commit body when applicable

## Project-Specific Architecture & Rules

### Key Files
- **App Shell**: `src/App.jsx` - Customer app shell and global state
- **Owner Dashboard**: `src/components/OwnerDashboard.jsx` - Booking and turf management
- **Supabase Helpers**: `src/lib/supabase.js` - Centralized database access
- **Cancellation Modal**: `src/components/CancellationModal.jsx` - Shared cancellation UX
- **Database Schema**: `supabase_schema.sql` - Tables, constraints, RLS policies

### Build and Test (from .github/copilot-instructions.md)
- Install dependencies: `npm install`
- Web development: `npm run dev` (Vite on port 3000)
- Production build: `npm run build` before Android deploys
- Lint checks: `npm run lint`
- Android deploy flow: `npm run build`, `npx cap sync android`, then `npx cap run android --target <device-id>`

### Booking Lifecycle Rules (from .github/instructions/booking-lifecycle.instructions.md)
- Treat `status` and `booking_status` as separate but synchronized
- Keep mapping strict: `pending|confirmed -> booked`, `cancelled -> cancelled`, past completed slot -> `time is gone`
- Cancellation sequence is mandatory:
  1. Update `bookings` row by `id` first
  2. Only after successful booking update, insert `booking_cancellations` audit row
  3. Then notify affected users and refresh booking/slot lists
- Cancellation updates must rotate `qr_token` to invalidate previous QRs
- Show cancel action only for actionable records: `booking_status === 'booked'` and future slot start time
- On owner/customer views, prefer rendering lifecycle badges from `booking_status`
- If an update returns no rows but the booking is visible, treat as policy/state mismatch and refresh from source
- Keep optimistic UI updates small and always follow with server re-fetch (`fetchUserBookings`, `fetchOwnerBookings`, `fetchBookedSlots`)
- For Supabase responses where zero rows is valid, use `.maybeSingle()` and handle `null` explicitly

### Available Agents & Skills
- **Booking Regression Checker**: `.github/agents/booking-regression-checker.agent.md`
  - For read-only scans of booking regressions, cancellation state drift, stale booked badges, and QR invalidation gaps before deploy
- **Supabase Booking Ops Skill**: `.github/skills/supabase-booking-ops/SKILL.md`
  - For Supabase booking lifecycle operations: schema updates, cancellation safety fixes, status invariant enforcement, QR invalidation, and verification
- **Dashboard Motion States Skill**: `.github/skills/dashboard-motion-states/SKILL.md`
- **UI Visuals Skill**: `.github/skills/ui-visuals/SKILL.md`

### QR and Anti-Scam Safety (from .github/copilot-instructions.md)
- Booking QR payloads must include both `bookingId` and `qrToken`
- Scanner validation must resolve by token and enforce token/id consistency
- Cancelled booking must invalidate prior QR scans by rotating `qr_token` during cancellation

### Documentation References
- Product and setup overview: [README.md](../README.md)
- Database schema and RLS details: [supabase_schema.sql](../supabase_schema.sql)
- Firebase deploy scripts: 
  - [scripts/firebase-deploy-ci.js](../scripts/firebase-deploy-ci.js)
  - [scripts/firebase-deploy-sa.js](../scripts/firebase-deploy-sa.js)
- iOS build setup and code signing guide: [docs/ios-build-setup.md](../docs/ios-build-setup.md)
