import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, MapPin, 
  TrendingUp, TrendingDown, Store as StoreIcon,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { storeService, StoreDto } from '../../services/stores.service';
import AddStoreModal from '../../components/stores/AddStoreModal';

const StoresPage = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- GERÇEK BACKEND SAYFALAMASI ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Sonraki sayfa var mı kontrolü (Eğer backend'den 10'dan az veri gelirse son sayfadayız demektir)
  const [hasMore, setHasMore] = useState(true); 

  const userRole = localStorage.getItem('smartvision_role'); 
  const isAdmin = userRole === 'ADMIN' || userRole === 'Admin';

  // Sayfa numarası (currentPage) her değiştiğinde backend'e yeni istek atarız!
  useEffect(() => {
    fetchStores(currentPage);
  }, [currentPage]);

  const fetchStores = async (page: number) => {
    try {
      setIsLoading(true);
      
      // Senin yazdığın backend endpoint'ine page ve size parametrelerini gönderiyoruz
      const data = await storeService.getAllStores(page, ITEMS_PER_PAGE); 
      
      setStores(data);
      
      // Eğer gelen veri sayısı 10'dan azsa, demek ki son sayfadayız. "Next" butonunu kapat.
      setHasMore(data.length === ITEMS_PER_PAGE);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Frontend Arama Filtresi (Ekranda görünen 10 veri içinde arar. 
  // İleride arama işlemini de backend'e taşıyabilirsin: GetStores(page, size, searchKeyword))
  const filteredStores = stores.filter(store => {
    const searchLower = searchTerm.toLowerCase();
    return (
      store.name.toLowerCase().includes(searchLower) || 
      store.chainName.toLowerCase().includes(searchLower) ||
      store.address.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant': return 'bg-green-50 text-green-700 border-green-200';
      case 'Warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Non-Compliant': case 'NonCompliant': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      
      {isAdmin && (
        <AddStoreModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={() => fetchStores(currentPage)} // Ekledikten sonra mevcut sayfayı yenile
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-500">Manage retail locations</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add Store
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search in current page..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading stores from server...</div>
        ) : filteredStores.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No stores found on this page.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">STORE</th>
                    <th className="px-6 py-4">LOCATION</th>
                    <th className="px-6 py-4">COMPLIANCE</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50 group transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <StoreIcon size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{store.name}</div>
                            <div className="text-xs text-gray-500">{store.chainName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin size={14} />
                          <span className="truncate max-w-[200px]" title={store.address}>{store.address}</span>
                        </div>
                        {store.region && <div className="text-xs text-gray-400 pl-5">{store.region}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold">{store.complianceScore}%</span>
                            {store.complianceScore >= 80 ? <TrendingUp size={14} className="text-green-500"/> : <TrendingDown size={14} className="text-red-500"/>}
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${getComplianceColor(store.complianceScore)}`} style={{width: `${store.complianceScore}%`}}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(store.status)}`}>
                          {store.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/stores/${store.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* GERÇEK BACKEND SAYFALAMA KONTROLLERİ */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-sm text-gray-500">
                Page <span className="font-medium text-gray-900">{currentPage}</span>
              </span>
              
              <div className="flex items-center gap-2">
                {/* Önceki Sayfa */}
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                {/* Sonraki Sayfa */}
                <button 
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!hasMore || isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StoresPage;