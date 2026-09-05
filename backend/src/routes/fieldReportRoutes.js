const express = require('express');
const router = express.Router();
const { INITIAL_FIELD_REPORTS } = require('../data/seedData');

let fieldReports = [...INITIAL_FIELD_REPORTS];

router.get('/', (req, res) => {
  const { state, severity, verified } = req.query;
  let list = fieldReports;
  if (state && state !== 'All') list = list.filter(r => r.state.toLowerCase() === state.toLowerCase());
  if (severity && severity !== 'All') list = list.filter(r => r.severity.toLowerCase() === severity.toLowerCase());
  if (verified !== undefined) list = list.filter(r => r.verified === (verified === 'true'));
  res.json({ success: true, total: list.length, reports: list });
});

router.post('/', (req, res) => {
  try {
    const { reporterName, phone, role, locationName, state, district, lat, lng, hazardType, severity, description, photoUrl } = req.body;
    if (!locationName || !state || !lat || !lng || !hazardType) {
      return res.status(400).json({ success: false, error: 'Missing mandatory fields' });
    }

    const defaultPhotos = [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop'
    ];

    const newReport = {
      id: `REP-2026-${String(fieldReports.length + 101).padStart(3, '0')}`,
      reporterName: reporterName || 'Anonymous Field Officer',
      phone: phone || '+91 90000 00000',
      role: role || 'Citizen / Community Volunteer',
      locationName,
      state,
      district: district || 'Local District',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      hazardType,
      severity: severity || 'Medium',
      description: description || 'No additional commentary provided.',
      photoUrl: photoUrl || defaultPhotos[Math.floor(Math.random() * defaultPhotos.length)],
      submittedAt: new Date().toISOString(),
      verified: false,
      status: 'PENDING_VERIFICATION'
    };

    fieldReports.unshift(newReport);
    res.status(201).json({ success: true, message: 'Field report submitted successfully.', report: newReport });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id/verify', (req, res) => {
  const report = fieldReports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
  report.verified = true;
  report.status = req.body.status || 'VERIFIED_ACTION_INITIATED';
  report.verifiedAt = new Date().toISOString();
  if (req.body.remarks) report.adminRemarks = req.body.remarks;
  res.json({ success: true, report });
});

module.exports = router;
