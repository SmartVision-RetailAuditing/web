// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  role: string;         // "ADMIN" | "SUPERVISOR" | "FIELD_WORKER"
  employeeId?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  role: string;
  employeeId?: string;
  phone?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  role?: string;
  employeeId?: string;
  phone?: string;
  isActive: boolean;
}

export interface AdminResetPasswordDto {
  newPassword: string;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// ─── Role helpers ─────────────────────────────────────────────────────────────

export const ROLE_OPTIONS = [
  { label: 'Admin',        value: 'ADMIN' },
  { label: 'Supervisor',   value: 'SUPERVISOR' },
  { label: 'Field Worker', value: 'FIELD_WORKER' },
];

export const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN':        return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'SUPERVISOR':   return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'FIELD_WORKER': return 'bg-green-50 text-green-700 border-green-200';
    default:             return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

export const getRoleLabel = (role: string) => {
  switch (role) {
    case 'ADMIN':        return 'Admin';
    case 'SUPERVISOR':   return 'Supervisor';
    case 'FIELD_WORKER': return 'Field Worker';
    default:             return role;
  }
};

// ─── Service ──────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${BASE_URL}/Users`;

const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}`,
});

export const userService = {

  // GET /api/users?page=1&size=10&search=ahmet&role=FIELD_WORKER
  getAllUsers: async (
    page = 1,
    size = 10,
    search?: string,
    role?: string,
  ): Promise<PagedResult<UserDto>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search?.trim()) params.append('search', search.trim());
    if (role?.trim())   params.append('role',   role.trim());

    const response = await fetch(`${API_URL}?${params}`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Failed to load users list.');
    return response.json();
  },

  // GET /api/users/:id
  getUserById: async (id: number): Promise<UserDto> => {
    const response = await fetch(`${API_URL}/${id}`, { headers: authHeaders() });
    if (!response.ok) throw new Error('User not found.');
    return response.json();
  },

  // GET /api/users/field-workers?search=ahmet
  getFieldWorkers: async (search?: string): Promise<UserDto[]> => {
    const params = new URLSearchParams();
    if (search?.trim()) params.append('search', search.trim());

    const response = await fetch(`${API_URL}/field-workers?${params}`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Field workers list could not be loaded.');
    return response.json();
  },

  // POST /api/users
  createUser: async (data: CreateUserDto): Promise<UserDto> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('User creation failed.');
    return response.json();
  },

  // PUT /api/users/:id — 204 No Content
  updateUser: async (id: number, data: UpdateUserDto): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('User update failed.');
  },

  // PATCH /api/users/:id/toggle-active — soft delete
  toggleUserActive: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}/toggle-active`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('User activation toggle failed.');
  },

  // PATCH /api/users/:id/reset-password
  resetPassword: async (id: number, newPassword: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}/reset-password`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ newPassword }),
    });
    if (!response.ok) throw new Error('User password reset failed.');
  },
};