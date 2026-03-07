export interface DashboardKpiDto {
  totalStores: number;
  averageCompliance: number;
  pendingTasks: number;
  criticalIssues: number;
}

export interface DashboardKpiWithTrends extends DashboardKpiDto {
  trends: {
    storesTrend: string;
    complianceTrend: string;
    tasksTrend: string;
    issuesTrend: string;
  };
}

export interface RecentIssueDto {
  id: number;
  auditId: number;
  storeName: string;
  location: string;
  issueType: string;
  severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
  description: string;
  captureDate: string;
}

export interface RecentAuditDto {
  id: number;
  storeName: string;
  auditorName: string;
  taskType: string;
  complianceScore: number;
  status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
  location: string;
  captureDate: string;
}


const BASE_URL = 'http://localhost:5000/api/Dashboard';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}`,
});

const buildTrends = (kpis: DashboardKpiDto): DashboardKpiWithTrends['trends'] => ({
  storesTrend:      `${kpis.totalStores} aktif mağaza`,
  complianceTrend:  kpis.averageCompliance >= 80 ? 'Hedef üzerinde' : 'Hedefin altında',
  tasksTrend:       kpis.pendingTasks === 0 ? 'Bekleyen görev yok' : `${kpis.pendingTasks} görev bekliyor`,
  issuesTrend:      kpis.criticalIssues === 0 ? 'Kritik hata yok' : `${kpis.criticalIssues} acil aksiyon`,
});

export const dashboardService = {
  getKpis: async (): Promise<DashboardKpiWithTrends> => {
    const response = await fetch(`${BASE_URL}/kpis`, {
      method: 'GET',
      headers: authHeaders(),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    const data: DashboardKpiDto = await response.json();
    return { ...data, trends: buildTrends(data) };
  },

  getRecentIssues: async (): Promise<RecentIssueDto[]> => {
    const response = await fetch(`${BASE_URL}/recent-issues`, {
      method: 'GET',
      headers: authHeaders(),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  },

  getRecentAudits: async (): Promise<RecentAuditDto[]> => {
    const response = await fetch(`${BASE_URL}/recent-audits`, {
      method: 'GET',
      headers: authHeaders(),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  },
};