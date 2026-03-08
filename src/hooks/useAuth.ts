// hooks/useAuth.ts
// Tüm sayfalarda localStorage'ı tekrar tekrar okumak yerine bu hook kullanılır.

export const useAuth = () => {
  const token = localStorage.getItem('smartvision_token');
  const role = localStorage.getItem('smartvision_role');

  const isAdmin = role === 'ADMIN' || role === 'Admin';
  const isSupervisor = role === 'SUPERVISOR' || role === 'Supervisor';
  const isFieldWorker = role === 'FIELD_WORKER' || role === 'FieldWorker';
  const isLoggedIn = !!token;

  return { token, role, isAdmin, isSupervisor, isFieldWorker, isLoggedIn };
};