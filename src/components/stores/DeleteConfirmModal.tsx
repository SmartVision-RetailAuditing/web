import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isLoading: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, onClose, onConfirm, itemName, isLoading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Kapat Butonu */}
        <button onClick={onClose} disabled={isLoading} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>

        <div className="p-6 sm:p-8 text-center">
          {/* Uyarı İkonu */}
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-6">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">Are you absolutely sure?</h2>
          <p className="text-gray-500 text-sm mb-6">
            You are about to permanently delete <span className="font-semibold text-gray-900">"{itemName}"</span>. 
            This action cannot be undone and will remove all data associated with this store.
          </p>

          {/* Aksiyon Butonları */}
          <div className="flex items-center justify-center gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={onConfirm}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center gap-2"
            >
              {isLoading ? 'Deleting...' : 'Yes, delete it'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;