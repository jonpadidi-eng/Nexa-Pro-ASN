import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, Key, UserCheck, AlertCircle, X, Sparkles } from 'lucide-react';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOwnerMode: boolean;
  onToggleOwnerMode: (enable: boolean) => void;
}

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({
  isOpen,
  onClose,
  isOwnerMode,
  onToggleOwnerMode,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // PIN Pemilik Akun: 050388
    if (pin === '050388' || pin === 'admin') {
      onToggleOwnerMode(true);
      setErrorMsg('');
      setPin('');
      onClose();
    } else {
      setErrorMsg('PIN salah. Masukkan PIN Akses Pemilik yang valid (050388).');
    }
  };

  const handleSwitchToPublic = () => {
    onToggleOwnerMode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border shadow-sm ${
              isOwnerMode
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}>
              {isOwnerMode ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {isOwnerMode ? 'Manajemen Akses Pemilik Akun' : 'Autentikasi Pemilik Akun'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemisahan hak akses publik & penambahan soal teknis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4">
          {isOwnerMode ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Mode Pemilik Akun Sedang Aktif</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Anda memiliki akses penuh untuk:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  <li>Menambahkan soal teknis bidang baru secara langsung.</li>
                  <li>Mengimpor dokumen materi dan bank soal PDF/JSON.</li>
                  <li>Mengunduh cadangan lokal .JSON master 700 soal.</li>
                </ul>
              </div>

              <button
                onClick={handleSwitchToPublic}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Beralih ke Tampilan Akses Publik (Peserta Ujian)</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>Akses Publik</strong> hanya dapat mengerjakan simulasi CAT 700 soal dan membaca pembahasan.
                </p>
                <p className="mt-1 text-slate-500">
                  Untuk menambah bank soal teknis baru atau mengelola cadangan JSON, silakan masukkan PIN pemilik akun.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>PIN Akses Pemilik Akun:</span>
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Masukkan PIN Pemilik (050388)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-amber-500 font-mono tracking-widest text-center text-sm"
                  autoFocus
                />
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>* PIN Akses Pemilik: <strong className="font-mono text-amber-700">050388</strong></span>
                  <button
                    type="button"
                    onClick={() => setPin('050388')}
                    className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                  >
                    Isi Otomatis
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 text-xs text-rose-600 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Buka Akses Pemilik Akun (Admin)</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-center text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Batal, Tetap di Mode Publik
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
