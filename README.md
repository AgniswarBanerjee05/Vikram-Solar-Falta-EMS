# Falta EMS Dashboard

Modern React + TypeScript version of the Falta Energy Metering dashboard. The UI is now a responsive single-page application powered by Vite, Tailwind CSS, and Chart.js, backed by a local JSON data source (`public/data/data.json`). Replace that JSON (or point the fetch call to an API) to plug the dashboard into live EMS data.

## Features
- React components for sidebar navigation, KPI cards, charts, and searchable data tables.
- Tailwind CSS styling with dark/light theme toggle stored in `localStorage`.
- Chart.js visualisations (models mix, comms availability, top locations, top panels) rendered via `react-chartjs-2`.
- CSV export for either table view (meters or panels) using Papa Parse.
- Mobile-first layout: collapsible sidebar, responsive charts, and touch friendly tables.

## Getting Started
```bash
# install dependencies
npm install

# run the Vite dev server (http://localhost:5173)
npm run dev

# type-check and build production assets
npm run build

# preview the production build locally
npm run preview
```

The development server automatically reloads on code changes. The production build emits static assets under `dist/`.

## Data
- Sample data lives at `public/data/data.json`. A fetch call in `useDashboardData` loads it at runtime.
- Swap in your own JSON file (keep the same shape) or adjust the fetch URL to target an API or proxy endpoint.
- Legacy CSV/XLSX conversion scripts have been removed from the build; bring them back if you still need automated exports.

## Project Structure
```
public/                 # Static assets served as-is
  data/data.json
  images/vikram-solar-logo.png
src/
  components/           # Layout, charts, tables, shared UI
  hooks/                # Data loading, theme, scroll spy
  lib/                  # Chart.js registration and helpers
  types/                # Dashboard data contracts
  utils/                # CSV exporter, search helpers
  App.tsx               # Dashboard composition
  main.tsx              # Entry point
tailwind.config.ts      # Tailwind theme overrides
```

## Tech Stack
- React 18 with TypeScript
- Vite 5 build tooling
- Tailwind CSS 3 for utility-first styling
- Chart.js 4 + react-chartjs-2 for visualisations
- Papa Parse for CSV export

## Next Ideas
1. Connect `useDashboardData` to an EMS API endpoint and add authentication.
2. Expand the chart suite with time series (power, energy) once telemetry is available.
3. Persist filters, active tabs, and theme selection per user profile.
