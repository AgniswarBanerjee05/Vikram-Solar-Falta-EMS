# Falta EMS Prototype Frontend

A static, zero-backend prototype that renders a dashboard for the **Vikram Solar – Falta** plant using the meter inventory inside your ZIP files. The UI still consumes a local JSON payload (`data/data.json`), but that payload is now produced with a Node.js + TypeScript toolkit.

## What's Inside
- `index.html` – Dashboard UI (KPI cards, charts, searchable table)
- `styles*.css` – Styling variants, including the layout that ships by default
- `app.js` – Fetches `data/data.json`, draws charts (Chart.js via CDN), filters & CSV export
- `data/data.json` – Aggregated dataset generated from the meter list
- `src/` – TypeScript sources that replace the original Python conversion scripts

## Data Pipeline (Node + TypeScript)

Install dependencies once:

```bash
npm install
```

Generate `data/data.json` straight from the provided `Data.csv`:

```bash
npm run convert:csv
```

If you receive an updated Excel workbook, convert it first and regenerate JSON:

```bash
npm run convert:excel -- --input Data.xlsx --output Data.csv
npm run convert:csv
```

Type-check and emit JavaScript builds to `dist/` with:

```bash
npm run build
```

The utilities use Papa Parse and SheetJS (`xlsx`) under the hood, so you can automate them via CI or extend them to handle new tabs/columns as needed.

## Running the Dashboard
1. Open the folder in VS Code (or your editor of choice).
2. Install the **Live Server** extension (Ritwick Dey) if you need a quick dev server.
3. Right-click `index.html` → **Open with Live Server**.
   - This serves the site at `http://127.0.0.1:5500` (or similar), which is required so the browser can `fetch` the local JSON.

Opening `index.html` directly via the filesystem will usually block `fetch('data/data.json')`; use a lightweight server to avoid that.

## Future Integration
- Replace `fetch('data/data.json')` in `app.js` with calls to MyEMS API endpoints (e.g., `/api/meters`, `/api/spaces`).
- Or insert a thin Node proxy that maps `/api` to the upstream EMS and keep the UI code unchanged.
- Time-series charts can be added easily once live EMS data (kWh/kW) is available; the current focus is inventory analytics.

(c) Prototype generated for Vikram Solar Falta.
