import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { userService, ROLE_OPTIONS } from '../../services/users.service';
import toast from 'react-hot-toast';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY_FORM = { fullName: '', email: '', password: '', role: '', employeeId: '', phone: '' };

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none";
const labelClass = "text-sm font-medium text-gray-700 dark:text-gray-300";

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleClose = () => {
    setFormData(EMPTY_FORM);
    setShowPassword(false);
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await userService.createUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.employeeId && { employeeId: formData.employeeId }),
        ...(formData.phone      && { phone: formData.phone }),
      });
      toast.success(`${formData.fullName} başarıyla oluşturuldu!`);
      handleClose();
      onSuccess();
    } catch (err: any) {
      const msg = err.message || 'Kullanıcı oluşturulurken bir hata oluştu.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New User</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
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

            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
              <input required type="text" name="fullName" value={formData.fullName}
                onChange={handleChange} placeholder="e.g. Ahmet Yılmaz" className={inputClass} />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>Email <span className="text-red-500">*</span></label>
              <input required type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="ahmet@example.com" className={inputClass} />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={formData.password}
                  onChange={handleChange} placeholder="Min. 6 characters" minLength={6}
                  className={`${inputClass} pr-10`}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>Role <span className="text-red-500">*</span></label>
              <select required name="role" value={formData.role} onChange={handleChange}
                className={inputClass}>
                <option value="">Select role...</option>
                {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>
                Employee ID <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
              </label>
              <input type="text" name="employeeId" value={formData.employeeId}
                onChange={handleChange} placeholder="e.g. EMP-001" className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>
                Phone <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
              </label>
              <input type="tel" name="phone" value={formData.phone}
                onChange={handleChange} placeholder="e.g. +90 555 123 4567" className={inputClass} />
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2">
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;