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

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL  = `${BASE_URL}/Stores`;

const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}`,
});

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const storeService = {
  // GET /api/Stores?page=1&size=10&search=migros
  getAllStores: async (page = 1, size = 10, search?: string): Promise<PagedResult<StoreDto>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search?.trim()) params.append('search', search.trim());
    const response = await fetch(`${API_URL}?${params}`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Stores could not be loaded.');
    return response.json();
  },

  // GET /api/Stores/:id
  getStoreById: async (id: string | number): Promise<StoreDto> => {
    const response = await fetch(`${API_URL}/${id}`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Store details not found.');
    return response.json();
  },

  // POST /api/Stores
  createStore: async (storeData: CreateStoreDto): Promise<StoreDto> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(storeData),
    });
    if (!response.ok) throw new Error('Store creation failed.');
    return response.json();
  },

  // PUT /api/Stores/:id
  updateStore: async (id: number, storeData: UpdateStoreDto): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(storeData),
    });
    if (!response.ok) throw new Error('Store update failed.');
  },

  // DELETE /api/Stores/:id
  deleteStore: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}` },
    });
    if (!response.ok) throw new Error('Store deletion failed.');
  },

  // GET /api/Stores/{id}/export/pdf
  exportPdf: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}/export/pdf`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}` },
    });
    if (!response.ok) throw new Error('PDF export failed.');
    const blob = await response.blob();
    downloadBlob(blob, `store-${id}-report.pdf`);
  },

  // GET /api/Stores/export/excel?search=migros
  exportExcel: async (search?: string): Promise<void> => {
    const params = new URLSearchParams();
    if (search?.trim()) params.append('search', search.trim());
    const response = await fetch(`${API_URL}/export/excel?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}` },
    });
    if (!response.ok) throw new Error('Excel export failed.');
    const blob = await response.blob();
    const date = new Date().toISOString().slice(0, 10);
    downloadBlob(blob, `smartvision-stores-${date}.xlsx`);
  },
};