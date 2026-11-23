# PWA de Mapa GPS en Tiempo Real

Aplicación Web Progresiva (PWA) de mapa y seguimiento GPS móvil de alta precisión, desarrollada con **React 18**, **Leaflet** y teselas de mapas abiertas de **OpenStreetMap**.

## Características Principales

- 📡 **Seguimiento GPS en Tiempo Real**: Implementa `navigator.geolocation.watchPosition` con configuración de alta precisión (`enableHighAccuracy`).
- ⭕ **Círculo de Precisión Dinámico**: Dibuja el radio de tolerancia e incertidumbre del satélite y un marcador personalizado con pulso de radar.
- 🎯 **Botón de Auto-Centrado**: Fija y centra automáticamente la cámara en el usuario al desplazarse o reactiva el seguimiento con un toque.
- 📊 **Panel de Telemetría (HUD Mobile-First)**: 
  - Velocidad actual en km/h y m/s en tiempo real.
  - Latitud y Longitud formateadas en grados sexagesimales cardinales.
  - Precisión métrica estimada con indicador de calidad de señal.
  - Altitud sobre el nivel del mar y rumbo de brújula.
- ⏺️ **Grabación de Rutas (Odómetro / Breadcrumbs)**:
  - Inicia y detén la grabación de recorridos con cálculo continuo de distancia recorrida mediante fórmula de Haversine.
  - Filtro contra desvíos estáticos o ruido del sensor (GPS drift filter).
  - Exportación de tracks grabados en formato estándar **GeoJSON** para usarlos en Google Earth, QGIS o Strava.
- ⚠️ **Manejo Robusto de Errores**:
  - Diálogo descriptivo para permisos denegados, señal inaccesible o timeout de satélites.
  - Detección de pérdida de conexión a internet (modo Offline).
- 🗺️ **Capas de Mapa Intercambiables**: Selección rápida entre OpenStreetMap clásico, CARTO Voyager y relieve Topográfico.
- 🔋 **Wake Lock API**: Mantiene la pantalla encendida mientras realizas seguimiento activo en exteriores.
- 📱 **PWA Instalable**: Funciona offline con service workers y puede agregarse a la pantalla de inicio en Android e iOS.

## Instalación y Ejecución Local

1. Clonar el repositorio o descargar el código:
```bash
npm install
```

2. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

3. Construir para producción:
```bash
npm run build
```

4. Previsualizar la compilación:
```bash
npm run preview
```

> **Nota de uso**: La API de Geolocalización de los navegadores requiere un contexto seguro (`HTTPS` o `localhost`). Al abrirlo en el móvil, asegúrate de permitir los permisos de ubicación solicitados.