import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Briefcase, Shield, KeyRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getRoleColor, getRoleLabel } from '../../services/users.service';
import { profileService } from '../../services/profile.service';
import type { UserProfileDto } from '../../services/profile.service';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
    <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
    <div>
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <div className="text-sm text-gray-900 dark:text-white">{value}</div>
    </div>
  </div>
);

const ProfilePage = () => {
  const { fullName, initials, role }      = useAuth();
  const [profile, setProfile]             = useState<UserProfileDto | null>(null);
  const [isLoading, setLoading]           = useState(true);
  const [isChangePassOpen, setChangePass] = useState(false);

  useEffect(() => {
    profileService.getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <ChangePasswordModal
        isOpen={isChangePassOpen}
        onClose={() => setChangePass(false)}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-500 text-sm">Manage your account information</p>
      </div>

      {/* Avatar + isim kartı */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400 shrink-0 select-none">
          {initials || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {isLoading ? '...' : profile?.fullName ?? fullName}
          </h2>
          <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(role)}`}>
            {getRoleLabel(role)}
          </span>
        </div>
        <button
          onClick={() => setChangePass(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg hover:bg-blue-100 transition-colors shrink-0"
        >
          <KeyRound size={15} />
          Change Password
        </button>
      </div>

      {/* Bilgi kartı */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Account Details</h3>

        {isLoading ? (
          <div className="py-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : (
          <>
            <InfoRow icon={<User size={15} />}     label="Full Name"   value={profile?.fullName ?? '—'} />
            <InfoRow icon={<Mail size={15} />}      label="Email"       value={
              <a href={`mailto:${profile?.email}`} className="text-blue-600 hover:underline">
                {profile?.email ?? '—'}
              </a>
            } />
            <InfoRow icon={<Phone size={15} />}     label="Phone"       value={
              profile?.phone || <span className="text-gray-400 italic text-xs">Not provided</span>
            } />
            <InfoRow icon={<Briefcase size={15} />} label="Employee ID" value={
              profile?.employeeId
                ? <span className="font-mono">{profile.employeeId}</span>
                : <span className="text-gray-400 italic text-xs">Not assigned</span>
            } />
            <InfoRow icon={<Shield size={15} />}    label="Role"        value={
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleColor(role)}`}>
                {getRoleLabel(role)}
              </span>
            } />
          </>
        )}
      </div>

    </div>
  );
};

export default ProfilePage;