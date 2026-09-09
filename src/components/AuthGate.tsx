import React, { useEffect, useState } from 'react';
import App from '../App';
import { ensureAnonymousAuth } from '../lib/auth';

export const AuthGate: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    ensureAnonymousAuth().then((user) => {
      if (!mounted) return;
      setFailed(!user);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin" />
          <p className="font-semibold">OldiSotti yuklanmoqda…</p>
          <p className="mt-1 text-sm text-slate-400">Xavfsiz ulanish tekshirilmoqda</p>
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-red-900/60 bg-slate-900 p-6 text-center shadow-xl">
          <h1 className="text-xl font-bold">Xavfsiz ulanish amalga oshmadi</h1>
          <p className="mt-2 text-sm text-slate-400">
            Firebase Anonymous Authentication yoqilmagan yoki konfiguratsiyada xatolik bor.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 font-bold hover:bg-indigo-500"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  return <App />;
};
