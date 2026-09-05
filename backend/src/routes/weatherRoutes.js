const express = require('express');
const router = express.Router();
const { fetchWeatherForCoordinates, getAllNERWeatherStations } = require('../services/weatherService');
const { NER_STATIONS } = require('../data/seedData');

router.get('/stations', async (req, res) => {
  try {
    const stationsData = await getAllNERWeatherStations();
    res.json({ success: true, count: stationsData.length, stations: stationsData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/query', async (req, res) => {
  const { lat, lng, name } = req.query;
  if (!lat || !lng) return res.status(400).json({ success: false, error: 'Latitude and longitude required' });
  try {
    const weather = await fetchWeatherForCoordinates(parseFloat(lat), parseFloat(lng), name || 'Custom Location');
    res.json({ success: true, weather });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/simulate-storm', (req, res) => {
  const { stationId, rainfall_24h_mm } = req.body;
  const targetStation = NER_STATIONS.find(s => s.id === stationId);
  if (!targetStation) return res.status(404).json({ success: false, error: 'Station not found' });

  const rain = rainfall_24h_mm || 185.0;
  targetStation.live_rainfall_24h_mm = rain;
  targetStation.live_rainfall_72h_mm = rain * 2;
  targetStation.soil_moisture = Math.min(0.98, 0.5 + (rain / 300));
  
  if (rain >= targetStation.high_risk_threshold_mm) {
    targetStation.risk_level = 3;
    targetStation.risk_code = 'SEVERE';
    targetStation.risk_score = 91.5;
  } else if (rain >= targetStation.high_risk_threshold_mm * 0.65) {
    targetStation.risk_level = 2;
    targetStation.risk_code = 'HIGH';
    targetStation.risk_score = 72.0;
  }

  res.json({ success: true, message: `Simulated storm of ${rain}mm at ${targetStation.name}`, updatedStation: targetStation });
});

module.exports = router;
