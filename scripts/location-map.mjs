import fs from 'fs';

function patchPostAd() {
  const path = 'src/components/PostAdModal.tsx';
  let s = fs.readFileSync(path, 'utf8');

  if (!s.includes("from './LocationMap';")) {
    s = s.replace(
      "import { InfoTabKey } from '../data/infoPagesData';",
      "import { InfoTabKey } from '../data/infoPagesData';\nimport { LocationMap, type MapPoint } from './LocationMap';"
    );
  }

  if (!s.includes('const [mapPoint, setMapPoint]')) {
    s = s.replace(
      "  const [address, setAddress] = useState('');",
      "  const [address, setAddress] = useState('');\n  const [mapPoint, setMapPoint] = useState<MapPoint | null>(null);"
    );
  }

  s = s.replace(
    "        address: address.trim() || undefined\n      },",
    "        address: address.trim() || undefined,\n        ...(mapPoint ? { latitude: mapPoint.latitude, longitude: mapPoint.longitude } : {})\n      },"
  );

  const locationStart = s.indexOf('            {/* 5. Location (Viloyat) */}');
  const locationEnd = s.indexOf('\n\n            {/* 6. Description */}', locationStart);
  if (locationStart !== -1 && locationEnd !== -1 && !s.slice(locationStart, locationEnd).includes('<LocationMap')) {
    const block = `            {/* 5. Location */}\n            <div className="space-y-3">\n              <div>\n                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">\n                  {t.regionField} *\n                </label>\n                <select\n                  id="post-region-select"\n                  value={regionId}\n                  onChange={(e) => setRegionId(e.target.value)}\n                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"\n                >\n                  {regions.map((r) => (\n                    <option key={r.id} value={r.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">\n                      {r.name[lang] || r.name.uz || r.name.ru}\n                    </option>\n                  ))}\n                </select>\n              </div>\n\n              <div>\n                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">\n                  Manzil <span className="normal-case font-medium text-slate-400">(ixtiyoriy)</span>\n                </label>\n                <input\n                  id="post-address-input"\n                  type="text"\n                  value={address}\n                  onChange={(e) => setAddress(e.target.value)}\n                  placeholder="Masalan: Registon ko‘chasi yoki mo‘ljal"\n                  maxLength={160}\n                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"\n                />\n              </div>\n\n              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 p-3 sm:p-4">\n                <div className="flex items-start gap-2 mb-3">\n                  <MapPin size={17} className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" />\n                  <div>\n                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Xaritada joylashuvni belgilang</div>\n                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Aniq uy manzilini ko‘rsatish majburiy emas. Istasangiz yaqin atrofdagi nuqtani belgilang.</div>\n                  </div>\n                </div>\n                <LocationMap value={mapPoint} onChange={setMapPoint} showLocateButton heightClass="h-56 sm:h-64" />\n              </div>\n            </div>`;
    s = s.slice(0, locationStart) + block + s.slice(locationEnd);
  }

  fs.writeFileSync(path, s);
}

function patchListingDetail() {
  const path = 'src/components/ListingDetailModal.tsx';
  let s = fs.readFileSync(path, 'utf8');

  if (!s.includes("from './LocationMap';")) {
    s = s.replace(
      "import { SimilarListingsSection } from './SimilarListingsSection';",
      "import { SimilarListingsSection } from './SimilarListingsSection';\nimport { LocationMap } from './LocationMap';"
    );
  }

  const mockStart = s.indexOf('                  {/* Stylized map container */}');
  const metaMarker = '\n                </div>\n              </div>\n\n              {/* Listing meta info */}';
  const mockEnd = s.indexOf(metaMarker, mockStart);
  if (mockStart !== -1 && mockEnd !== -1 && !s.slice(mockStart, mockEnd).includes('<LocationMap')) {
    const replacement = `                  {typeof listing.location.latitude === 'number' && typeof listing.location.longitude === 'number' ? (\n                    <LocationMap\n                      value={{ latitude: listing.location.latitude, longitude: listing.location.longitude }}\n                      readOnly\n                      heightClass="h-48 sm:h-56"\n                    />\n                  ) : (\n                    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 p-5 text-center text-xs text-slate-500 dark:text-slate-400">\n                      Bu e'lon uchun xaritadagi aniq nuqta ko‘rsatilmagan.\n                    </div>\n                  )}`;
    s = s.slice(0, mockStart) + replacement + s.slice(mockEnd);
  }

  fs.writeFileSync(path, s);
}

function patchApp() {
  const path = 'src/App.tsx';
  let s = fs.readFileSync(path, 'utf8');

  if (!s.includes('const [nearbyLocation, setNearbyLocation]')) {
    const marker = "  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);";
    const insert = `${marker}\n  const [nearbyLocation, setNearbyLocation] = useState<{ latitude: number; longitude: number } | null>(() => {\n    try {\n      const raw = localStorage.getItem('oldisotti_user_location');\n      if (!raw) return null;\n      const parsed = JSON.parse(raw);\n      return typeof parsed?.latitude === 'number' && typeof parsed?.longitude === 'number' ? parsed : null;\n    } catch {\n      return null;\n    }\n  });\n\n  useEffect(() => {\n    const syncNearbyLocation = () => {\n      try {\n        const raw = localStorage.getItem('oldisotti_user_location');\n        if (!raw) return setNearbyLocation(null);\n        const parsed = JSON.parse(raw);\n        if (typeof parsed?.latitude === 'number' && typeof parsed?.longitude === 'number') setNearbyLocation(parsed);\n      } catch { /* ignore invalid cache */ }\n    };\n    window.addEventListener('oldisotti_user_location_updated', syncNearbyLocation);\n    return () => window.removeEventListener('oldisotti_user_location_updated', syncNearbyLocation);\n  }, []);`;
    if (s.includes(marker)) s = s.replace(marker, insert);
  }

  const sortMarker = `    }).sort((a, b) => {\n      // Sorting`;
  if (s.includes(sortMarker) && !s.includes("filters.sortBy === 'distance'")) {
    s = s.replace(sortMarker, `    }).sort((a, b) => {\n      if (filters.sortBy === 'distance' && nearbyLocation) {\n        const distanceKm = (item: Listing) => {\n          const lat = item.location.latitude;\n          const lon = item.location.longitude;\n          if (typeof lat !== 'number' || typeof lon !== 'number') return Number.POSITIVE_INFINITY;\n          const toRad = (deg: number) => deg * Math.PI / 180;\n          const dLat = toRad(lat - nearbyLocation.latitude);\n          const dLon = toRad(lon - nearbyLocation.longitude);\n          const lat1 = toRad(nearbyLocation.latitude);\n          const lat2 = toRad(lat);\n          const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;\n          return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));\n        };\n        return distanceKm(a) - distanceKm(b);\n      }\n\n      // Sorting`);
  }

  s = s.replace(
    '  }, [listings, filters, currency, blockedSellerIds]);',
    '  }, [listings, filters, currency, blockedSellerIds, nearbyLocation]);'
  );

  fs.writeFileSync(path, s);
}

function patchFilters() {
  const path = 'src/components/ListingFilters.tsx';
  let s = fs.readFileSync(path, 'utf8');

  if (!s.includes('Menga yaqin')) {
    s = s.replace(
      "    { value: 'popular', label: t.sortPopular }",
      "    { value: 'popular', label: t.sortPopular },\n    { value: 'distance', label: lang === 'ru' ? 'Рядом со мной' : lang === 'oz' ? 'Менга яқин' : 'Menga yaqin' }"
    );
  }

  if (!s.includes('const handleSortChange =')) {
    const marker = '  const brandLabel =';
    const handler = `  const handleSortChange = (value: SortOption) => {\n    if (value !== 'distance') {\n      onFilterChange({ sortBy: value });\n      return;\n    }\n    if (!navigator.geolocation) {\n      window.alert('Qurilmangiz joylashuvni aniqlashni qo‘llab-quvvatlamaydi.');\n      return;\n    }\n    navigator.geolocation.getCurrentPosition(\n      (position) => {\n        const point = {\n          latitude: Number(position.coords.latitude.toFixed(6)),\n          longitude: Number(position.coords.longitude.toFixed(6))\n        };\n        try { localStorage.setItem('oldisotti_user_location', JSON.stringify(point)); } catch { /* ignore */ }\n        window.dispatchEvent(new Event('oldisotti_user_location_updated'));\n        onFilterChange({ sortBy: 'distance' });\n      },\n      () => window.alert('Menga yaqin e’lonlarni ko‘rsatish uchun joylashuvga ruxsat bering.'),\n      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }\n    );\n  };\n\n`;
    if (s.includes(marker)) s = s.replace(marker, handler + marker);
  }

  s = s.replace(
    "onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}",
    "onChange={(e) => handleSortChange(e.target.value as SortOption)}"
  );

  fs.writeFileSync(path, s);
}

patchPostAd();
patchListingDetail();
patchApp();
patchFilters();
