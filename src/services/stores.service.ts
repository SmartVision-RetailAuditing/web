// DTOs
export interface StoreDto {
  id: number;
  name: string;
  chainName: string;
  region?: string;
  address: string;
  latitude: number;
  longitude: number;
  complianceScore: number;
  status: string; // "Compliant" | "Warning" | "Non-Compliant" | "Unknown"
  auditCount: number;
}

export interface CreateStoreDto {
  name: string;
  chainName: string;
  region?: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface UpdateStoreDto {
  name: string;
  chainName: string;
  region?: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const API_URL = 'http://localhost:5000/api/Stores';

const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}`,
});

export const storeService = {
  // GET /api/Stores?page=1&size=10&search=migros
  getAllStores: async (
    page = 1,
    size = 10,
    search?: string
  ): Promise<PagedResult<StoreDto>> => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (search?.trim()) params.append('search', search.trim());

    const response = await fetch(`${API_URL}?${params}`, {
      headers: authHeaders(),
    });

    if (!response.ok) throw new Error('Mağazalar yüklenemedi.');
    return response.json(); // PagedResult<StoreDto>
  },

  // GET /api/Stores/:id
  getStoreById: async (id: string | number): Promise<StoreDto> => {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: authHeaders(),
    });

    if (!response.ok) throw new Error('Mağaza detayı bulunamadı.');
    return response.json();
  },

  // POST /api/Stores
  createStore: async (storeData: CreateStoreDto): Promise<StoreDto> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(storeData),
    });

    if (!response.ok) throw new Error('Mağaza oluşturulamadı.');
    return response.json();
  },

  // PUT /api/Stores/:id — 204 No Content döner
  updateStore: async (id: number, storeData: UpdateStoreDto): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(storeData),
    });

    if (!response.ok) throw new Error('Güncelleme işlemi başarısız.');
  },

  // DELETE /api/Stores/:id — 204 No Content döner
  deleteStore: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}` },
    });

    if (!response.ok) throw new Error('Silme işlemi başarısız.');
  },
};