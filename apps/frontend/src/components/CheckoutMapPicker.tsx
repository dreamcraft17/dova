import { useEffect, useRef, useState } from 'react';

type Coordinates = { latitude: number; longitude: number };
type Props = {
  value: Coordinates | null;
  onChange: (location: Coordinates, address?: string) => void;
  onError?: (message: string) => void;
};

const YENAGOA: Coordinates = { latitude: 4.9247, longitude: 6.2649 };

export function CheckoutMapPicker({ value, onChange, onError }: Props) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const onErrorRef = useRef(onError);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => { onChangeRef.current = onChange; onErrorRef.current = onError; }, [onChange, onError]);

  useEffect(() => {
    let cancelled = false;
    if (!mapElement.current || mapRef.current) return;
    import('leaflet').then((L) => {
      if (cancelled || !mapElement.current) return;
      const initial = value || YENAGOA;
      const map = L.map(mapElement.current, { scrollWheelZoom: false }).setView([initial.latitude, initial.longitude], value ? 16 : 12);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41],
      });
      const marker = L.marker([initial.latitude, initial.longitude], { draggable: true, icon }).addTo(map);
      const update = (lat: number, lng: number) => {
        marker.setLatLng([lat, lng]);
        map.setView([lat, lng], Math.max(map.getZoom(), 16), { animate: true });
        onChangeRef.current({ latitude: Number(lat.toFixed(7)), longitude: Number(lng.toFixed(7)) });
      };
      map.on('click', (event: any) => update(event.latlng.lat, event.latlng.lng));
      marker.on('dragend', () => {
        const point = marker.getLatLng();
        update(point.lat, point.lng);
      });
      mapRef.current = map;
      markerRef.current = marker;
      window.setTimeout(() => map.invalidateSize(), 0);
    }).catch(() => onErrorRef.current?.('Map failed to load. You can still enter your address manually.'));
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; markerRef.current = null; };
  }, []);

  useEffect(() => {
    if (!value || !mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([value.latitude, value.longitude]);
    mapRef.current.setView([value.latitude, value.longitude], Math.max(mapRef.current.getZoom(), 16));
  }, [value]);

  async function searchAddress() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearching(true);
    onErrorRef.current?.('');
    try {
      const params = new URLSearchParams({ format: 'jsonv2', limit: '1', countrycodes: 'ng', q: trimmed });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Search unavailable');
      const results = await response.json() as Array<{ lat: string; lon: string; display_name: string }>;
      if (!results[0]) throw new Error('Address not found. Try adding Yenagoa or Bayelsa.');
      const result = results[0];
      const location = { latitude: Number(result.lat), longitude: Number(result.lon) };
      onChangeRef.current(location, result.display_name);
      mapRef.current?.setView([location.latitude, location.longitude], 16, { animate: true });
    } catch (error) {
      onErrorRef.current?.(error instanceof Error ? error.message : 'Unable to search this address.');
    } finally { setSearching(false); }
  }

  function useDeviceLocation() {
    if (!navigator.geolocation) { onErrorRef.current?.('Your browser does not provide location access.'); return; }
    setLocating(true); onErrorRef.current?.('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { onChangeRef.current({ latitude: Number(coords.latitude.toFixed(7)), longitude: Number(coords.longitude.toFixed(7)) }); setLocating(false); },
      () => { onErrorRef.current?.('Location access was unavailable. Search your address or move the pin manually.'); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div className="checkout-map-picker">
      <div className="map-search-row">
        <input aria-label="Search delivery address" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void searchAddress(); } }} placeholder="Search street, area or landmark" />
        <button type="button" className="map-action-button" onClick={() => void searchAddress()} disabled={searching}>{searching ? 'Searching…' : 'Search'}</button>
      </div>
      <div ref={mapElement} className="checkout-map" aria-label="Choose delivery location on map" />
      <div className="map-picker-footer">
        <span>{value ? 'Pin selected. Drag it to the exact delivery point.' : 'Search or tap the map to choose a pin.'}</span>
        <button type="button" className="map-location-button" onClick={useDeviceLocation} disabled={locating}>{locating ? 'Locating…' : 'Use my location'}</button>
      </div>
    </div>
  );
}
