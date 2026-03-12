import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, User, Calendar, Activity, AlertTriangle, Package, BarChart2, Layers } from 'lucide-react';
import { auditService, AuditDto } from '../../services/audits.service';

const STATUS_STYLES: Record<string, string> = {
  COMPLIANT: 'bg-green-50 text-green-700 border-green-200',
  WARNING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  NON_COMPLIANT: 'bg-red-50 text-red-700 border-red-200',
};
const STATUS_LABELS: Record<string, string> = { COMPLIANT: 'Compliant', WARNING: 'Warning', NON_COMPLIANT: 'Non-Compliant' };
const TASK_TYPE_LABELS: Record<string, string> = { SHELF_AUDIT: 'Shelf Audit', PRICE_CHECK: 'Price Check', PLANOGRAM_COMPLIANCE: 'Planogram Compliance', PANORAMA: 'Panorama' };
const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
  MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  LOW: 'bg-blue-50 text-blue-700 border-blue-200',
};
const ISSUE_TYPE_LABELS: Record<string, string> = {
  MISSING_PRODUCT: 'Missing Product', WRONG_PRICE: 'Wrong Price',
  LOW_SHELF_SHARE: 'Low Shelf Share', WRONG_SHELF_POSITION: 'Wrong Position', PLANOGRAM_MISMATCH: 'Planogram Mismatch',
};
const BRAND_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];

const getScoreColor = (score: number) => {
  if (score >= 80) return { bar: 'bg-green-500', text: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30' };
  if (score >= 60) return { bar: 'bg-yellow-400', text: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/30' };
  return { bar: 'bg-red-500', text: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' };
};

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const AuditDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<AuditDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    auditService.getAuditById(id)
      .then(setAudit)
      .catch((err: any) => setError(err.message || 'Audit yüklenemedi.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="p-12 text-center text-gray-400 text-sm">Loading audit details...</div>;
  if (error || !audit) return <div className="p-12 text-center text-red-500 text-sm">{error || 'Audit not found.'}</div>;

  const scoreColor = getScoreColor(audit.complianceScore);
  const criticalIssues = audit.issues.filter(i => i.severity === 'CRITICAL');
  const otherIssues = audit.issues.filter(i => i.severity !== 'CRITICAL');

  let brandData: { name: string; value: number }[] = [];
  if (audit.brandDistributionJson) {
    try {
      brandData = Object.entries(JSON.parse(audit.brandDistributionJson))
        .map(([name, value]) => ({ name, value: Number(value) }))
        .sort((a, b) => b.value - a.value);
    } catch { }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/audits')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{audit.storeName}</h1>
            <p className="text-sm text-gray-400 mt-0.5">Audit #{audit.id}<span className="mx-1.5">•</span>{TASK_TYPE_LABELS[audit.taskType] ?? audit.taskType}</p>
          </div>
        </div>
        <span className={`self-start sm:self-auto px-3 py-1.5 rounded-full text-sm font-semibold border ${STATUS_STYLES[audit.status] ?? ''}`}>
          {STATUS_LABELS[audit.status] ?? audit.status}
        </span>
      </div>

      {/* Hero Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-xl border ${scoreColor.bg} col-span-2 md:col-span-1`}>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className={scoreColor.text} />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Compliance</span>
          </div>
          <div className={`text-4xl font-bold mb-2 ${scoreColor.text}`}>{audit.complianceScore}%</div>
          <div className="w-full bg-white/60 dark:bg-white/10 rounded-full h-2">
            <div className={`h-2 rounded-full ${scoreColor.bar}`} style={{ width: `${Math.min(audit.complianceScore, 100)}%` }} />
          </div>
        </div>
        {[
          { icon: <Store size={16} className="text-blue-500" />, label: 'Store', value: audit.storeName, sub: `ID: #${audit.storeId}` },
          { icon: <User size={16} className="text-purple-500" />, label: 'Auditor', value: audit.auditorName, sub: null },
          { icon: <Calendar size={16} className="text-orange-500" />, label: 'Date', value: formatDate(audit.captureDate), sub: null },
        ].map(card => (
          <div key={card.label} className="p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center gap-2 mb-3">{card.icon}<span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{card.label}</span></div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{card.value}</div>
            {card.sub && <div className="text-xs text-gray-400 mt-1">{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* Shelf Image */}
      {audit.imageUrl && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Shelf Image</h2>
            <p className="text-xs text-gray-400">Captured during audit</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 flex justify-center">
            <img src={audit.imageUrl} alt="Shelf audit" className="max-h-80 rounded-lg object-contain shadow" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </div>
      )}

      {/* Shelf Share + Brand Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4"><Layers size={18} className="text-teal-500" /><h2 className="text-base font-bold text-gray-900 dark:text-white">Shelf Share</h2></div>
          <div className="flex items-end gap-4">
            <span className="text-5xl font-bold text-gray-900 dark:text-white">{audit.shelfSharePercentage}%</span>
            <span className="text-sm text-gray-400 pb-1">of shelf occupied</span>
          </div>
          <div className="mt-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
            <div className="h-3 rounded-full bg-teal-500 transition-all" style={{ width: `${Math.min(audit.shelfSharePercentage, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0%</span><span>Target: 30%</span><span>100%</span></div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4"><BarChart2 size={18} className="text-indigo-500" /><h2 className="text-base font-bold text-gray-900 dark:text-white">Brand Distribution</h2></div>
          {brandData.length === 0 ? (
            <p className="text-sm text-gray-400">No brand data available.</p>
          ) : (
            <div className="space-y-3">
              {brandData.map((brand, idx) => (
                <div key={brand.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{brand.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{brand.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${BRAND_COLORS[idx % BRAND_COLORS.length]}`} style={{ width: `${brand.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Issues */}
      {audit.issues.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Issues</h2>
              <p className="text-xs text-gray-400">{audit.issues.length} issue{audit.issues.length > 1 ? 's' : ''} detected</p>
            </div>
            {criticalIssues.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 px-2.5 py-1 rounded-full">
                <AlertTriangle size={12} />{criticalIssues.length} Critical
              </span>
            )}
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {[...criticalIssues, ...otherIssues].map(issue => (
              <div key={issue.id} className="px-6 py-4 flex items-start gap-4">
                <span className={`shrink-0 mt-0.5 text-xs font-bold px-2 py-0.5 rounded-full border ${SEVERITY_STYLES[issue.severity] ?? ''}`}>{issue.severity}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{ISSUE_TYPE_LABELS[issue.issueType] ?? issue.issueType}</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{issue.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {audit.products.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Detected Products</h2>
            <p className="text-xs text-gray-400">{audit.products.length} product{audit.products.length > 1 ? 's' : ''} identified</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left">Product</th><th className="px-6 py-3 text-left">Brand</th>
                  <th className="px-6 py-3 text-left">Code</th><th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-right">Confidence</th><th className="px-6 py-3 text-center">Edited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {audit.products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-white">{product.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{product.brandName}</td>
                    <td className="px-6 py-3 text-gray-400 font-mono text-xs">{product.productCode}</td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-white">{product.price.toFixed(2)} ₺</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`text-xs font-bold ${product.confidenceScore >= 0.9 ? 'text-green-600 dark:text-green-400' : product.confidenceScore >= 0.75 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                        {(product.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {product.isManuallyEdited
                        ? <span className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/30 px-2 py-0.5 rounded-full font-medium">Manual</span>
                        : <span className="text-xs text-gray-400">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditDetailPage;