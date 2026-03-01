// 1. DTO'lara karşılık gelen TypeScript tipleri
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
}

// Backend'in çalıştığı URL (Geliştirme aşamasında localhost portuna göre değiştir)
//const API_URL = 'https://smartvisionbackend-d4bfdra8f4b6gmad.swedencentral-01.azurewebsites.net/api/Auth'; //
const API_URL = 'http://localhost:5000/api/Auth'; 


export const authService = {
  login: async (credentials: LoginRequestDto): Promise<LoginResponseDto> => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login error.');
    }

    return data;
  },
};
