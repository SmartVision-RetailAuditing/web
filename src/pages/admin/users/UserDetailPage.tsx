import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, KeyRound, ToggleLeft, ToggleRight,
  User, Mail, Phone, Briefcase, Shield, Calendar,
  ClipboardList, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';
import { userService, UserDto, getRoleColor, getRoleLabel } from '../../../services/users.service';
import { taskService, TaskDto, TASK_TYPE_LABELS, getPriorityColor, getStatusColor, getStatusLabel } from '../../../services/tasks.service';
import { useAuth } from '../../../hooks/useAuth';
import EditUserModal from '../../../components/users/EditUserModal';
import ResetPasswordModal from '../../../components/users/ResetPasswordModal';
import toast from 'react-hot-toast';

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

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode; label: string; value: number | string; color: string;
}> = ({ icon, label, value, color }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
    <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const UserDetailPage = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { isAdmin } = useAuth();

  const [user, setUser]         = useState<UserDto | null>(null);
  const [tasks, setTasks]       = useState<TaskDto[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError]               = useState('');
  const [isToggling, setIsToggling]     = useState(false);

  const [isEditOpen, setEditOpen]           = useState(false);
  const [isResetPassOpen, setResetPassOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser(id);
      fetchUserTasks(parseInt(id));
    }
  }, [id]);

  const fetchUser = async (userId: string) => {
    try {
      setIsLoading(true);
      setError('');
      const data = await userService.getUserById(parseInt(userId));
      setUser(data);
    } catch (err: any) {
      setError(err.message || 'Kullanıcı detayı yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTasks = async (userId: number) => {
    try {
      setTasksLoading(true);
      const data = await taskService.getAllTasks(1, 50, undefined, undefined, undefined, undefined);
      // Backend'de user'a göre task filtresi yok getAllTasks'ta,
      // my-tasks endpoint'i sadece current user için — bu yüzden tüm tasks'ı çekip filtrele
      // TODO: Backend'e GET /api/tasks?userId=x eklenirse burası güncellenir
      setTasks(data.data.filter(t => t.assigneeId === userId));
    } catch {
      // task hatası sayfayı engellemesin
    } finally {
      setTasksLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;
    setIsToggling(true);
    try {
      await userService.toggleUserActive(user.id);
      toast.success(`${user.fullName} ${user.isActive ? 'deactivated' : 'activated'}!`);
      fetchUser(id as string);
    } catch (err: any) {
      toast.error(err.message || 'Durum değiştirilemedi.');
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) return (
    <div className="p-12 text-center text-gray-400 text-sm">Loading user details...</div>
  );
  if (error || !user) return (
    <div className="p-12 text-center text-red-500 text-sm">{error || 'User not found.'}</div>
  );

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const pendingTasks   = tasks.filter(t => t.status === 'PENDING').length;
  const inProgress     = tasks.filter(t => t.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-6">

      {/* Modals */}
      {isAdmin && (
        <>
          <EditUserModal
            isOpen={isEditOpen}
            onClose={() => setEditOpen(false)}
            user={user}
            onSuccess={() => fetchUser(id as string)}
          />
          <ResetPasswordModal
            isOpen={isResetPassOpen}
            onClose={() => setResetPassOpen(false)}
            user={user}
          />
        </>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
              user.isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
              <p className="text-gray-500 flex items-center gap-1.5 text-sm mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
                <span className="text-gray-300">•</span>
                <span className={`text-xs font-medium ${user.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Edit2 size={15} />
              Edit
            </button>
            <button
              onClick={() => setResetPassOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 transition-colors shadow-sm"
            >
              <KeyRound size={15} />
              Reset Password
            </button>
            <button
              onClick={handleToggleActive}
              disabled={isToggling}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors shadow-sm disabled:opacity-60 ${
                user.isActive
                  ? 'text-red-600 bg-red-50 border-red-100 hover:bg-red-100'
                  : 'text-green-600 bg-green-50 border-green-100 hover:bg-green-100'
              }`}
            >
              {user.isActive
                ? <><ToggleLeft size={15} /> Deactivate</>
                : <><ToggleRight size={15} /> Activate</>
              }
            </button>
          </div>
        )}
      </div>

      {/* Inactive banner */}
      {!user.isActive && (
        <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm">
          <AlertCircle size={18} className="shrink-0 text-gray-400" />
          <span>This user is <strong>inactive</strong> and cannot log in to the system.</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ClipboardList size={18} className="text-blue-600" />}
          label="Total Tasks" value={tasks.length}
          color="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle2 size={18} className="text-green-600" />}
          label="Completed" value={completedTasks}
          color="bg-green-50"
        />
        <StatCard
          icon={<Clock size={18} className="text-yellow-600" />}
          label="Pending" value={pendingTasks}
          color="bg-yellow-50"
        />
        <StatCard
          icon={<AlertCircle size={18} className="text-purple-600" />}
          label="In Progress" value={inProgress}
          color="bg-purple-50"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: User Info ── */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <User size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">User Info</h3>
            </div>

            <InfoRow
              icon={<Mail size={15} />}
              label="Email"
              value={<a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">{user.email}</a>}
            />
            <InfoRow
              icon={<Phone size={15} />}
              label="Phone"
              value={user.phone || <span className="text-gray-400 italic text-xs">Not provided</span>}
            />
            <InfoRow
              icon={<Briefcase size={15} />}
              label="Employee ID"
              value={
                user.employeeId
                  ? <span className="font-mono text-gray-800">{user.employeeId}</span>
                  : <span className="text-gray-400 italic text-xs">Not assigned</span>
              }
            />
            <InfoRow
              icon={<Shield size={15} />}
              label="Role"
              value={
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              }
            />
            <InfoRow
              icon={<Calendar size={15} />}
              label="Member Since"
              value={new Date(user.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'long', year: 'numeric',
              })}
            />
            <InfoRow
              icon={<Calendar size={15} />}
              label="Last Login"
              value={
                user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })
                  : <span className="text-gray-400 italic text-xs">Never logged in</span>
              }
            />
          </div>
        </div>

        {/* ── Right: Task List ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Assigned Tasks</h3>
              <span className="text-xs text-gray-400">{tasks.length} total</span>
            </div>

            {tasksLoading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No tasks assigned to this user.</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                            {TASK_TYPE_LABELS[task.taskType] ?? task.taskType}
                          </span>
                          <span className="text-xs text-gray-400">#{task.id}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">{task.storeName}</p>
                        <p className="text-xs text-gray-400 truncate">{task.storeAddress}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <p className={`text-xs mt-2 ${
                      new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                        ? 'text-red-500 font-medium'
                        : 'text-gray-400'
                    }`}>
                      Due: {new Date(task.dueDate).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;