import React, { useState } from 'react';
import { 
  MapPin, 
  FileText, 
  BarChart2, 
  Cpu, 
  Globe, 
  ChevronRight, 
  ChevronLeft, 
  Languages, 
  Heart, 
  Newspaper, 
  ShieldAlert,
  Menu,
  X,
  Radio,
  SlidersHorizontal
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SidebarNav({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
  const { lang, setLang, t, languages } = useLanguage();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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

  // Primary bottom navigation items for fast mobile thumb access
  const mobileQuickTabs = [
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'alerts', label: 'Alerts', icon: ShieldAlert, badge: 'AUTH' },
    { id: 'field-reports', label: 'Intel', icon: FileText },
    { id: 'ml-sandbox', label: 'AI Sim', icon: Cpu },
    { id: 'more', label: 'Menu', icon: Menu, isMore: true }
  ];

  const currentNav = navItems.find(i => i.id === activeTab) || navItems[0];

  return (
    <>
      {/* 
        MOBILE TOP HEADER BAR (Only visible on screens narrower than md / 768px)
        Uses fixed positioning so it stays attached to the top of the viewport.
      */}
      <header className="md:hidden fixed top-7 left-0 right-0 h-12 bg-black/95 backdrop-blur-xl border-b border-neutral-800 z-30 px-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_10px_#ef4444] flex-shrink-0" />
          <div className="truncate">
            <span className="font-bold text-fluid-xs tracking-tight text-white block truncate leading-none">NER Landslide</span>
            <span className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase mt-0.5 block truncate">
              {currentNav.label}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mobile Language Switcher with comfortable touch area */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 min-h-[38px]">
            <Languages className="w-3.5 h-3.5 text-neutral-400 mr-1.5 flex-shrink-0" />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)} 
              className="bg-transparent text-white text-fluid-xs font-bold focus:outline-none cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-black text-white">{l.label.slice(0, 3)}</option>
              ))}
            </select>
          </div>

          {/* Menu button with minimum 44px touch hit area */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white touch-target flex items-center justify-center"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 
        MOBILE BOTTOM NAVIGATION DOCK (Fixed at bottom on phones < 768px)
        Allows 1-thumb fast access to critical operational views (Map, Alerts, Field Intel, AI Sim).
        pb-safe ensures it respects iOS Home Bar / safe area insets.
      */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-2xl border-t border-neutral-800 px-2 py-1 pb-safe flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        {mobileQuickTabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          if (item.isMore) {
            return (
              <button
                key={item.id}
                onClick={() => setMobileDrawerOpen(true)}
                className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 rounded-xl transition-all text-neutral-400 hover:text-white active:scale-95"
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 rounded-xl transition-all relative active:scale-95 ${
                isActive 
                  ? 'text-white font-bold' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className={`relative p-1 rounded-lg ${isActive ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.3)]' : ''}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                {item.badge && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'text-white font-bold' : 'text-neutral-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 
        MOBILE SLIDE-OVER DRAWER FOR COMPLETE MODULE ACCESS
        Renders an overlay drawer with min 44px high tap buttons for all tabs.
      */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Semi-transparent dark backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileDrawerOpen(false)} 
          />
          
          <div className="relative ml-auto w-4/5 max-w-xs bg-black border-l border-neutral-800 h-full p-5 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_10px_#ef4444]" />
                  <span className="font-bold text-fluid-sm text-white">Command Modules</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white touch-target flex items-center justify-center"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-3">
                <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider block mb-2 px-1">
                  MDoNER • NESAC Aligned
                </span>
                <nav className="space-y-1.5">
                  {navItems.map(({ id, label, icon: Icon, badge }) => {
                    const active = activeTab === id;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setActiveTab(id);
                          setMobileDrawerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 min-h-[44px] rounded-xl transition-all text-fluid-xs ${
                          active 
                            ? 'bg-white text-black font-bold shadow-md' 
                            : 'text-neutral-300 hover:bg-neutral-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-black' : 'text-neutral-400'}`} />
                          <span className="truncate">{label}</span>
                        </div>
                        {badge && (
                          <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                            active ? 'bg-red-600 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 space-y-3 pb-safe">
              <div className="flex items-center justify-between text-fluid-xs text-neutral-400 px-1">
                <span className="flex items-center space-x-1.5">
                  <Languages className="w-4 h-4" />
                  <span>Language:</span>
                </span>
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value)} 
                  className="bg-neutral-900 text-white text-fluid-xs font-bold px-2.5 py-1.5 min-h-[40px] rounded-lg border border-neutral-800 focus:outline-none"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code} className="bg-black text-white">{l.label}</option>
                  ))}
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-500 text-center">
                MDoNER • NESAC • IMD Grid Data
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR NAVIGATION (Hidden on screens smaller than md / 768px) */}
      <aside className={`hidden md:flex fixed top-7 bottom-0 left-0 z-40 bg-black/95 backdrop-blur-xl border-r border-neutral-800 transition-all duration-300 flex-col justify-between ${isCollapsed ? 'w-16' : 'w-56'}`}>
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-800">
            {!isCollapsed ? (
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_12px_#ef4444]" />
                <div>
                  <span className="font-bold text-fluid-sm tracking-tight text-white block leading-none">NER Landslide</span>
                  <span className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase mt-0.5 block">MDoNER • NESAC Aligned</span>
                </div>
              </div>
            ) : (
              <div className="mx-auto w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_12px_#ef4444]" />
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors touch-target"
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
                    isCollapsed ? 'justify-center p-3 min-h-[44px]' : 'px-3 py-2.5 min-h-[44px] space-x-3'
                  } ${active ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.15)]' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-black' : 'text-neutral-400'}`} />
                  {!isCollapsed && <span className="text-fluid-xs truncate tracking-normal">{label}</span>}
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
            <div className="flex items-center justify-between text-fluid-xs text-neutral-400 px-1">
              <span className="flex items-center space-x-1.5">
                <Languages className="w-3.5 h-3.5 text-neutral-400" />
                <span>Lang:</span>
              </span>
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-white text-fluid-xs font-bold focus:outline-none cursor-pointer">
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-black text-white">{l.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <button onClick={() => setIsCollapsed(false)} className="w-full flex justify-center py-2 text-neutral-400 hover:text-white touch-target" title="Switch language">
              <Languages className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

export function TopAlertStrip() {
  return (
    <div className="h-7 bg-black border-b border-neutral-800 px-2.5 sm:px-4 flex items-center justify-between select-none fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center space-x-2 sm:space-x-2.5 overflow-hidden">
        <span className="flex h-1.5 w-1.5 relative flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ef4444]" />
        </span>
        <span className="font-mono text-[9px] sm:text-[10px] text-[#ef4444] uppercase tracking-wider font-bold flex-shrink-0">LIVE ADVISORY</span>
        <span className="text-neutral-600 flex-shrink-0">•</span>
        <span className="text-neutral-300 text-fluid-xs font-normal truncate">
          Gangtok & Cherrapunji — Soil pore pressure critical. Standby.
        </span>
      </div>
      <div className="hidden lg:flex items-center space-x-3 text-[10px] text-neutral-400 font-mono flex-shrink-0">
        <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />8 NER STATES</span>
        <span>•</span>
        <span>MDoNER • NESAC • IMD</span>
        <span>•</span>
        <span className="text-white font-semibold">AI ACCURACY: 94.2%</span>
      </div>
    </div>
  );
}


