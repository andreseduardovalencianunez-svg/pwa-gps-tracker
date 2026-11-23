// Utility to calculate distance between two coordinates in meters (Haversine Formula)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Format speed safely (m/s to km/h)
export function formatSpeed(speedMps) {
  if (speedMps === null || speedMps === undefined || isNaN(speedMps) || speedMps < 0.2) {
    return { kmh: '0.0', mps: '0.0' };
  }
  const kmh = (speedMps * 3.6).toFixed(1);
  const mps = speedMps.toFixed(1);
  return { kmh, mps };
}

// Format distance
export function formatDistance(meters) {
  if (!meters || meters < 0) return '0 m';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

// Format duration seconds to HH:MM:SS
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [
    h > 0 ? String(h).padStart(2, '0') : null,
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0')
  ].filter(Boolean).join(':');
}

// Export route coordinates to GeoJSON download
export function downloadGeoJSON(routePoints, trackName = 'gps-ruta') {
  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: trackName,
          timestamp: new Date().toISOString(),
          totalPoints: routePoints.length
        },
        geometry: {
          type: 'LineString',
          coordinates: routePoints.map(p => [p.lng, p.lat, p.altitude || 0])
        }
      }
    ]
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${trackName}-${new Date().toISOString().slice(0, 10)}.geojson`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
