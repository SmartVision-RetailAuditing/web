import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, Activity, Edit2, Trash2, ClipboardList } from 'lucide-react';
import { storeService, StoreDto } from '../../services/stores.service';
import { useAuth } from '../../hooks/useAuth';
import EditStoreModal from '../../components/stores/EditStoreModal';
import DeleteConfirmModal from '../../components/stores/DeleteConfirmModal';
import toast from 'react-hot-toast';

const StoreDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [store, setStore] = useState<StoreDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { if (id) fetchStoreDetail(id); }, [id]);

  const fetchStoreDetail = async (storeId: string) => {
    try {
      setIsLoading(true); setError('');
      setStore(await storeService.getStoreById(storeId));
    } catch (err: any) { setError(err.message || 'Mağaza detayı yüklenemedi.'); }
    finally { setIsLoading(false); }
  };

  const confirmDelete = async () => {
    if (!store) return;
    setIsDeleting(true);
    try {
      await storeService.deleteStore(store.id);
      setIsDeleteModalOpen(false);
      toast.success(`${store.name} başarıyla silindi!`);
      navigate('/stores', { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Silme işlemi başarısız oldu.');
      setIsDeleteModalOpen(false);
    } finally { setIsDeleting(false); }
  };

  const getComplianceColor = (score: number) => score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Compliant':     return 'bg-green-50 text-green-700 border-green-200';
      case 'Warning':       return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Non-Compliant': return 'bg-red-50 text-red-700 border-red-200';
      default:              return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  if (isLoading) return <div className="p-12 text-center text-gray-400 text-sm">Loading store details...</div>;
  if (error || !store) return <div className="p-12 text-center text-red-500 text-sm">{error || 'Store not found.'}</div>;

  return (
    <div className="space-y-6">
      <EditStoreModal isOpen={isAdmin && isEditModalOpen} onClose={() => setIsEditModalOpen(false)} store={store} onSuccess={() => fetchStoreDetail(id as string)} />
      <DeleteConfirmModal isOpen={isAdmin && isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} itemName={store.name} isLoading={isDeleting} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/stores')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{store.name}</h1>
            <p className="text-gray-500 flex items-center gap-1.5 text-sm mt-0.5">
              <span className="font-medium text-blue-600">{store.chainName}</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-gray-400">Store ID: #{store.id}</span>
            </p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
              <Edit2 size={15} />Edit Store
            </button>
            <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shadow-sm">
              <Trash2 size={15} />Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><MapPin size={20} /></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Location</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{store.address}</p>
          <p className="text-gray-400 text-xs">{store.latitude}, {store.longitude}</p>
          {store.region && <div className="mt-3 inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-md">{store.region}</div>}
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><Activity size={20} /></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Compliance</h3>
          </div>
          <div className="flex items-end justify-between mb-3">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Score</span>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{store.complianceScore}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div className={`h-2 rounded-full transition-all ${getComplianceColor(store.complianceScore)}`} style={{ width: `${Math.min(store.complianceScore, 100)}%` }} />
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(store.status)}`}>{store.status}</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Building2 size={20} /></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Chain Info</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Part of the <span className="font-semibold text-gray-900 dark:text-white">{store.chainName}</span> retail chain.
          </p>
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 rounded-lg"><ClipboardList size={18} /></div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{store.auditCount}</div>
              <div className="text-xs text-gray-400">Total audit{store.auditCount !== 1 ? 's' : ''} completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailPage;