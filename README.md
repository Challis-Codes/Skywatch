# ✈ SkyWatch — Real-Time Overhead Flight Finder

Point your phone at the sky and know exactly which planes you're looking at.

SkyWatch uses your GPS location, live ADS-B flight data (OpenSky Network), and weather visibility (Open-Meteo) to calculate which flights are geometrically visible from your exact position, and tells you precisely where to look.

---

## Features

- **Compass view** — All nearby visible flights plotted on a live compass rose
- **Flight cards** — Altitude, bearing, elevation angle, speed, and slant range
- **"Where to look" panel** — Plain-English instructions + elevation visualizer
- **AR camera overlay** — Point your phone at the sky; flight labels appear in real time
- **Weather-aware** — Filters out flights beyond current visibility, shows cloud cover
- **Free** — Uses only free APIs (OpenSky + Open-Meteo), free hosting (Vercel)

---

## How the Math Works

For each flight, the app computes:

1. **Horizontal distance** (Haversine formula) between you and the plane's ground track
2. **Elevation angle** — `atan(altitude / horizontal_distance)` — flights below 1° are below the visual horizon
3. **Slant range** — straight-line 3D distance to the aircraft
4. **Bearing** (azimuth) — compass direction from you to the plane
5. **Visibility filter** — if slant range > weather visibility, the flight is filtered out

---

## Project Structure

```
skywatch/
├── public/
│   └── index.html        ← entire frontend (HTML + CSS + JS, single file)
├── api/
│   └── flights.js        ← Vercel serverless function (OpenSky proxy)
├── vercel.json           ← Vercel routing config
├── package.json
└── README.md
```

---

## Hosting on Vercel (Free, ~5 minutes)

### Step 1 — Push to GitHub

1. Create a free account at https://github.com if you don't have one
2. Create a new **public** repository called `skywatch`
3. Upload (drag and drop) these files into the repo, maintaining the folder structure:
   - `public/index.html`
   - `api/flights.js`
   - `vercel.json`
   - `package.json`

Or if you have Git installed, run:
```bash
git init
git add .
git commit -m "Initial SkyWatch"
git remote add origin https://github.com/YOUR_USERNAME/skywatch.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to https://vercel.com and sign in with your GitHub account
2. Click **"Add New Project"**
3. Import your `skywatch` repository
4. Click **Deploy** — that's it! Vercel auto-detects the config.

Your site will be live at `https://skywatch-XXXXX.vercel.app` in about 30 seconds.

### Step 3 (Optional) — Add a Custom Domain

In your Vercel project settings → Domains, add any domain you own.

---

## Optional: OpenSky Credentials (Higher Rate Limits)

Anonymous OpenSky access is limited to ~100 requests/day per IP. For personal use this is usually fine. For more:

1. Sign up free at https://opensky-network.org
2. In Vercel → your project → Settings → Environment Variables, add:
   - `OPENSKY_USER` = your OpenSky username
   - `OPENSKY_PASS` = your OpenSky password
3. Redeploy (Vercel → Deployments → Redeploy)

---

## Running Locally

```bash
# Install Vercel CLI
npm install -g vercel

# Run dev server (starts both static + API)
cd skywatch
vercel dev
```

Open http://localhost:3000

> **Note**: Geolocation and DeviceOrientation (AR) require HTTPS. They work on Vercel's deployment but may not work on plain `localhost` — use `vercel dev` which handles this.

---

## AR Mode Notes

- Works best on **mobile** (iPhone or Android)
- Requires camera permission + motion/orientation permission
- On iOS, orientation permission is requested when you tap "Open AR View"
- Compass accuracy varies by device — the AR overlay is approximate, not precise to the meter

---

## Data Sources

| Data | Provider | Cost |
|------|----------|------|
| Live flight positions | OpenSky Network | Free |
| Weather & visibility | Open-Meteo | Free, no API key |

---

## Known Limitations

- OpenSky free tier has rate limits; if the API returns nothing, wait a few minutes
- Visibility is surface-level; upper atmosphere transparency isn't modeled
- Building/terrain obstruction isn't calculated — the app assumes open sky
- AR compass heading varies ±5–15° depending on device and magnetic interference

---

## License

MIT — do whatever you want with it.
