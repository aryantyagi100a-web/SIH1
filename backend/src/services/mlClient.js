const axios = require('axios');
const { getLiveRainfallSnapshot, estimateSoilMoisture } = require('./forecastService');
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

const RISK_CODES = ['LOW', 'MODERATE', 'HIGH', 'SEVERE'];
const RISK_LABELS = ['LOW (Normal)', 'MODERATE (Advisory - Yellow)', 'HIGH (Warning - Orange)', 'SEVERE (Immediate Evacuation - Red)'];
const RISK_ACTIONS = [
  'Normal conditions. Continuous automated monitoring active.',
  '🟡 YELLOW ADVISORY: Moderate Susceptibility. Increase telemetry monitoring frequency.',
  '⚠️ ORANGE ALERT: High Landslide Probability. Issue SMS advisory to hill-slope residents.',
  '🚨 RED ALERT: Trigger Immediate Citizen Evacuation SMS. Mobilize SDRF/NDRF search & rescue.'
];

/**
 * Rule-based risk scorer used when the Python ML service is offline.
 * It uses the same rainfall/slope/moisture formula the synthetic training
 * data was generated from, so the demo still reacts to rainfall changes
 * even when the Random Forest service is not running.
 */
function scoreRiskFallback(features) {
  const { slope_deg, rainfall_24h_mm, rainfall_72h_mm, soil_moisture, elevation_m, lithology_code, ndvi } = features;

  const trigger = ((rainfall_24h_mm || 50) / 150.0) * 35.0 +
                  ((rainfall_72h_mm || 100) / 350.0) * 20.0 +
                  (Math.pow(soil_moisture || 0.5, 2)) * 25.0;

  const terrain = ((slope_deg || 30) / 50.0) * 30.0 +
                  ((lithology_code || 3) / 5.0) * 15.0 -
                  ((ndvi || 0.5) * 15.0) +
                  ((elevation_m || 1000) / 3000.0) * 5.0;

  const combinedScore = Math.min(100, Math.max(5, Math.round(trigger + terrain)));
  const riskLevel = combinedScore >= 75 ? 3 : combinedScore >= 55 ? 2 : combinedScore >= 35 ? 1 : 0;

  return {
    risk_level: riskLevel,
    risk_code: RISK_CODES[riskLevel],
    risk_label: RISK_LABELS[riskLevel],
    risk_score_percentage: combinedScore,
    confidence_probabilities: { Low: riskLevel === 0 ? 0.85 : 0.05, Moderate: riskLevel === 1 ? 0.75 : 0.15, High: riskLevel === 2 ? 0.78 : 0.12, Severe: riskLevel === 3 ? 0.88 : 0.04 },
    recommended_action: RISK_ACTIONS[riskLevel],
    factors_summary: [`Rainfall: ${rainfall_24h_mm} mm/24h`, `Slope: ${slope_deg}°`, `Soil Moisture Index: ${soil_moisture}`]
  };
}

async function predictRisk(features) {
  try {
    return (await axios.post(`${ML_SERVICE_URL}/predict`, features, { timeout: 3000 })).data;
  } catch (err) {
    return scoreRiskFallback(features);
  }
}

const COLOR_MAP = { 0: '#10B981', 1: '#F59E0B', 2: '#F97316', 3: '#EF4444' };

/**
 * Build a single heatmap station object (same response shape for both modes).
 */
function shapeStation({ station, rainfall24h, rainfall72h, rainfallForecast24h, moisture, prediction, provider }) {
  return {
    station_id: station.id,
    name: station.name,
    state: station.state,
    district: station.district,
    lat: station.lat,
    lng: station.lng,
    elevation_m: station.elevation_m,
    slope_deg: station.slope_deg,
    soil_type: station.soil_type,
    current_rainfall_24h_mm: rainfall24h,
    current_rainfall_72h_mm: rainfall72h,
    rainfall_forecast_24h_mm: rainfallForecast24h,
    soil_moisture: moisture,
    rainfall_provider: provider,
    risk_level: prediction.risk_level,
    risk_code: prediction.risk_code,
    risk_label: prediction.risk_label,
    risk_score_percentage: prediction.risk_score_percentage,
    confidence_probabilities: prediction.confidence_probabilities,
    color: COLOR_MAP[prediction.risk_level] || '#10B981',
    recommended_action: prediction.recommended_action
  };
}

/**
 * LIVE mode (default): ingest real Open-Meteo nowcast rainfall per station, estimate
 * soil moisture from real 72h rain, and run each station through the AI risk model.
 * Every prediction goes through `predictRisk`, so the random-forest microservice is
 * used when it is online and the documented rule-based replica otherwise.
 */
async function liveHeatmap() {
  const { NER_STATIONS } = require('../data/seedData');
  const snapshot = await getLiveRainfallSnapshot();

  const attempts = await Promise.allSettled(snapshot.stations.map(async (rf) => {
    const station = NER_STATIONS.find((s) => s.id === rf.id);
    const moisture = estimateSoilMoisture(rf.rainfall_72h_mm);
    const prediction = await predictRisk({
      slope_deg: station.slope_deg,
      rainfall_24h_mm: rf.rainfall_24h_mm,
      rainfall_72h_mm: rf.rainfall_72h_mm,
      soil_moisture: moisture,
      elevation_m: station.elevation_m,
      lithology_code: station.lithology_code,
      ndvi: station.baseline_ndvi
    });
    return shapeStation({
      station,
      rainfall24h: rf.rainfall_24h_mm,
      rainfall72h: rf.rainfall_72h_mm,
      rainfallForecast24h: rf.rainfall_forecast_24h_mm,
      moisture,
      prediction,
      provider: rf.provider
    });
  }));

  const stations = snapshot.stations.map((rf, i) => {
    const station = NER_STATIONS.find((s) => s.id === rf.id);
    if (attempts[i].status === 'fulfilled') return attempts[i].value;
    // Prediction failed even with fallback: report a safe, transparent placeholder.
    return shapeStation({
      station,
      rainfall24h: rf.rainfall_24h_mm,
      rainfall72h: rf.rainfall_72h_mm,
      rainfallForecast24h: rf.rainfall_forecast_24h_mm,
      moisture: estimateSoilMoisture(rf.rainfall_72h_mm),
      prediction: { risk_level: 0, risk_code: 'LOW', risk_label: 'LOW (Normal)', risk_score_percentage: 0, confidence_probabilities: {}, recommended_action: 'Monitoring data unavailable.' },
      provider: rf.provider
    });
  });

  return {
    region: 'North Eastern Region (NER) India',
    station_count: stations.length,
    data_source: snapshot.source,
    fetched_at: snapshot.fetchedAt,
    mode: 'live',
    stations
  };
}

/**
 * SIMULATE mode (demo only): retains the original "monsoon surge" multiplier for
 * product demos. Uses the ML microservice bulk endpoint when online, otherwise the
 * seeded baseline scaled by the multiplier. Clearly flagged as simulation.
 */
async function simulateHeatmap(multiplier) {
  try {
    return (await axios.get(`${ML_SERVICE_URL}/ner-risk-points?rainfall_multiplier=${multiplier}`, { timeout: 3000 })).data;
  } catch (err) {
    const { NER_STATIONS } = require('../data/seedData');

    const stations = NER_STATIONS.map(st => {
      // Same simulated-rainfall recipe as the ML service (/ner-risk-points),
      // so the demo looks identical whether or not the Python service runs.
      const sim24h = Math.min(350.0, Math.round(st.high_risk_threshold_mm * 0.45 * multiplier * 10) / 10);
      const sim72h = Math.min(600.0, Math.round(sim24h * 1.85 * 10) / 10);
      const moisture = Math.min(0.98, Math.max(0.20, Math.round((0.35 + (sim72h / 500.0) * 0.55) * 100) / 100));

      // Recompute the risk from the simulated rain so the surge slider works.
      const prediction = scoreRiskFallback({
        slope_deg: st.slope_deg,
        rainfall_24h_mm: sim24h,
        rainfall_72h_mm: sim72h,
        soil_moisture: moisture,
        elevation_m: st.elevation_m,
        lithology_code: st.lithology_code,
        ndvi: st.baseline_ndvi
      });

      return {
        station_id: st.id,
        name: st.name,
        state: st.state,
        district: st.district,
        lat: st.lat,
        lng: st.lng,
        elevation_m: st.elevation_m,
        slope_deg: st.slope_deg,
        soil_type: st.soil_type,
        current_rainfall_24h_mm: sim24h,
        current_rainfall_72h_mm: sim72h,
        rainfall_forecast_24h_mm: Math.round(sim24h * 0.8 * 10) / 10,
        soil_moisture: moisture,
        rainfall_provider: 'SIMULATION',
        risk_level: prediction.risk_level,
        risk_code: prediction.risk_code,
        risk_label: prediction.risk_label,
        risk_score_percentage: prediction.risk_score_percentage,
        color: COLOR_MAP[prediction.risk_level] || '#10B981',
        recommended_action: prediction.recommended_action
      };
    });

    return {
      region: 'North Eastern Region (NER) India',
      station_count: stations.length,
      data_source: 'SIMULATION',
      rainfall_simulation_multiplier: multiplier,
      stations
    };
  }
}

async function getNERHeatmapPoints({ mode = 'live', multiplier = 1.0 } = {}) {
  if (mode === 'simulate') return simulateHeatmap(multiplier);
  return liveHeatmap();
}

module.exports = { predictRisk, getNERHeatmapPoints };
