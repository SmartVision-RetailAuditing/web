import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, MapPin,
  TrendingUp, TrendingDown, Store as StoreIcon,
  ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import { useStores } from '../../hooks/useStores';
import { useAuth } from '../../hooks/useAuth';
import AddStoreModal from '../../components/stores/AddStoreModal';

const StoresPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const {
    stores, totalCount, totalPages,
    currentPage, setCurrentPage,
    isLoading, error,
    searchTerm, setSearchTerm,
    refresh,
  } = useStores();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant':     return 'bg-green-50 text-green-700 border-green-200';
      case 'Warning':       return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Non-Compliant': return 'bg-red-50 text-red-700 border-red-200';
      default:              return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">

      {isAdmin && (
        <AddStoreModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={refresh}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-500 text-sm">
            {totalCount > 0
              ? `${totalCount} retail location${totalCount > 1 ? 's' : ''}`
              : 'Manage retail locations'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus size={16} />
            Add Store
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, chain or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
          <button onClick={refresh} className="ml-auto text-red-600 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {searchTerm ? `No stores found for "${searchTerm}".` : 'No stores found.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Store</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Compliance</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Audits</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                            <StoreIcon size={18} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{store.name}</div>
                            <div className="text-xs text-gray-400">{store.chainName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-600 text-xs">
                          <MapPin size={13} className="shrink-0" />
                          <span className="truncate max-w-[180px]" title={store.address}>
                            {store.address}
                          </span>
                        </div>
                        {store.region && (
                          <div className="text-xs text-gray-400 mt-0.5 pl-4">{store.region}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-28">
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-semibold text-gray-800">{store.complianceScore}%</span>
                            {store.complianceScore >= 80
                              ? <TrendingUp size={13} className="text-green-500" />
                              : <TrendingDown size={13} className="text-red-500" />
                            }
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${getComplianceColor(store.complianceScore)}`}
                              style={{ width: `${Math.min(store.complianceScore, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(store.status)}`}>
                          {store.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-700">{store.auditCount}</span>
                        <span className="text-xs text-gray-400 ml-1">
                          audit{store.auditCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/stores/${store.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-sm text-gray-500">
                Page{' '}
                <span className="font-medium text-gray-900">{currentPage}</span>
                {' '}of{' '}
                <span className="font-medium text-gray-900">{totalPages}</span>
                <span className="text-gray-400 ml-2">({totalCount} total)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StoresPage;