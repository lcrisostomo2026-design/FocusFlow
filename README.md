# FocusFlow

FocusFlow is a personal productivity and deep-work time-blocking web application designed to protect two daily 90-minute focus sessions and track completion consistency (80%+ target) across four consecutive calendar weeks.

## Features

- **Daily Deep-Work Scheduling**: Schedule up to two non-overlapping 90-minute sessions per day dedicated to concrete deliverables and aligned with your energy levels.
- **Accurate 90-Minute Focus Timer**: Wall-clock-synced countdown with Start, Pause, Resume, and explicit completion verification, surviving page refreshes.
- **Four-Week Program & Weekly Tracker**: Automatic calculation of planned vs. completed sessions, completion percentages, and 80% weekly targets with interactive charts.
- **Distraction-Minimizing Focus Mode**: Clean full-viewport timer view that mutes in-app alerts while keeping your active deliverable visible.
- **Google Authentication Only**: Uses Firebase Authentication (`signInWithPopup` with Google) exclusively for identity and session management.
- **Local-First Storage**: All schedules, timer progress, preferences, and productivity records are stored locally in `localStorage` on your device.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (optional locally when `firebase-applet-config.json` is present; required for external hosting):
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase project's web app identifiers (`VITE_FIREBASE_*`).
3. Start the development server:
   ```bash
   npm run dev
   ```

## Deploying via GitHub & Netlify

1. Push this repository to GitHub.
2. In **Netlify**, create a new site from your GitHub repository (`netlify.toml` automatically sets `npm run build` and publishes `dist` with SPA fallback routing).
3. In **Netlify Site Configuration -> Environment variables**, add:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. In the **Firebase Console -> Authentication -> Settings -> Authorized domains**, add your Netlify domain (e.g., `your-app.netlify.app`) so Google Sign-In pop-ups succeed in production.
