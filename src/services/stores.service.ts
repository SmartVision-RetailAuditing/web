export interface StoreDto {
  id: number;
  name: string;        // "Migros MM Konak"
  chainName: string;   // "Migros"
  region?: string;     // "Ege" (Nullable)
  address: string;
  latitude: number;
  longitude: number;
  complianceScore: number; // 92.5
  status: string;      // "Compliant", "Warning", "Non-Compliant"
}

const API_URL = 'http://localhost:5000/api/Stores';

export const storeService = {
  // 1. Tüm Mağazaları Listele
  getAllStores: async (page = 1, size = 100): Promise<StoreDto[]> => {
    const token = localStorage.getItem('smartvision_token');
    const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) throw new Error('Mağazalar yüklenemedi.');
    return response.json();
  },

  // 2. Tekil Mağaza Detayı Getir
  getStoreById: async (id: string): Promise<StoreDto> => {
    const token = localStorage.getItem('smartvision_token');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) throw new Error('Mağaza detayı bulunamadı.');
    return response.json();
  },

  // 3. Yeni Mağaza Ekle (POST)
  createStore: async (storeData: Partial<StoreDto>) => {
    const token = localStorage.getItem('smartvision_token');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(storeData),
    });
    
    if (!response.ok) throw new Error('Mağaza oluşturulamadı.');
    return response.json();
  },

  // 4. Mağaza Sil (DELETE)
  deleteStore: async (id: number) => {
    const token = localStorage.getItem('smartvision_token');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) throw new Error('Silme işlemi başarısız.');
    return true; 
  },

  // 5. Mağaza Güncelle (PUT) - YENİ EKLENDİ
  updateStore: async (id: number, storeData: Partial<StoreDto>) => {
    const token = localStorage.getItem('smartvision_token');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(storeData),
    });

    // Backend dokümanında başarılı ise 204 NoContent döndüğü belirtilmiş [cite: 598]
    if (!response.ok) throw new Error('Güncelleme işlemi başarısız.');
    return true; 
  }
};