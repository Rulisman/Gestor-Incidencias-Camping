import React, { useState } from 'react';
import { User } from '../../types';
import { Icons } from '../ui/Icons';

interface LoginProps {
  onLogin: (user: User) => void;
  // Ahora pasamos email y password para validar
  validateCredentials: (email: string, password: string) => User | null;
}

export const Login: React.FC<LoginProps> = ({ onLogin, validateCredentials }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (email && password) {
      // Intentar autenticar con email y contraseña
      const user = validateCredentials(email, password);

      if (!user) {
        setError("⛔ Credenciales incorrectas o usuario no registrado.");
        return;
      }

      // Si es correcto, procedemos
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-[#0054a6] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in border-t-4 border-yellow-400">
        <div className="flex flex-col items-center mb-8">
          {/* Logo con sistema de Fallback */}
          {!logoError ? (
            <img 
                src="https://www.playabrava.com/wp-content/themes/playabrava/img/logo.png" 
                alt="Camping Platja Brava" 
                className="h-24 w-auto mb-4 object-contain transition-opacity duration-300"
                onError={() => setLogoError(true)}
            />
          ) : (
            <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-[#0054a6] border-4 border-blue-100">
                <Icons.Glamping size={48} />
            </div>
          )}
          
          <h1 className="text-2xl font-bold text-slate-800 text-center">Gestor Incidencias</h1>
          <p className="text-slate-500 text-sm mt-2">Área restringida para empleados</p>
        </div>

        {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <Icons.Alert size={18} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Corporativo</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Icons.User size={18} />
                </div>
                <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0054a6] focus:border-[#0054a6]"
                placeholder="usuario@playabrava.com"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icons.Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0054a6] focus:border-[#0054a6]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0054a6] text-white font-bold py-3.5 rounded-lg hover:bg-[#004080] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            Iniciar Sesión <Icons.Send size={18} />
          </button>
          
          <p className="text-center text-xs text-slate-400 mt-4">
            ¿Olvidaste tu contraseña? Contacta con Dirección (Raúl).
          </p>
        </form>
      </div>
    </div>
  );
};