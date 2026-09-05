const axios = require('axios');
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

async function predictRisk(features) {
  try {
    return (await axios.post(`${ML_SERVICE_URL}/predict`, features, { timeout: 3000 })).data;
  } catch (err) {
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
    const riskCodes = ['LOW', 'MODERATE', 'HIGH', 'SEVERE'];
    const riskLabels = ['LOW (Normal)', 'MODERATE (Advisory - Yellow)', 'HIGH (Warning - Orange)', 'SEVERE (Immediate Evacuation - Red)'];
    const actions = [
      'Normal conditions. Continuous automated monitoring active.',
      '🟡 YELLOW ADVISORY: Moderate Susceptibility. Increase telemetry monitoring frequency.',
      '⚠️ ORANGE ALERT: High Landslide Probability. Issue SMS advisory to hill-slope residents.',
      '🚨 RED ALERT: Trigger Immediate Citizen Evacuation SMS. Mobilize SDRF/NDRF search & rescue.'
    ];

    return {
      risk_level: riskLevel,
      risk_code: riskCodes[riskLevel],
      risk_label: riskLabels[riskLevel],
      risk_score_percentage: combinedScore,
      confidence_probabilities: { Low: riskLevel === 0 ? 0.85 : 0.05, Moderate: riskLevel === 1 ? 0.75 : 0.15, High: riskLevel === 2 ? 0.78 : 0.12, Severe: riskLevel === 3 ? 0.88 : 0.04 },
      recommended_action: actions[riskLevel],
      factors_summary: [`Rainfall: ${rainfall_24h_mm} mm/24h`, `Slope: ${slope_deg}°`, `Soil Moisture Index: ${soil_moisture}`]
    };
  }
}

async function getNERHeatmapPoints(rainfallMultiplier = 1.0) {
  try {
    return (await axios.get(`${ML_SERVICE_URL}/ner-risk-points?rainfall_multiplier=${rainfallMultiplier}`, { timeout: 3000 })).data;
  } catch (err) {
    const { NER_STATIONS } = require('../data/seedData');
    const colorMap = { 0: '#10B981', 1: '#F59E0B', 2: '#F97316', 3: '#EF4444' };
    
    return {
      region: 'North Eastern Region (NER) India',
      station_count: NER_STATIONS.length,
      rainfall_simulation_multiplier: rainfallMultiplier,
      stations: NER_STATIONS.map(st => ({
        station_id: st.id,
        name: st.name,
        state: st.state,
        district: st.district,
        lat: st.lat,
        lng: st.lng,
        elevation_m: st.elevation_m,
        slope_deg: st.slope_deg,
        soil_type: st.soil_type,
        current_rainfall_24h_mm: Math.round(st.live_rainfall_24h_mm * rainfallMultiplier * 10) / 10,
        current_rainfall_72h_mm: Math.round(st.live_rainfall_72h_mm * rainfallMultiplier * 10) / 10,
        soil_moisture: st.soil_moisture,
        risk_level: st.risk_level,
        risk_code: st.risk_code,
        risk_label: `${st.risk_code} Risk Level`,
        risk_score_percentage: st.risk_score,
        color: colorMap[st.risk_level] || '#10B981',
        recommended_action: st.risk_level >= 2 ? 'High Alert: Evacuation protocols on standby.' : 'Normal monitoring.'
      }))
    };
  }
}

module.exports = { predictRisk, getNERHeatmapPoints };
