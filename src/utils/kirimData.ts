/**
 * Modul Pengiriman Data dengan Pencegah Error (Google Apps Script / Webhook Integration)
 *
 * Mengimplementasikan pengiriman data dengan:
 * 1. Validasi input nama & email
 * 2. Header text/plain;charset=utf-8 untuk kompatibilitas CORS Google Apps Script Web App
 * 3. Pengecekan status HTTP dan logika bisnis (hasil.result === "success")
 * 4. Penanganan error yang ramah pengguna (alert & log)
 */

export interface KirimDataPayload {
  nama: string;
  email: string;
  action?: string;
  license_key?: string;
  skor_total?: number;
  skor_maksimal?: number;
  predikat?: string;
  status_kelulusan?: string;
  bidang_id?: string;
  bidang_nama?: string;
  mode_ujian?: string;
  rincian_subtes?: Record<string, any>;
  timestamp?: string;
  [key: string]: any;
}

export interface KirimDataResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const SCRIPT_URL_STORAGE_KEY = 'pro_asn_script_url';
export const USER_INFO_STORAGE_KEY = 'pro_asn_user_identity';

/**
 * Mengambil SCRIPT_URL aktif:
 * - Prioritas 1: URL custom dari LocalStorage yang diatur pengguna/owner
 * - Prioritas 2: Environment variable VITE_SCRIPT_URL
 * - Prioritas 3: Fallback ke endpoint server internal '/api/submit-data'
 */
export function getActiveScriptUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(SCRIPT_URL_STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  }

  const envUrl = (import.meta as any).env?.VITE_SCRIPT_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim();
  }

  return '/api/submit-data';
}

/**
 * Menyimpan konfigurasi SCRIPT_URL baru
 */
export function saveScriptUrl(url: string): void {
  if (typeof window !== 'undefined') {
    const clean = url.trim();
    if (clean) {
      localStorage.setItem(SCRIPT_URL_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(SCRIPT_URL_STORAGE_KEY);
    }
  }
}

/**
 * Mengambil data identitas pengguna tersimpan (nama & email)
 */
export function getSavedUserInfo(): { nama: string; email: string } {
  if (typeof window === 'undefined') return { nama: '', email: '' };
  try {
    const raw = localStorage.getItem(USER_INFO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        nama: typeof parsed.nama === 'string' ? parsed.nama : '',
        email: typeof parsed.email === 'string' ? parsed.email : '',
      };
    }
  } catch {
    // ignore
  }
  return { nama: '', email: '' };
}

/**
 * Menyimpan identitas pengguna (nama & email) agar tidak perlu diisi ulang
 */
export function saveUserInfo(info: { nama: string; email: string }): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        USER_INFO_STORAGE_KEY,
        JSON.stringify({
          nama: info.nama.trim(),
          email: info.email.trim(),
        })
      );
    } catch {
      // ignore
    }
  }
}

/**
 * Fungsi kirimDataDenganPencegahError sesuai spesifikasi:
 *
 * 1. Validasi Input Sebelum Pengiriman
 * 2. Cek Status HTTP Respon
 * 3. Cek Status Logika Bisnis dari Server
 * 4. Penanganan Error yang Ramah Pengguna
 */
export async function kirimDataDenganPencegahError(
  payload: KirimDataPayload,
  customScriptUrl?: string
): Promise<KirimDataResult> {
  // 1. Validasi Input Sebelum Pengiriman
  if (!payload.nama || !payload.email) {
    console.warn("⚠️ Peringatan: Input nama dan email tidak boleh kosong!");
    alert("Harap isi semua kolom!");
    return {
      success: false,
      error: "Input nama dan email tidak boleh kosong!",
    };
  }

  const SCRIPT_URL = customScriptUrl?.trim() || getActiveScriptUrl();

  try {
    console.log("⏳ Mengirim data ke server...", { SCRIPT_URL, payload });

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    // 2. Cek Status HTTP Respon
    if (!response.ok) {
      throw new Error(`Server Merespons Error HTTP: ${response.status}`);
    }

    const hasil = await response.json();

    // 3. Cek Status Logika Bisnis dari Server
    if (hasil.result === "success") {
      console.log("🎉 Data sukses tersimpan!", hasil);
      alert("Terima kasih, data Anda telah tersimpan.");

      // Simpan nama & email agar mempermudah pengiriman berikutnya
      saveUserInfo({ nama: payload.nama, email: payload.email });

      return {
        success: true,
        data: hasil,
      };
    } else {
      throw new Error(`Gagal dari sisi Server: ${hasil.error || 'Respon tidak diketahui'}`);
    }
  } catch (error: any) {
    // 4. Penanganan Error yang Ramah Pengguna
    console.error("🔍 [Detail Error Log]:", error?.message || error);
    alert("Maaf, terjadi gangguan koneksi. Data gagal terkirim. Silakan coba lagi.");
    return {
      success: false,
      error: error?.message || String(error),
    };
  }
}
