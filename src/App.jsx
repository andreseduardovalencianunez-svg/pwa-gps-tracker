import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Crosshair,
  Play,
  Square,
  Layers,
  FolderClock,
  WifiOff,
  Sun,
  Compass,
  Info
} from 'lucide-react';
import MapComponent from './components/MapComponent';
import MetricsSheet from './components/MetricsSheet';
import ErrorModal from './components/ErrorModal';
import TrackHistoryModal from './components/TrackHistoryModal';
import { calculateDistance } from './utils/geoUtils';

export default function App() {
  // Geolocation states
  const [currentPosition, setCurrentPosition] = useState(null); // { lat, lng }
  const [accuracy, setAccuracy] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [heading, setHeading] = useState(null);
  const [altitude, setAltitude] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [isWatching, setIsWatching] = useState(false);

  // UI states
  const [autoCenter, setAutoCenter] = useState(true);
  const [activeTileLayer, setActiveTileLayer] = useState('osm');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // Route Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedRoute, setRecordedRoute] = useState([]); // array of { lat, lng, time, altitude, speed }
  const [recordedDistance, setRecordedDistance] = useState(0);
  const [recordStartTime, setRecordStartTime] = useState(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [savedTracks, setSavedTracks] = useState(() => {
    try {
      const stored = localStorage.getItem('gps_tracks_history');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const watchIdRef = useRef(null);
  const wakeLockRef = useRef(null);
  const durationTimerRef = useRef(null);

  // Network status listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save tracks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gps_tracks_history', JSON.stringify(savedTracks));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [savedTracks]);

  // Screen Wake Lock API to prevent mobile screen sleeping while tracking
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        setWakeLockActive(true);
        wakeLockRef.current.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      } catch (err) {
        console.log('WakeLock not granted:', err);
      }
    }
  };

  // Handle geolocation updates
  const handlePositionSuccess = useCallback((pos) => {
    const { latitude, longitude, accuracy, speed, heading, altitude } = pos.coords;
    setGeoError(null);

    const newPos = { lat: latitude, lng: longitude };
    setCurrentPosition(newPos);
    setAccuracy(accuracy);
    setSpeed(speed);
    setHeading(heading);
    setAltitude(altitude);

    // If recording route, append point if distance is reasonable
    if (isRecording) {
      setRecordedRoute(prevRoute => {
        if (prevRoute.length > 0) {
          const lastPt = prevRoute[prevRoute.length - 1];
          const dist = calculateDistance(lastPt.lat, lastPt.lng, latitude, longitude);
          // Filter out tiny GPS drift (threshold > 1.5m) to avoid zig-zags
          if (dist > 1.5) {
            setRecordedDistance(prevDist => prevDist + dist);
            return [...prevRoute, { lat: latitude, lng: longitude, altitude, time: Date.now() }];
          }
          return prevRoute;
        } else {
          return [{ lat: latitude, lng: longitude, altitude, time: Date.now() }];
        }
      });
    }
  }, [isRecording]);

  const handlePositionError = useCallback((err) => {
    console.warn('Geolocation error:', err);
    setGeoError(err);
  }, []);

  // Start GPS watching
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError({ code: 0, message: 'Geolocalización no soportada en este navegador' });
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 1000
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      options
    );
    setIsWatching(true);
    requestWakeLock();
  }, [handlePositionSuccess, handlePositionError]);

  // Initialize GPS on load
  useEffect(() => {
    startTracking();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [startTracking]);

  // Duration counter when recording
  useEffect(() => {
    if (isRecording) {
      durationTimerRef.current = setInterval(() => {
        if (recordStartTime) {
          setRecordedDuration(Math.floor((Date.now() - recordStartTime) / 1000));
        }
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [isRecording, recordStartTime]);

  // Toggle Route Recording
  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      setRecordedRoute(currentPosition ? [{ ...currentPosition, time: Date.now() }] : []);
      setRecordedDistance(0);
      setRecordStartTime(Date.now());
      setRecordedDuration(0);
    } else {
      // Stop recording and save if points exist
      setIsRecording(false);
      if (recordedRoute.length > 2) {
        const newTrack = {
          id: 'track_' + Date.now(),
          name: `Ruta ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          timestamp: Date.now(),
          distance: recordedDistance,
          duration: recordedDuration,
          points: recordedRoute
        };
        setSavedTracks(prev => [newTrack, ...prev]);
      }
    }
  };

  // Delete track
  const handleDeleteTrack = (id) => {
    setSavedTracks(prev => prev.filter(t => t.id !== id));
  };

  const handleClearAllTracks = () => {
    if (window.confirm('¿Deseas eliminar todo el historial de rutas?')) {
      setSavedTracks([]);
    }
  };

  // Re-center button click
  const handleCenterClick = () => {
    setAutoCenter(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none flex flex-col">
      {/* Top Navigation & Status Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 pt-3 pb-2 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="glass-card px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
            <span className={`w-2.5 h-2.5 rounded-full ${isWatching && !geoError ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span className="text-xs font-bold tracking-wide text-white font-mono">
              GPS {isWatching && !geoError ? 'ACTIVO' : 'PAUSADO'}
            </span>
          </div>
          {isOffline && (
            <div className="glass-card px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-amber-400 text-xs font-semibold shadow-lg">
              <WifiOff size={13} />
              <span>Offline</span>
            </div>
          )}
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Layer switcher button */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className={`w-10 h-10 rounded-full flex items-center justify-center glass-btn shadow-md ${showLayerMenu ? 'active' : ''}`}
              aria-label="Cambiar mapa base"
            >
              <Layers size={18} />
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 mt-2 w-40 glass-card rounded-xl p-1.5 shadow-xl flex flex-col gap-1 z-30">
                <button
                  onClick={() => { setActiveTileLayer('osm'); setShowLayerMenu(false); }}
                  className={`px-3 py-2 text-left text-xs rounded-lg transition font-medium ${activeTileLayer === 'osm' ? 'bg-sky-500 text-white' : 'hover:bg-slate-800 text-slate-200'}`}
                >
                  OpenStreetMap (Estándar)
                </button>
                <button
                  onClick={() => { setActiveTileLayer('cartoDark'); setShowLayerMenu(false); }}
                  className={`px-3 py-2 text-left text-xs rounded-lg transition font-medium ${activeTileLayer === 'cartoDark' ? 'bg-sky-500 text-white' : 'hover:bg-slate-800 text-slate-200'}`}
                >
                  Voyager (Claro)
                </button>
                <button
                  onClick={() => { setActiveTileLayer('topo'); setShowLayerMenu(false); }}
                  className={`px-3 py-2 text-left text-xs rounded-lg transition font-medium ${activeTileLayer === 'topo' ? 'bg-sky-500 text-white' : 'hover:bg-slate-800 text-slate-200'}`}
                >
                  Topográfico
                </button>
              </div>
            )}
          </div>

          {/* History / Saved Routes */}
          <button
            onClick={() => setHistoryModalOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center glass-btn shadow-md relative"
            aria-label="Ver historial de rutas"
          >
            <FolderClock size={18} />
            {savedTracks.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {savedTracks.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Map Viewport */}
      <main className="flex-1 w-full h-full relative z-0">
        <MapComponent
          position={currentPosition}
          accuracy={accuracy}
          heading={heading}
          autoCenter={autoCenter}
          onUserPan={() => setAutoCenter(false)}
          activeTileLayer={activeTileLayer}
          recordedRoute={recordedRoute}
        />

        {/* Floating Controls Over Map */}
        <div className="absolute right-4 bottom-52 z-20 flex flex-col gap-3 pointer-events-auto">
          {/* Center Location Button */}
          <button
            onClick={handleCenterClick}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${autoCenter ? 'glass-btn active ring-2 ring-sky-400' : 'glass-btn hover:text-sky-300'}`}
            title={autoCenter ? 'Auto-centrado activado' : 'Centrar en mi ubicación'}
            aria-label="Centrar mapa"
          >
            <Crosshair size={22} className={autoCenter ? 'animate-spin-slow' : ''} />
          </button>

          {/* Start/Stop Track Recording Button */}
          <button
            onClick={toggleRecording}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/40'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95'
            }`}
            title={isRecording ? 'Detener grabación de ruta' : 'Iniciar grabación de ruta'}
            aria-label="Grabar ruta"
          >
            {isRecording ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>
      </main>

      {/* Bottom Sheet for Metrics (Mobile-first HUD) */}
      <MetricsSheet
        currentPosition={currentPosition}
        speedMps={speed}
        accuracy={accuracy}
        altitude={altitude}
        heading={heading}
        isRecording={isRecording}
        recordedDistance={recordedDistance}
        recordedDuration={recordedDuration}
        routePointsCount={recordedRoute.length}
      />

      {/* Geolocation Error Alert Modal */}
      <ErrorModal
        error={geoError}
        onRetry={startTracking}
        isOffline={false}
      />

      {/* Route History Modal */}
      <TrackHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        history={savedTracks}
        onDeleteTrack={handleDeleteTrack}
        onClearAll={handleClearAllTracks}
      />
    </div>
  );
}
