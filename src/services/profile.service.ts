const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('smartvision_token') ?? ''}`,
});

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface UserProfileDto {
  fullName:   string;
  email:      string;
  role:       string;
  employeeId: string;
  phone:      string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────
export const profileService = {
  getProfile: async (): Promise<UserProfileDto> => {
    const res = await fetch(`${BASE_URL}/Users/profile`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Profile could not be loaded.');
    return res.json();
  },

  changePassword: async (dto: ChangePasswordDto): Promise<void> => {
    const res = await fetch(`${BASE_URL}/Auth/change-password`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Password change failed.');
  },
};