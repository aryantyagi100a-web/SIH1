import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 5000
});

const FALLBACK_STATIONS = [
  { station_id: "NER-MEGH-01", name: "Cherrapunji (Sohra)", state: "Meghalaya", district: "East Khasi Hills", lat: 25.2986, lng: 91.5822, elevation_m: 1430, slope_deg: 38.5, soil_type: "Clayey Sand over Sandstone", current_rainfall_24h_mm: 142.5, current_rainfall_72h_mm: 285.0, soil_moisture: 0.82, risk_level: 2, risk_code: "HIGH", risk_label: "HIGH (Warning - Orange)", risk_score_percentage: 74.2, color: "#F97316", recommended_action: "⚠️ ORANGE ALERT: High Landslide Probability. Issue SMS advisory." },
  { station_id: "NER-SIKK-01", name: "Gangtok - Deorali Slopes", state: "Sikkim", district: "East Sikkim", lat: 27.3389, lng: 88.6065, elevation_m: 1650, slope_deg: 42.0, soil_type: "Phyllites & Schists", current_rainfall_24h_mm: 155.0, current_rainfall_72h_mm: 310.0, soil_moisture: 0.89, risk_level: 3, risk_code: "SEVERE", risk_label: "SEVERE (Immediate Evacuation - Red)", risk_score_percentage: 89.5, color: "#EF4444", recommended_action: "🚨 RED ALERT: Trigger Immediate Evacuation SMS." },
  { station_id: "NER-MIZO-01", name: "Aizawl (Hunthar)", state: "Mizoram", district: "Aizawl", lat: 23.7271, lng: 92.7176, elevation_m: 1132, slope_deg: 36.2, soil_type: "Shale & Siltstone", current_rainfall_24h_mm: 88.4, current_rainfall_72h_mm: 160.2, soil_moisture: 0.68, risk_level: 1, risk_code: "MODERATE", risk_label: "MODERATE (Advisory - Yellow)", risk_score_percentage: 52.8, color: "#F59E0B", recommended_action: "🟡 YELLOW ADVISORY: Moderate Susceptibility." },
  { station_id: "NER-NAGA-01", name: "Kohima - Zubza Corridor", state: "Nagaland", district: "Kohima", lat: 25.6751, lng: 94.1086, elevation_m: 1444, slope_deg: 34.8, soil_type: "Disang Shale", current_rainfall_24h_mm: 64.0, current_rainfall_72h_mm: 120.0, soil_moisture: 0.54, risk_level: 1, risk_code: "MODERATE", risk_label: "MODERATE (Advisory - Yellow)", risk_score_percentage: 46.0, color: "#F59E0B", recommended_action: "🟡 YELLOW ADVISORY: Moderate Susceptibility." },
  { station_id: "NER-ARUN-01", name: "Itanagar - Papum Pare Hills", state: "Arunachal Pradesh", district: "Papum Pare", lat: 27.0844, lng: 93.6053, elevation_m: 750, slope_deg: 31.4, soil_type: "Siwalik Sediments", current_rainfall_24h_mm: 112.0, current_rainfall_72h_mm: 215.0, soil_moisture: 0.76, risk_level: 2, risk_code: "HIGH", risk_label: "HIGH (Warning - Orange)", risk_score_percentage: 68.4, color: "#F97316", recommended_action: "⚠️ ORANGE ALERT: High Landslide Probability." },
  { station_id: "NER-ARUN-02", name: "Tawang Mountain Pass", state: "Arunachal Pradesh", district: "Tawang", lat: 27.5861, lng: 91.8594, elevation_m: 3048, slope_deg: 46.0, soil_type: "Granitic Gneiss", current_rainfall_24h_mm: 98.0, current_rainfall_72h_mm: 190.0, soil_moisture: 0.81, risk_level: 2, risk_code: "HIGH", risk_label: "HIGH (Warning - Orange)", risk_score_percentage: 72.0, color: "#F97316", recommended_action: "⚠️ ORANGE ALERT: High Landslide Probability." },
  { station_id: "NER-ASSA-01", name: "Haflong - Dima Hasao Slopes", state: "Assam", district: "Dima Hasao", lat: 25.1762, lng: 93.0189, elevation_m: 512, slope_deg: 28.5, soil_type: "Tertiary Sandstones", current_rainfall_24h_mm: 135.0, current_rainfall_72h_mm: 270.0, soil_moisture: 0.79, risk_level: 2, risk_code: "HIGH", risk_label: "HIGH (Warning - Orange)", risk_score_percentage: 71.5, color: "#F97316", recommended_action: "⚠️ ORANGE ALERT: High Landslide Probability." },
  { station_id: "NER-ASSA-02", name: "Guwahati - Kamakhya Foothills", state: "Assam", district: "Kamrup Metropolitan", lat: 26.1445, lng: 91.7362, elevation_m: 120, slope_deg: 22.0, soil_type: "Red Loamy Soil", current_rainfall_24h_mm: 35.0, current_rainfall_72h_mm: 70.0, soil_moisture: 0.38, risk_level: 0, risk_code: "LOW", risk_label: "LOW (Normal)", risk_score_percentage: 18.2, color: "#10B981", recommended_action: "🟢 GREEN (SAFE): Normal conditions." },
  { station_id: "NER-MANI-01", name: "Imphal - Noney Railway Sector", state: "Manipur", district: "Noney", lat: 24.8167, lng: 93.6000, elevation_m: 880, slope_deg: 35.0, soil_type: "Fractured Shale", current_rainfall_24h_mm: 72.0, current_rainfall_72h_mm: 145.0, soil_moisture: 0.62, risk_level: 1, risk_code: "MODERATE", risk_label: "MODERATE (Advisory - Yellow)", risk_score_percentage: 54.0, color: "#F59E0B", recommended_action: "🟡 YELLOW ADVISORY: Moderate Susceptibility." },
  { station_id: "NER-TRIP-01", name: "Jampui Hills - North Tripura", state: "Tripura", district: "North Tripura", lat: 23.9500, lng: 92.2667, elevation_m: 930, slope_deg: 24.5, soil_type: "Sandy Clay Loam", current_rainfall_24h_mm: 40.0, current_rainfall_72h_mm: 82.0, soil_moisture: 0.42, risk_level: 0, risk_code: "LOW", risk_label: "LOW (Normal)", risk_score_percentage: 22.5, color: "#10B981", recommended_action: "🟢 GREEN (SAFE): Normal conditions." }
];

export const fetchRiskHeatmap = async (mode = 'live', multiplier = 1.0) => {
  try {
    const params = mode === 'simulate' ? `mode=simulate&multiplier=${multiplier}` : 'mode=live';
    return (await client.get(`/risk/heatmap-points?${params}`)).data;
  } catch {
    return {
      region: "North Eastern Region (NER) India",
      station_count: FALLBACK_STATIONS.length,
      data_source: 'OFFLINE_SNAPSHOT',
      mode,
      stations: mode === 'simulate'
        ? FALLBACK_STATIONS.map(s => ({ ...s, current_rainfall_24h_mm: Math.round(s.current_rainfall_24h_mm * multiplier * 10) / 10, current_rainfall_72h_mm: Math.round(s.current_rainfall_72h_mm * multiplier * 10) / 10 }))
        : FALLBACK_STATIONS
    };
  }
};

export const fetchAlerts = async (params = {}) => {
  try {
    return (await client.get('/alerts', { params })).data.alerts;
  } catch {
    return [
      { id: "ALT-2026-001", title: "SEVERE LANDSLIDE WARNING: Gangtok Deorali Corridor", state: "Sikkim", district: "East Sikkim", severity: "RED", riskScore: 89.5, message: "Critical rainfall accumulation (155mm/24h) and high soil saturation detected. High danger of debris flow. Immediate evacuation advised.", targetAudience: "All Citizens & Local Disaster Management Authority", issuedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), status: "ACTIVE", smsBroadcastSent: true, recipientCount: 1420 },
      { id: "ALT-2026-002", title: "HIGH RISK ADVISORY: Cherrapunji-Mawsynram Highway", state: "Meghalaya", district: "East Khasi Hills", severity: "ORANGE", riskScore: 74.2, message: "Torrential downpour in progress. NH-206 ghat section vulnerable to rockfalls and mudslides.", targetAudience: "Commuters, PWD Road Engineers, Local Police", issuedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(), status: "ACTIVE", smsBroadcastSent: true, recipientCount: 890 }
    ];
  }
};

export const createAlert = async (alertData) => (await client.post('/alerts', alertData)).data;
export const triggerSMSBroadcast = async (alertId, targetPhone) => (await client.post(`/alerts/${alertId}/broadcast-sms`, { targetPhone })).data;
export const fetchFieldReports = async (params = {}) => {
  try { return (await client.get('/field-reports', { params })).data.reports; } catch { return []; }
};
export const submitFieldReport = async (reportData) => (await client.post('/field-reports', reportData)).data;
export const verifyFieldReport = async (reportId, data) => (await client.patch(`/field-reports/${reportId}/verify`, data)).data;

export const fetchAnalytics = async () => {
  try {
    return (await client.get('/analytics/overview')).data;
  } catch {
    return {
      totalSensors: 10,
      activeAlerts: 3,
      verifiedFieldReports: 2,
      rainfallVsThreshold: FALLBACK_STATIONS.map(st => ({ name: st.name.split(' ')[0], state: st.state, currentRainfall: st.current_rainfall_24h_mm, criticalThreshold: st.elevation_m > 1200 ? 140 : 160, riskScore: st.risk_score_percentage })),
      distribution: { low: 2, moderate: 4, high: 3, severe: 1 },
      stateSummary: [
        { state: "Meghalaya", stations: 2, avgRisk: 74, status: "High Alert" },
        { state: "Sikkim", stations: 2, avgRisk: 89, status: "Severe Warning" },
        { state: "Arunachal Pradesh", stations: 2, avgRisk: 70, status: "High Alert" },
        { state: "Assam", stations: 2, avgRisk: 45, status: "Moderate Advisory" }
      ],
      hourlyTrend: [
        { hour: "00:00", cherrapunji: 45, gangtok: 55, itanagar: 30 },
        { hour: "06:00", cherrapunji: 85, gangtok: 95, itanagar: 55 },
        { hour: "12:00", cherrapunji: 125, gangtok: 135, itanagar: 88 },
        { hour: "18:00", cherrapunji: 142, gangtok: 155, itanagar: 112 }
      ]
    };
  }
};

export const fetchPublicBulletin = async () => {
  try {
    return (await client.get('/public/bulletin')).data;
  } catch {
    return {
      systemStatus: "24x7 Emergency Grid Active",
      activeAlerts: await fetchAlerts(),
      highRiskDistricts: FALLBACK_STATIONS.filter(s => s.risk_level >= 2),
      emergencyHelplines: [
        { region: "National Disaster Response Force (NDRF)", number: "1078 / 9711077372", type: "HQ 24x7" },
        { region: "Assam / Meghalaya / Sikkim SDMA", number: "1070", type: "Toll Free Helpline" }
      ],
      safetyGuidelines: []
    };
  }
};

export const runMLPrediction = async (features) => {
  try {
    return (await client.post('/risk/predict', features)).data;
  } catch {
    const score = Math.min(95, Math.round((features.rainfall_24h_mm / 150) * 45 + (features.slope_deg / 45) * 35));
    const level = score > 75 ? 3 : score > 50 ? 2 : score > 30 ? 1 : 0;
    return {
      prediction: {
        risk_level: level,
        risk_code: ["LOW", "MODERATE", "HIGH", "SEVERE"][level],
        risk_label: ["LOW (Normal)", "MODERATE (Yellow)", "HIGH (Orange)", "SEVERE (Red)"][level],
        risk_score_percentage: score,
        confidence_probabilities: { Low: 0.1, Moderate: 0.2, High: 0.4, Severe: 0.3 },
        recommended_action: level >= 2 ? "High Alert: Issue Evacuation Notice" : "Normal Monitoring Active",
        factors_summary: ["Rainfall intensity", "Slope gradient"]
      }
    };
  }
};
