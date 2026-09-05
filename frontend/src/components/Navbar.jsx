import React from 'react';
import { MapPin, FileText, BarChart2, Cpu, Globe, ChevronRight, ChevronLeft, Languages, Heart, Newspaper, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SidebarNav({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
  const { lang, setLang, t, languages } = useLanguage();

  const navItems = [
    { id: 'map', label: t.tabMap || 'Risk Map', icon: MapPin },
    { id: 'alerts', label: t.tabAlerts || 'Authority Dispatch (SMS)', icon: ShieldAlert, badge: 'AUTH' },
    { id: 'field-reports', label: t.tabFieldReports || 'Field Intel', icon: FileText },
    { id: 'analytics', label: t.tabAnalytics || 'Telemetry', icon: BarChart2 },
    { id: 'ml-sandbox', label: t.tabMl || 'AI Simulator', icon: Cpu },
    { id: 'public', label: t.tabPublic || 'Public Portal', icon: Globe },
    { id: 'relief', label: t.tabRelief || 'Relief Fund & Aid', icon: Heart },
    { id: 'news', label: t.tabNews || 'News & Bulletins', icon: Newspaper }
  ];

  return (
    <aside className={`fixed top-7 bottom-0 left-0 z-40 bg-black/95 backdrop-blur-xl border-r border-neutral-800 transition-all duration-300 flex flex-col justify-between ${isCollapsed ? 'w-16' : 'w-56'}`}>
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-800">
          {!isCollapsed ? (
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_12px_#ef4444]" />
              <div>
                <span className="font-bold text-sm tracking-tight text-white block leading-none">NER Landslide</span>
                <span className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase mt-0.5 block">MDoNER • NESAC Aligned</span>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_12px_#ef4444]" />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="p-2 space-y-1 mt-2">
          {navItems.map(({ id, label, icon: Icon, badge }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center rounded-xl transition-all duration-150 relative ${
                  isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5 space-x-3'
                } ${active ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.15)]' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
                title={isCollapsed ? label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-black' : 'text-neutral-400'}`} />
                {!isCollapsed && <span className="text-xs truncate tracking-normal">{label}</span>}
                {badge && !isCollapsed && (
                  <span className={`ml-auto px-1.5 py-0.2 text-[10px] font-mono font-bold rounded ${active ? 'bg-red-600 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {badge}
                  </span>
                )}
                {badge && isCollapsed && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#ef4444]" />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-neutral-800">
        {!isCollapsed ? (
          <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
            <span className="flex items-center space-x-1.5">
              <Languages className="w-3.5 h-3.5 text-neutral-400" />
              <span>Lang:</span>
            </span>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer">
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-black text-white">{l.label}</option>
              ))}
            </select>
          </div>
        ) : (
          <button onClick={() => setIsCollapsed(false)} className="w-full flex justify-center py-2 text-neutral-400 hover:text-white" title="Switch language">
            <Languages className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}

export function TopAlertStrip() {
  return (
    <div className="h-7 bg-black border-b border-neutral-800 px-4 flex items-center justify-between text-[11px] select-none fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center space-x-2.5 overflow-hidden">
        <span className="flex h-1.5 w-1.5 relative flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ef4444]" />
        </span>
        <span className="font-mono text-[10px] text-[#ef4444] uppercase tracking-wider font-bold">LIVE ADVISORY</span>
        <span className="text-neutral-600">•</span>
        <span className="text-neutral-300 text-xs font-normal truncate">Gangtok (Sikkim) & Cherrapunji (Meghalaya) — Critical soil pore pressure detected. Evacuation standby.</span>
      </div>
      <div className="hidden md:flex items-center space-x-3 text-[10px] text-neutral-400 font-mono">
        <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />8 NER STATES</span>
        <span>•</span>
        <span>MDoNER • NESAC • IMD DATA</span>
        <span>•</span>
        <span className="text-white font-semibold">AI ACCURACY: 94.2%</span>
      </div>
    </div>
  );
}
