import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, UserPlus,
  ClipboardList, Clock, Activity, CheckCircle2,
  ChevronLeft, ChevronRight, AlertCircle,
  Filter, User
} from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import {
  TASK_TYPE_LABELS, TASK_TYPE_OPTIONS, PRIORITY_OPTIONS,
  getPriorityColor, getStatusColor, getStatusLabel,
} from '../../services/tasks.service';
import AddTaskModal from '../../components/tasks/AddTaskModal';
import AssignTaskModal from '../../components/tasks/AssignTaskModal';

const STATUS_TABS = [
  { label: 'All',         value: '' },
  { label: 'Pending',     value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed',   value: 'COMPLETED' },
  { label: 'Unassigned',  value: 'UNASSIGNED' },
];

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  sub: string;
  value: number | string;
  color: string;
  darkColor: string;
  loading: boolean;
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, sub, value, color, darkColor, loading, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 ${onClick ? 'cursor-pointer hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-md transition-all' : ''}`}
  >
    <div className={`p-3 rounded-xl ${color} ${darkColor}`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{sub}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
        {loading ? <span className="text-gray-300 dark:text-gray-600 animate-pulse">—</span> : value}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </div>
);

const TasksPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isSupervisor } = useAuth();
  const canManage = isAdmin || isSupervisor;

  const {
    tasks, totalCount, totalPages, currentPage, setCurrentPage,
    isLoading, error, searchTerm, setSearchTerm,
    statusFilter, setStatusFilter, priorityFilter, setPriorityFilter,
    taskTypeFilter, setTaskTypeFilter, stats, statsLoading, refresh,
  } = useTasks();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assignTask, setAssignTask] = useState<{ id: number; storeName: string } | null | undefined>(undefined);

  return (
    <div className="space-y-6">

      {canManage && (
        <>
          <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={refresh} />
          <AssignTaskModal
            isOpen={assignTask !== undefined}
            preselectedTaskId={assignTask?.id || null}
            preselectedTaskLabel={assignTask?.storeName ?? ''}
            onClose={() => setAssignTask(undefined)}
            onSuccess={refresh}
          />
        </>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {totalCount > 0 ? `${totalCount} task${totalCount > 1 ? 's' : ''}` : 'Manage field assignments'}
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <button onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium">
              <Plus size={16} />Create Task
            </button>
            <button onClick={() => setAssignTask(null)}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-sm font-medium">
              <UserPlus size={16} />Assign Task
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard icon={<ClipboardList size={20} className="text-blue-600" />} label="Total Active" sub="Active assignments" value={stats?.totalActive ?? 0} color="bg-blue-50" darkColor="dark:bg-blue-900/30" loading={statsLoading} />
        <KpiCard icon={<Clock size={20} className="text-yellow-600" />} label="Pending" sub="Need assignment" value={stats?.pending ?? 0} color="bg-yellow-50" darkColor="dark:bg-yellow-900/30" loading={statsLoading} />
        <KpiCard icon={<Activity size={20} className="text-purple-600" />} label="In Progress" sub="Currently active" value={stats?.inProgress ?? 0} color="bg-purple-50" darkColor="dark:bg-purple-900/30" loading={statsLoading} />
        <KpiCard icon={<CheckCircle2 size={20} className="text-green-600" />} label="Completed This Week" sub="Successfully done" value={stats?.completedThisWeek ?? 0} color="bg-green-50" darkColor="dark:bg-green-900/30" loading={statsLoading} />
        <KpiCard icon={<User size={20} className="text-orange-600" />} label="Unassigned" sub="Need assignment" value={stats?.unassigned ?? 0} color="bg-orange-50" darkColor="dark:bg-orange-900/30" loading={statsLoading} onClick={() => setStatusFilter("UNASSIGNED")} />
      </div>

      {/* Search + Filters */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search tasks, stores or assignee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
              className="pl-8 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="">All Priorities</option>
              {PRIORITY_OPTIONS.map(o => <option key={o.value} value={['LOW','MEDIUM','HIGH'][o.value]}>{o.label}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select value={taskTypeFilter} onChange={(e) => setTaskTypeFilter(e.target.value)}
              className="pl-8 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="">All Types</option>
              {TASK_TYPE_OPTIONS.map(o => <option key={o.value} value={Object.keys(TASK_TYPE_LABELS)[o.value]}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === tab.value ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={18} className="shrink-0" /><span>{error}</span>
          <button onClick={refresh} className="ml-auto text-red-600 underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {searchTerm ? `No tasks found for "${searchTerm}".` : 'No tasks found.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Store</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Assignee</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{task.storeName}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[160px]">{task.storeAddress}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md font-medium">
                          {TASK_TYPE_LABELS[task.taskType] ?? task.taskType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {task.assigneeId && task.assigneeName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                              {task.assigneeName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm truncate max-w-[120px]">{task.assigneeName}</span>
                          </div>
                        ) : canManage ? (
                          <button onClick={() => setAssignTask({ id: task.id, storeName: task.storeName })}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                            <UserPlus size={13} />Assign
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-red-500 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                          {new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => navigate(`/tasks/${task.id}`)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page <span className="font-medium text-gray-900 dark:text-white">{currentPage}</span> of <span className="font-medium text-gray-900 dark:text-white">{totalPages}</span>
                <span className="text-gray-400 ml-2">({totalCount} total)</span>
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={15} />Previous
                </button>
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages || isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Next<ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TasksPage;