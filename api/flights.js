// api/flights.js — Vercel serverless function
// Proxies OpenSky Network ADS-B data to avoid CORS issues in the browser.
// OpenSky returns an array of state vectors. No API key required for anonymous access
// (rate limited to ~100 requests/day per IP). For higher limits, sign up free at
// https://opensky-network.org and add OPENSKY_USER / OPENSKY_PASS env vars in Vercel.

export default async function handler(req, res) {
  const { lat, lon, d = 1.4 } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  const latF = parseFloat(lat);
  const lonF = parseFloat(lon);
  const dF   = parseFloat(d);

  // Bounding box
  const lamin = latF - dF;
  const lamax = latF + dF;
  const lomin = lonF - dF;
  const lomax = lonF + dF;

  // Build URL — add basic auth if credentials are available
  let openSkyUrl = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;

  const headers = { 'Accept': 'application/json' };
  if (process.env.OPENSKY_USER && process.env.OPENSKY_PASS) {
    const creds = Buffer.from(`${process.env.OPENSKY_USER}:${process.env.OPENSKY_PASS}`).toString('base64');
    headers['Authorization'] = `Basic ${creds}`;
  }

  try {
    const upstream = await fetch(openSkyUrl, { headers });

    if (!upstream.ok) {
      // If rate-limited, return empty rather than crashing
      if (upstream.status === 429) {
        return res.status(200).json([]);
      }
      throw new Error(`OpenSky returned ${upstream.status}`);
    }

    const data = await upstream.json();
    // data.states is an array of state vectors, or null if none
    const states = data.states || [];

    // Cache for 15 seconds to be polite to OpenSky
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    return res.status(200).json(states);
  } catch (err) {
    console.error('OpenSky fetch error:', err);
    return res.status(500).json({ error: err.message });
  }
}
