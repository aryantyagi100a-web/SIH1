import React, { useState } from 'react';
import { 
  Newspaper, 
  HardHat, 
  CloudRain, 
  Shield, 
  ExternalLink, 
  Clock, 
  MapPin, 
  Filter, 
  BadgeCheck, 
  Sparkles, 
  Zap, 
  Copy, 
  Check, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const MOCK_NEWS = [
  {
    id: 0,
    category: 'weather',
    title: 'MDoNER & NESAC Release High-Resolution Landslide Early Warning Satellite Telemetry',
    summary: 'Ministry of Development of North Eastern Region (MDoNER) in coordination with NESAC (ISRO) has integrated real-time Sentinel-1 InSAR slope displacement feeds into the NER disaster grid.',
    aiKeyPoints: ['MDoNER & NESAC satellite feeds active across all 8 North Eastern states.', 'Millimeter-level slope deformation tracking enabled for critical highway lifelines.', 'Direct data link established with State Disaster Management Authorities (SDMAs).'],
    source: 'MDoNER & NESAC (ISRO)',
    state: 'All States',
    time: 'Just now',
    verified: true
  },
  {
    id: 1,
    category: 'road',
    title: 'NH-10 Gangtok-Siliguri Highway Cleared After 72-Hour Closure',
    summary: 'BRO 58 RCC team completed debris removal near Rangpo. Single-lane traffic restored for light vehicles. Heavy vehicles restricted until further notice.',
    aiKeyPoints: ['NH-10 opened for light passenger vehicles only; heavy trucks still prohibited.', 'Debris removed at Rangpo by BRO 58 RCC after 72 hours of work.', 'Drivers advised to maintain speed below 30 km/h due to wet mud strata.'],
    source: 'BRO (Border Roads Organisation)',
    state: 'Sikkim',
    time: '35 mins ago',
    verified: true
  },
  {
    id: 2,
    category: 'weather',
    title: 'IMD Issues Red Alert for East Khasi Hills — 200mm Rain Expected in 24h',
    summary: 'India Meteorological Department has upgraded Cherrapunji and Mawsynram to Red warning. Residents advised to avoid low-lying areas and river banks.',
    aiKeyPoints: ['Cherrapunji & Mawsynram upgraded to RED ALERT with >200mm rainfall forecast.', 'High risk of flash mudslides on southern canyon slopes.', 'Villagers near Wah Umngot river basin advised to move to higher ground.'],
    source: 'IMD (India Meteorological Department)',
    state: 'Meghalaya',
    time: '1 hour ago',
    verified: true
  },
  {
    id: 3,
    category: 'rescue',
    title: 'NDRF Deploys 3 Teams to Mangan District After Fresh Landslide',
    summary: '45 NDRF personnel with search dogs deployed. 12 families evacuated to temporary shelter at Mangan Town Hall. No casualties reported so far.',
    aiKeyPoints: ['3 NDRF specialized search-and-rescue teams deployed to Mangan, North Sikkim.', '12 vulnerable families safely shifted to Mangan Town Hall relief camp.', 'Zero casualties confirmed; emergency medical supplies pre-positioned.'],
    source: 'NDRF (National Disaster Response Force)',
    state: 'Sikkim',
    time: '2 hours ago',
    verified: true
  },
  {
    id: 4,
    category: 'road',
    title: 'Aizawl-Silchar Road (NH-306) Partially Blocked at Vairengte',
    summary: 'A 30-metre stretch has subsided. BRO deploying JCBs and expects clearance by tomorrow evening. Alternative via Champhai not recommended.',
    aiKeyPoints: ['30-meter road subsidence at Vairengte border section.', 'BRO JCBs actively repairing retaining wall; single lane opening expected tomorrow.', 'Essential food & fuel tankers given escorted priority clearance.'],
    source: 'BRO (Border Roads Organisation)',
    state: 'Mizoram',
    time: '3 hours ago',
    verified: true
  },
  {
    id: 5,
    category: 'weather',
    title: 'Monsoon Trough Active Over Sub-Himalayan West Bengal & Assam',
    summary: 'Heavy to very heavy rainfall likely over Kamrup, Nalbari, and Barpeta districts. Brahmaputra water level rising but below danger mark.',
    aiKeyPoints: ['Heavy monsoon surge across Kamrup, Nalbari, and Barpeta (Assam).', 'Brahmaputra river rising but currently 1.2m below critical threshold.', 'Guwahati SDRF teams on 24x7 standby for urban waterlogging.'],
    source: 'IMD (India Meteorological Department)',
    state: 'Assam',
    time: '4 hours ago',
    verified: true
  },
  {
    id: 6,
    category: 'rescue',
    title: 'IAF Helicopter Airlifts 8 Stranded Tourists from Zuluk, East Sikkim',
    summary: 'Indian Air Force Mi-17V5 helicopter completed two sorties. All tourists safe and shifted to Gangtok. Road to Zuluk remains closed.',
    aiKeyPoints: ['8 stranded tourists safely evacuated via IAF Mi-17V5 helicopter sorties.', 'All evacuated individuals reported healthy and accommodated in Gangtok.', 'Zuluk hill road remains shut due to continuous boulder roll.'],
    source: 'IAF & SDRF Sikkim',
    state: 'Sikkim',
    time: '5 hours ago',
    verified: true
  },
  {
    id: 7,
    category: 'road',
    title: 'Guwahati-Shillong Highway (NH-40) Fully Operational After Repairs',
    summary: 'PWD Meghalaya completed retaining wall repair near Nongpoh bypass. Both lanes open. Speed limit 30 km/h in repaired zone.',
    aiKeyPoints: ['NH-40 (Guwahati to Shillong) 100% restored with two-lane traffic open.', 'Retaining wall reconstruction completed at Nongpoh bypass.', 'Cautious driving advised with 30 km/h advisory speed limit.'],
    source: 'PWD Meghalaya & BRO',
    state: 'Meghalaya',
    time: '6 hours ago',
    verified: true
  },
  {
    id: 8,
    category: 'weather',
    title: 'Orange Alert Downgraded to Yellow for Arunachal Pradesh West Kameng',
    summary: 'Rainfall intensity decreasing. IMD downgrades from orange to yellow alert for Bomdila and Tawang. Normal operations can resume with caution.',
    aiKeyPoints: ['Rainfall intensity reduced in West Kameng, Bomdila, and Tawang.', 'Alert downgraded from Orange to Yellow Advisory.', 'Commercial movement permitted with daylight visibility.'],
    source: 'IMD (India Meteorological Department)',
    state: 'Arunachal Pradesh',
    time: '8 hours ago',
    verified: true
  }
];

const CATEGORIES = [
  { id: 'all', label: 'allNews', icon: Newspaper, fallback: 'All Updates' },
  { id: 'road', label: 'roadClearance', icon: HardHat, fallback: 'Road Clearance (BRO)' },
  { id: 'weather', label: 'weatherUpdates', icon: CloudRain, fallback: 'Weather Alerts (IMD)' },
  { id: 'rescue', label: 'rescueOperations', icon: Shield, fallback: 'Rescue & Relief' }
];

const NER_STATES = ['All States', 'Sikkim', 'Meghalaya', 'Assam', 'Arunachal Pradesh', 'Mizoram', 'Nagaland', 'Manipur', 'Tripura'];

const SAMPLES = [
  { title: 'BRO Teesta Emergency', text: 'Heavy downpours triggered slope instability along the Teesta River corridor. 400 cubic meters of boulder debris blocked carriageway. Clearance underway under continuous drone surveillance.' },
  { title: 'Meghalaya Flood Advisory', text: 'Meghalaya SDMA activated Incident Response Teams across East Khasi Hills. Multiple mud slips reported along Dawki-Shillong corridor. River levels surged by 2.4m.' }
];

const CAT_CFG = {
  road: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', tag: 'ROAD / BRO' },
  weather: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', tag: 'WEATHER / IMD' },
  rescue: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', tag: 'RESCUE / NDRF' }
};

export default function NewsInfoHub() {
  const { t } = useLanguage();
  const [activeCat, setActiveCat] = useState('all');
  const [stateFilter, setStateFilter] = useState('All States');
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTool, setShowTool] = useState(false);
  const [customText, setCustomText] = useState('');
  const [summaryResult, setSummaryResult] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const filtered = MOCK_NEWS.filter(i => (activeCat === 'all' || i.category === activeCat) && (stateFilter === 'All States' || i.state === stateFilter));

  const handleRunSummary = (text) => {
    const val = text || customText;
    if (!val.trim()) return;
    setIsSummarizing(true);
    setSummaryResult(null);
    setTimeout(() => {
      setSummaryResult({
        bullets: ['Key Incident: Geological slope failure with debris blockage detected.', 'Impact: Immediate transportation route restricted; emergency diversions active.', 'Official Action: BRO & SDRF executing clearance with 24x7 drone surveillance.'],
        actionAdvice: 'Avoid travel through affected valley corridors until official clearance is broadcasted.',
        readTime: '15-sec read'
      });
      setIsSummarizing(false);
    }, 500);
  };

  const handleCopy = () => {
    if (!summaryResult) return;
    navigator.clipboard.writeText(summaryResult.bullets.join('\n') + '\n\n' + summaryResult.actionAdvice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    /* 
      News & Telemetry Hub Container:
      Renders live BRO, IMD, and SDRF verified bulletins with AI 3-bullet instant summaries.
    */
    <div className="space-y-5 sm:space-y-6 max-w-6xl mx-auto pb-8 sm:pb-12 animate-fade-in py-1">
      <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 sm:p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl flex-shrink-0">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-fluid-xl font-bold tracking-tight text-white">{t.newsTitle || 'Official News & Road Bulletins'}</h1>
              <span className="px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold bg-neutral-900 text-neutral-300 border border-neutral-700 hidden sm:inline">AI ON</span>
            </div>
            <p className="text-fluid-xs text-neutral-400 mt-0.5">{t.newsSubtitle || 'Verified updates from BRO, IMD, NDRF, and State Disaster Authorities.'}</p>
          </div>
        </div>

        {/* AI Custom Summarizer Toggle Button (44px min touch area) */}
        <button onClick={() => setShowTool(!showTool)} className={`w-full sm:w-auto px-4 py-3 min-h-[44px] rounded-xl text-fluid-xs font-bold transition-all flex items-center justify-center space-x-2 border shadow-lg active:scale-98 ${showTool ? 'bg-white text-black border-white' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-700'}`}>
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{showTool ? 'Close Custom Summarizer' : 'AI News Summarizer Tool'}</span>
        </button>
      </div>

      {/* AI Regional Situation Digest Card */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-950/90 shadow-2xl space-y-3.5 sm:space-y-4">
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-neutral-800/80">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-fluid-base font-bold text-white tracking-tight">AI Regional Situation Digest</h2>
          </div>
          <button onClick={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 600); }} disabled={isRefreshing} className="flex items-center space-x-1.5 text-fluid-xs text-neutral-400 hover:text-white transition-colors bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 active:scale-95 min-h-[36px]">
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isRefreshing ? 'Synthesizing...' : 'Refresh'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5 text-fluid-xs">
          {[
            { icon: HardHat, color: 'text-amber-400', title: 'HIGHWAYS & PASSABILITY', desc: 'NH-10 (Sikkim) single-lane open. NH-306 (Mizoram) 30m subsidence clearing tomorrow. NH-40 fully open.' },
            { icon: CloudRain, color: 'text-blue-400', title: 'IMD PRECIPITATION SURGE', desc: 'Red Alert in East Khasi Hills (200mm/24h). Heavy rain in Kamrup & Barpeta. Arunachal downgraded to Yellow.' },
            { icon: Shield, color: 'text-red-400', title: 'SDRF & NDRF MOBILIZATION', desc: '3 NDRF teams in Mangan Town Hall (12 families sheltered). 8 tourists airlifted from Zuluk by IAF.' }
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-black/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-800/80 space-y-1">
              <div className={`flex items-center space-x-1.5 ${color} font-bold font-mono text-fluid-xs`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{title}</span>
              </div>
              <p className="text-neutral-300 text-fluid-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {showTool && (
        <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-950 space-y-3.5 sm:space-y-4 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5 sm:pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <h3 className="text-fluid-base font-bold text-white">Custom Article Summarizer</h3>
            </div>
            <span className="text-[9px] sm:text-[10px] text-neutral-500 font-mono">NLP Engine</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-fluid-xs">
            <span className="text-neutral-500 font-mono">Samples:</span>
            {SAMPLES.map((s, idx) => (
              <button key={idx} onClick={() => { setCustomText(s.text); handleRunSummary(s.text); }} className="px-2.5 py-1.5 min-h-[36px] bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-lg transition-colors truncate max-w-[140px] sm:max-w-xs flex items-center">
                {s.title}
              </button>
            ))}
          </div>

          <textarea rows={3} placeholder="Paste any news report or BRO clearance notice..." value={customText} onChange={(e) => setCustomText(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl p-3 text-fluid-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 font-mono min-h-[80px]" />
          <div className="flex justify-end">
            <button onClick={() => handleRunSummary(customText)} disabled={isSummarizing || !customText.trim()} className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-white text-black hover:bg-neutral-200 disabled:opacity-50 text-fluid-xs font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-98">
              <Sparkles className="w-4 h-4 text-black" />
              <span>{isSummarizing ? 'Analyzing...' : 'Generate AI Summary'}</span>
            </button>
          </div>

          {summaryResult && (
            <div className="bg-black p-4 rounded-xl sm:rounded-2xl border border-neutral-800 space-y-2.5 sm:space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-fluid-xs font-bold text-white flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" /> AI Key Takeaways</span>
                <button onClick={handleCopy} className="flex items-center space-x-1.5 text-fluid-xs text-neutral-400 hover:text-white p-1 touch-target">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <ul className="space-y-1.5 text-fluid-xs text-neutral-300">
                {summaryResult.bullets.map((b, i) => <li key={i} className="flex items-start space-x-2"><span className="text-amber-400 font-bold">•</span><span>{b}</span></li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Category Filter Pills (Horizontal Touch-Scrollable with min 44px height) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCat === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCat(cat.id)} className={`flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-fluid-xs font-bold transition-all border whitespace-nowrap flex-shrink-0 active:scale-95 ${isActive ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.15)]' : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-white'}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-neutral-500'}`} />
                <span>{t[cat.label] || cat.fallback}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-4 h-4 text-neutral-400" />
          <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="bg-neutral-900 border border-neutral-800 text-fluid-xs text-white rounded-xl px-3 py-2 min-h-[44px] focus:outline-none">
            {NER_STATES.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
          </select>
        </div>
      </div>

      {/* News Article List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const cfg = CAT_CFG[item.category] || CAT_CFG.road;
          const isExp = expandedId === item.id;
          return (
            <article key={item.id} className="bg-black border border-neutral-800 rounded-2xl p-4 sm:p-5 hover:border-neutral-700 transition-all space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{cfg.tag}</span>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.state}</span>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                {item.verified && <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 flex items-center gap-0.5"><BadgeCheck className="w-3 h-3" /> Verified</span>}
              </div>

              <h3 className="text-fluid-base font-bold text-white leading-snug">{item.title}</h3>
              <p className="text-fluid-xs text-neutral-400 leading-relaxed">{item.summary}</p>

              {isExp && (
                <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2 text-fluid-xs animate-fade-in">
                  <div className="flex items-center space-x-1.5 text-amber-400 font-bold font-mono text-[10px] uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Key Takeaways:</span>
                  </div>
                  <ul className="space-y-1.5 text-neutral-300 text-fluid-xs">
                    {item.aiKeyPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5"><span className="text-amber-400 font-bold">•</span><span>{pt}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-neutral-900 text-fluid-xs">
                <span className="text-[9px] sm:text-[10px] text-neutral-500 font-mono truncate max-w-[150px] sm:max-w-none">{item.source}</span>
                <button onClick={() => setExpandedId(isExp ? null : item.id)} className="px-3 py-1.5 min-h-[40px] text-fluid-xs text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 active:scale-95">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isExp ? 'Hide Bullets' : '⚡ 3-Bullet Summary'}</span>
                  {isExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="border-t border-neutral-800 pt-4 mt-6">
        <p className="text-[9px] sm:text-[10px] text-neutral-500 font-mono text-center">
          Sources: Ministry of Development of North Eastern Region (MDoNER) • North Eastern Space Applications Centre (NESAC / ISRO) • BRO • IMD • NDRF • SDRF
        </p>
      </div>
    </div>
  );
}


