import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// 1. Mock Data: İzmir Mağaza Konumları (Konak, Karşıyaka, Bornova, Bayraklı)
const STORE_LOCATIONS = [
  { id: 1, name: "Migros MM - Konak", lat: 38.4192, lng: 27.1287, status: 'compliant', city: "Konak" },
  { id: 2, name: "BİM - Karşıyaka Çarşı", lat: 38.4591, lng: 27.1125, status: 'warning', city: "Karşıyaka" },
  { id: 3, name: "A101 - Bornova Merkez", lat: 38.4622, lng: 27.2166, status: 'non-compliant', city: "Bornova" },
  { id: 4, name: "Şok - Alsancak", lat: 38.4382, lng: 27.1414, status: 'compliant', city: "Konak" },
  { id: 5, name: "Migros Jet - Bostanlı", lat: 38.4530, lng: 27.1030, status: 'non-compliant', city: "Karşıyaka" },
  { id: 6, name: "A101 - Bayraklı", lat: 38.4600, lng: 27.1700, status: 'warning', city: "Bayraklı" },
  { id: 7, name: "BİM - Göztepe", lat: 38.3950, lng: 27.0850, status: 'compliant', city: "Konak" },
];

const StoreLocationsMap = () => {
  const getColor = (status: string) => {
    switch (status) {
      case 'compliant': return '#22c55e'; // Yeşil
      case 'warning': return '#eab308';   // Sarı
      case 'non-compliant': return '#ef4444'; // Kırmızı
      default: return '#94a3b8';
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 flex flex-col">
      {/* Kart Başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">Mağaza Konumları</h3>
          <p className="text-sm text-gray-500">Uyumluluk durumuna göre renklendirilmiş (İzmir)</p>
        </div>
        
        {/* Lejant */}
        <div className="flex items-center gap-3 text-xs font-medium bg-gray-50 px-3 py-2 rounded-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span className="text-gray-600">Uygun</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="text-gray-600">Uyarı</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="text-gray-600">Uygunsuz</span>
          </div>
        </div>
      </div>

      {/* Harita Alanı */}
      <div className="rounded-xl overflow-hidden border border-gray-100 relative z-0 h-64 sm:h-72 md:h-80 lg:h-72 xl:h-80">
        <MapContainer 
          center={[38.4237, 27.1428]} // İzmir Merkezi
          zoom={12} // Mahalleleri görebilmek için zoom'u artırdık
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          {/* CartoDB Light Katmanı - Sade görünüm */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
          />

          {STORE_LOCATIONS.map((store) => (
            <CircleMarker
              key={store.id}
              center={[store.lat, store.lng]}
              radius={8} // Noktaları biraz daha belirgin yaptık
              pathOptions={{
                fillColor: getColor(store.status),
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 1
              }}
            >
              <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                <div className="text-center">
                    <span className="font-bold block text-sm">{store.name}</span>
                    <span className="text-xs text-gray-500">{store.city}</span>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default StoreLocationsMap;