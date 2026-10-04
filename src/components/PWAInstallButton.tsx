import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>PWA Aktif</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95 cursor-pointer"
        title="Install Aplikasi Bank Soal Pro ASN ke Perangkat Anda"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Pasang Aplikasi (PWA)</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
          title="Pasang di iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Pasang di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-100">Pasang di iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs shrink-0 mt-0.5">1</span>
                  <span>Buka menu browser Safari, lalu ketuk tombol <strong>Bagikan (Share)</strong> pada bilah navigasi.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs shrink-0 mt-0.5">2</span>
                  <span>Gulir ke bawah dan pilih opsi <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs shrink-0 mt-0.5">3</span>
                  <span>Ketuk <strong>Tambah (Add)</strong> di sudut kanan atas untuk membuka aplikasi secara offline kapan saja.</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  const [showDesktopInfo, setShowDesktopInfo] = useState(false);

  // Fallback indicator or prompt when running in standard desktop browser without trigger
  return (
    <>
      <button
        onClick={() => setShowDesktopInfo(true)}
        className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-600 hover:text-white transition-all cursor-pointer"
        title="Informasi PWA Ready"
      >
        <Download className="w-3.5 h-3.5 text-amber-400" />
        <span>PWA Siap</span>
      </button>

      {showDesktopInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Download className="w-4 h-4" />
                <span>Pemasangan Aplikasi PWA</span>
              </div>
              <button
                onClick={() => setShowDesktopInfo(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Untuk memasang aplikasi ini di komputer Anda:
              <br /><br />
              1. Klik ikon <strong>Install / Tambah</strong> di bilah alamat peramban (Chrome / Edge / Brave).
              <br />
              2. Atau tekan <strong>Ctrl + D</strong> (Cmd + D di Mac) untuk menyimpan sebagai pintasan cepat.
            </p>
            <button
              onClick={() => setShowDesktopInfo(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
