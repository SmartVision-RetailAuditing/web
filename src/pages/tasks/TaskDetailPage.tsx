import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, MapPin, User,
  ClipboardList, Calendar, CheckCircle2, ExternalLink,
  AlertCircle, Clock, Activity
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  taskService,
  TaskDto,
  TASK_TYPE_LABELS,
  getPriorityColor,
  getStatusColor,
  getStatusLabel,
} from '../../services/tasks.service';
import { useAuth } from '../../hooks/useAuth';
import EditTaskModal from '../../components/tasks/EditTaskModal';
import DeleteConfirmModal from '../../components/tasks/DeleteConfirmModal';
import toast from 'react-hot-toast';

// ─── Map pin — priority'e göre renkli ────────────────────────────────────────
const createPriorityIcon = (priority: string) => {
  const colorClass =
    priority === 'HIGH'   ? 'bg-red-500' :
    priority === 'MEDIUM' ? 'bg-yellow-500' :
                            'bg-green-500';

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center ${colorClass}">
             <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
           </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });
};

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon, label, value,
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isSupervisor } = useAuth();
  const canManage = isAdmin || isSupervisor;

  const [task, setTask]                   = useState<TaskDto | null>(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState('');
  const [isEditModalOpen, setEditModal]   = useState(false);
  const [isDeleteModalOpen, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting]       = useState(false);

  useEffect(() => {
    if (id) fetchTask(id);
  }, [id]);

  const fetchTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      setError('');
      const data = await taskService.getTaskById(taskId);
      setTask(data);
    } catch (err: any) {
      setError(err.message || 'Task detayı yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!task) return;
    setIsDeleting(true);
    try {
      await taskService.deleteTask(task.id);
      setDeleteModal(false);
      toast.success('Task başarıyla silindi!');
      navigate('/tasks', { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Silme işlemi başarısız oldu.');
      setDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Loading / Error states ──────────────────────────────────────────────────
  if (isLoading) return (
    <div className="p-12 text-center text-gray-400 text-sm">Loading task details...</div>
  );

  if (error || !task) return (
    <div className="p-12 text-center text-red-500 text-sm">{error || 'Task not found.'}</div>
  );

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  return (
    <div className="space-y-6">

      {/* Modals */}
      {canManage && (
        <>
          <EditTaskModal
            isOpen={isEditModalOpen}
            onClose={() => setEditModal(false)}
            task={task}
            onSuccess={() => fetchTask(id as string)}
          />
          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setDeleteModal(false)}
            onConfirm={confirmDelete}
            itemName={`Task #${task.id} — ${task.storeName}`}
            isLoading={isDeleting}
          />
        </>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tasks')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Task <span className="text-gray-400 font-normal">#{task.id}</span>
            </h1>
            <p className="text-gray-500 flex items-center gap-1.5 text-sm mt-0.5">
              <span className="font-medium text-blue-600">{task.storeName}</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">{TASK_TYPE_LABELS[task.taskType] ?? task.taskType}</span>
            </p>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Edit2 size={15} />
              Edit Task
            </button>
            <button
              onClick={() => setDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Overdue banner */}
      {isOverdue && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>This task is <strong>overdue</strong>. Due date was {new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.</span>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column: Hero card + Audit link ── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Hero Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <ClipboardList size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Task Details</h3>
            </div>

            <InfoRow
              icon={<Activity size={15} />}
              label="Status"
              value={
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              }
            />

            <InfoRow
              icon={<AlertCircle size={15} />}
              label="Priority"
              value={
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                </span>
              }
            />

            <InfoRow
              icon={<ClipboardList size={15} />}
              label="Task Type"
              value={
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">
                  {TASK_TYPE_LABELS[task.taskType] ?? task.taskType}
                </span>
              }
            />

            <InfoRow
              icon={<Calendar size={15} />}
              label="Due Date"
              value={
                <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                  {new Date(task.dueDate).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </span>
              }
            />

            {task.completedAt && (
              <InfoRow
                icon={<CheckCircle2 size={15} />}
                label="Completed At"
                value={new Date(task.completedAt).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              />
            )}

            {task.description && (
              <InfoRow
                icon={<Clock size={15} />}
                label="Description"
                value={<span className="text-gray-600">{task.description}</span>}
              />
            )}
          </div>

          {/* Assignee Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <User size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Assignee</h3>
            </div>

            {task.assigneeId && task.assigneeName ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-base font-bold shrink-0">
                  {task.assigneeName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{task.assigneeName}</div>
                  <div className="text-xs text-gray-400">Field Worker</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No assignee yet.</p>
            )}
          </div>

          {/* Linked Audit Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Linked Audit</h3>
            </div>

            {task.auditId ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  This task has a completed audit record.
                </p>
                <button
                  onClick={() => navigate(`/audits/${task.auditId}`)}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  View Audit #{task.auditId}
                  <ExternalLink size={14} />
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No audit linked yet. Audit will be created when the task is completed.
              </p>
            )}
          </div>
        </div>

        {/* ── Right column: Store info + Map ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Store Info Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                <MapPin size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Store Location</h3>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{task.storeName}</p>
                <p className="text-sm text-gray-500 mt-0.5">{task.storeAddress}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {task.latitude}, {task.longitude}
                </p>
              </div>
              <button
                onClick={() => navigate(`/stores/${task.storeId}`)}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
              >
                View Store <ExternalLink size={12} />
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Map</h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  task.priority === 'HIGH'   ? 'bg-red-500' :
                  task.priority === 'MEDIUM' ? 'bg-yellow-500' :
                                              'bg-green-500'
                }`} />
                <span>{task.priority.charAt(0) + task.priority.slice(1).toLowerCase()} Priority</span>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ height: '380px' }}>
              <MapContainer
                center={[task.latitude, task.longitude]}
                zoom={14}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <Marker
                  position={[task.latitude, task.longitude]}
                  icon={createPriorityIcon(task.priority)}
                >
                  <Popup className="custom-popup">
                    <div className="min-w-[180px]">
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{task.storeName}</h3>
                      <p className="text-xs text-gray-500 mb-3 truncate">{task.storeAddress}</p>
                      <button
                        onClick={() => navigate(`/stores/${task.storeId}`)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg transition-colors"
                      >
                        View Store <ExternalLink size={12} />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;