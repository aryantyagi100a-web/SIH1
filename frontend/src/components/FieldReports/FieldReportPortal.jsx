import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Navigation } from 'lucide-react';
import { fetchFieldReports, submitFieldReport, verifyFieldReport } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const INP_CLS = 'w-full bg-[#070b14] border border-white/[0.08] rounded-lg p-2 text-white focus:outline-none text-xs';
const STATES = ['Sikkim', 'Meghalaya', 'Arunachal Pradesh', 'Assam', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura'];

export default function FieldReportPortal() {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [geoLocating, setGeoLocating] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    reporterName: '', phone: '', role: 'Resident / Citizen', locationName: '',
    state: 'Sikkim', district: 'East Sikkim', lat: '27.3389', lng: '88.6065',
    hazardType: 'Tension Cracks on Road Slopes', severity: 'High', description: '',
    photoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop'
  });

  const loadReports = () => fetchFieldReports().then(data => setReports(data || []));
  useEffect(() => { loadReports(); }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser');
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({ ...prev, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
        setGeoLocating(false);
      },
      () => {
        setFormData(prev => ({ ...prev, lat: '27.3389', lng: '88.6065' }));
        setGeoLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitFieldReport(formData);
      setSubmittedSuccess(true);
      setFormData({ reporterName: '', phone: '', role: 'Resident / Citizen', locationName: '', state: 'Sikkim', district: 'East Sikkim', lat: '27.3389', lng: '88.6065', hazardType: 'Tension Cracks on Road Slopes', severity: 'High', description: '', photoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop' });
      loadReports();
      setTimeout(() => setSubmittedSuccess(false), 5000);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleVerify = async (reportId) => {
    await verifyFieldReport(reportId, { status: 'VERIFIED_ACTION_INITIATED' });
    loadReports();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in py-2">
      <div className="pb-4 border-b border-white/[0.06]">
        <span className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest block">GEO-TAGGED CROWDSOURCED & FIELD INTEL</span>
        <h1 className="text-2xl font-bold tracking-tight text-[#e2e8f0] mt-1">{t.reportFormTitle}</h1>
        <p className="text-xs text-[#64748b] mt-1">{t.reportFormSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/[0.06] space-y-4">
          {submittedSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Report transmitted to Disaster Command Center!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#94a3b8] mb-1 font-medium">{t.reporterName}</label>
                <input type="text" required value={formData.reporterName} onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })} className={INP_CLS} />
              </div>
              <div>
                <label className="block text-[#94a3b8] mb-1 font-medium">{t.reporterPhone}</label>
                <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={INP_CLS} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#94a3b8] mb-1 font-medium">{t.roleLabel}</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={INP_CLS}>
                  {['Citizen', 'Volunteer', 'Officer', 'Police'].map(r => <option key={r} value={r}>{t[`role${r}`] || r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[#94a3b8] mb-1 font-medium">{t.state}</label>
                <select value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className={INP_CLS}>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#94a3b8] mb-1 font-medium">{t.landmarkLabel}</label>
              <input type="text" required value={formData.locationName} onChange={(e) => setFormData({ ...formData, locationName: e.target.value })} className={INP_CLS} />
            </div>

            <div className="p-3 bg-[#070b14] rounded-lg border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#64748b] font-mono uppercase tracking-wider">GPS PIN</span>
                <button type="button" onClick={handleGetLocation} className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded text-[10px] font-mono flex items-center space-x-1">
                  <Navigation className="w-3 h-3" />
                  <span>{geoLocating ? t.acquiringGps : t.autoGps}</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <input type="text" value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded p-1.5 text-white" />
                <input type="text" value={formData.lng} onChange={(e) => setFormData({ ...formData, lng: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded p-1.5 text-white" />
              </div>
            </div>

            <div>
              <label className="block text-[#94a3b8] mb-1 font-medium">{t.hazardTypeLabel}</label>
              <select value={formData.hazardType} onChange={(e) => setFormData({ ...formData, hazardType: e.target.value })} className={INP_CLS}>
                {[
                  { k: 'hazardCracks', v: 'Tension Cracks on Road Slopes' },
                  { k: 'hazardMudflow', v: 'Mud & Debris Flow' },
                  { k: 'hazardFallingRocks', v: 'Fallen Boulders / Rockfall' },
                  { k: 'hazardBrokenWall', v: 'Retaining Wall Bulging / Collapse' },
                  { k: 'hazardWaterSpring', v: 'New Spring Water Seepage' }
                ].map(({ k, v }) => <option key={k} value={v}>{t[k] || v}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[#94a3b8] mb-1 font-medium">{t.notesLabel}</label>
              <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={INP_CLS} />
            </div>

            <button type="submit" className="w-full py-2.5 bg-white text-black hover:bg-neutral-200 font-semibold text-xs rounded-lg shadow-lg flex items-center justify-center space-x-1.5 transition-all">
              <Send className="w-3.5 h-3.5" />
              <span>{t.submitReport}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-3">
          <span className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest block">VERIFIED GROUND REPORTS ({reports.length})</span>
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {reports.map((rep) => (
              <div key={rep.id} className="glass-panel p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-[#64748b]">
                      <span>{rep.id}</span>
                      <span>•</span>
                      <span>{rep.locationName}, {rep.district}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mt-0.5">{rep.hazardType}</h4>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${rep.verified ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b]'}`}>
                    {rep.verified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed bg-[#070b14]/50 p-2.5 rounded-lg border border-white/[0.04]">"{rep.description}"</p>
                <div className="flex items-center justify-between text-[11px] text-[#64748b] pt-1">
                  <span>{rep.reporterName} ({rep.role})</span>
                  {!rep.verified && (
                    <button onClick={() => handleVerify(rep.id)} className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded text-[10px] font-mono transition-colors">
                      {t.verifyAction}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
