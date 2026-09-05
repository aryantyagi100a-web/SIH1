require('dotenv').config();

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM_PHONE = process.env.TWILIO_PHONE_NUMBER || '+18005550199';

const smsDispatchHistory = [];

async function sendSMS({ to, message, alertId, severity }) {
  const timestamp = new Date().toISOString();
  
  if (ACCOUNT_SID?.startsWith('AC') && AUTH_TOKEN) {
    try {
      const twilio = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);
      const response = await twilio.messages.create({ body: message, from: FROM_PHONE, to });
      const record = { id: `SMS-${Date.now()}`, to, message, alertId: alertId || 'DIRECT', severity: severity || 'HIGH', status: 'DELIVERED', provider: 'TWILIO_LIVE', twilioSid: response.sid, sentAt: timestamp };
      smsDispatchHistory.unshift(record);
      return record;
    } catch (err) {
      console.warn(`[Twilio Service] Live SMS failed (${err.message}). Using simulation.`);
    }
  }

  const mockRecord = {
    id: `SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    to: to || '+91 98765 00000',
    message,
    alertId: alertId || 'SIMULATED',
    severity: severity || 'ORANGE',
    status: 'DELIVERED (SIMULATED)',
    provider: 'SIMULATED_GATEWAY',
    twilioSid: `SM_mock_${Math.random().toString(36).substring(2, 12)}`,
    sentAt: timestamp
  };

  smsDispatchHistory.unshift(mockRecord);
  if (smsDispatchHistory.length > 50) smsDispatchHistory.pop();
  return mockRecord;
}

const getDispatchHistory = () => smsDispatchHistory;

module.exports = { sendSMS, getDispatchHistory };
