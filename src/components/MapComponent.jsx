import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const TILE_LAYERS = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  },
  cartoDark: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OSM contributors'
  }
};

export default function MapComponent({
  position,
  accuracy,
  heading,
  autoCenter,
  onUserPan,
  activeTileLayer = 'osm',
  recordedRoute = []
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const routePolylineRef = useRef(null);
  const isInitialCenteringDone = useRef(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = position ? position.lat : 40.4168;
    const initialLng = position ? position.lng : -3.7038;
    const initialZoom = position ? 16 : 13;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: true
    });

    // Create base tile layer
    tileLayerRef.current = L.tileLayer(TILE_LAYERS[activeTileLayer].url, {
      maxZoom: 19,
      attribution: TILE_LAYERS[activeTileLayer].attribution
    }).addTo(map);

    // Detect manual user panning/dragging to pause auto-follow
    map.on('dragstart zoomstart', () => {
      if (onUserPan) {
        onUserPan();
      }
    });

    // Create route polyline
    routePolylineRef.current = L.polyline([], {
      color: '#38bdf8',
      weight: 4,
      opacity: 0.9,
      lineJoin: 'round',
      dashArray: null
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch map tile provider
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const target = TILE_LAYERS[activeTileLayer] || TILE_LAYERS.osm;
    tileLayerRef.current.setUrl(target.url);
  }, [activeTileLayer]);

  // Update User Marker & Accuracy Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !position) return;

    const latlng = [position.lat, position.lng];

    // 1. Accuracy Circle
    if (accuracy && accuracy > 0) {
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = L.circle(latlng, {
          radius: accuracy,
          fillColor: '#0ea5e9',
          fillOpacity: 0.18,
          color: '#38bdf8',
          weight: 1.5,
          opacity: 0.7
        }).addTo(map);
      } else {
        accuracyCircleRef.current.setLatLng(latlng);
        accuracyCircleRef.current.setRadius(accuracy);
      }
    } else if (accuracyCircleRef.current) {
      map.removeLayer(accuracyCircleRef.current);
      accuracyCircleRef.current = null;
    }

    // 2. Custom User Marker with heading pointer and pulse
    const headingRotation = heading !== null && heading !== undefined ? heading : 0;
    const hasHeading = heading !== null && heading !== undefined;

    const markerHtml = `
      <div class="custom-user-marker">
        <div class="marker-pulse"></div>
        ${hasHeading ? `<div class="marker-heading-pointer" style="transform: rotate(${headingRotation}deg);"></div>` : ''}
        <div class="marker-center-dot"></div>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: markerHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(latlng, {
        icon: customIcon,
        zIndexOffset: 1000
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng(latlng);
      userMarkerRef.current.setIcon(customIcon);
    }

    // 3. Pan / Fly if autoCenter is active or first load
    if (autoCenter || !isInitialCenteringDone.current) {
      map.panTo(latlng, { animate: true, duration: 0.8 });
      isInitialCenteringDone.current = true;
    }
  }, [position, accuracy, heading, autoCenter]);

  // Update route polyline path
  useEffect(() => {
    if (!routePolylineRef.current) return;
    const latLngs = recordedRoute.map(pt => [pt.lat, pt.lng]);
    routePolylineRef.current.setLatLngs(latLngs);
  }, [recordedRoute]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
}
