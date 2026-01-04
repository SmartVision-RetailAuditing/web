import React from 'react';
import { MapPin, Clock, ChevronRight } from 'lucide-react';

// 1. Tip Tanımları
interface FlaggedStore {
  id: string;
  store: string;
  location: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  time: string;
}

// 2. Mock Data (İzmir ve Gerçekçi Sorunlar)
const FLAGGED_STORES: FlaggedStore[] = [
  {
    id: '1',
    store: 'A101 - Bornova Merkez',
    location: 'Bornova, İzmir',
    issue: 'Pınar milk products missing on shelf', // Brand X missing
    severity: 'high',
    time: '10 minutes ago',
  },
  {
    id: '2',
    store: 'BİM - Karşıyaka Çarşı',
    location: 'Karşıyaka, İzmir',
    issue: 'Incorrect shelf arrangement (Planogram)', // Incorrect shelf placement
    severity: 'medium',
    time: '45 minutes ago',
  },
  {
    id: '3',
    store: 'Migros Jet - Bostanlı',
    location: 'Karşıyaka, İzmir',
    issue: 'Low shelf share (%12)', // Low shelf share
    severity: 'high',
    time: '1 hour ago',
  },
  {
    id: '4',
    store: 'Şok - Alsancak',
    location: 'Konak, İzmir',
    issue: 'Price tag is unreadable',
    severity: 'low',
    time: '2 hours ago',
  },
];

// 3. Bileşen Kodları
const FlaggedStoresList = () => {
  
  // Önem derecesine göre renk belirleme
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 text-red-700 border-red-100';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'low': return 'bg-gray-50 text-gray-700 border-gray-100';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col">
      {/* Başlık */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Recently Flagged</h3>
        <p className="text-sm text-gray-500">Attention needed</p>
      </div>

      {/* Liste */}
      <div className="overflow-y-auto p-4 space-y-3 max-h-64 sm:max-h-72 md:max-h-80 lg:max-h-72 xl:max-h-80">
        {FLAGGED_STORES.map((item) => (
          <div 
            key={item.id} 
            className="group p-3 rounded-lg border border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 transition-all cursor-pointer"
          >
            {/* Üst Kısım: Mağaza ve Badge */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                  {item.store}
                </h4>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <MapPin size={12} />
                  {item.location}
                </div>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getSeverityColor(item.severity)}`}>
                {item.severity}
              </span>
            </div>

            {/* Orta Kısım: Sorun Açıklaması */}
            <p className="text-xs text-gray-700 font-medium bg-gray-50 p-2 rounded border border-gray-100 group-hover:bg-white transition-colors">
              {item.issue}
            </p>

            {/* Alt Kısım: Zaman ve Ok İkonu */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={12} />
                {item.time}
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
      
      {/* View All Linki */}
      <div className="p-3 border-t border-gray-100 text-center">
        <button className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
          View All Issues
        </button>
      </div>
    </div>
  );
};

export default FlaggedStoresList;