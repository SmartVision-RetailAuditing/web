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
  severity: string; // 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
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
  preImageUrl: string;
  postImageUrl:string
  captureDate: string;
  complianceScore: number;
  shelfSharePercentage: number;
  status: string;
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

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}`,
});

export const auditService = {
  // GET /api/Audits?page=1&size=10&search=migros&status=WARNING&storeId=4
  getAllAudits: async (
    page = 1,
    size = 10,
    search?: string,
    status?: string,
    storeId?: number,         // ← YENİ
  ): Promise<PagedResult<AuditDto>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search?.trim())        params.append('search',  search.trim());
    if (status?.trim())        params.append('status',  status.trim());
    if (storeId !== undefined) params.append('storeId', String(storeId));

    const response = await fetch(`${BASE_URL}/Audits?${params}`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Audits could not be loaded.');
    return response.json();
  },

  // GET /api/Audits/:id
  getAuditById: async (id: string | number): Promise<AuditDto> => {
    const response = await fetch(`${BASE_URL}/Audits/${id}`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Audit details not found.');
    return response.json();
  },

  // DELETE /api/Audits/:id — sadece ADMIN
  deleteAudit: async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/Audits/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Audit deletion failed.');
  },
};