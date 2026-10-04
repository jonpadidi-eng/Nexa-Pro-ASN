/**
 * License Key Verification System for Bank Soal Pro ASN
 * Format: PAS-XXXXX (e.g., PAS-PRO2026, PAS-BKN2026, PAS-LYNK01, PAS-050388)
 */

export const LICENSE_STORAGE_KEY_ACTIVATED = 'is_activated';
export const LICENSE_STORAGE_KEY_CODE = 'license_key';
export const LICENSE_STORAGE_KEY_DATE = 'license_activated_at';

// Pre-authorized VIP / master codes provided to purchasers
export const OFFICIAL_PREAUTHORIZED_CODES: string[] = [
  'PAS-PRO2026',
  'PAS-ASN700',
  'PAS-BKN2026',
  'PAS-VIP888',
  'PAS-LYNK01',
  'PAS-050388', // Owner master key
  'PAS-MANDIRI26',
  'PAS-SUKSES2026',
  'PAS-JUARA2026',
];

export const LYNK_SHOP_URL = 'https://lynk.id/logikabirokrasi';

export interface LicenseValidationResult {
  valid: boolean;
  normalizedKey: string;
  errorMessage?: string;
}

/**
 * Normalizes input code:
 * - Trims whitespace
 * - Converts to uppercase
 * - Auto-prepends 'PAS-' if user only enters the 4-8 alphanumeric suffix
 */
export function normalizeLicenseCode(rawInput: string): string {
  let cleaned = (rawInput || '').trim().toUpperCase();
  if (!cleaned) return '';

  // If user entered e.g. "PRO2026" without "PAS-", auto-prefix "PAS-"
  if (!cleaned.startsWith('PAS-') && !cleaned.startsWith('PAS')) {
    cleaned = `PAS-${cleaned}`;
  } else if (cleaned.startsWith('PAS') && !cleaned.startsWith('PAS-')) {
    cleaned = `PAS-${cleaned.slice(3)}`;
  }

  return cleaned;
}

/**
 * Validates the license code:
 * - Must not be empty
 * - Must either be in the pre-authorized array or match format PAS-[A-Z0-9]{4,16}
 */
export function validateLicenseKey(rawInput: string): LicenseValidationResult {
  const normalized = normalizeLicenseCode(rawInput);

  if (!normalized || normalized === 'PAS-') {
    return {
      valid: false,
      normalizedKey: '',
      errorMessage: 'Kode Akses tidak boleh kosong. Silakan periksa email bukti pembayaran Anda dari Lynk.id.',
    };
  }

  // 1. Check exact match in official pre-authorized codes
  const isOfficialListed = OFFICIAL_PREAUTHORIZED_CODES.includes(normalized);

  // 2. Check pattern matching: "PAS-" followed by 4 to 16 alphanumeric characters
  const patternRegex = /^PAS-[A-Z0-9]{4,16}$/;
  const isPatternValid = patternRegex.test(normalized);

  if (isOfficialListed || isPatternValid) {
    return {
      valid: true,
      normalizedKey: normalized,
    };
  }

  return {
    valid: false,
    normalizedKey: normalized,
    errorMessage: 'Kode Akses tidak ditemukan atau salah. Silakan periksa email bukti pembayaran Anda dari Lynk.id.',
  };
}

/**
 * Retrieves current activation status from LocalStorage
 */
export function getStoredLicense(): { isActivated: boolean; licenseKey: string | null } {
  if (typeof window === 'undefined') {
    return { isActivated: false, licenseKey: null };
  }

  try {
    const isActivated = localStorage.getItem(LICENSE_STORAGE_KEY_ACTIVATED) === 'true';
    const licenseKey = localStorage.getItem(LICENSE_STORAGE_KEY_CODE);
    return {
      isActivated: Boolean(isActivated && licenseKey),
      licenseKey: licenseKey || null,
    };
  } catch {
    return { isActivated: false, licenseKey: null };
  }
}

/**
 * Persists valid license in LocalStorage
 */
export function saveLicenseToStorage(licenseKey: string): void {
  try {
    localStorage.setItem(LICENSE_STORAGE_KEY_ACTIVATED, 'true');
    localStorage.setItem(LICENSE_STORAGE_KEY_CODE, licenseKey);
    localStorage.setItem(LICENSE_STORAGE_KEY_DATE, new Date().toISOString());
  } catch (e) {
    console.error('Failed to save license to localStorage:', e);
  }
}

/**
 * Clears license from LocalStorage (for logout / license change)
 */
export function clearLicenseFromStorage(): void {
  try {
    localStorage.removeItem(LICENSE_STORAGE_KEY_ACTIVATED);
    localStorage.removeItem(LICENSE_STORAGE_KEY_CODE);
    localStorage.removeItem(LICENSE_STORAGE_KEY_DATE);
  } catch (e) {
    console.error('Failed to clear license from localStorage:', e);
  }
}
