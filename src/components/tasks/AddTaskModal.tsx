import React, { useState, useEffect, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { taskService, TASK_TYPE_OPTIONS, PRIORITY_OPTIONS } from '../../services/tasks.service';
import type { CreateTaskDto } from '../../services/tasks.service';
import { userService } from '../../services/users.service';
import type { UserDto } from '../../services/users.service';
import { storeService } from '../../services/stores.service';
import type { StoreDto } from '../../services/stores.service';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY_FORM = {
  taskType: '',
  priority: '',
  dueDate:  '',
  description: '',
};

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none";
const labelClass = "text-sm font-medium text-gray-700 dark:text-gray-300";

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [storeSearch, setStoreSearch]       = useState('');
  const [stores, setStores]                 = useState<StoreDto[]>([]);
  const [selectedStore, setSelectedStore]   = useState<StoreDto | null>(null);
  const [storeOpen, setStoreOpen]           = useState(false);
  const [storeFetching, setStoreFetching]   = useState(false);

  const [workerSearch, setWorkerSearch]     = useState('');
  const [workers, setWorkers]               = useState<UserDto[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<UserDto | null>(null);
  const [workerOpen, setWorkerOpen]         = useState(false);
  const [workerFetching, setWorkerFetching] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const debouncedStore  = useDebounce(storeSearch, 400);
  const debouncedWorker = useDebounce(workerSearch, 400);

  const fetchStores = useCallback(async (search: string) => {
    setStoreFetching(true);
    try {
      const data = await storeService.getAllStores(1, 20, search || undefined);
      setStores(data.data);
    } catch { } finally { setStoreFetching(false); }
  }, []);

  const fetchWorkers = useCallback(async (search: string) => {
    setWorkerFetching(true);
    try {
      const data = await userService.getFieldWorkers(search || undefined);
      setWorkers(data);
    } catch { } finally { setWorkerFetching(false); }
  }, []);

  useEffect(() => { if (isOpen && storeOpen)  fetchStores(debouncedStore);  }, [debouncedStore,  storeOpen,  isOpen, fetchStores]);
  useEffect(() => { if (isOpen && workerOpen) fetchWorkers(debouncedWorker); }, [debouncedWorker, workerOpen, isOpen, fetchWorkers]);

  useEffect(() => {
    if (!isOpen) return;
    fetchStores('');
    fetchWorkers('');
  }, [isOpen, fetchStores, fetchWorkers]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleClose = () => {
    setFormData(EMPTY_FORM);
    setSelectedStore(null);
    setSelectedWorker(null);
    setStoreSearch('');
    setWorkerSearch('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) { setError('Lütfen bir mağaza seçin.'); return; }
    setError('');
    setIsLoading(true);
    try {
      const payload: CreateTaskDto = {
        storeId:  selectedStore.id,
        taskType: parseInt(formData.taskType),
        priority: parseInt(formData.priority),
        dueDate:  new Date(formData.dueDate).toISOString(),
        ...(selectedWorker       && { userId:      selectedWorker.id }),
        ...(formData.description && { description: formData.description }),
      };
      await taskService.createTask(payload);
      toast.success('Task başarıyla oluşturuldu!');
      handleClose();
      onSuccess();
    } catch (err: any) {
      const msg = err.message || 'Task oluşturulurken bir hata oluştu.';
      setError(msg);
      toast.error(msg);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Task</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Store Dropdown */}
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>Store <span className="text-red-500">*</span></label>
              <div className="relative">
                <div
                  onClick={() => setStoreOpen(v => !v)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm cursor-pointer flex items-center justify-between bg-white dark:bg-gray-800 hover:border-blue-400 transition-colors"
                >
                  <span className={selectedStore ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
                    {selectedStore ? selectedStore.name : 'Select a store...'}
                  </span>
                  <span className="text-gray-400 text-xs">{storeOpen ? '▲' : '▼'}</span>
                </div>
                {storeOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          autoFocus type="text" placeholder="Search store..."
                          value={storeSearch} onChange={e => setStoreSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="max-h-44 overflow-y-auto">
                      {storeFetching ? (
                        <div className="p-3 text-center text-xs text-gray-400">Loading...</div>
                      ) : stores.length === 0 ? (
                        <div className="p-3 text-center text-xs text-gray-400">No stores found.</div>
                      ) : stores.map(store => (
                        <button key={store.id} type="button"
                          onClick={() => { setSelectedStore(store); setStoreOpen(false); setStoreSearch(''); }}
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{store.name}</div>
                          <div className="text-xs text-gray-400 truncate">{store.address}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Assignee Dropdown */}
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>
                Assignee
                <span className="ml-1.5 text-xs text-gray-400 font-normal">(optional — assign later)</span>
              </label>
              <div className="relative">
                <div
                  onClick={() => setWorkerOpen(v => !v)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm cursor-pointer flex items-center justify-between bg-white dark:bg-gray-800 hover:border-blue-400 transition-colors"
                >
                  <span className={selectedWorker ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
                    {selectedWorker ? selectedWorker.fullName : 'Select a field worker...'}
                  </span>
                  <span className="text-gray-400 text-xs">{workerOpen ? '▲' : '▼'}</span>
                </div>
                {workerOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          autoFocus type="text" placeholder="Search worker..."
                          value={workerSearch} onChange={e => setWorkerSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="max-h-44 overflow-y-auto">
                      {workerFetching ? (
                        <div className="p-3 text-center text-xs text-gray-400">Loading...</div>
                      ) : workers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-gray-400">No workers found.</div>
                      ) : workers.map(worker => (
                        <button key={worker.id} type="button"
                          onClick={() => { setSelectedWorker(worker); setWorkerOpen(false); setWorkerSearch(''); }}
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                              {worker.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{worker.fullName}</div>
                              <div className="text-xs text-gray-400">{worker.email}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Task Type */}
            <div className="space-y-1.5">
              <label className={labelClass}>Task Type <span className="text-red-500">*</span></label>
              <select required name="taskType" value={formData.taskType} onChange={handleChange} className={inputClass}>
                <option value="">Select type...</option>
                {TASK_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className={labelClass}>Priority <span className="text-red-500">*</span></label>
              <select required name="priority" value={formData.priority} onChange={handleChange} className={inputClass}>
                <option value="">Select priority...</option>
                {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>Due Date <span className="text-red-500">*</span></label>
              <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={inputClass} />
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>
                Description
                <span className="ml-1.5 text-xs text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                rows={3} placeholder="Task details, special instructions..."
                className={`${inputClass} resize-none`} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70">
              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;