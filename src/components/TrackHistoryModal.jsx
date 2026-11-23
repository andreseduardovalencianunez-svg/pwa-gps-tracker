import React from 'react';
import { X, Download, Trash2, MapPin, Calendar, Clock, Route } from 'lucide-react';
import { formatDistance, formatDuration, downloadGeoJSON } from '../utils/geoUtils';

export default function TrackHistoryModal({
  isOpen,
  onClose,
  history = [],
  onDeleteTrack,
  onClearAll
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="text-sky-400" size={20} />
            <h2 className="text-base font-bold text-white">Rutas Guardadas</h2>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {history.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Track List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MapPin size={36} className="mx-auto text-slate-600 mb-2" />
              <p className="font-medium text-slate-300">No hay rutas grabadas aún</p>
              <p className="text-xs text-slate-500 mt-1">
                Usa el botón de grabar (círculo rojo) en la pantalla principal para registrar tus recorridos.
              </p>
            </div>
          ) : (
            history.map(track => (
              <div
                key={track.id}
                className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 flex flex-col gap-2 hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white truncate max-w-[200px]">
                    {track.name || 'Recorrido GPS'}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(track.timestamp).toLocaleDateString()} {new Date(track.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 py-1 border-t border-b border-slate-700/40 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Distancia</span>
                    <strong className="text-sky-300">{formatDistance(track.distance)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Tiempo</span>
                    <span>{formatDuration(track.duration)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Puntos</span>
                    <span>{track.points.length}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => downloadGeoJSON(track.points, track.name || 'gps-track')}
                    className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                    title="Descargar GeoJSON"
                  >
                    <Download size={13} /> GeoJSON
                  </button>
                  <button
                    onClick={() => onDeleteTrack(track.id)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs transition"
                    title="Eliminar ruta"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {history.length > 0 && (
          <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex justify-end gap-2">
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 transition flex items-center gap-1.5"
            >
              <Trash2 size={13} /> Borrar Todo el Historial
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
