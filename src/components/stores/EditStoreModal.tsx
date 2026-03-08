import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { storeService, StoreDto, UpdateStoreDto } from '../../services/stores.service';
import toast from 'react-hot-toast';

interface EditStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  store: StoreDto;
}

const EditStoreModal: React.FC<EditStoreModalProps> = ({ isOpen, onClose, onSuccess, store }) => {
  const [formData, setFormData] = useState({
    name: '',
    chainName: '',
    region: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // store değişince (modal her açılışta) formu doldur
  useEffect(() => {
    if (store && isOpen) {
      setFormData({
        name: store.name,
        chainName: store.chainName,
        region: store.region ?? '',
        address: store.address,
        latitude: String(store.latitude),
        longitude: String(store.longitude),
      });
      setError('');
    }
  }, [store, isOpen]); // isOpen dependency eklendi — modal her açılışta formu sıfırlar

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload: UpdateStoreDto = {
        name: formData.name,
        chainName: formData.chainName,
        region: formData.region || undefined,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };

      await storeService.updateStore(store.id, payload);
      toast.success('Mağaza başarıyla güncellendi!');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Mağaza güncellenirken bir hata oluştu.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Edit Store</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Store Name <span className="text-red-500">*</span>
              </label>
              <input
                required type="text" name="name" value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Chain Name <span className="text-red-500">*</span>
              </label>
              <input
                required type="text" name="chainName" value={formData.chainName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Region</label>
              <input
                type="text" name="region" value={formData.region}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                required name="address" value={formData.address}
                onChange={handleChange} rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Latitude <span className="text-red-500">*</span>
              </label>
              <input
                required type="number" step="any" name="latitude" value={formData.latitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Longitude <span className="text-red-500">*</span>
              </label>
              <input
                required type="number" step="any" name="longitude" value={formData.longitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70"
            >
              {isLoading ? 'Updating...' : 'Update Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStoreModal;