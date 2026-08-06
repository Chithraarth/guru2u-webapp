# Guru 2 u — Frontend (React + Vite)

Standalone React 19 + Vite + Tailwind v4 web app (all 5 reading flows, pricing, Firebase auth, i18n in 10 languages).

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill in values.
3. `npm run dev` (defaults to http://localhost:5173) — build with `npm run build`.

The app expects the backend API to be reachable under the same origin at `/api` (use a Vite proxy or reverse proxy). Shared code (API client, locales) is vendored in `vendor/`.
