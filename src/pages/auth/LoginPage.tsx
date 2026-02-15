import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode'; // 1. Paketi import ettik

const LoginPage = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Backend'den token'ı alıyoruz
      const response = await authService.login({ email, password });
      const token = response.token;
      
      // 2. Token'ı çöz ve içindeki Claim'leri oku
      const decodedToken: any = jwtDecode(token);
      
      // 3. .NET Core'un uzun rol anahtarını veya standart 'role' anahtarını yakala
      const roleClaimKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
      // Backend geliştiricinin nasıl isimlendirdiğine bağlı olarak ikisine de bakıyoruz
      const userRole = decodedToken[roleClaimKey] || decodedToken.role || decodedToken.Role;

      // Console'a basarak backend'in tam olarak hangi key ile rol yolladığını görebilirsin
      console.log("Decoded Token:", decodedToken);
      console.log("User Role:", userRole);

      // 4. Rol Kontrolü (FIELD_WORKER engellemesi)
      // (Backend'deki rol ismine göre buradaki string'i tam eşleştir: 'FIELD_WORKER', 'FieldWorker' vb.)
      if (userRole === "FIELD_WORKER" || userRole === "FieldWorker") {
        setError("Only admin and supervisor can login.");
        setIsLoading(false);
        return; // İşlemi iptal et, token'ı kaydetme!
      }

      // 5. Admin veya Supervisor ise normal devam et
      localStorage.setItem('smartvision_token', token);
      
      // İleride rol bazlı işlemler için rolü de kaydedebilirsin
      localStorage.setItem('smartvision_role', userRole); 
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      {/* Kart Konteyneri */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.04)] border border-gray-100 p-8">
        
        {/* Üst Bilgi: Logo ve Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
            <Eye className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign In</h1>
          <p className="text-sm text-gray-500">Enter your corporate email to continue</p>
        </div>

        {/* Hata Mesajı Alanı */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
                placeholder="name@company.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Şifremi Unuttum */}
          <div className="flex justify-end">
            <a href="#" className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Submit Butonu */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Notu */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Demo: Use any email and password to access</p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;