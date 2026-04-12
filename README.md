TURF-BOOKING
turf-mobile

![turf-mobile](https://socialify.git.ci/MehulBlitz/turf-mobile/image?language=1&name=1&owner=1&stargazers=1&theme=Light)
GitHub repo size GitHub stars GitHub forks License: MIT

📝 Overview
Turf-Mobile is a high-performance cross-platform application (Web & Mobile) designed to bridge the gap between sports enthusiasts and turf owners. Built with React.js and wrapped in Capacitor, it ensures a native mobile experience alongside a robust web presence. The system utilizes Supabase for ACID-compliant transactions and advanced concurrency handling.

🚀 Project Demo
Live Web App: https://turf-booking-171bf.web.app/
Mobile APK: Available via GitHub Releases
📸 Screenshots
| Customer View | Owner Dashboard | QR Ticket | | :---: | :---: | :---: | | Customer | Owner | QR |

✨ Features
Dual User Roles: Separate login flows and dashboards for Turf Owners (management) and Customers (booking).
ACID-Compliant Bookings: Time slot logic follows strict ACID rules via PostgreSQL transactions to prevent double-booking.
Race Condition Algorithms: Implements database-level row locking to handle high-concurrency booking attempts.
QR Code Tickets: Automatic generation of unique QR codes for booking verification at the venue.
Real-time Discovery: Browse turfs by location, price, and sport type.
🛠 Tech Stack
Frontend: React.js, Tailwind CSS
Mobile Bridge: Capacitor (iOS/Android)
Backend-as-a-Service: Supabase (PostgreSQL, Auth, Storage)
Hosting: Firebase Hosting
CI/CD: GitHub Actions (Auto-deploy & APK Build)
⚙️ Installation Steps
Prerequisites
Node.js (v18+)
Android Studio (for mobile builds)
Supabase Project URL & Anon Key
Steps
Clone the repository:

 copy
bash

git clone https://github.com/MehulBlitz/turf-mobile.git
cd turf-mobile
Install dependencies:

 copy
bash

npm install
Setup Environment Variables: Create a .env file:

 copy
env

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Run Web Development:

 copy
bash

npm run dev
Sync with Mobile (Capacitor):

 copy
bash

npm run build
npx cap sync
npx cap open android
🚀 Deployment & CI/CD
The project uses GitHub Workflows for automated pipelines:

Auto-Deploy: Every push to main triggers a build and deploy to Firebase Hosting.
Auto-Build APK: Every release tag triggers a workflow that generates a production Android APK and attaches it to the release.
🤝 Contribution Guidelines
Fork the Project.
Create your Feature Branch (git checkout -b feature/NewFeature).
Commit your changes (git commit -m 'Add NewFeature').
Push to the Branch (git push origin feature/NewFeature).
Open a Pull Request.
⚖️ License
Distributed under the MIT License.

📞 Support
Created by Mehul Blitz.
Reach out via GitHub Issues for bugs and feature requests.
