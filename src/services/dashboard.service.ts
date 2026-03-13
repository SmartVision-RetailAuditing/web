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
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
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

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${BASE_URL}/Dashboard`;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('smartvision_token')}`,
});

const buildTrends = (kpis: DashboardKpiDto): DashboardKpiWithTrends['trends'] => ({
  storesTrend:     `${kpis.totalStores} active stores`,
  complianceTrend: kpis.averageCompliance >= 80 ? 'Above target' : 'Below target',
  tasksTrend:      kpis.pendingTasks === 0 ? 'No pending tasks' : `${kpis.pendingTasks} tasks pending`,
  issuesTrend:     kpis.criticalIssues === 0 ? 'No critical issues' : `${kpis.criticalIssues} require immediate action`,
});

export const dashboardService = {
  getKpis: async (): Promise<DashboardKpiWithTrends> => {
    const response = await fetch(`${API_URL}/kpis`, {
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
    const response = await fetch(`${API_URL}/recent-issues`, {
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
    const response = await fetch(`${API_URL}/recent-audits`, {
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