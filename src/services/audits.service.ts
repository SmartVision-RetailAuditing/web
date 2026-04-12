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
  postImageUrl: string;
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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const auditService = {
  // GET /api/Audits?page=1&size=10&search=migros&status=WARNING&storeId=4
  getAllAudits: async (
    page = 1,
    size = 10,
    search?: string,
    status?: string,
    storeId?: number,
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

  // GET /api/Audits/:id/export/pdf
  exportPdf: async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/Audits/${id}/export/pdf`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}` },
    });
    if (!response.ok) throw new Error('PDF export failed.');
    const blob = await response.blob();
    downloadBlob(blob, `audit-${id}-report.pdf`);
  },

  // GET /api/Audits/export/excel
  exportExcel: async (filters: {
    storeId?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<void> => {
    const params = new URLSearchParams();
    if (filters.storeId !== undefined) params.append('storeId',  String(filters.storeId));
    if (filters.status)                params.append('status',   filters.status);
    if (filters.dateFrom)              params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo)                params.append('dateTo',   filters.dateTo);

    const response = await fetch(`${BASE_URL}/Audits/export/excel?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}` },
    });
    if (!response.ok) throw new Error('Excel export failed.');
    const blob = await response.blob();
    const date = new Date().toISOString().slice(0, 10);
    downloadBlob(blob, `smartvision-audits-${date}.xlsx`);
  },
};