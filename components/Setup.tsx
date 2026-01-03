import React, { useState } from 'react';
import { saveCredentials } from '../services/supabaseClient';

const Setup: React.FC = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && key) {
      saveCredentials(url.trim(), key.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 font-sans">
      <div className="bg-dark-surface p-8 rounded-xl shadow-2xl w-full max-w-md border border-dark-border">
        <div className="text-center mb-6">
            <img src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" alt="Logo" className="h-10 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-white uppercase tracking-wider">Configuração de Sistema</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-brand uppercase tracking-widest mb-1">Project URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border text-white p-3 rounded focus:border-brand focus:outline-none text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-brand uppercase tracking-widest mb-1">Anon Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border text-white p-3 rounded focus:border-brand focus:outline-none text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand hover:bg-brand-hover text-black font-bold py-3 rounded transition uppercase tracking-wide text-xs mt-4 shadow-lg"
          >
            Iniciar Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

export default Setup;