import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailToUse = username.includes('@') ? username : `${username}@fcb.pt`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (error) {
      setError("Acesso negado. Verifique as credenciais.");
      setLoading(false);
    } else {
      if (data.user) {
         const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

         if (profile) {
            localStorage.setItem('userRole', profile.role);
            navigate('/matches');
         } else {
             localStorage.setItem('userRole', 'dashboard');
             navigate('/matches');
         }
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      <div className="bg-dark-surface p-10 rounded-xl shadow-2xl w-full max-w-sm border border-dark-border relative z-10">
        <div className="flex justify-center mb-8">
            <img 
                src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" 
                alt="VPRO3 Logo" 
                className="h-16 object-contain"
            />
        </div>
        
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded mb-6 text-xs font-bold text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Operador</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border text-white p-3 rounded focus:outline-none focus:border-brand transition-colors text-sm placeholder-gray-700"
              placeholder="USERNAME"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Chave de Acesso</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border text-white p-3 rounded focus:outline-none focus:border-brand transition-colors text-sm placeholder-gray-700"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-hover text-black font-extrabold py-3 px-4 rounded transition duration-200 uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(255,77,0,0.3)] hover:shadow-[0_0_25px_rgba(255,77,0,0.5)]"
          >
            {loading ? 'A Autenticar...' : 'Iniciar Sessão'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-dark-border">
            <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                <span>SYSTEM: VPRO3_CORE</span>
                <span>STATUS: ONLINE</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;