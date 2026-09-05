require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use('/api/field-reports', require('./routes/fieldReportRoutes'));
app.use('/api/risk', require('./routes/riskRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));

app.get('/api/health', (req, res) => res.json({
  status: 'online',
  service: 'NER Landslide Early Warning Backend API',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  regions: ['Assam', 'Meghalaya', 'Arunachal Pradesh', 'Sikkim', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura']
}));

app.get('/', (req, res) => res.json({
  message: 'SIH 2026 Problem Statement 26001 - NER Landslide Early Warning System API',
  documentation: { alerts: '/api/alerts', weather: '/api/weather/stations', fieldReports: '/api/field-reports', riskHeatmap: '/api/risk/heatmap-points', analytics: '/api/analytics/overview', publicBulletin: '/api/public/bulletin', health: '/api/health' }
}));

app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`🚀 NER Landslide Backend running on port ${PORT}`));
