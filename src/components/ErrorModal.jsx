import React from 'react';
import { AlertTriangle, RefreshCw, Settings, ShieldAlert } from 'lucide-react';

export default function ErrorModal({ error, onRetry, isOffline }) {
  if (!error && !isOffline) return null;

  const getErrorInfo = err => {
    if (!err) return { title: 'Modo Offline', message: 'Estás sin conexión a internet. Los mapas en caché funcionarán, pero nuevas teselas no podrán cargarse.', code: null };

    switch (err.code) {
      case 1: // PERMISSION_DENIED
        return {
          title: 'Permiso de GPS Denegado',
          message: 'La aplicación necesita acceso a tu ubicación satelital para funcionar. Por favor, habilita el permiso de ubicación en los ajustes de tu navegador o dispositivo móvil.',
          hint: 'En Android/iOS: Pulsa en el icono de candado o configuración al lado de la barra de dirección web y permite "Ubicación".'
        };
      case 2: // POSITION_UNAVAILABLE
        return {
          title: 'Señal GPS no disponible',
          message: 'No es posible determinar tu posición actual. Verifica que la señal GPS o el servicio de ubicación esté encendido y que tengas vista despejada al cielo.',
          hint: 'Intenta salir a un espacio abierto o conectar WiFi para triangulación asistida.'
        };
      case 3: // TIMEOUT
        return {
          title: 'Tiempo de espera agotado',
          message: 'El dispositivo tardó demasiado tiempo en obtener una respuesta del satélite GPS.',
          hint: 'Presiona reintentar con alta precisión.'
        };
      default:
        return {
          title: 'Error de Geolocalización',
          message: err.message || 'Ocurrió un error inesperado al intentar acceder al sensor de GPS.',
          hint: 'Reinicia la aplicación o revisa los permisos.'
        };
    }
  };

  const info = getErrorInfo(error);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
        <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
          {error?.code === 1 ? <ShieldAlert size={28} /> : <AlertTriangle size={28} />}
        </div>

        <h3 className="text-lg font-bold text-white mb-2">{info.title}</h3>
        <p className="text-sm text-slate-300 mb-4 leading-relaxed">{info.message}</p>

        {info.hint && (
          <div className="bg-slate-800/80 border border-slate-700 text-slate-400 text-xs p-3 rounded-lg text-left mb-5">
            <strong className="text-sky-400 font-semibold">Sugerencia: </strong>
            {info.hint}
          </div>
        )}

        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 py-3 px-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-sky-500/25"
            >
              <RefreshCw size={16} /> Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
