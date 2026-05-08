import React, { useState } from 'react';
import { X } from 'lucide-react';
import { storeService } from '../../services/stores.service';
//import type { CreateStoreDto } from '../../services/stores.service';
import toast from 'react-hot-toast';

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; }

const EMPTY_FORM = { name: '', chainName: '', region: '', address: '', latitude: '', longitude: '' };

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none";
const labelClass = "text-sm font-medium text-gray-700 dark:text-gray-300";

const AddStoreModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    try {
      await storeService.createStore({ name: formData.name, chainName: formData.chainName, region: formData.region || undefined, address: formData.address, latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude) });
      toast.success('Mağaza başarıyla eklendi!');
      setFormData(EMPTY_FORM); onSuccess(); onClose();
    } catch (err: any) { const msg = err.message || 'Hata oluştu.'; setError(msg); toast.error(msg); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Store</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>Store Name <span className="text-red-500">*</span></label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Migros MM Konak" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Chain Name <span className="text-red-500">*</span></label>
              <input required type="text" name="chainName" value={formData.chainName} onChange={handleChange} placeholder="e.g. Migros" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Region</label>
              <input type="text" name="region" value={formData.region} onChange={handleChange} placeholder="e.g. Ege" className={inputClass} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>Address <span className="text-red-500">*</span></label>
              <textarea required name="address" value={formData.address} onChange={handleChange} rows={2} placeholder="Full address" className={`${inputClass} resize-none`} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Latitude <span className="text-red-500">*</span></label>
              <input required type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="38.4237" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Longitude <span className="text-red-500">*</span></label>
              <input required type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="27.1428" className={inputClass} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70">{isLoading ? 'Saving...' : 'Save Store'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStoreModal;