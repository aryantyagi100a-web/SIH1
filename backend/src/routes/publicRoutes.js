const express = require('express');
const router = express.Router();
const { INITIAL_ALERTS, EMERGENCY_HELPLINES, NER_STATIONS } = require('../data/seedData');

router.get('/bulletin', (req, res) => {
  const activeAlerts = INITIAL_ALERTS.filter(a => a.status === 'ACTIVE');
  const highRiskDistricts = NER_STATIONS
    .filter(s => s.risk_level >= 2)
    .map(s => ({ name: s.name, district: s.district, state: s.state, riskLevel: s.risk_code, riskScore: s.risk_score, rainfall24h: s.live_rainfall_24h_mm }));

  const safetyGuidelines = [
    {
      category: "BEFORE (Warning Phase)",
      points: [
        "Monitor local radio, SMS alerts, and weather advisories regularly.",
        "Identify tension cracks on slopes, retaining walls, or foundations.",
        "Prepare an Emergency Go-Bag (Medicines, Torch, First Aid, ID proofs, Non-perishable Food).",
        "Keep SDRF/NDRF helpline numbers (1070/1078) on speed dial."
      ]
    },
    {
      category: "DURING (Active Landslide / Cloudburst)",
      points: [
        "Evacuate immediately away from the path of debris flow or steep drainage slopes.",
        "Never cross flooded bridges or road sections with visible flowing mud.",
        "If trapped indoors, take shelter under sturdy furniture and protect your head.",
        "Stay alert for sudden unusual sounds like trees cracking or boulders knocking."
      ]
    },
    {
      category: "AFTER (Post-Incident Safety)",
      points: [
        "Stay clear of landslide zones—secondary slides frequently occur.",
        "Report broken power lines and water gas pipeline ruptures immediately.",
        "Assist injured or trapped persons only if safe to do so without endangering yourself.",
        "Submit geo-tagged ground observations to help emergency rescue teams."
      ]
    }
  ];

  res.json({
    success: true,
    broadcastTime: new Date().toISOString(),
    systemStatus: "24x7 Real-Time Emergency Grid Active",
    activeAlerts,
    highRiskDistricts,
    emergencyHelplines: EMERGENCY_HELPLINES,
    safetyGuidelines
  });
});

module.exports = router;
