import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapPoint {
  latitude: number;
  longitude: number;
}

interface LocationMapProps {
  value?: MapPoint | null;
  onChange?: (point: MapPoint) => void;
  readOnly?: boolean;
  heightClass?: string;
  showLocateButton?: boolean;
}

// O'zbekiston markazi (Navoiy/Samarqand atrofi)
const DEFAULT_CENTER: [number, number] = [41.311081, 69.240562]; // Toshkent markazi boshlang'ich nuqta sifatida

export const LocationMap: React.FC<LocationMapProps> = ({
  value,
  onChange,
  readOnly = false,
  heightClass = 'h-64',
  showLocateButton = false
}) => {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const [geoError, setGeoError] = useState('');

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;

    const start: [number, number] = value
      ? [value.latitude, value.longitude]
      : DEFAULT_CENTER;

    const map = L.map(mapEl.current, {
      center: start,
      zoom: value ? 14 : 9,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    if (value) {
      markerRef.current = L.circleMarker(start, {
        radius: 9,
        color: '#4f46e5',
        fillColor: '#6366f1',
        weight: 3,
        fillOpacity: 0.85
      }).addTo(map);
    }

    if (!readOnly && onChange) {
      map.on('click', (event: L.LeafletMouseEvent) => {
        const point = {
          latitude: Number(event.latlng.lat.toFixed(6)),
          longitude: Number(event.latlng.lng.toFixed(6))
        };
        if (!markerRef.current) {
          markerRef.current = L.circleMarker(event.latlng, {
            radius: 9,
            color: '#4f46e5',
            fillColor: '#6366f1',
            weight: 3,
            fillOpacity: 0.85
          }).addTo(map);
        } else {
          markerRef.current.setLatLng(event.latlng);
        }
        onChange(point);
      });
    }

    mapRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !value) return;
    const latLng = L.latLng(value.latitude, value.longitude);
    if (!markerRef.current) {
      markerRef.current = L.circleMarker(latLng, {
        radius: 9,
        color: '#4f46e5',
        fillColor: '#6366f1',
        weight: 3,
        fillOpacity: 0.85
      }).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng(latLng);
    }
    mapRef.current.setView(latLng, Math.max(mapRef.current.getZoom(), 13), { animate: true });
  }, [value?.latitude, value?.longitude]);

  const locateMe = () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Qurilmangiz joylashuvni aniqlashni qo‘llab-quvvatlamaydi.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6))
        };
        onChange?.(point);
      },
      () => setGeoError('Joylashuvga ruxsat berilmadi yoki aniqlab bo‘lmadi.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-2">
      {showLocateButton && !readOnly && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={locateMe}
            className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
          >
            📍 Mening joylashuvim
          </button>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Yoki xaritadagi kerakli nuqtani bosing.
          </span>
        </div>
      )}

      {geoError && <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">{geoError}</div>}

      <div className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 ${heightClass}`}>
        <div ref={mapEl} className="absolute inset-0 z-0" />
      </div>

      {value && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Koordinata: {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}</span>
          <a
            href={`https://www.openstreetmap.org/?mlat=${value.latitude}&mlon=${value.longitude}#map=16/${value.latitude}/${value.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Xaritada ochish ↗
          </a>
        </div>
      )}
    </div>
  );
};
