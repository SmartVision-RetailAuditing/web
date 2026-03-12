import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExternalLink, Activity } from 'lucide-react';
import { storeService, StoreDto } from '../../services/stores.service';

const createCustomIcon = (status: string) => {
  let colorClass = 'bg-gray-500';
  if (status === 'COMPLIANT'     || status === 'Compliant')     colorClass = 'bg-green-500';
  if (status === 'WARNING'       || status === 'Warning')       colorClass = 'bg-yellow-500';
  if (status === 'NON_COMPLIANT' || status === 'Non-Compliant') colorClass = 'bg-red-500';

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center ${colorClass} transition-transform hover:scale-110">
             <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
           </div>`,
    iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -12],
  });
};

const StoreLocationsMap = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const MAP_CENTER: [number, number] = [38.4237, 27.1428];

  useEffect(() => {
    storeService.getAllStores(1, 100)
      .then(data => setStores(data.data))
      .catch(err => console.error('Harita verileri çekilemedi:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Mağaza Konumları</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Canlı uyumluluk haritası (İzmir)</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Compliant</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Warning</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Action Required</span>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden flex-1 min-h-[400px] bg-gray-50 dark:bg-gray-800 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 text-gray-500 dark:text-gray-400">
            Harita yükleniyor...
          </div>
        ) : (
          <MapContainer center={MAP_CENTER} zoom={10} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {stores.map(store => (
              <Marker key={store.id} position={[store.latitude, store.longitude]} icon={createCustomIcon(store.status)}>
                <Popup className="custom-popup rounded-2xl overflow-hidden shadow-xl border-0">
                  <div className="min-w-[220px]">
                    <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">{store.name}</h3>
                    <p className="text-xs text-gray-500 mb-4 truncate">{store.address}</p>
                    <div className="flex items-center justify-between mb-4 bg-gray-50 p-2 rounded-lg">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600"><Activity size={16} />Score</div>
                      <span className={`text-base font-bold ${store.complianceScore >= 80 ? 'text-green-600' : store.complianceScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {store.complianceScore}%
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/stores/${store.id}`)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors shadow-sm"
                    >
                      View Details <ExternalLink size={14} />
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default StoreLocationsMap;