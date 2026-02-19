// api/flights.js — Vercel serverless function (CommonJS, Node 18+)
const https = require('https');

module.exports = async function handler(req, res) {
  const { lat, lon, d = '1.4' } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  const latF = parseFloat(lat);
  const lonF = parseFloat(lon);
  const dF   = parseFloat(d);

  const lamin = latF - dF;
  const lamax = latF + dF;
  const lomin = lonF - dF;
  const lomax = lonF + dF;

  const path = `/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;

  const headers = { 'Accept': 'application/json' };
  if (process.env.OPENSKY_USER && process.env.OPENSKY_PASS) {
    const creds = Buffer.from(`${process.env.OPENSKY_USER}:${process.env.OPENSKY_PASS}`).toString('base64');
    headers['Authorization'] = `Basic ${creds}`;
  }

  try {
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'opensky-network.org',
        path: path,
        method: 'GET',
        headers: headers,
      };

      const request = https.request(options, (resp) => {
        if (resp.statusCode === 429) {
          resolve({ states: [] });
          return;
        }
        if (resp.statusCode !== 200) {
          reject(new Error(`OpenSky returned ${resp.statusCode}`));
          return;
        }
        let body = '';
        resp.on('data', chunk => body += chunk);
        resp.on('end', () => {
          try { resolve(JSON.parse(body)); }
          catch(e) { reject(new Error('Invalid JSON from OpenSky')); }
        });
      });

      request.on('error', reject);
      request.setTimeout(8000, () => {
        request.destroy();
        reject(new Error('OpenSky request timed out'));
      });
      request.end();
    });

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data.states || []);

  } catch (err) {
    console.error('OpenSky fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
