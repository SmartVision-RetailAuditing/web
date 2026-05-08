import React, { useState } from 'react';
import { X, Eye, EyeOff, KeyRound } from 'lucide-react';
import { profileService } from '../../services/profile.service';
import toast from 'react-hot-toast';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [oldPassword, setOld]         = useState('');
  const [newPassword, setNew]         = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [showOld, setShowOld]         = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setLoading]       = useState(false);
  const [error, setError]             = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setOld(''); setNew(''); setConfirm(''); setError('');
    onClose();
  };

  const passwordsMatch    = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordsMismatch) { setError('New passwords do not match.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setError('');
    setLoading(true);
    try {
      await profileService.changePassword({ oldPassword, newPassword });
      toast.success('Password updated successfully!');
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <KeyRound size={18} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>
          )}

          {/* Old Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
            <div className="relative">
              <input
                required type={showOld ? 'text' : 'password'}
                value={oldPassword} onChange={e => setOld(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
              />
              <button type="button" onClick={() => setShowOld(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
            <div className="relative">
              <input
                required type={showNew ? 'text' : 'password'}
                value={newPassword} onChange={e => setNew(e.target.value)}
                placeholder="Min. 6 characters" minLength={6}
                className="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
            <div className="relative">
              <input
                required type={showConfirm ? 'text' : 'password'}
                value={confirmPassword} onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
                className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 outline-none bg-white dark:bg-gray-800 dark:text-white transition-colors ${
                  passwordsMismatch
                    ? 'border-red-300 focus:ring-red-300'
                    : passwordsMatch
                    ? 'border-green-300 focus:ring-green-300'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
                }`}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordsMismatch && <p className="text-xs text-red-500">Passwords do not match.</p>}
            {passwordsMatch    && <p className="text-xs text-green-600">Passwords match.</p>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit"
              disabled={isLoading || !!passwordsMismatch || !oldPassword || !newPassword || !confirmPassword}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;