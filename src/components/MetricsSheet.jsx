import React, { useState } from 'react';
import {
  Gauge,
  Navigation,
  Compass,
  Maximize2,
  Minimize2,
  Clock,
  Milestone,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { formatSpeed, formatDistance, formatDuration } from '../utils/geoUtils';

export default function MetricsSheet({
  currentPosition,
  speedMps,
  accuracy,
  altitude,
  heading,
  isRecording,
  recordedDistance,
  recordedDuration,
  routePointsCount
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { kmh, mps } = formatSpeed(speedMps);

  const formatCoord = (val, dirPos, dirNeg) => {
    if (val === null || val === undefined) return '--';
    const dir = val >= 0 ? dirPos : dirNeg;
    return `${Math.abs(val).toFixed(5)}° ${dir}`;
  };

  const getAccuracyQuality = acc => {
    if (!acc) return { text: 'Calculando...', color: 'text-gray-400' };
    if (acc <= 5) return { text: `Excelente (±${Math.round(acc)}m)`, color: 'text-emerald-400' };
    if (acc <= 15) return { text: `Buena (±${Math.round(acc)}m)`, color: 'text-sky-400' };
    if (acc <= 35) return { text: `Moderada (±${Math.round(acc)}m)`, color: 'text-amber-400' };
    return { text: `Baja (±${Math.round(acc)}m)`, color: 'text-rose-400' };
  };

  const accInfo = getAccuracyQuality(accuracy);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 ease-out glass-card rounded-t-3xl shadow-2xl flex flex-col ${
        isExpanded ? 'max-h-[82vh]' : 'max-h-[195px]'
      }`}
      style={{ borderBottom: 'none' }}
    >
      {/* Drag handle / collapse bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full pt-2.5 pb-1 flex flex-col items-center justify-center outline-none cursor-pointer text-slate-400 hover:text-white transition-colors"
        aria-label={isExpanded ? 'Colapsar panel' : 'Expandir panel'}
      >
        <div className="w-12 h-1.5 bg-slate-600 rounded-full mb-1 opacity-80" />
        <div className="flex items-center text-xs font-medium text-slate-400 gap-1">
          <span>{isExpanded ? 'Menos detalles' : 'Más detalles'}</span>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </button>

      {/* Main Bar: Velocidad & Coordenadas resumen */}
      <div className="px-5 pb-3 pt-1 flex items-center justify-between border-b border-slate-700/50">
        {/* Velocímetro Digital Primario */}
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black tracking-tight text-white font-mono drop-shadow-md">
            {kmh}
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">KM/H</span>
            <span className="text-[10px] text-slate-400 font-mono">{mps} m/s</span>
          </div>
        </div>

        {/* Estado de Grabación o Precisión rápida */}
        {isRecording ? (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs animate-pulse">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span>
              GRABANDO RUTA
            </div>
            <div className="text-sm font-mono font-bold text-white mt-0.5">
              {formatDistance(recordedDistance)}
            </div>
            <div className="text-xs font-mono text-slate-400">
              {formatDuration(recordedDuration)}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-end text-right">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
              Precisión GPS
            </span>
            <span className={`text-xs font-semibold ${accInfo.color}`}>
              {accInfo.text}
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
              {currentPosition ? `${currentPosition.lat.toFixed(4)}, ${currentPosition.lng.toFixed(4)}` : 'Buscando satélites...'}
            </span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 overflow-y-auto max-h-[60vh]">
        {/* Latitud */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Navigation size={12} className="text-sky-400" /> Latitud
          </span>
          <span className="text-sm font-mono font-semibold text-slate-100 mt-1 truncate">
            {currentPosition ? formatCoord(currentPosition.lat, 'N', 'S') : '--'}
          </span>
        </div>

        {/* Longitud */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Navigation size={12} className="text-sky-400 rotate-90" /> Longitud
          </span>
          <span className="text-sm font-mono font-semibold text-slate-100 mt-1 truncate">
            {currentPosition ? formatCoord(currentPosition.lng, 'E', 'O') : '--'}
          </span>
        </div>

        {/* Precisión */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Compass size={12} className="text-sky-400" /> Precisión Estimada
          </span>
          <span className="text-sm font-mono font-semibold text-slate-100 mt-1">
            {accuracy !== null && accuracy !== undefined ? `± ${accuracy.toFixed(1)} m` : '--'}
          </span>
        </div>

        {/* Altitud */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Gauge size={12} className="text-sky-400" /> Altitud S.N.M.
          </span>
          <span className="text-sm font-mono font-semibold text-slate-100 mt-1">
            {altitude !== null && altitude !== undefined ? `${altitude.toFixed(1)} m` : 'No disp.'}
          </span>
        </div>

        {/* Rumbo / Dirección */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Compass size={12} className="text-sky-400" /> Rumbo
          </span>
          <span className="text-sm font-mono font-semibold text-slate-100 mt-1">
            {heading !== null && heading !== undefined ? `${Math.round(heading)}°` : 'Sin brújula'}
          </span>
        </div>

        {/* Puntos grabados */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Milestone size={12} className="text-sky-400" /> Muestra Puntos
          </span>
          <span className="text-sm font-mono font-semibold text-slate-100 mt-1">
            {routePointsCount} puntos
          </span>
        </div>
      </div>
    </div>
  );
}
