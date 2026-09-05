/**
 * Real precipitation nowcast ingestion for the NER monitoring stations.
 *
 * Provider chain (extensible — swap in IMD/MOSDAC later by adding a provider):
 *   1. Open-Meteo Forecast API (free, no API key). Returns hourly precipitation
 *      in the station's local timezone for the trailing 72 hours AND the next 24h.
 *      We slice rolling 24h / 72h accumulations off the observed hours and keep the
 *      next-24h forecast separately, so the map can show both current wetness and
 *      the coming surge.
 *   2. If the provider is unreachable, fall back to each station's baseline
 *      telemetry (seed values) so the risk map never goes blank during a demo.
 *      The response's `source` / per-station `provider` fields make the fallback
 *      explicit instead of silently pretending it is live data.
 *
 * Soil moisture is not exposed by the free provider, so it is estimated from the
 * real 72h accumulation using the same saturation curve the training-data
 * generator uses: moisture = 0.15 + (rain72 / 500) * 0.7  (clamped).
 */
const axios = require('axios');
const { NER_STATIONS } = require('../data/seedData');

const PROVIDER_URL = process.env.FORECAST_PROVIDER_URL || 'https://api.open-meteo.com/v1/forecast';
const CACHE_TTL_MS = 10 * 60 * 1000; // Refresh live rainfall at most once per 10 minutes.

let snapshotCache = { fetchedAt: 0, payload: null };

const round1 = (v) => Math.round(v * 10) / 10;
const round2 = (v) => Math.round(v * 100) / 100;

function sum(values) {
  return values.reduce((acc, v) => acc + (Number(v) || 0), 0);
}

/** Estimate soil-moisture index (0..1) from real 72h rainfall accumulation. */
function estimateSoilMoisture(rainfall72hMm) {
  const raw = 0.15 + (rainfall72hMm / 500.0) * 0.7;
  return round2(Math.min(0.98, Math.max(0.2, raw)));
}

/**
 * Fetch one station's rolling rainfall windows from Open-Meteo.
 * @returns {{ rainfall_24h_mm: number, rainfall_72h_mm: number, rainfall_forecast_24h_mm: number }}
 */
async function fetchStationRainfall(lat, lng) {
  const url = `${PROVIDER_URL}?latitude=${lat}&longitude=${lng}&hourly=precipitation&past_days=3&forecast_days=1&timezone=auto`;
  const { data } = await axios.get(url, { timeout: 8000 });

  const times = data.hourly && data.hourly.time;
  const precip = data.hourly && data.hourly.precipitation;
  if (!Array.isArray(times) || !Array.isArray(precip) || times.length < 72) {
    throw new Error('Unexpected Open-Meteo response shape');
  }

  // Provider slots are in the station's local timezone. Find the newest slot at
  // or before "now" (local wall-clock), then slice rolling windows off it.
  const offsetMs = (data.utc_offset_seconds || 0) * 1000;
  const nowLocalKey = new Date(Date.now() + offsetMs).toISOString().slice(0, 13) + ':00';

  let lastPastIndex = times.length - 1;
  for (let i = 0; i < times.length; i += 1) {
    if (times[i] > nowLocalKey) { lastPastIndex = i - 1; break; }
  }

  // Trailing 24h / 72h observed accumulation (fall back to whatever history exists).
  const start24 = Math.max(0, lastPastIndex - 23);
  const start72 = Math.max(0, lastPastIndex - 71);
  const rainfall24h = round1(sum(precip.slice(start24, lastPastIndex + 1)));
  const rainfall72h = round1(sum(precip.slice(start72, lastPastIndex + 1)));

  // Next-24h forecast accumulation (up to 24 slots ahead, clamped to response length).
  const forecastEnd = Math.min(times.length, lastPastIndex + 25);
  const rainfallForecast24h = round1(sum(precip.slice(lastPastIndex + 1, forecastEnd)));

  return { rainfall_24h_mm: rainfall24h, rainfall_72h_mm: rainfall72h, rainfall_forecast_24h_mm: rainfallForecast24h };
}

/**
 * Live rainfall snapshot for every NER monitoring station, cached for CACHE_TTL_MS.
 * @returns {{ stations: Array, source: string, fetchedAt: string }}
 *   station item: { id, rainfall_24h_mm, rainfall_72h_mm, rainfall_forecast_24h_mm, provider }
 *   source: 'OPEN_METEO_LIVE' | 'SEED_FALLBACK' | 'PARTIAL_OPEN_METEO'
 */
async function getLiveRainfallSnapshot() {
  const now = Date.now();
  if (snapshotCache.payload && now - snapshotCache.fetchedAt < CACHE_TTL_MS) {
    return snapshotCache.payload;
  }

  const attempts = await Promise.allSettled(NER_STATIONS.map((st) => fetchStationRainfall(st.lat, st.lng)));

  const okCount = attempts.filter((r) => r.status === 'fulfilled').length;
  const source = okCount === NER_STATIONS.length
    ? 'OPEN_METEO_LIVE'
    : okCount === 0 ? 'SEED_FALLBACK' : 'PARTIAL_OPEN_METEO';

  const stations = NER_STATIONS.map((st, i) => {
    const baseline = {
      rainfall_24h_mm: st.live_rainfall_24h_mm,
      rainfall_72h_mm: st.live_rainfall_72h_mm,
      rainfall_forecast_24h_mm: round1(st.live_rainfall_24h_mm * 0.8)
    };
    if (attempts[i].status === 'fulfilled') {
      return { id: st.id, provider: 'OPEN_METEO', ...baseline, ...attempts[i].value };
    }
    return { id: st.id, provider: 'SEED_FALLBACK', ...baseline };
  });

  snapshotCache = { fetchedAt: now, payload: { stations, source, fetchedAt: new Date(now).toISOString() } };
  return snapshotCache.payload;
}

module.exports = { getLiveRainfallSnapshot, estimateSoilMoisture };
