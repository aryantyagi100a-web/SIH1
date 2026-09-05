import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity } from 'lucide-react';
import { fetchAnalytics } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const TOOLTIP_STYLE = { backgroundColor: '#070b14', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', color: '#e2e8f0' };

export default function AnalyticsDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);

  useEffect(() => { fetchAnalytics().then(setData); }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 sm:h-96">
        <div className="text-center space-y-2">
          <Activity className="w-6 h-6 text-white animate-spin mx-auto opacity-50" />
          <p className="text-xs text-[#64748b] font-mono">Syncing hydrological telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in py-1 sm:py-2">
      <div className="pb-4 border-b border-white/[0.06]">
        <span className="text-[9px] sm:text-[10px] text-[#64748b] font-mono uppercase tracking-widest block">HYDROLOGICAL ANALYTICS & TRENDS</span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#e2e8f0] mt-1">{t.analyticsTitle}</h1>
        <p className="text-[11px] sm:text-xs text-[#64748b] mt-1">{t.analyticsSubtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 py-1">
        {[
          { label: 'STATIONS ONLINE', val: data.totalSensors, sub: 'Across 8 NER States', col: 'text-[#e2e8f0]' },
          { label: 'ACTIVE THREATS', val: data.activeAlerts, sub: 'SMS Broadcasts Armed', col: 'text-[#ef4444]' },
          { label: 'GROUND INTEL', val: data.verifiedFieldReports, sub: 'Verified by SDRF', col: 'text-emerald-400' },
          { label: 'AI INFERENCE', val: '94.2%', sub: 'Random Forest Metric', col: 'text-[#e2e8f0]' }
        ].map((s) => (
          <div key={s.label} className="bg-neutral-950/60 p-3 sm:p-4 rounded-xl border border-neutral-800/80">
            <span className="text-[9px] sm:text-[10px] font-mono text-[#64748b] uppercase tracking-wider block truncate">{s.label}</span>
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 block ${s.col}`}>{s.val}</span>
            <span className="text-[10px] sm:text-[11px] text-[#94a3b8] font-mono block truncate">{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/[0.06] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs sm:text-sm font-semibold text-[#e2e8f0] tracking-tight">{t.chartRainVsLimit}</span>
            <span className="text-[10px] sm:text-[11px] font-mono text-[#64748b]">IMD LIVE RADAR FEEDS</span>
          </div>
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.rainfallVsThreshold} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '12px' }} />
                <Bar dataKey="currentRainfall" fill="#e2e8f0" name={t.currentRainLabel} radius={[3, 3, 0, 0]} />
                <Bar dataKey="criticalThreshold" fill="#ef4444" name={t.safeLimitLabel} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/[0.06] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs sm:text-sm font-semibold text-[#e2e8f0] tracking-tight">{t.hourlyRainCurve}</span>
            <span className="text-[10px] sm:text-[11px] font-mono text-[#64748b]">24-HOUR RADAR CURVE</span>
          </div>
          <div className="h-60 sm:h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.hourlyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="cherrapunji" stroke="#e2e8f0" strokeWidth={2} name="Cherrapunji" dot={false} />
                <Line type="monotone" dataKey="gangtok" stroke="#ef4444" strokeWidth={2} name="Gangtok" dot={false} />
                <Line type="monotone" dataKey="itanagar" stroke="#f59e0b" strokeWidth={1.5} name="Itanagar" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

