import { useEffect, useRef } from 'react';

interface LiveMapProps {
  lat: number;
  lng: number;
  label?: string;
  height?: string;
}

export const LiveMap = ({ lat, lng, label = 'Bus Location', height = '300px' }: LiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const marker = useRef<any>(null);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView([lat, lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(leafletMap.current);
      
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });

      marker.current = L.marker([lat, lng], { icon }).addTo(leafletMap.current)
        .bindPopup(label)
        .openPopup();
    } else {
      leafletMap.current.panTo([lat, lng]);
      marker.current.setLatLng([lat, lng]);
    }
  }, [lat, lng, label]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height, 
        width: '100%', 
        borderRadius: '12px', 
        border: '1px solid rgba(255,255,255,0.1)',
        zIndex: 1,
        background: '#141625' 
      }} 
    />
  );
};
