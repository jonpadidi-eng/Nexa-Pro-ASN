import React, { useState } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  Send,
  Sparkles,
  X,
  Code2,
  RefreshCw,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import {
  getActiveScriptUrl,
  saveScriptUrl,
  kirimDataDenganPencegahError,
  getSavedUserInfo,
  saveUserInfo,
} from '../utils/kirimData';

interface WebhookConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebhookConfigModal: React.FC<WebhookConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [scriptUrl, setScriptUrlInput] = useState<string>(() => getActiveScriptUrl());
  const [testNama, setTestNama] = useState<string>(() => getSavedUserInfo().nama || 'Budi Santoso');
  const [testEmail, setTestEmail] = useState<string>(() => getSavedUserInfo().email || 'budi@asn.go.id');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    saveScriptUrl(scriptUrl);
    saveUserInfo({ nama: testNama, email: testEmail });
    setStatusMessage({
      type: 'success',
      text: 'Konfigurasi SCRIPT_URL berhasil disimpan!',
    });
  };

  const handleResetToDefault = () => {
    saveScriptUrl('/api/submit-data');
    setScriptUrlInput('/api/submit-data');
    setStatusMessage({
      type: 'info',
      text: 'SCRIPT_URL dikembalikan ke endpoint server internal (/api/submit-data).',
    });
  };

  const handleTestSend = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await kirimDataDenganPencegahError(
        {
          nama: testNama,
          email: testEmail,
          action: 'uji_coba_koneksi',
          timestamp: new Date().toISOString(),
          keterangan: 'Tes fungsi kirimDataDenganPencegahError',
        },
        scriptUrl
      );

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: 'Uji coba sukses! Server merespons { result: "success" }.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `Gagal mengirim data: ${res.error || 'Terjadi kesalahan'}`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Error sistem: ${err?.message || err}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 font-sans max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">
                  Integrasi Google Apps Script & Server
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  Anti-CORS Ready
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pencegah error pengiriman data (Validasi, text/plain header, HTTP check, & graceful error).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-sky-50 border-sky-300 text-sky-900'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{statusMessage.text}</p>
              </div>
            </div>
          )}

          {/* SCRIPT_URL Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Target URL Server (SCRIPT_URL):
              </label>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold cursor-pointer underline"
              >
                Gunakan Server Bawaan (/api/submit-data)
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={scriptUrl}
                onChange={(e) => setScriptUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec atau /api/submit-data"
                className="w-full rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 py-3 text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Anda dapat mengarahkan ke <strong>Google Apps Script Web App</strong> (URL berakhiran <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">/exec</code>) atau ke server internal Pro ASN.
            </p>
          </div>

          {/* 4 Pilar Pencegah Error */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>4 Lapisan Pencegah Error dalam <code className="text-indigo-600 font-mono">kirimDataDenganPencegahError</code></span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <strong className="block text-slate-900">1. Validasi Input Ketat</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Mencegah request kosong jika nama atau email belum diisi.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <strong className="block text-slate-900">2. Header text/plain</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Bypass batasan CORS preflight OPTIONS pada Google Apps Script.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <strong className="block text-slate-900">3. Validasi HTTP & Bisnis</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Memverifikasi response.ok dan hasil.result === &quot;success&quot;.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <strong className="block text-slate-900">4. Penanganan Ramah Pengguna</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Pesan alert jelas bagi pengguna + log detail di konsol pengembang.
                </p>
              </div>
            </div>
          </div>

          {/* Test Form */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              <span>Form Uji Coba Pengiriman Data</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Lengkap:
                </label>
                <input
                  type="text"
                  value={testNama}
                  onChange={(e) => setTestNama(e.target.value)}
                  className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Alamat Email:
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  placeholder="Contoh: budi@asn.go.id"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveUrl}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Simpan Konfigurasi
              </button>

              <button
                type="button"
                onClick={handleTestSend}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sedang Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Uji Coba Kirim Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Status: Siap terintegrasi dengan Google Sheets & Database</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
