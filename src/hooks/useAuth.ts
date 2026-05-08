import { jwtDecode } from 'jwt-decode';

// .NET Core ClaimTypes tam URL formatında geliyor
const CLAIM_NAME       = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
const CLAIM_EMAIL      = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
const CLAIM_ROLE       = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const CLAIM_NAMEID     = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

interface JwtPayload {
  [CLAIM_NAME]:   string;
  [CLAIM_EMAIL]:  string;
  [CLAIM_ROLE]:   string;
  [CLAIM_NAMEID]: string;
  exp:            number;
}

const EMPTY_AUTH = {
  token:         null as string | null,
  userId:        null as number | null,
  fullName:      '',
  email:         '',
  role:          '',
  initials:      '',
  isAdmin:       false,
  isSupervisor:  false,
  isFieldWorker: false,
  isLoggedIn:    false,
};

const clearAuth = () => {
  localStorage.removeItem('smartvision_token');
  localStorage.removeItem('smartvision_role');
};

export const useAuth = () => {
  const token = localStorage.getItem('smartvision_token');

  if (!token) return EMPTY_AUTH;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    // Token expire kontrolü
    if (decoded.exp * 1000 < Date.now()) {
      clearAuth();
      return EMPTY_AUTH;
    }

    const role     = decoded[CLAIM_ROLE]   ?? '';
    const fullName = decoded[CLAIM_NAME]   ?? '';
    const email    = decoded[CLAIM_EMAIL]  ?? '';
    const userId   = parseInt(decoded[CLAIM_NAMEID] ?? '0');

    // "Sistem Yöneticisi" → "SY"
    const initials = fullName
      .split(' ')
      .slice(0, 2)
      .map((n: string) => n.charAt(0).toUpperCase())
      .join('');

    return {
      token,
      userId,
      fullName,
      email,
      role,
      initials,
      isAdmin:       role === 'ADMIN',
      isSupervisor:  role === 'SUPERVISOR',
      isFieldWorker: role === 'FIELD_WORKER',
      isLoggedIn:    true,
    };
  } catch {
    clearAuth();
    return EMPTY_AUTH;
  }
};