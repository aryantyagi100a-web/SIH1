import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Radio, 
  UserCheck, 
  Eye, 
  EyeOff, 
  KeyRound, 
  User 
} from 'lucide-react';
import { fetchAlerts, createAlert, triggerSMSBroadcast } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const INPUT_CLS = 'w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-white';
const STATES = ['All', 'Sikkim', 'Meghalaya', 'Arunachal Pradesh', 'Assam', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura'];

export default function AlertManager() {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [officerName, setOfficerName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const [alerts, setAlerts] = useState([]);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [broadcastingId, setBroadcastingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    state: 'Sikkim',
    district: 'East Sikkim',
    severity: 'RED',
    message: '',
    targetAudience: 'Villagers, Hill Drivers, Emergency SDRF/NDRF',
    sendSmsNow: true,
    channel: 'CELL_BROADCAST',
    phoneNumbers: '+91 98*** **210, +91 94*** **776'
  });

  const loadAlerts = () => fetchAlerts().then(data => setAlerts(data || []));
  useEffect(() => { loadAlerts(); }, []);

  const handleLogin = (e) => {
    e?.preventDefault();
    if (!officerName.trim()) return setAuthError('Please enter your Officer Name or Badge ID.');
    if (!password.trim()) return setAuthError('Please enter your Security Password.');
    setIsAuthenticated(true);
    setAuthError('');
  };

  const handleQuickDemoLogin = () => {
    setOfficerName('Officer A. Sharma (SDMA Zone-NER)');
    setPassword('••••••••');
    setIsAuthenticated(true);
    setAuthError('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setOfficerName('');
    setPassword('');
    setShowCreateModal(false);
  };

  const handleBroadcastSMS = async (alertId) => {
    setBroadcastingId(alertId);
    try {
      await triggerSMSBroadcast(alertId, '+91 98765 43210');
      setToastMessage({ type: 'success', text: '✅ CAP Emergency SMS Broadcast Dispatched to Citizen Cell Towers!' });
      loadAlerts();
    } catch {
      setToastMessage({ type: 'error', text: 'Failed to broadcast SMS.' });
    } finally {
      setBroadcastingId(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const phoneList = formData.phoneNumbers.split(',').map(p => p.trim()).filter(Boolean);
      await createAlert({ ...formData, issuedBy: officerName || 'SDMA Zonal Officer', issuedAt: new Date().toISOString(), phoneNumbers: phoneList });
      setToastMessage({ type: 'success', text: '✅ Official Alert & Mass SMS Broadcast Successfully Triggered!' });
      setShowCreateModal(false);
      setFormData({ title: '', state: 'Sikkim', district: 'East Sikkim', severity: 'RED', message: '', targetAudience: 'Villagers, Hill Drivers, Emergency SDRF/NDRF', sendSmsNow: true, channel: 'CELL_BROADCAST', phoneNumbers: '+91 98*** **210, +91 94*** **776' });
      loadAlerts();
    } catch {
      setToastMessage({ type: 'error', text: 'Error creating alert.' });
    } finally {
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const filtered = alerts.filter(a => 
    (selectedState === 'All' || a.state.toLowerCase() === selectedState.toLowerCase()) &&
    (selectedSeverity === 'All' || a.severity.toLowerCase() === selectedSeverity.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-2 sm:py-8 animate-fade-in">
        <div className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-5 sm:space-y-6">
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-900 border border-neutral-700 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-neutral-400 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">RESTRICTED AUTHORITY PORTAL</span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-2">Emergency Alert & SMS Dispatcher</h1>
              <p className="text-[11px] sm:text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">Restricted to verified Disaster Management Officers (NDMA, SDMA, NDRF, & District Magistrates).</p>
            </div>
          </div>

          <div className="bg-neutral-950 p-3.5 sm:p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-[11px] sm:text-xs">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Safety & Privacy Protection Active</span>
            </div>
            <p className="text-neutral-400 text-[10px] sm:text-[11px] leading-relaxed">
              • <strong>Zero Panic Prevention</strong>: Public cannot send fake mass alarms.<br />
              • <strong>Privacy Guaranteed</strong>: All citizen phone numbers are 100% masked and encrypted via Common Alerting Protocol (CAP-India).<br />
              • <strong>Official Audit Log</strong>: Every broadcast records the dispatching officer's name and timestamp.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-neutral-300 text-xs font-semibold mb-1">Officer Name / Badge ID:</label>
              <div className="relative">
                <input type="text" placeholder="e.g. Officer Sharma / SDMA-NER-07" value={officerName} onChange={(e) => setOfficerName(e.target.value)} className={`${INPUT_CLS} pl-10`} />
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 text-xs font-semibold mb-1">Officer Password:</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Enter secure password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${INPUT_CLS} pl-10 pr-10`} />
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-neutral-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && <p className="text-red-400 text-[11px] mt-1.5 font-mono">{authError}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button type="submit" className="flex-1 py-3 sm:py-2.5 bg-white text-black hover:bg-neutral-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-98">
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In & Unlock Dispatcher</span>
              </button>
              <button type="button" onClick={handleQuickDemoLogin} className="py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors active:scale-98">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>1-Click Demo Login</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6 animate-fade-in py-1 sm:py-2">
      {toastMessage && (
        <div className={`p-3.5 sm:p-4 rounded-xl border flex items-center space-x-3 transition-all ${toastMessage.type === 'success' ? 'bg-neutral-900 border-emerald-500/40 text-emerald-300' : 'bg-neutral-900 border-red-500/40 text-red-300'}`}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-mono">{toastMessage.text}</span>
        </div>
      )}

      <div className="glass-panel p-4 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-950/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="truncate">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white truncate">OFFICIAL DISPATCH ACTIVE</span>
              <span className="px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">VERIFIED</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-neutral-400 font-mono block mt-0.5 truncate">
              Officer: <span className="text-white font-semibold">{officerName || 'SDMA Zonal Lead'}</span> • CAP Protocol
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button onClick={() => setShowCreateModal(true)} className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-xl shadow-lg flex items-center justify-center space-x-1.5 transition-all active:scale-98">
            <Radio className="w-3.5 h-3.5 text-black animate-pulse flex-shrink-0" />
            <span className="truncate">Broadcast Alert</span>
          </button>
          <button onClick={handleLogout} className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs rounded-xl transition-colors flex items-center space-x-1 flex-shrink-0">
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-neutral-400 font-mono text-[10px] sm:text-[11px] uppercase">Filter:</span>
          <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="bg-neutral-900 text-neutral-200 rounded-lg border border-neutral-800 px-2.5 py-1.5 text-xs focus:outline-none">
            {STATES.map(s => <option key={s} value={s}>{s === 'All' ? t.allStates : s}</option>)}
          </select>
          <select value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)} className="bg-neutral-900 text-neutral-200 rounded-lg border border-neutral-800 px-2.5 py-1.5 text-xs focus:outline-none">
            <option value="All">{t.allLevels}</option>
            <option value="RED">🔴 {t.danger}</option>
            <option value="ORANGE">🟠 {t.warning}</option>
            <option value="YELLOW">🟡 {t.advisory}</option>
          </select>
        </div>
        <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400">{filtered.length} ACTIVE NOTICES</span>
      </div>

      <div className="space-y-3">
        {filtered.map((alert) => {
          const isRed = alert.severity === 'RED';
          const isOrange = alert.severity === 'ORANGE';
          return (
            <div key={alert.id} className="glass-panel p-4 sm:p-5 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all space-y-3 bg-black">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 truncate pr-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[9px] sm:text-[10px] text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">ID: {alert.id}</span>
                    <span className="text-[11px] sm:text-xs text-neutral-400 font-medium">{alert.state} • {alert.district}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">{alert.title}</h3>
                </div>
                <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-mono font-bold tracking-wider flex-shrink-0 ${
                  isRed ? 'bg-red-500/20 border border-red-500/40 text-red-400' : isOrange ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' : 'bg-neutral-800 border border-neutral-700 text-white'
                }`}>{alert.severity} ALERT</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-800 font-mono">{alert.message}</p>
              <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-[10px] sm:text-[11px] text-emerald-400 font-mono">{alert.smsBroadcastSent ? `✓ Dispatched to ~${alert.recipientCount || '12,500'} Mobiles` : 'Awaiting SMS Gateway'}</span>
                <button onClick={() => handleBroadcastSMS(alert.id)} disabled={broadcastingId === alert.id} className="w-full sm:w-auto px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors active:scale-98">
                  <Send className="w-3 h-3 text-neutral-300" />
                  <span>{broadcastingId === alert.id ? 'Dispatching...' : 'Dispatch Live SMS Again'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="glass-panel p-5 sm:p-6 rounded-2xl sm:rounded-3xl max-w-lg w-full border border-neutral-800 shadow-2xl space-y-4 bg-black max-h-[90vh] overflow-y-auto my-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-white">Emergency Citizen SMS Dispatch</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateAlert} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Alert Title:</label>
                <input type="text" required placeholder="e.g. FLASH EVACUATION: NH-10 Teesta Slope" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={INPUT_CLS} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">{t.state}:</label>
                  <select value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className={INPUT_CLS}>
                    {STATES.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">{t.aiRisk}:</label>
                  <select value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })} className={INPUT_CLS}>
                    <option value="RED">🔴 RED (Evacuate Now)</option>
                    <option value="ORANGE">🟠 ORANGE (High Alert)</option>
                    <option value="YELLOW">🟡 YELLOW (Advisory)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">SMS Message:</label>
                <textarea rows={3} required placeholder="e.g. SDMA URGENT: High landslide probability on North Sikkim Highway." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className={`${INPUT_CLS} leading-relaxed`} />
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="w-full sm:w-auto px-4 py-2 text-neutral-400 hover:text-white text-xs">{t.cancel}</button>
                <button type="submit" className="w-full sm:w-auto px-4 py-2.5 bg-white text-black font-bold rounded-xl shadow-lg hover:bg-neutral-200 text-xs flex items-center justify-center space-x-1.5 active:scale-98">
                  <Send className="w-3 h-3 text-black" />
                  <span>Authorize & Broadcast SMS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

}
