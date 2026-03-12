import React, { useState } from 'react';
import { X, Eye, EyeOff, KeyRound } from 'lucide-react';
import { userService, UserDto } from '../../services/users.service';
import toast from 'react-hot-toast';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDto;
}

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none";
const labelClass = "text-sm font-medium text-gray-700 dark:text-gray-300";

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose, user }) => {
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirm]     = useState('');
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setNewPassword('');
    setConfirm('');
    setShowNew(false);
    setShowConfirm(false);
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);
    try {
      await userService.resetPassword(user.id, newPassword);
      toast.success(`${user.fullName} için şifre başarıyla sıfırlandı!`);
      handleClose();
    } catch (err: any) {
      const msg = err.message || 'Şifre sıfırlama işlemi başarısız oldu.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400 rounded-lg">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reset Password</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[240px]">
                {user.fullName} — {user.email}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Warning */}
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-lg text-xs text-orange-700 dark:text-orange-400">
            Bu işlem kullanıcının mevcut şifresini sıfırlayacaktır. Yeni şifreyi kullanıcıyla paylaşmayı unutmayın.
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {/* New Password */}
          <div className="space-y-1.5">
            <label className={labelClass}>
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                required
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                minLength={6}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className={labelClass}>
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                required
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
                className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 ${
                  passwordMismatch
                    ? 'border-red-300 focus:ring-red-300 dark:border-red-500/50 dark:focus:ring-red-500'
                    : passwordsMatch
                    ? 'border-green-300 focus:ring-green-300 dark:border-green-500/50 dark:focus:ring-green-500'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordMismatch && (
              <p className="text-xs text-red-500 dark:text-red-400">Şifreler eşleşmiyor.</p>
            )}
            {passwordsMatch && (
              <p className="text-xs text-green-600 dark:text-green-400">Şifreler eşleşiyor.</p>
            )}
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
              type="submit"
              disabled={isLoading || !!passwordMismatch || !newPassword || !confirmPassword}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <KeyRound size={15} />
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;