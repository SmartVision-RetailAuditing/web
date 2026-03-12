import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { userService, UserDto, UpdateUserDto, ROLE_OPTIONS } from '../../services/users.service';
import toast from 'react-hot-toast';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: UserDto;
}

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none";
const labelClass = "text-sm font-medium text-gray-700 dark:text-gray-300";

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSuccess, user }) => {
  const [formData, setFormData] = useState({
    fullName:   '',
    role:       '',
    employeeId: '',
    phone:      '',
    isActive:   true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  // Modal her açıldığında mevcut user verileriyle formu doldur
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        fullName:   user.fullName,
        role:       user.role,
        employeeId: user.employeeId ?? '',
        phone:      user.phone ?? '',
        isActive:   user.isActive,
      });
      setError('');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload: UpdateUserDto = {
        fullName:   formData.fullName,
        role:       formData.role,
        employeeId: formData.employeeId || undefined,
        phone:      formData.phone      || undefined,
        isActive:   formData.isActive,
      };

      await userService.updateUser(user.id, payload);
      toast.success(`${formData.fullName} başarıyla güncellendi!`);
      onSuccess();
      handleClose();
    } catch (err: any) {
      const msg = err.message || 'Güncelleme işlemi başarısız oldu.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit User</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{user.email} — #{user.id}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Full Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                required type="text" name="fullName" value={formData.fullName}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Email — readonly, değiştirilemez */}
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>Email</label>
              <input
                type="email" value={user.email} disabled
                className="w-full px-3 py-2 border border-gray-100 dark:border-gray-800 rounded-lg text-sm bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">Email değiştirilemez.</p>
            </div>

            {/* Role */}
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>
                Role <span className="text-red-500">*</span>
              </label>
              <select
                required name="role" value={formData.role} onChange={handleChange}
                className={inputClass}
              >
                {ROLE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Employee ID */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                Employee ID
                <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="text" name="employeeId" value={formData.employeeId}
                onChange={handleChange} placeholder="e.g. EMP-001"
                className={inputClass}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                Phone
                <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="tel" name="phone" value={formData.phone}
                onChange={handleChange} placeholder="e.g. +90 555 123 4567"
                className={inputClass}
              />
            </div>

            {/* IsActive toggle */}
            <div className="md:col-span-2 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Status</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Inactive users cannot log in to the system.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
              </label>
            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button" onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70"
            >
              {isLoading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;