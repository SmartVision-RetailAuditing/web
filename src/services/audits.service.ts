// Backend'deki Audit entity'sine dayanarak oluşturulan DTO [cite: 257-295]
export interface AuditDto {
  id: number;
  taskId: number;
  storeName: string;      // DTO'da flat (düzleştirilmiş) olarak geleceğini varsayıyoruz
  auditorName: string;    // DTO'da flat olarak geleceğini varsayıyoruz
  captureDate: string;    // DateTime
  complianceScore: number;
  shelfSharePercentage: number;
  status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT'; // Enum karşılığı [cite: 255]
  issueCount?: number;    // AuditIssue listesinin eleman sayısı
}

// Varsayılan Endpoint (Eğer backend'de farklıysa burayı güncelleyebiliriz)
//const API_URL = 'https://smartvisionbackend-d4bfdra8f4b6gmad.swedencentral-01.azurewebsites.net/api/Audits';
const API_URL = 'http://localhost:5000/api/Auth';

export const auditService = {
  getAllAudits: async (page = 1, size = 10): Promise<AuditDto[]> => {
    const token = localStorage.getItem('smartvision_token');
    
    const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    // Eğer backend'de henüz bu endpoint yoksa, ekranın çökmemesi için sahte (mock) veri dönüyoruz.
    // Backend hazır olduğunda aşağıdaki IF bloğunu aktifleştirebilirsin.
    
    if (!response.ok) {
       console.warn("API/Audits endpoint'i bulunamadı. Şimdilik Mock veri gösteriliyor.");
       return getMockAudits(); // Geçici mock fonksiyonu
    }
    
    return response.json();
  }
};

// BACKEND HAZIR OLANA KADAR UI'I TEST ETMEK İÇİN GEÇİCİ VERİ
const getMockAudits = (): AuditDto[] => [
  { id: 4821, taskId: 1, storeName: 'Walmart #4521', auditorName: 'Mike Chen', captureDate: '2024-12-12T09:15:00', complianceScore: 92, shelfSharePercentage: 28.5, status: 'COMPLIANT', issueCount: 0 },
  { id: 4820, taskId: 2, storeName: 'Target #2134', auditorName: 'Sarah Parker', captureDate: '2024-12-12T08:45:00', complianceScore: 68, shelfSharePercentage: 18.2, status: 'WARNING', issueCount: 2 },
  { id: 4819, taskId: 3, storeName: 'Kroger #8765', auditorName: 'James Wilson', captureDate: '2024-12-11T16:30:00', complianceScore: 45, shelfSharePercentage: 12.1, status: 'NON_COMPLIANT', issueCount: 5 },
];