import React, { useState, useEffect, useCallback } from 'react';
import { X, UserPlus, Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { taskService, TaskDto, TASK_TYPE_LABELS, getPriorityColor } from '../../services/tasks.service';
import { userService, UserDto } from '../../services/users.service';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedTaskId?: number | null;
  preselectedTaskLabel?: string;
}

const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  isOpen, onClose, onSuccess,
  preselectedTaskId = null,
  preselectedTaskLabel = '',
}) => {
  const [step, setStep] = useState<'task' | 'worker'>(
    preselectedTaskId ? 'worker' : 'task'
  );

  const [tasks, setTasks]               = useState<TaskDto[]>([]);
  const [taskSearch, setTaskSearch]     = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);

  const [workers, setWorkers]               = useState<UserDto[]>([]);
  const [workerSearch, setWorkerSearch]     = useState('');
  const [selectedWorker, setSelectedWorker] = useState<UserDto | null>(null);
  const [workersLoading, setWorkersLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState('');

  const debouncedTaskSearch   = useDebounce(taskSearch, 400);
  const debouncedWorkerSearch = useDebounce(workerSearch, 400);

  const fetchUnassignedTasks = useCallback(async (search: string) => {
    setTasksLoading(true);
    try {
      const data = await taskService.getAllTasks(1, 50, search || undefined);
      setTasks(data.data.filter(t => !t.assigneeId || t.assigneeId === 0));
    } catch { setError('Task listesi yüklenemedi.'); }
    finally { setTasksLoading(false); }
  }, []);

  const fetchWorkers = useCallback(async (search: string) => {
    setWorkersLoading(true);
    try {
      const data = await userService.getFieldWorkers(search || undefined);
      setWorkers(data);
    } catch { setError('Field worker listesi yüklenemedi.'); }
    finally { setWorkersLoading(false); }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (preselectedTaskId) { setStep('worker'); fetchWorkers(''); }
    else { setStep('task'); fetchUnassignedTasks(''); }
  }, [isOpen]);

  useEffect(() => { if (isOpen && step === 'task')   fetchUnassignedTasks(debouncedTaskSearch);   }, [debouncedTaskSearch,   step]);
  useEffect(() => { if (isOpen && step === 'worker') fetchWorkers(debouncedWorkerSearch); }, [debouncedWorkerSearch, step]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(preselectedTaskId ? 'worker' : 'task');
    setSelectedTask(null); setSelectedWorker(null);
    setTaskSearch(''); setWorkerSearch(''); setError('');
    onClose();
  };

  const handleTaskSelect = (task: TaskDto) => {
    setSelectedTask(task); setStep('worker');
    setWorkerSearch(''); fetchWorkers('');
  };

  const handleBack = () => { setStep('task'); setSelectedWorker(null); setWorkerSearch(''); };

  const handleAssign = async () => {
    const taskId = preselectedTaskId ?? selectedTask?.id;
    if (!taskId || !selectedWorker) return;
    setIsSubmitting(true);
    try {
      await taskService.updateTask(taskId, { userId: selectedWorker.id });
      toast.success(`${selectedWorker.fullName} başarıyla atandı!`);
      handleClose(); onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Atama başarısız oldu.');
    } finally { setIsSubmitting(false); }
  };

  const activeTaskLabel = preselectedTaskLabel || selectedTask?.storeName || '';
  const activeTaskType  = selectedTask ? (TASK_TYPE_LABELS[selectedTask.taskType] ?? selectedTask.taskType) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {step === 'worker' && !preselectedTaskId && (
              <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 transition-colors p-1 -ml-1">
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Task</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-xs font-medium ${step === 'task' ? 'text-blue-600' : 'text-gray-400'}`}>
                  1. Select Task
                </span>
                <ChevronRight size={12} className="text-gray-300 dark:text-gray-600" />
                <span className={`text-xs font-medium ${step === 'worker' ? 'text-blue-600' : 'text-gray-400'}`}>
                  2. Select Worker
                </span>
              </div>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {/* STEP 1: Task Seç */}
          {step === 'task' && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Search unassigned tasks..."
                  value={taskSearch} onChange={e => setTaskSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1.5">
                {tasksLoading ? (
                  <p className="text-center text-gray-400 text-sm py-6">Loading...</p>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm font-medium">No unassigned tasks</p>
                    <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">All tasks have been assigned.</p>
                  </div>
                ) : tasks.map(task => (
                  <button key={task.id} onClick={() => handleTaskSelect(task)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.storeName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{TASK_TYPE_LABELS[task.taskType] ?? task.taskType}</span>
                        <span className="text-gray-200 dark:text-gray-700">•</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-400 shrink-0 ml-2 transition-colors" />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* STEP 2: Worker Seç */}
          {step === 'worker' && (
            <>
              {activeTaskLabel && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-blue-500 font-medium">Selected Task</p>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 truncate">{activeTaskLabel}</p>
                    {activeTaskType && <p className="text-xs text-blue-400">{activeTaskType}</p>}
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                  Select Field Worker <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" placeholder="Search by name or email..."
                    value={workerSearch} onChange={e => setWorkerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1.5">
                {workersLoading ? (
                  <p className="text-center text-gray-400 text-sm py-6">Loading...</p>
                ) : workers.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-6">No field workers found.</p>
                ) : workers.map(worker => (
                  <button key={worker.id} onClick={() => setSelectedWorker(worker)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                      selectedWorker?.id === worker.id
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      selectedWorker?.id === worker.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {worker.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{worker.fullName}</p>
                      <p className="text-xs text-gray-400 truncate">{worker.email}</p>
                    </div>
                    {selectedWorker?.id === worker.id && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              {selectedWorker && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30 text-sm text-blue-700 dark:text-blue-300">
                  <UserPlus size={16} className="shrink-0" />
                  <span><strong>{selectedWorker.fullName}</strong> will be assigned to this task.</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          {step === 'worker' && (
            <button onClick={handleAssign} disabled={!selectedWorker || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <UserPlus size={15} />
              {isSubmitting ? 'Assigning...' : 'Assign'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignTaskModal;