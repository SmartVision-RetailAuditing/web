// DTOs
export interface AuditProductDto {
  id: number;
  auditId: number;
  productName: string;
  productCode: string;
  brandName: string;
  price: number;
  isManuallyEdited: boolean;
  boundingBoxX: number;
  boundingBoxY: number;
  boundingBoxWidth: number;
  boundingBoxHeight: number;
  confidenceScore: number;
}

export interface AuditIssueDto {
  id: number;
  auditId: number;
  issueType: string;
  severity: string; // 'CRITICAL' | 'MEDIUM' | 'LOW'
  description: string;
}

export interface AuditDto {
  id: number;
  taskId: number;
  storeId: number;
  userId: number;
  storeName: string;
  auditorName: string;
  taskType: string;
  imageUrl?: string;
  captureDate: string;
  complianceScore: number;
  shelfSharePercentage: number;
  status: string; // 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT'
  brandDistributionJson?: string;
  products: AuditProductDto[];
  issues: AuditIssueDto[];
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const API_URL = 'http://localhost:5000/api/Audits';

const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}`,
});

export const auditService = {
  // GET /api/Audits?page=1&size=10&search=migros&status=WARNING
  getAllAudits: async (
    page = 1,
    size = 10,
    search?: string,
    status?: string,
  ): Promise<PagedResult<AuditDto>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search?.trim()) params.append('search', search.trim());
    if (status?.trim()) params.append('status', status.trim());

    const response = await fetch(`${API_URL}?${params}`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Auditler yüklenemedi.');
    return response.json();
  },

  // GET /api/Audits/:id
  getAuditById: async (id: string | number): Promise<AuditDto> => {
    const response = await fetch(`${API_URL}/${id}`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Audit detayı bulunamadı.');
    return response.json();
  },

  // DELETE /api/Audits/:id — sadece ADMIN
  deleteAudit: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Silme işlemi başarısız.');
  },
};