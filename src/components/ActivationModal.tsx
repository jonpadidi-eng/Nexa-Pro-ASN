import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Lock,
  User,
  Mail,
  Loader2,
} from 'lucide-react';
import {
  validateLicenseKey,
  saveLicenseToStorage,
  LYNK_SHOP_URL,
  OFFICIAL_PREAUTHORIZED_CODES,
} from '../utils/licenseValidator';
import {
  kirimDataDenganPencegahError,
  getSavedUserInfo,
  saveUserInfo,
} from '../utils/kirimData';

interface ActivationModalProps {
  isOpen: boolean;
  onActivated: (licenseKey: string) => void;
  currentKey?: string | null;
}

export const ActivationModal: React.FC<ActivationModalProps> = ({
  isOpen,
  onActivated,
  currentKey = '',
}) => {
  const [inputCode, setInputCode] = useState<string>(currentKey || '');
  const [nama, setNama] = useState<string>(() => getSavedUserInfo().nama || '');
  const [email, setEmail] = useState<string>(() => getSavedUserInfo().email || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successKey, setSuccessKey] = useState<string>('');

  if (!isOpen) return null;

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validasi Input Sebelum Pengiriman
    if (!nama.trim() || !email.trim()) {
      console.warn("⚠️ Peringatan: Input nama dan email tidak boleh kosong!");
      alert("Harap isi semua kolom!");
      return;
    }

    const result = validateLicenseKey(inputCode);
    if (!result.valid) {
      setErrorMessage(
        result.errorMessage ||
          'Kode Akses tidak ditemukan atau salah. Silakan periksa email bukti pembayaran Anda dari Lynk.id.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Simpan data identitas lokal
      saveUserInfo({ nama, email });

      // Kirim data aktivasi resmi ke server / Google Apps Script
      await kirimDataDenganPencegahError({
        nama: nama.trim(),
        email: email.trim(),
        license_key: result.normalizedKey,
        action: 'aktivasi_lisensi_pro_asn',
        timestamp: new Date().toISOString(),
      });

      // Simpan lisensi lokal
      saveLicenseToStorage(result.normalizedKey);
      setIsSuccess(true);
      setSuccessKey(result.normalizedKey);

      setTimeout(() => {
        onActivated(result.normalizedKey);
      }, 800);
    } catch (err: any) {
      console.error('Error saat aktivasi:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDemoCode = (code: string) => {
    setInputCode(code);
    if (!nama) setNama('Calon ASN Juara');
    if (!email) setEmail('peserta@asn.go.id');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 font-sans">
        {/* Top Header Badge / Pattern */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-7 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/20 ring-4 ring-amber-400/20">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                Sistem Lisensi Resmi
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Aktivasi Lisensi Pro ASN
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                Silakan masukkan <strong>Kode Akses Resmi</strong> untuk membuka seluruh 700 butir soal, kunci pembahasan, modul ajar, dan simulasi CAT.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-emerald-950">Aktivasi Berhasil!</h3>
              <p className="text-xs sm:text-sm text-emerald-800">
                Lisensi Anda <strong>{successKey}</strong> telah diverifikasi dan aktif. Membuka seluruh fitur aplikasi...
              </p>
            </div>
          ) : (
            <form onSubmit={handleActivate} className="space-y-5">
              {/* Error Message Alert */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm flex items-start gap-3 animate-in shake duration-200">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="block font-bold">Aktivasi Tidak Berhasil</strong>
                    <p className="text-xs leading-relaxed text-rose-800">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* User Identity: Nama & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Nama Lengkap Peserta:
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => {
                        setNama(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Nama Lengkap Anda"
                      className="w-full rounded-xl bg-slate-50 border border-slate-300 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email Bukti Pembayaran:
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="email@anda.com"
                      className="w-full rounded-xl bg-slate-50 border border-slate-300 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* License Key Large Input (Font 18px / text-lg) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Masukkan Kode Akses Lisensi:
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Contoh: PAS-PRO2026"
                    style={{ fontSize: '18px' }}
                    className="w-full rounded-2xl bg-slate-50 border-2 border-slate-300 pl-12 pr-4 py-4 text-slate-950 font-mono font-black tracking-wider focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 focus:outline-none transition placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal"
                    autoFocus
                    autoCapitalize="characters"
                    spellCheck="false"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Format pola: <strong>PAS-XXXXX</strong></span>
                  <span className="text-emerald-700 font-bold">1 Kali Aktivasi Selamanya</span>
                </div>
              </div>

              {/* Action Buttons: 2 Utama */}
              <div className="space-y-3 pt-2">
                {/* 1. Tombol Aktifkan Lisensi (Warna Kontras Hijau/Biru) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-base shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sedang Mengirim & Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Aktifkan Lisensi Sekarang</span>
                    </>
                  )}
                </button>

                {/* 2. Tombol Beli Kode Akses Resmi di Lynk.id */}
                <a
                  href={LYNK_SHOP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-amber-300 font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
                >
                  <span>Beli Kode Akses Resmi di Lynk.id</span>
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                </a>
              </div>
            </form>
          )}

          {/* Quick Help & Demo Hint */}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
            <div className="flex items-start gap-2 text-slate-600">
              <span className="font-bold text-slate-800">💡 Informasi:</span>
              <p className="leading-relaxed">
                Kode Akses dikirimkan otomatis setelah transaksi berhasil melalui platform Lynk.id. Status aktivasi tersimpan aman di browser Anda dan tetap aktif saat aplikasi dibuka luring (offline PWA).
              </p>
            </div>

            {/* Quick test chips for testers / owners */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 block">
                Kode Resmi Contoh untuk Pengujian:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {OFFICIAL_PREAUTHORIZED_CODES.slice(0, 3).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleSelectDemoCode(code)}
                    className="px-2 py-0.5 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 font-mono text-[10px] font-bold cursor-pointer transition"
                    title={`Klik untuk mengisi ${code}`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
