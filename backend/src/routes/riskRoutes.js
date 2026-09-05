const express = require('express');
const router = express.Router();
const { predictRisk, getNERHeatmapPoints } = require('../services/mlClient');

router.get('/heatmap-points', async (req, res) => {
  try {
    const data = await getNERHeatmapPoints(req.query.multiplier ? parseFloat(req.query.multiplier) : 1.0);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/predict', async (req, res) => {
  try {
    const { slope_deg, rainfall_24h_mm, rainfall_72h_mm, soil_moisture, elevation_m, lithology_code, ndvi } = req.body;
    if (slope_deg === undefined || rainfall_24h_mm === undefined) {
      return res.status(400).json({ success: false, error: 'slope_deg and rainfall_24h_mm are required' });
    }

    const payload = {
      slope_deg: parseFloat(slope_deg),
      rainfall_24h_mm: parseFloat(rainfall_24h_mm),
      rainfall_72h_mm: parseFloat(rainfall_72h_mm || rainfall_24h_mm * 1.8),
      soil_moisture: parseFloat(soil_moisture || 0.65),
      elevation_m: parseFloat(elevation_m || 1200),
      lithology_code: parseInt(lithology_code || 3),
      ndvi: parseFloat(ndvi || 0.55)
    };

    const result = await predictRisk(payload);
    res.json({ success: true, input_features: payload, prediction: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
