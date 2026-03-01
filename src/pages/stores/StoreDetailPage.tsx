import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, Activity, Edit2, Trash2 } from 'lucide-react';
import { storeService, StoreDto } from '../../services/stores.service';
import EditStoreModal from '../../components/stores/EditStoreModal';
import DeleteConfirmModal from '../../components/stores/DeleteConfirmModal'; // 2. Modal Import
import toast from 'react-hot-toast';


const StoreDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [store, setStore] = useState<StoreDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Silme Modalı Stateleri
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rol Kontrolü (Sadece Admin Silebilir/Güncelleyebilir)
  const userRole = localStorage.getItem('smartvision_role'); 
  const isAdmin = userRole === 'ADMIN' || userRole === 'Admin';

  useEffect(() => {
    if (id) fetchStoreDetail(id);
  }, [id]);

  const fetchStoreDetail = async (storeId: string) => {
    try {
      setIsLoading(true);
      const data = await storeService.getStoreById(storeId);
      setStore(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /// GÜNCELLENEN SİLME FONKSİYONU
  const confirmDelete = async () => {
    if (!store) return;
    
    setIsDeleting(true);
    try {
      await storeService.deleteStore(store.id);
      
      // Önce modalı kapatıyoruz
      setIsDeleteModalOpen(false);
      
      // Bildirimi fırlatıyoruz (import edilmediğinde tam burada kod çöküyordu)
      toast.success(`${store.name} başarıyla silindi!`);
      
      // Listeye yönlendiriyoruz. 
      // DİKKAT: replace: true kullandık. Bu sayede kullanıcı tarayıcıda 
      // "Geri" tuşuna basarsa silinmiş olan detay sayfasına değil, bir önceki sayfaya gider.
      navigate('/stores', { replace: true });
      
    } catch (err: any) {
      toast.error(err.message || 'Silme işlemi başarısız oldu.');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading details...</div>;
  if (error || !store) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      
      {/* Güncelleme Modalı */}

        {/* Silme Onay Modalı */}
        {isAdmin && (
        <DeleteConfirmModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          itemName={store?.name || 'this store'}
          isLoading={isDeleting}
        />
      )}

      {isAdmin && (
        <EditStoreModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          store={store}
          onSuccess={() => fetchStoreDetail(id as string)} // Güncelleme bitince sayfadaki veriyi tazele
        />
      )}

      {/* Header, Back Button & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/stores')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
            <p className="text-gray-500 flex items-center gap-1 text-sm">
              <span className="font-medium text-blue-600">{store.chainName}</span> 
              • 
              <span>Store ID: #{store.id}</span>
            </p>
          </div>
        </div>

        {/* ADMIN AKSİYON BUTONLARI */}
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Edit2 size={16} />
              Edit Store
            </button>
            {/* Silme Butonu Artık Direkt window.confirm ÇAĞIRMIYOR, Modal Açıyor */}
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Address Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <MapPin size={24} />
            </div>
            <h3 className="font-semibold text-gray-900">Location</h3>
          </div>
          <p className="text-gray-600 text-sm mb-2">{store.address}</p>
          <p className="text-gray-500 text-xs">
            Coordinates: {store.latitude}, {store.longitude}
          </p>
          {store.region && (
             <div className="mt-3 inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
               Region: {store.region}
             </div>
          )}
        </div>

        {/* Status Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Activity size={24} />
            </div>
            <h3 className="font-semibold text-gray-900">Compliance Status</h3>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Score</span>
            <span className="text-2xl font-bold text-gray-900">{store.complianceScore}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full ${store.complianceScore >= 80 ? 'bg-green-500' : 'bg-red-500'}`} 
              style={{ width: `${store.complianceScore}%` }}
            ></div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-50 border-gray-200">
            {store.status}
          </span>
        </div>

        {/* Chain Info */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Building2 size={24} />
            </div>
            <h3 className="font-semibold text-gray-900">Chain Info</h3>
          </div>
          <p className="text-sm text-gray-600">Part of the <span className="font-semibold">{store.chainName}</span> retail chain.</p>
        </div>
      </div>
      
    </div>
  );
};

export default StoreDetailPage;