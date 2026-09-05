import React, { useState, useEffect } from 'react';
import { PhoneCall, AlertTriangle, Share2 } from 'lucide-react';
import { fetchPublicBulletin } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const HELPLINES = [
  { region: 'National Emergency Helpline', number: '112', type: 'All Emergencies' },
  { region: 'NDMA Disaster Helpline', number: '1078', type: 'National Control Room' },
  { region: 'NDRF 24x7 Control', number: '011-24363260', type: 'Search & Rescue' },
  { region: 'Sikkim SDMA Gangtok', number: '1070 / 03592-202410', type: 'State Help' },
  { region: 'Meghalaya SDMA Shillong', number: '1070 / 0364-2502098', type: 'State Help' },
  { region: 'Assam SDMA Guwahati', number: '1070 / 1079', type: 'State Help' },
  { region: 'Arunachal SDMA Itanagar', number: '1070 / 0360-2292777', type: 'State Help' },
  { region: 'Nagaland NSDMA Kohima', number: '1070 / 0370-2270050', type: 'State Help' },
  { region: 'Mizoram Disaster Control', number: '1070 / 0389-2342520', type: 'State Help' }
];

export default function PublicAlertPortal() {
  const { t } = useLanguage();
  const [bulletin, setBulletin] = useState(null);

  useEffect(() => {
    fetchPublicBulletin().then(setBulletin);
  }, []);

  const handleShare = () => {
    navigator.share 
      ? navigator.share({ title: t.siteTitle, text: t.siteSubtitle, url: window.location.href })
      : alert('Alert URL copied: ' + window.location.href);
  };

  const safetyTips = [
    { title: '1. Before Rainstorm', desc: t.tipBefore, color: 'text-[#e2e8f0]' },
    { title: '2. During Landslide', desc: t.tipDuring, color: 'text-[#ef4444]' },
    { title: '3. Post Recovery', desc: t.tipAfter, color: 'text-emerald-400' }
  ];

  return (
    /* 
      Public Citizen Advisory Portal:
      Openly accessible to citizens without login for instant life-safety advisories & direct helpline calling.
    */
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in py-1 sm:py-2">
      <div className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/[0.06] space-y-4">
        <div>
          <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono tracking-widest uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">{t.publicNoLogin}</span>
          <h1 className="text-fluid-2xl font-extrabold text-[#e2e8f0] tracking-tight mt-2.5">{t.publicTitle}</h1>
          <p className="text-fluid-xs text-[#94a3b8] mt-1 leading-relaxed max-w-2xl">{t.publicSubtitle}</p>
        </div>

        {/* Action Buttons: Min 44px touch height for fast one-tap action on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button onClick={handleShare} className="px-4 py-3 min-h-[44px] bg-white text-black hover:bg-neutral-200 text-fluid-xs font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-98">
            <Share2 className="w-4 h-4 text-black" />
            <span>{t.share}</span>
          </button>
          <a href="tel:1070" className="px-4 py-3 min-h-[44px] bg-[#ef4444] hover:bg-[#ef4444]/90 text-white text-fluid-xs font-bold rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center space-x-2 transition-all active:scale-98">
            <PhoneCall className="w-4 h-4" />
            <span>{t.emergencySos} (Direct Dial: 1070)</span>
          </a>
        </div>
      </div>

      {/* Active Warning Bulletins */}
      <div className="space-y-3 sm:space-y-4">
        <span className="text-[9px] sm:text-[10px] text-[#64748b] font-mono uppercase tracking-widest block">{t.activeWarnings}</span>
        <div className="space-y-3">
          {bulletin?.activeAlerts?.map((alert) => {
            const isRed = alert.severity === 'RED';
            return (
              <div key={alert.id} className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/[0.06] space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2 truncate">
                    <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold tracking-wider flex-shrink-0 ${isRed ? 'bg-[#ef4444]/20 border border-[#ef4444]/30 text-[#ef4444]' : 'bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-[#f59e0b]'}`}>
                      {alert.severity} ALERT
                    </span>
                    <h3 className="text-fluid-base font-semibold text-white truncate">{alert.title}</h3>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-[#64748b] flex-shrink-0">{new Date(alert.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-fluid-xs text-[#94a3b8] leading-relaxed">{alert.message}</p>
                <div className="text-fluid-xs text-[#f59e0b] font-medium flex items-center pt-1">
                  <AlertTriangle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span>{isRed ? t.actionRed : t.actionOrange}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Direct Tap-to-Call Emergency Helplines Grid */}
      <div className="space-y-3 sm:space-y-4">
        <span className="text-[9px] sm:text-[10px] text-[#64748b] font-mono uppercase tracking-widest block">{t.helplinesTitle}</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 text-fluid-xs">
          {HELPLINES.map((item, idx) => (
            <a key={idx} href={`tel:${item.number.split(' ')[0]}`} className="glass-panel p-3.5 min-h-[50px] rounded-xl border border-white/[0.06] hover:border-white/[0.15] active:bg-white/[0.05] flex items-center justify-between transition-all group">
              <div className="truncate pr-2">
                <span className="text-[9px] sm:text-[10px] text-[#64748b] font-mono block truncate">{item.type}</span>
                <span className="font-medium text-[#e2e8f0] group-hover:text-white truncate block">{item.region}</span>
              </div>
              <span className="px-2.5 py-1 bg-white/[0.08] text-white font-mono text-fluid-xs rounded flex-shrink-0">{item.number}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Safety Protocol Guidance */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/[0.06] space-y-3">
        <span className="text-[9px] sm:text-[10px] text-[#64748b] font-mono uppercase tracking-widest block">{t.safetyTipsTitle}</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-fluid-xs text-[#94a3b8] leading-relaxed">
          {safetyTips.map(({ title, desc, color }, idx) => (
            <div key={idx} className="p-3.5 bg-[#070b14]/50 rounded-xl border border-white/[0.04] space-y-1">
              <strong className={`${color} block text-fluid-xs font-bold`}>{title}</strong>
              <p className="text-fluid-xs">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

