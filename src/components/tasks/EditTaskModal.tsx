import React, { useState, useEffect, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import {
  taskService, TaskDto, UpdateTaskDto,
  TASK_TYPE_OPTIONS, PRIORITY_OPTIONS, STATUS_OPTIONS,
} from '../../services/tasks.service';
import { userService, UserDto } from '../../services/users.service';
import { storeService, StoreDto } from '../../services/stores.service';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: TaskDto;
}

const taskTypeToIndex = (val: string) =>
  ['SHELF_AUDIT', 'PRICE_CHECK', 'PANORAMA', 'PLANOGRAM_COMPLIANCE'].indexOf(val);
const priorityToIndex = (val: string) => ['LOW', 'MEDIUM', 'HIGH'].indexOf(val);
const statusToIndex   = (val: string) => ['PENDING', 'IN_PROGRESS', 'COMPLETED'].indexOf(val);

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, onSuccess, task }) => {
  const [formData, setFormData] = useState({
    taskType: '', priority: '', status: '', dueDate: '', description: '',
  });

  // Store dropdown
  const [storeSearch, setStoreSearch]     = useState('');
  const [stores, setStores]               = useState<StoreDto[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreDto | null>(null);
  const [storeOpen, setStoreOpen]         = useState(false);
  const [storeFetching, setStoreFetching] = useState(false);

  // Worker dropdown
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

  // Modal açılınca mevcut task ile formu doldur
  useEffect(() => {
    if (!task || !isOpen) return;
    setFormData({
      taskType:    String(taskTypeToIndex(task.taskType)),
      priority:    String(priorityToIndex(task.priority)),
      status:      String(statusToIndex(task.status)),
      dueDate:     task.dueDate.split('T')[0],
      description: task.description ?? '',
    });
    // Mevcut store ve worker'ı selected olarak set et
    setSelectedStore({ id: task.storeId, name: task.storeName, address: task.storeAddress } as StoreDto);
    setSelectedWorker(
      task.assigneeId
        ? { id: task.assigneeId, fullName: task.assigneeName, email: '' } as UserDto
        : null
    );
    setError('');
    fetchStores('');
    fetchWorkers('');
  }, [task, isOpen, fetchStores, fetchWorkers]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleClose = () => { setError(''); setStoreOpen(false); setWorkerOpen(false); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) { setError('Lütfen bir mağaza seçin.'); return; }
    setError('');
    setIsLoading(true);

    try {
      const payload: UpdateTaskDto = {
        storeId:     selectedStore.id,
        taskType:    parseInt(formData.taskType),
        priority:    parseInt(formData.priority),
        status:      parseInt(formData.status),
        dueDate:     new Date(formData.dueDate).toISOString(),
        description: formData.description || undefined,
        ...(selectedWorker && { userId: selectedWorker.id }),
      };

      await taskService.updateTask(task.id, payload);
      toast.success('Task başarıyla güncellendi!');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const msg = err.message || 'Task güncellenirken bir hata oluştu.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Dropdown bileşeni — tekrar kullanım için
  const SearchableDropdown = ({
    label, required = false, placeholder, selected, selectedLabel,
    isOpen: open, onToggle, search, onSearch, fetching, children,
  }: {
    label: string; required?: boolean; placeholder: string;
    selected: boolean; selectedLabel: string;
    isOpen: boolean; onToggle: () => void;
    search: string; onSearch: (v: string) => void;
    fetching: boolean; children: React.ReactNode;
  }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div
          onClick={onToggle}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer flex items-center justify-between bg-white hover:border-blue-400 transition-colors"
        >
          <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
            {selected ? selectedLabel : placeholder}
          </span>
          <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
        </div>
        {open && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus type="text" placeholder="Search..." value={search}
                  onChange={e => onSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="max-h-44 overflow-y-auto">
              {fetching
                ? <div className="p-3 text-center text-xs text-gray-400">Loading...</div>
                : children}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Task</h2>
            <p className="text-xs text-gray-400 mt-0.5">{task.storeName} — #{task.id}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Store Dropdown */}
            <div className="md:col-span-2">
              <SearchableDropdown
                label="Store" required placeholder="Select a store..."
                selected={!!selectedStore} selectedLabel={selectedStore?.name ?? ''}
                isOpen={storeOpen} onToggle={() => setStoreOpen(v => !v)}
                search={storeSearch} onSearch={setStoreSearch}
                fetching={storeFetching}
              >
                {stores.length === 0
                  ? <div className="p-3 text-center text-xs text-gray-400">No stores found.</div>
                  : stores.map(store => (
                    <button
                      key={store.id} type="button"
                      onClick={() => { setSelectedStore(store); setStoreOpen(false); setStoreSearch(''); }}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="font-medium text-gray-900">{store.name}</div>
                      <div className="text-xs text-gray-400 truncate">{store.address}</div>
                    </button>
                  ))}
              </SearchableDropdown>
            </div>

            {/* Worker Dropdown */}
            <div className="md:col-span-2">
              <SearchableDropdown
                label="Assignee" placeholder="Select a field worker..."
                selected={!!selectedWorker} selectedLabel={selectedWorker?.fullName ?? ''}
                isOpen={workerOpen} onToggle={() => setWorkerOpen(v => !v)}
                search={workerSearch} onSearch={setWorkerSearch}
                fetching={workerFetching}
              >
                {workers.length === 0
                  ? <div className="p-3 text-center text-xs text-gray-400">No workers found.</div>
                  : workers.map(worker => (
                    <button
                      key={worker.id} type="button"
                      onClick={() => { setSelectedWorker(worker); setWorkerOpen(false); setWorkerSearch(''); }}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {worker.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{worker.fullName}</div>
                          <div className="text-xs text-gray-400">{worker.email}</div>
                        </div>
                      </div>
                    </button>
                  ))}
              </SearchableDropdown>
            </div>

            {/* Task Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Task Type <span className="text-red-500">*</span></label>
              <select required name="taskType" value={formData.taskType} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                {TASK_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Priority <span className="text-red-500">*</span></label>
              <select required name="priority" value={formData.priority} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
              <select required name="status" value={formData.status} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Due Date <span className="text-red-500">*</span></label>
              <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Description <span className="ml-1.5 text-xs text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                rows={3} placeholder="Task details, special instructions..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70">
              {isLoading ? 'Updating...' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;