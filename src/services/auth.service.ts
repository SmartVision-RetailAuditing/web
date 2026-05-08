export interface LoginRequestDto {
  email:    string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  UserId: number;
  Role: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${BASE_URL}/Auth`;

export const authService = {

  login: async (credentials: LoginRequestDto): Promise<LoginResponseDto> => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login error.');
    }

    return data;
  },

  // Token ve rol bilgisini localStorage'dan temizler
  logout: () => {
    localStorage.removeItem('smartvision_token');
    localStorage.removeItem('smartvision_role');
  },

};