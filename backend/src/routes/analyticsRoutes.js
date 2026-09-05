const express = require('express');
const router = express.Router();
const { NER_STATIONS, INITIAL_ALERTS, INITIAL_FIELD_REPORTS } = require('../data/seedData');

router.get('/overview', (req, res) => {
  const rainfallVsThreshold = NER_STATIONS.map(st => ({
    name: st.name.split(' ')[0],
    state: st.state,
    currentRainfall: st.live_rainfall_24h_mm,
    criticalThreshold: st.high_risk_threshold_mm,
    riskScore: st.risk_score
  }));

  const distribution = {
    low: NER_STATIONS.filter(s => s.risk_level === 0).length,
    moderate: NER_STATIONS.filter(s => s.risk_level === 1).length,
    high: NER_STATIONS.filter(s => s.risk_level === 2).length,
    severe: NER_STATIONS.filter(s => s.risk_level === 3).length
  };

  const stateSummary = [
    { state: 'Meghalaya', stations: 2, avgRisk: 74, status: 'High Alert' },
    { state: 'Sikkim', stations: 2, avgRisk: 89, status: 'Severe Warning' },
    { state: 'Arunachal Pradesh', stations: 2, avgRisk: 70, status: 'High Alert' },
    { state: 'Assam', stations: 2, avgRisk: 45, status: 'Moderate Advisory' },
    { state: 'Nagaland', stations: 1, avgRisk: 46, status: 'Moderate Advisory' },
    { state: 'Mizoram', stations: 1, avgRisk: 53, status: 'Moderate Advisory' },
    { state: 'Manipur', stations: 1, avgRisk: 54, status: 'Moderate Advisory' },
    { state: 'Tripura', stations: 1, avgRisk: 22, status: 'Normal (Safe)' }
  ];

  const hourlyTrend = [
    { hour: '00:00', cherrapunji: 45, gangtok: 55, itanagar: 30, aizawl: 20 },
    { hour: '04:00', cherrapunji: 70, gangtok: 85, itanagar: 45, aizawl: 35 },
    { hour: '08:00', cherrapunji: 95, gangtok: 110, itanagar: 65, aizawl: 48 },
    { hour: '12:00', cherrapunji: 125, gangtok: 135, itanagar: 88, aizawl: 60 },
    { hour: '16:00', cherrapunji: 142, gangtok: 155, itanagar: 112, aizawl: 75 },
    { hour: '20:00', cherrapunji: 148, gangtok: 160, itanagar: 115, aizawl: 88 }
  ];

  res.json({
    success: true,
    totalSensors: NER_STATIONS.length,
    activeAlerts: INITIAL_ALERTS.length,
    verifiedFieldReports: INITIAL_FIELD_REPORTS.filter(r => r.verified).length,
    rainfallVsThreshold,
    distribution,
    stateSummary,
    hourlyTrend
  });
});

module.exports = router;
