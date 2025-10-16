
# Falta EMS — Prototype Frontend

A static, zero-backend prototype that renders a *beautiful* dashboard for the **Vikram Solar — Falta** plant using the meter inventory inside your ZIP files.

> This uses local JSON (`data/data.json`) generated from: `Copy of EMS_Meter List_Falta - to RDL (002).xlsx` → **Energy Meter** sheet.

## What’s inside
- `index.html` — Dashboard UI (KPI cards, charts, searchable table)
- `styles.css` — Clean dark/light theme
- `app.js` — Fetches `data/data.json`, draws charts (Chart.js via CDN), filters & CSV export
- `data/data.json` — Aggregated dataset built from the meter list

## How to run in VS Code (recommended)
1. Open the folder in VS Code.
2. Install the **Live Server** extension (Ritwick Dey).
3. Right‑click `index.html` → **Open with Live Server**.
   - This serves the site at `http://127.0.0.1:5500` (or similar), which is required so the browser can `fetch` the local JSON.
4. The dashboard should load immediately. Use the search box to filter, and **Download CSV** to export.

> If you simply double‑click `index.html`, most browsers will block `fetch('data/data.json')` from the local filesystem. Use Live Server to avoid this.

## How to adapt to MyEMS backend later
- Replace `fetch('data/data.json')` in `app.js` with calls to your MyEMS API endpoints (e.g., `/api/meters`, `/api/spaces`, etc.).
- Or add a tiny dev proxy (Nginx/Node) that maps `/api` → MyEMS API and keep the UI code unchanged.

## Notes
- **Counts:** Total meters, new meters flagged, communication port (YES/NO/UNKNOWN), breakdown by models, counts by location and panel.
- **Data quality:** Many rows in the spreadsheet have missing model values; these show as `Unknown`.
- **Extend:** You can add time‑series charts by wiring to live EMS data (kWh/kW). This prototype focuses on the inventory view because the provided files don’t include time-series.

(c) Prototype generated for Vikram Solar Falta.
# Vikram-Solar-Falta-EMS
# Vikram-Solar-Falta-EMS
