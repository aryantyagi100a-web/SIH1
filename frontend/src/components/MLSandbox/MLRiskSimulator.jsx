import React, { useState } from 'react';
import { Sparkles, Mountain, CloudRain, Droplets, Layers, Trees, Check } from 'lucide-react';
import { runMLPrediction } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const PRESETS = {
  cloudburst: { slope_deg: 44.0, rainfall_24h_mm: 210.0, rainfall_72h_mm: 380.0, soil_moisture: 0.94, elevation_m: 1650, lithology_code: 5, ndvi: 0.38 },
  moderate: { slope_deg: 32.0, rainfall_24h_mm: 75.0, rainfall_72h_mm: 140.0, soil_moisture: 0.62, elevation_m: 1100, lithology_code: 3, ndvi: 0.60 },
  normal: { slope_deg: 20.0, rainfall_24h_mm: 25.0, rainfall_72h_mm: 45.0, soil_moisture: 0.35, elevation_m: 350, lithology_code: 2, ndvi: 0.75 }
};

const PRESET_BTNS = [
  { key: 'cloudburst', label: '⛈️ Cloudburst', cls: 'text-[#ef4444] border-[#ef4444]/30' },
  { key: 'moderate', label: '🌧️ Monsoon', cls: 'text-[#f59e0b] border-[#f59e0b]/30' },
  { key: 'normal', label: '☀️ Clear', cls: 'text-emerald-400 border-emerald-500/30' }
];

export default function MLRiskSimulator() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(PRESETS.moderate);
  const [prediction, setPrediction] = useState({
    risk_level: 2,
    risk_code: 'HIGH',
    risk_label: 'HIGH Warning',
    risk_score_percentage: 74.2,
    recommended_action: 'High rainfall is saturating soil pore pressure. Issue SMS advisory to hill-slope residents.',
    factors_summary: [
      'Heavy 24h Rain: 145 mm (High pore pressure)',
      'Steep Slope Gradient: 38.5° (High gravitational pull)',
      'Soil Wetness: 82% saturated',
      'Soft fractured rock layer'
    ]
  });

  const handlePredict = async () => {
    setLoading(true);
    const res = await runMLPrediction(params);
    if (res?.prediction) setPrediction(res.prediction);
    setLoading(false);
  };

  const sliders = [
    { key: 'rainfall_24h_mm', label: t.sliderRain, Icon: CloudRain, min: 0, max: 350, step: 5, fmt: (v) => `${v} mm`, update: (v) => ({ rainfall_24h_mm: v, rainfall_72h_mm: v * 1.8 }) },
    { key: 'slope_deg', label: t.sliderSlope, Icon: Mountain, min: 5, max: 58, step: 0.5, fmt: (v) => `${v}°` },
    { key: 'soil_moisture', label: t.sliderWetness, Icon: Droplets, min: 0.1, max: 0.99, step: 0.02, fmt: (v) => `${Math.round(v * 100)}%` },
    { key: 'lithology_code', label: t.sliderRock, Icon: Layers, min: 1, max: 5, step: 1, fmt: (v) => `Level ${v}`, parse: parseInt },
    { key: 'ndvi', label: t.sliderTrees, Icon: Trees, min: 0.15, max: 0.85, step: 0.05, fmt: (v) => v }
  ];

  const riskBadgeCls = prediction.risk_level === 3 
    ? 'bg-[#ef4444]/20 border-[#ef4444]/30 text-[#ef4444]' 
    : prediction.risk_level === 2 
      ? 'bg-[#f59e0b]/20 border-[#f59e0b]/30 text-[#f59e0b]' 
      : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';

  return (
    /* 
      AI Simulation Sandbox:
      Responsive 12-column layout (stacks to 1 col on mobile < 1024px, 7/5 split on desktop).
    */
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in py-1 sm:py-2">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <span className="text-[9px] sm:text-[10px] text-[#64748b] font-mono uppercase tracking-widest block">AI LANDSLIDE SUSCEPTIBILITY ENGINE</span>
          <h1 className="text-fluid-xl font-bold tracking-tight text-[#e2e8f0] mt-1">{t.aiSandboxTitle}</h1>
          <p className="text-fluid-xs text-[#64748b] mt-1">{t.aiSandboxSubtitle}</p>
        </div>

        {/* Preset Condition Buttons with minimum 44px touch height */}
        <div className="flex items-center gap-2 flex-wrap text-fluid-xs">
          {PRESET_BTNS.map(({ key, label, cls }) => (
            <button
              key={key}
              onClick={() => setParams(PRESETS[key])}
              className={`px-3 py-2 min-h-[44px] bg-white/[0.04] hover:bg-white/[0.08] border rounded-xl font-mono text-fluid-xs transition-all flex items-center justify-center ${cls}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Interactive Geotechnical Sliders */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5 bg-black/40 p-4 sm:p-6 rounded-2xl border border-white/[0.06]">
          {sliders.map(({ key, label, Icon, min, max, step, fmt, update, parse }) => {
            const parser = parse || parseFloat;
            return (
              <div key={key} className="space-y-1.5 py-1">
                <div className="flex justify-between text-fluid-xs">
                  <span className="text-[#94a3b8] flex items-center font-medium">
                    <Icon className="w-4 h-4 mr-1.5 text-[#64748b] flex-shrink-0" />
                    <span>{label}</span>
                  </span>
                  <span className="font-mono text-white font-semibold">{fmt(params[key])}</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={params[key]}
                  onChange={(e) => {
                    const val = parser(e.target.value);
                    setParams(prev => ({ ...prev, ...(update ? update(val) : { [key]: val }) }));
                  }}
                  className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white touch-target"
                />
              </div>
            );
          })}

          {/* Trigger Inference Button (min-h-[44px] for finger tap compliance) */}
          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full py-3 min-h-[44px] bg-white text-black font-bold text-fluid-xs rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-neutral-200 active:scale-98 flex items-center justify-center space-x-2 transition-all mt-3"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>{loading ? 'Evaluating Random Forest Matrix...' : t.runAiButton}</span>
          </button>
        </div>

        {/* Right Column: AI Risk Output Panel */}
        <div className="lg:col-span-5 glass-panel p-4 sm:p-6 rounded-2xl border border-white/[0.06] flex flex-col justify-between space-y-5">
          <div>
            <span className="text-[9px] sm:text-[10px] text-[#64748b] font-mono uppercase tracking-widest block">PREDICTED HAZARD PROBABILITY</span>
            <div className="flex items-baseline space-x-3 mt-1 sm:mt-2">
              <span className="text-fluid-2xl font-extrabold tracking-tight text-[#e2e8f0]">{prediction.risk_score_percentage}%</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider border ${riskBadgeCls}`}>{prediction.risk_code}</span>
            </div>

            <div className="mt-4 sm:mt-6 space-y-2">
              <span className="text-[9px] sm:text-[10px] font-mono text-[#64748b] uppercase tracking-wider block">{t.whyDanger}</span>
              <div className="space-y-2">
                {prediction.factors_summary?.map((factor, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-fluid-xs text-[#cbd5e1]">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-[#070b14]/80 rounded-xl border border-white/[0.06] text-fluid-xs text-[#94a3b8] leading-relaxed">
            <strong className="text-white block text-[9px] sm:text-[10px] uppercase font-mono tracking-wider mb-0.5">{t.whatToDo}</strong>
            {prediction.recommended_action}
          </div>
        </div>
      </div>
    </div>
  );
}

