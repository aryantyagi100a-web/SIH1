const express = require('express');
const router = express.Router();
const { INITIAL_ALERTS } = require('../data/seedData');
const { sendSMS, getDispatchHistory } = require('../services/twilioService');

let alerts = [...INITIAL_ALERTS];

router.get('/', (req, res) => {
  const { state, severity, status } = req.query;
  let filtered = alerts;
  if (state && state !== 'All') filtered = filtered.filter(a => a.state.toLowerCase() === state.toLowerCase());
  if (severity && severity !== 'All') filtered = filtered.filter(a => a.severity.toLowerCase() === severity.toLowerCase());
  if (status && status !== 'All') filtered = filtered.filter(a => a.status.toLowerCase() === status.toLowerCase());
  res.json({ success: true, total: filtered.length, alerts: filtered });
});

router.post('/', async (req, res) => {
  try {
    const { title, state, district, severity, message, targetAudience, phoneNumbers, sendSmsNow } = req.body;
    if (!title || !state || !severity || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const newAlert = {
      id: `ALT-2026-${String(alerts.length + 1).padStart(3, '0')}`,
      title,
      state,
      district: district || 'Statewide Hills',
      severity: severity.toUpperCase(),
      riskScore: severity === 'RED' ? 92 : severity === 'ORANGE' ? 74 : 45,
      message,
      targetAudience: targetAudience || 'Citizens & Relief Agencies',
      issuedAt: new Date().toISOString(),
      status: 'ACTIVE',
      smsBroadcastSent: Boolean(sendSmsNow),
      recipientCount: phoneNumbers?.length || 1250
    };

    alerts.unshift(newAlert);
    const smsResults = [];

    if (sendSmsNow) {
      const targetPhones = phoneNumbers?.length ? phoneNumbers : ['+91 98765 43210', '+91 94361 88776'];
      for (const phone of targetPhones) {
        const smsRes = await sendSMS({
          to: phone,
          message: `🚨 [NER DISASTER ALERT - ${newAlert.severity}] ${newAlert.title}: ${newAlert.message}. SDMA Helplines: 1070.`,
          alertId: newAlert.id,
          severity: newAlert.severity
        });
        smsResults.push(smsRes);
      }
    }

    res.status(201).json({ success: true, alert: newAlert, smsDispatched: smsResults });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/broadcast-sms', async (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
  const phone = req.body.targetPhone || '+91 98765 43210';
  const smsRes = await sendSMS({
    to: phone,
    message: `🚨 [NER LANDSLIDE ALERT - ${alert.severity}] ${alert.title}. ${alert.message}. Helpline: 1070`,
    alertId: alert.id,
    severity: alert.severity
  });
  alert.smsBroadcastSent = true;
  res.json({ success: true, message: `SMS alert broadcasted to ${phone}`, dispatchDetails: smsRes });
});

router.patch('/:id/resolve', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
  alert.status = 'RESOLVED';
  alert.resolvedAt = new Date().toISOString();
  res.json({ success: true, alert });
});

router.get('/sms-history', (req, res) => res.json({ success: true, history: getDispatchHistory() }));

module.exports = router;
