// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface TaskDto {
  id: number;
  storeId: number;
  storeName: string;
  storeAddress: string;
  latitude: number;
  longitude: number;
  taskType: string;   // "SHELF_AUDIT" | "PRICE_CHECK" | "PANORAMA" | "PLANOGRAM_COMPLIANCE"
  priority: string;  // "LOW" | "MEDIUM" | "HIGH"
  status: string;    // "PENDING" | "IN_PROGRESS" | "COMPLETED"
  dueDate: string;
  completedAt?: string;
  description?: string;
  assigneeId: number;
  assigneeName: string;
  auditId?: number;
}

export interface CreateTaskDto {
  storeId: number;
  userId?: number;   // nullable — backend'de int? UserId, [Required] kaldırıldı
  taskType: number;  // enum int value: 0=SHELF_AUDIT, 1=PRICE_CHECK, 2=PANORAMA, 3=PLANOGRAM_COMPLIANCE
  priority: number;  // enum int value: 0=LOW, 1=MEDIUM, 2=HIGH
  dueDate: string;
  description?: string;
}

export interface UpdateTaskDto {
  storeId?: number;
  userId?: number;
  taskType?: number;
  priority?: number;
  dueDate?: string;
  description?: string;
  status?: number;   // 0=PENDING, 1=IN_PROGRESS, 2=COMPLETED
}

export interface TaskStatsDto {
  totalActive: number;
  pending: number;
  inProgress: number;
  completedThisWeek: number;
  unassigned: number;  // UserId == null
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// ─── Label Helpers ────────────────────────────────────────────────────────────

export const TASK_TYPE_LABELS: Record<string, string> = {
  SHELF_AUDIT:          'Shelf Audit',
  PRICE_CHECK:          'Price Check',
  PANORAMA:             'Panorama',
  PLANOGRAM_COMPLIANCE: 'Planogram Compliance',
};

export const TASK_TYPE_OPTIONS = [
  { label: 'Shelf Audit',          value: 0 },
  { label: 'Price Check',          value: 1 },
  { label: 'Panorama',             value: 2 },
  { label: 'Planogram Compliance', value: 3 },
];

export const PRIORITY_OPTIONS = [
  { label: 'Low',    value: 0 },
  { label: 'Medium', value: 1 },
  { label: 'High',   value: 2 },
];

export const STATUS_OPTIONS = [
  { label: 'Pending',     value: 0 },
  { label: 'In Progress', value: 1 },
  { label: 'Completed',   value: 2 },
];

// ─── Color Helpers ────────────────────────────────────────────────────────────

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'HIGH':   return 'bg-red-50 text-red-700 border-red-200';
    case 'MEDIUM': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'LOW':    return 'bg-green-50 text-green-700 border-green-200';
    default:       return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':  return 'bg-green-50 text-green-700 border-green-200';
    case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'PENDING':    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    default:           return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'COMPLETED':   return 'Completed';
    case 'IN_PROGRESS': return 'In Progress';
    case 'PENDING':     return 'Pending';
    default:            return status;
  }
};

// ─── Service ──────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${BASE_URL}/Tasks`;

const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}`,
});

export const taskService = {
  // GET /api/tasks/stats
  getTaskStats: async (): Promise<TaskStatsDto> => {
    const response = await fetch(`${API_URL}/stats`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to load task statistics.');
    return response.json();
  },

  // GET /api/tasks?page=1&size=10&search=...&status=PENDING&priority=HIGH&taskType=SHELF_AUDIT&userId=5
  getAllTasks: async (
    page = 1,
    size = 10,
    search?: string,
    status?: string,
    priority?: string,
    taskType?: string,
    userId?: number,    // UserDetailPage için
  ): Promise<PagedResult<TaskDto>> => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (search?.trim())   params.append('search',   search.trim());
    if (status?.trim())   params.append('status',   status.trim());
    if (priority?.trim()) params.append('priority', priority.trim());
    if (taskType?.trim()) params.append('taskType', taskType.trim());
    if (userId)           params.append('userId',   String(userId));

    const response = await fetch(`${API_URL}?${params}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to load task list.');
    return response.json();
  },

  // GET /api/tasks/:id
  getTaskById: async (id: string | number): Promise<TaskDto> => {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Task details not found.');
    return response.json();
  },

  // POST /api/tasks
  createTask: async (data: CreateTaskDto): Promise<TaskDto> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Task creation failed.');
    return response.json();
  },

  // PUT /api/tasks/:id  — hem full edit hem assign-only için kullanılır
  updateTask: async (id: number, data: UpdateTaskDto): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Task update failed.');
  },

  // DELETE /api/tasks/:id
  deleteTask: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}` },
    });
    if (!response.ok) throw new Error('Task deletion failed.');
  },
};