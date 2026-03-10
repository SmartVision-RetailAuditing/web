import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, ChevronLeft, ChevronRight,
  AlertCircle, Users, ShieldCheck, Briefcase, HardHat,
} from 'lucide-react';
import { useUsers } from '../../../hooks/useUsers';
import { useAuth } from '../../../hooks/useAuth';
import {
  getRoleColor, getRoleLabel, ROLE_OPTIONS,
} from '../../../services/users.service';
import AddUserModal from '../../../components/users/AddUserModal';

// ─── Role filter tabs ─────────────────────────────────────────────────────────
const ROLE_TABS = [
  { label: 'All',          value: '',             icon: <Users size={13} /> },
  { label: 'Admin',        value: 'ADMIN',        icon: <ShieldCheck size={13} /> },
  { label: 'Supervisor',   value: 'SUPERVISOR',   icon: <Briefcase size={13} /> },
  { label: 'Field Worker', value: 'FIELD_WORKER', icon: <HardHat size={13} /> },
];

const UsersPage = () => {
  const navigate  = useNavigate();
  const { isAdmin } = useAuth();

  const {
    users, totalCount, totalPages, currentPage, setCurrentPage,
    isLoading, error,
    searchTerm, setSearchTerm,
    roleFilter, setRoleFilter,
    refresh,
  } = useUsers();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6">

      {isAdmin && (
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={refresh}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm">
            {totalCount > 0
              ? `${totalCount} user${totalCount > 1 ? 's' : ''}`
              : 'Manage team members'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus size={16} />
            Add User
          </button>
        )}
      </div>

      {/* Search + Role Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Role tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {ROLE_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === tab.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
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
          <div className="p-12 text-center text-gray-400 text-sm">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {searchTerm ? `No users found for "${searchTerm}".` : 'No users found.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Employee ID</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Last Login</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${!user.isActive ? 'opacity-60' : ''}`}>

                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                            user.isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>

                      {/* Employee ID */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 font-mono">
                          {user.employeeId ?? <span className="text-gray-300 italic">—</span>}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {user.phone ?? <span className="text-gray-300 italic">—</span>}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          user.isActive
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })
                            : <span className="text-gray-300 italic text-xs">Never</span>
                          }
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/users/${user.id}`)}
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

export default UsersPage;