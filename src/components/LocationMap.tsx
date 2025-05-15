import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons not displaying correctly
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

interface LocationMapProps {
  latitude: number;
  longitude: number;
  cityName: string;
  className?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ 
  latitude, 
  longitude, 
  cityName,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // For Leaflet map, the correct order is [latitude, longitude]
      console.log(`Initializing map with coordinates: [${latitude}, ${longitude}]`);
      
      mapInstanceRef.current = L.map(mapRef.current).setView([latitude, longitude], 10);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
      
      // Add marker with the same coordinates
      L.marker([latitude, longitude], { icon: DefaultIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(cityName)
        .openPopup();
    }
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, cityName]);
  
  // Effect to handle resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className={`overflow-hidden rounded-lg ${className}`}>
      <div ref={mapRef} style={{ height: '300px', width: '100%' }} />
    </div>
  );
};

export default LocationMap; 