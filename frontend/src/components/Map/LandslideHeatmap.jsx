import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Send, ChevronUp, ChevronDown, X, Info, RefreshCw, FlaskConical } from 'lucide-react';
import { fetchRiskHeatmap, triggerSMSBroadcast } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { NER_BOUNDS } from '../../data/nerStateBoundaries';

const STATE_COORDS = {
  All: { center: [25.8, 92.2], zoom: 7 },
  Sikkim: { center: [27.5, 88.5], zoom: 9 },
  Meghalaya: { center: [25.5, 91.6], zoom: 9 },
  Assam: { center: [26.2, 92.8], zoom: 7.5 },
  'Arunachal Pradesh': { center: [27.6, 93.8], zoom: 8 },
  Nagaland: { center: [25.8, 94.2], zoom: 8.5 },
  Manipur: { center: [24.8, 93.9], zoom: 8.5 },
  Mizoram: { center: [23.5, 92.8], zoom: 8.5 },
  Tripura: { center: [23.8, 91.5], zoom: 9 }
};

// Turn a UTC timestamp (like "2026-09-05T15:30:00.000Z") into a simple "9:05 PM" clock string.
const formatClock = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

const createGlowPinIcon = (level) => {
  const isCritical = level === 3;
  const isWarning = level === 2;
  const color = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

  return L.divIcon({
    className: 'custom-minimal-marker',
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      ${isCritical ? '<div style="position:absolute;width:34px;height:34px;border-radius:50%;background:rgba(239,68,68,0.4);animation:radar-pulse 2.2s infinite ease-out;"></div>' : ''}
      ${isWarning ? '<div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(245,158,11,0.3);animation:radar-pulse 3s infinite ease-out;"></div>' : ''}
      <div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.35),0 0 12px ${color};z-index:10;"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

function MapViewSync({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.25 });
  }, [center, zoom, map]);

  useEffect(() => {
    const bounds = L.latLngBounds(
      L.latLng(NER_BOUNDS.southWest[0], NER_BOUNDS.southWest[1]),
      L.latLng(NER_BOUNDS.northEast[0], NER_BOUNDS.northEast[1])
    );
    map.setMaxBounds(bounds.pad(0.12));
    map.setMinZoom(6);
  }, [map]);

  return null;
}

export default function LandslideHeatmap() {
  const { t } = useLanguage();
  const [stations, setStations] = useState([]);
  const [selectedState, setSelectedState] = useState('All');
  // dataMode: 'live' uses REAL Open-Meteo rainfall • 'simulate' is the demo surge
  const [dataMode, setDataMode] = useState('live');
  const [rainfallMult, setRainfallMult] = useState(1.0);
  const [dataSource, setDataSource] = useState('');
  const [fetchedAt, setFetchedAt] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0); // +1 each time the user taps Refresh
  const [mapCenter, setMapCenter] = useState([25.8, 92.2]);
  const [mapZoom, setMapZoom] = useState(7);
  const [selectedStation, setSelectedStation] = useState(null);
  const [smsStatus, setSmsStatus] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Fetch the risk map again whenever the mode, the surge slider, or Refresh changes.
  useEffect(() => {
    let cancelled = false;
    fetchRiskHeatmap(dataMode, rainfallMult).then((data) => {
      if (cancelled) return;
      const list = data.stations || [];
      setStations(list);
      setDataSource(data.data_source || '');
      setFetchedAt(data.fetched_at || null);
      // Keep the open station panel showing fresh numbers after a refresh.
      setSelectedStation((prev) => {
        if (!prev) return list.length ? list.reduce((max, s) => s.risk_score_percentage > max.risk_score_percentage ? s : max, list[0]) : null;
        return list.find((s) => s.station_id === prev.station_id) || prev;
      });
    });
    return () => { cancelled = true; };
  }, [dataMode, rainfallMult, refreshCount]);

  // In live mode, re-check the real forecast every 5 minutes automatically.
  useEffect(() => {
    if (dataMode !== 'live') return;
    const timer = setInterval(() => setRefreshCount((n) => n + 1), 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [dataMode]);

  // True when the backend could not reach Open-Meteo and used its baseline instead.
  const isFallback = dataSource === 'SEED_FALLBACK' || dataSource === 'PARTIAL_OPEN_METEO';

  const handleStateChange = (name) => {
    setSelectedState(name);
    const target = STATE_COORDS[name] || STATE_COORDS.All;
    setMapCenter(target.center);
    setMapZoom(target.zoom);
  };

  const handleSelectStation = (st) => {
    setSelectedStation(st);
    setMapCenter([st.lat, st.lng]);
    setMapZoom(11);
    // On mobile, automatically show the detail sheet when a station marker is tapped
    if (window.innerWidth < 1024) {
      setMobileDrawerOpen(true);
    }
  };

  const handleQuickSMS = async (station) => {
    setSmsStatus('SENDING');
    try {
      await triggerSMSBroadcast(station.station_id, '+91 98765 43210');
      setSmsStatus('SENT');
      setTimeout(() => setSmsStatus(null), 3500);
    } catch {
      setSmsStatus('ERROR');
    }
  };

  const counts = {
    crit: stations.filter(s => s.risk_level === 3).length,
    warn: stations.filter(s => s.risk_level === 2).length,
    safe: stations.filter(s => s.risk_level <= 1).length
  };

  const filtered = selectedState === 'All' ? stations : stations.filter(s => s.state === selectedState);

  return (
    /* 
      Map Viewport Container:
      - 100dvh (dynamic viewport height) ensures full height on mobile browsers without content cut-off.
      - Relative positioning holds absolute control overlays (state filter, station sheet, slider).
    */
    <div className="relative h-[calc(100dvh-7.5rem)] md:h-[calc(100vh-5.5rem)] flex flex-col justify-between select-none bg-black">
      {/* Top Filter Bar */}
      <div className="z-20 flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2 px-0.5">
        {/* State Pills - Smooth Horizontal Scroll with 44px touch target heights */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 max-w-full">
          {Object.keys(STATE_COORDS).map((st) => (
            <button
              key={st}
              onClick={() => handleStateChange(st)}
              className={`px-3.5 py-2 min-h-[44px] rounded-full text-fluid-xs transition-all whitespace-nowrap flex-shrink-0 flex items-center justify-center ${
                selectedState === st
                  ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Live Counters */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-fluid-xs font-mono text-neutral-400 overflow-x-auto no-scrollbar flex-shrink-0">
          {[
            { color: '#ef4444', count: counts.crit, label: 'CRITICAL' },
            { color: '#f59e0b', count: counts.warn, label: 'WARNING' },
            { color: '#10b981', count: counts.safe, label: 'STABLE' }
          ].map(({ color, count, label }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <span className="opacity-40">&bull;</span>}
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                <span className="text-white font-bold">{count}</span>
                <span>{label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-800 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
        <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom style={{ height: '100%', width: '100%', background: '#f8fafc' }}>
          <MapViewSync center={mapCenter} zoom={mapZoom} />
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} className="map-tiles-clean" />

          {filtered.map((st) => {
            const isCrit = st.risk_level === 3;
            const isWarn = st.risk_level === 2;
            const color = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';
            return (
              <React.Fragment key={st.station_id}>
                <Circle center={[st.lat, st.lng]} radius={isCrit ? 22000 : isWarn ? 16000 : 10000} pathOptions={{ color, fillColor: color, fillOpacity: isCrit ? 0.28 : 0.16, weight: isCrit ? 2 : 1, dashArray: isCrit ? '3, 4' : null }} />
                <Marker position={[st.lat, st.lng]} icon={createGlowPinIcon(st.risk_level)} eventHandlers={{ click: () => handleSelectStation(st) }} />
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Data Source Panel — LIVE Open-Meteo rainfall by default, demo surge optional */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-[990] glass-panel px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl w-[220px] sm:w-64 text-fluid-xs border border-neutral-800 shadow-xl">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1.5 min-w-0">
              {/* Pulsing dot: green = real data, amber = demo simulation */}
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dataMode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-mono text-[9px] sm:text-[10px] tracking-wider uppercase text-neutral-300 truncate">
                {dataMode === 'live' ? 'Live Rain Nowcast' : 'Surge Simulation'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRefreshCount((n) => n + 1)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors flex items-center justify-center touch-target"
              aria-label="Refresh rainfall data"
              title="Refresh rainfall data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="font-mono text-[9px] sm:text-[10px] text-neutral-400 leading-relaxed">
            {dataMode === 'live' ? (
              <>
                <div className={isFallback ? 'text-amber-400' : 'text-emerald-400'}>
                  {isFallback ? 'Live — using fallback baseline' : 'Real 24h/72h rain + AI risk'}
                </div>
                <div>Updated {fetchedAt ? formatClock(fetchedAt) : '…'}</div>
              </>
            ) : (
              <div className="text-amber-400">Artificial rainfall — demo only</div>
            )}
          </div>

          {/* One-tap switch between real data and the demo surge mode */}
          <div className="mt-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setDataMode(dataMode === 'live' ? 'simulate' : 'live')}
              className={`w-full py-1.5 min-h-[36px] rounded-lg flex items-center justify-center space-x-1.5 text-[9px] sm:text-[10px] font-mono font-bold transition-colors ${
                dataMode === 'live'
                  ? 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-700'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{dataMode === 'live' ? 'Demo: Simulate Monsoon Surge' : 'Switch Back to Live Data'}</span>
            </button>

            {/* Surge slider is only shown while simulating (demo mode) */}
            {dataMode === 'simulate' && (
              <div className="mt-2">
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.5" 
                  step="0.25" 
                  value={rainfallMult} 
                  onChange={(e) => setRainfallMult(parseFloat(e.target.value))} 
                  className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400 touch-target" 
                />
                <div className="flex justify-between text-[8px] sm:text-[10px] text-neutral-500 font-mono mt-1">
                  <span>0.5x Base</span>
                  <span>{rainfallMult}x</span>
                  <span>2.5x Cloudburst</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Station Quick Trigger Bar (Tap opens details bottom sheet) */}
        {selectedStation && (
          <div className="lg:hidden absolute top-3 left-3 right-3 z-[990]">
            <div 
              onClick={() => setMobileDrawerOpen(true)}
              className="glass-panel p-3 rounded-xl border border-neutral-800 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform shadow-xl bg-black/90 min-h-[44px]"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  selectedStation.risk_level === 3 ? 'bg-red-500 animate-ping' : 
                  selectedStation.risk_level === 2 ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                <div className="truncate">
                  <span className="text-white font-bold text-fluid-xs truncate block">{selectedStation.name}</span>
                  <span className="text-[10px] text-neutral-400 font-mono block">{selectedStation.district} • {selectedStation.risk_score_percentage}% Risk</span>
                </div>
              </div>
              <button 
                type="button"
                className="px-3 py-1.5 bg-white text-black font-bold text-fluid-xs rounded-lg flex items-center space-x-1 flex-shrink-0 shadow min-h-[36px]"
              >
                <span>Details</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Desktop Station Side Panel (Shown on screens >= 1024px) */}
        {selectedStation && (
          <div className="hidden lg:flex absolute top-4 right-4 bottom-4 z-[1000] w-80 glass-panel p-5 rounded-3xl flex-col justify-between text-fluid-xs overflow-y-auto shadow-2xl border border-neutral-800 transition-all">
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
                <div>
                  <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest block">{selectedStation.state} &bull; {selectedStation.district}</span>
                  <h3 className="text-fluid-lg font-bold text-white tracking-tight mt-0.5">{selectedStation.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold tracking-wider ${
                  selectedStation.risk_level === 3 ? 'bg-red-500/20 border border-red-500/40 text-red-400' :
                  selectedStation.risk_level === 2 ? 'bg-orange-500/20 border border-orange-500/40 text-orange-400' :
                  'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                }`}>{selectedStation.risk_code}</span>
              </div>

              <div className="py-4">
                <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest block">AI SUSCEPTIBILITY INDEX</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-4xl font-black tracking-tight text-white">{selectedStation.risk_score_percentage}%</span>
                  <span className="text-xs text-neutral-400 font-mono">{selectedStation.risk_level === 3 ? 'EVACUATION' : selectedStation.risk_level === 2 ? 'HIGH HAZARD' : 'BASELINE'}</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${selectedStation.risk_score_percentage}%`, backgroundColor: selectedStation.risk_level === 3 ? '#ef4444' : selectedStation.risk_level === 2 ? '#f59e0b' : '#ffffff' }} />
                </div>
              </div>

              <div className="space-y-2 py-2 border-t border-b border-neutral-800 text-fluid-xs">
                {[
                  { label: '24h Rain', val: `${selectedStation.current_rainfall_24h_mm} mm` },
                  { label: 'Slope Gradient', val: `${selectedStation.slope_deg}° steep` },
                  { label: 'Pore Saturation', val: `${Math.round(selectedStation.soil_moisture * 100)}% wet` },
                  { label: 'Strata Type', val: selectedStation.soil_type }
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between py-1">
                    <span className="text-neutral-400">{label}</span>
                    <span className="text-white font-mono font-bold truncate max-w-[140px]">{val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-black border border-neutral-800 text-fluid-xs leading-relaxed text-neutral-300">
                <strong className="text-white block text-[10px] uppercase font-mono tracking-wider mb-1">Direct Protocol:</strong>
                {selectedStation.recommended_action}
              </div>
            </div>

            <div className="pt-3">
              <button 
                onClick={() => handleQuickSMS(selectedStation)} 
                disabled={smsStatus === 'SENDING'} 
                className="w-full py-3 min-h-[44px] bg-white text-black hover:bg-neutral-200 font-bold text-fluid-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-98"
              >
                <Send className="w-4 h-4 text-black" />
                <span>{smsStatus === 'SENDING' ? 'Dispatching Twilio Gateway...' : smsStatus === 'SENT' ? 'SMS Broadcasted to Cell Towers' : 'Dispatch Emergency SMS Warning'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Station Bottom Sheet (Collapsible bottom overlay for phone viewports) */}
        {selectedStation && mobileDrawerOpen && (
          <div className="lg:hidden absolute inset-x-2 bottom-2 z-[1001] max-h-[75vh] bg-black/95 backdrop-blur-2xl p-4 rounded-2xl flex flex-col justify-between text-fluid-xs overflow-y-auto shadow-2xl border border-neutral-700 animate-fade-in">
            <div>
              <div className="flex items-start justify-between pb-2 border-b border-neutral-800">
                <div className="truncate pr-2">
                  <span className="text-[9px] text-neutral-400 font-mono uppercase tracking-widest block">{selectedStation.state} • {selectedStation.district}</span>
                  <h3 className="text-fluid-base font-bold text-white tracking-tight truncate">{selectedStation.name}</h3>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    selectedStation.risk_level === 3 ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                    selectedStation.risk_level === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>{selectedStation.risk_code}</span>
                  <button 
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-2 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white touch-target flex items-center justify-center"
                    aria-label="Close station sheet"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="py-2.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[9px] text-neutral-400 font-mono uppercase">SUSCEPTIBILITY INDEX</span>
                  <span className="text-2xl font-black text-white">{selectedStation.risk_score_percentage}%</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${selectedStation.risk_score_percentage}%`, backgroundColor: selectedStation.risk_level === 3 ? '#ef4444' : selectedStation.risk_level === 2 ? '#f59e0b' : '#ffffff' }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-neutral-800 text-fluid-xs">
                {[
                  { label: '24h Rain', val: `${selectedStation.current_rainfall_24h_mm} mm` },
                  { label: 'Slope', val: `${selectedStation.slope_deg}°` },
                  { label: 'Moisture', val: `${Math.round(selectedStation.soil_moisture * 100)}%` },
                  { label: 'Strata', val: selectedStation.soil_type }
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between bg-neutral-950 p-2 rounded-lg border border-neutral-900">
                    <span className="text-neutral-400">{label}:</span>
                    <span className="text-white font-mono font-bold truncate">{val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2.5 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-fluid-xs leading-relaxed text-neutral-300">
                <strong className="text-white block text-[9px] uppercase font-mono tracking-wider mb-0.5">Protocol:</strong>
                {selectedStation.recommended_action}
              </div>
            </div>

            <div className="pt-3">
              <button 
                onClick={() => handleQuickSMS(selectedStation)} 
                disabled={smsStatus === 'SENDING'} 
                className="w-full py-3 min-h-[44px] bg-white text-black hover:bg-neutral-200 font-bold text-fluid-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-98"
              >
                <Send className="w-4 h-4 text-black" />
                <span>{smsStatus === 'SENDING' ? 'Dispatching...' : smsStatus === 'SENT' ? 'Dispatched to Towers' : 'Dispatch Emergency SMS Warning'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

