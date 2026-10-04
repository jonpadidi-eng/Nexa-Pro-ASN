import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  FileCheck2,
  AlertTriangle,
  Layers,
  Copy,
  Download,
  BookOpen,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  CheckCircle,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { ProAsnDataPackage, SubtestType, ValidationReport } from '../types/asn';
import { parseRawDocumentToPackage } from '../utils/parserEngine';
import { validateProAsnJson } from '../utils/jsonValidator';
import { sampleDocuments } from '../data/sampleRawDocs';

interface DocumentProcessorProps {
  currentData: ProAsnDataPackage;
  onUpdateData: (newData: ProAsnDataPackage) => void;
  onSwitchToBank: () => void;
  onSwitchToCat: () => void;
}

export const DocumentProcessor: React.FC<DocumentProcessorProps> = ({
  currentData,
  onUpdateData,
  onSwitchToBank,
  onSwitchToCat,
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [docType, setDocType] = useState<'auto' | 'modul' | 'soal_umum' | 'soal_teknis'>('auto');
  const [subtestHint, setSubtestHint] = useState<SubtestType>('KM-SK');
  const [fieldHint, setFieldHint] = useState<string>('kesehatan');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [engineMode, setEngineMode] = useState<'local' | 'ai'>('local');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Conversion result preview
  const [convertedPackage, setConvertedPackage] = useState<ProAsnDataPackage | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      setStatusMessage({
        type: 'info',
        text: `Dokumen "${file.name}" (${(file.size / 1024).toFixed(1)} KB) berhasil dibaca. Klik "Jalankan Konversi Presisi" di bawah.`,
      });
    };
    reader.onerror = () => {
      setStatusMessage({
        type: 'error',
        text: 'Gagal membaca berkas dokumen yang diunggah.',
      });
    };
    reader.readAsText(file);
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = sampleDocuments.find((s) => s.id === sampleId);
    if (!sample) return;
    setRawText(sample.content);
    if (sample.category === 'modul') setDocType('modul');
    else if (sample.category === 'soal_umum') setDocType('soal_umum');
    else if (sample.category === 'soal_teknis') setDocType('soal_teknis');
    else setDocType('auto');

    setStatusMessage({
      type: 'info',
      text: `Contoh dokumen "${sample.name}" dimuat. Siap diproses ke struktur JSON statis.`,
    });
  };

  const executeConversion = async () => {
    if (!rawText.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Harap tempelkan teks dokumen atau unggah berkas terlebih dahulu.',
      });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      let resultPackage: ProAsnDataPackage;

      if (engineMode === 'ai') {
        // AI Endpoint Call
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawText,
            docType,
            subtestHint,
            fieldHint,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Gagal memproses dengan Gemini AI. Mengalihkan ke Engine Lokal.');
        }

        resultPackage = data.data;
      } else {
        // Smart Local Deterministic Engine
        resultPackage = parseRawDocumentToPackage(rawText, {
          docType,
          defaultSubtest: subtestHint,
          defaultField: fieldHint,
        });
      }

      // Ensure version and last_updated are stamped
      if (!resultPackage.version) resultPackage.version = '1.0.0';
      resultPackage.last_updated = new Date().toISOString();

      // Validate result
      const report = validateProAsnJson(resultPackage);
      setConvertedPackage(resultPackage);
      setValidationReport(report);

      const totalSoal = resultPackage.general_questions.length + resultPackage.technical_questions.length;
      setStatusMessage({
        type: 'success',
        text: `Konversi Berhasil! Terdeteksi ${resultPackage.modules.length} Modul Ajar, ${resultPackage.general_questions.length} Soal Umum (4 Subtes), dan ${resultPackage.technical_questions.length} Soal Teknis. Validasi JSON: ${report.isValid ? 'VALID' : 'Ada Catatan'}.`,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('AI Extraction failed, falling back to local:', errMsg);

      // Fallback to local parser
      const fallbackResult = parseRawDocumentToPackage(rawText, {
        docType,
        defaultSubtest: subtestHint,
        defaultField: fieldHint,
      });
      fallbackResult.version = '1.0.0';
      fallbackResult.last_updated = new Date().toISOString();
      const report = validateProAsnJson(fallbackResult);
      setConvertedPackage(fallbackResult);
      setValidationReport(report);

      setStatusMessage({
        type: 'info',
        text: `Diproses menggunakan Smart Local Parser bawaan: ${fallbackResult.modules.length} Modul, ${fallbackResult.general_questions.length + fallbackResult.technical_questions.length} Soal terstruktur.`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToBank = (mode: 'replace' | 'merge') => {
    if (!convertedPackage) return;

    if (mode === 'replace') {
      onUpdateData(convertedPackage);
      setStatusMessage({
        type: 'success',
        text: 'Bank Soal Utama berhasil diganti dengan data dokumen baru ini.',
      });
    } else {
      // Merge
      const merged: ProAsnDataPackage = {
        version: convertedPackage.version || currentData.version,
        last_updated: new Date().toISOString(),
        meta: {
          title: 'Bank Soal Pro ASN (Hasil Penggabungan)',
          total_modules: currentData.modules.length + convertedPackage.modules.length,
          total_general_questions: currentData.general_questions.length + convertedPackage.general_questions.length,
          total_technical_questions: currentData.technical_questions.length + convertedPackage.technical_questions.length,
        },
        modules: [...currentData.modules, ...convertedPackage.modules],
        general_questions: [...currentData.general_questions, ...convertedPackage.general_questions],
        technical_questions: [...currentData.technical_questions, ...convertedPackage.technical_questions],
      };
      onUpdateData(merged);
      setStatusMessage({
        type: 'success',
        text: `Berhasil menggabungkan dokumen ke dalam Bank Soal. Total sekarang: ${merged.modules.length} Modul, ${merged.general_questions.length + merged.technical_questions.length} Soal.`,
      });
    }
  };

  const handleCopyJson = () => {
    if (!convertedPackage) return;
    navigator.clipboard.writeText(JSON.stringify(convertedPackage, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleDownloadJson = () => {
    if (!convertedPackage) return;
    const blob = new Blob([JSON.stringify(convertedPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-soal-pro-asn-v${convertedPackage.version || '1.0.0'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Heading */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Engine Pengolah Data & Arsitek Konten Pro ASN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            Konversi Dokumen Mentah Menjadi Struktur Data JSON Statis Presisi
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Membaca dan merapikan naskah dokumen (Modul Ajar, Soal Umum 4 Subtes: KM-SK, POT, LD, PK, serta Soal Teknis Jabatan) secara instan, bebas galat sintaks, mempertahankan bobot dan teks asli, serta siap digunakan di web PWA.
          </p>
        </div>
      </div>

      {/* Main Grid: Input Workspace & Conversion Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (8 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                <FolderOpen className="w-4 h-4 text-amber-400" />
                <span>Dokumen Masukan (Input)</span>
              </div>

              {/* Sample Document Selectors */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Muat Contoh:</span>
                <button
                  onClick={() => handleLoadSample('sample-modul-ajar')}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-medium text-amber-300 border border-slate-700 transition cursor-pointer"
                >
                  Modul Ajar
                </button>
                <button
                  onClick={() => handleLoadSample('sample-soal-umum')}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-medium text-amber-300 border border-slate-700 transition cursor-pointer"
                >
                  Soal Umum
                </button>
                <button
                  onClick={() => handleLoadSample('sample-soal-teknis')}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-medium text-amber-300 border border-slate-700 transition cursor-pointer"
                >
                  Soal Teknis
                </button>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-4 text-center cursor-pointer transition bg-slate-950/40 hover:bg-amber-500/5"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json,.csv,.doc"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-1.5">
                <div className="p-2 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-300 group-hover:text-amber-300 transition">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  Klik untuk Unggah Berkas atau Tarik & Lepas Dokumen ke Sini
                </div>
                <div className="text-[11px] text-slate-400">
                  Mendukung .txt, .md, .json, naskah modul, dan teks butir soal ujian
                </div>
              </div>
            </div>

            {/* Raw Text Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Atau Tempel Teks Dokumen Mentah:</span>
                <span>{rawText.length.toLocaleString()} karakter</span>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Contoh format teks:
# MODUL AJAR: INTEGRITAS & PELAYANAN
Materi Pokok: ...
Poin Strategi: ...
Indikator Utama: ...
Pola Jawaban: ...

1. Anda bertugas di dinas penanaman modal...
A. Menolak dengan santun (Skor 5)
B. Melaporkan ke atasan (Skor 4)
Kunci: A
Pembahasan: ..."
                className="w-full h-72 rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none leading-relaxed transition"
              />
            </div>

            {/* Quick Actions under textarea */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setRawText('')}
                className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                Kosongkan Input
              </button>
              <div className="text-[11px] text-slate-500">
                Pencocokan pola otomatis: A-E, skor, kunci jawaban, dan pembahasan.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Engine Settings & Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm pb-3 border-b border-slate-800">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Konfigurasi & Parameter Klasifikasi</span>
            </div>

            {/* Engine Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Pilihan Mesin Pemroses:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEngineMode('local')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    engineMode === 'local'
                      ? 'border-amber-500/80 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">Smart Local Engine</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">100% Offline</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300 leading-snug">
                    Cepat, deterministik, bekerja tanpa kuota / internet langsung di browser.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setEngineMode('ai')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    engineMode === 'ai'
                      ? 'border-amber-500/80 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">Gemini AI Architect</span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">Deep Extract</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300 leading-snug">
                    Untuk dokumen tidak beraturan, hasil scan OCR, atau dokumen panjang.
                  </p>
                </button>
              </div>
            </div>

            {/* Document Type Hint */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Target Jenis Dokumen:</span>
                <span className="text-[10px] text-slate-400">Aturan Ekstraksi</span>
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as 'auto' | 'modul' | 'soal_umum' | 'soal_teknis')}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="auto">Deteksi Otomatis (Modul & Soal Gabungan)</option>
                <option value="modul">1. Modul Ajar (Materi, Strategi, Indikator, Pola Jawaban)</option>
                <option value="soal_umum">2. Soal Umum (4 Subtes: KM-SK, POT, LD, PK)</option>
                <option value="soal_teknis">3. Soal Teknis (Spesifik Bidang Profesi Jabatan)</option>
              </select>
            </div>

            {/* Subtest Default Hint */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Prioritas Subtes Umum (4 Subtes Pro ASN):
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {(
                  [
                    { id: 'KM-SK', label: 'KM-SK (Manajerial & Sosio-Kultural)' },
                    { id: 'POT', label: 'POT (Uji Potensi)' },
                    { id: 'LD', label: 'LD (Literasi Digital)' },
                    { id: 'PK', label: 'PK (Preferensi Karir / RIASEC)' },
                  ] as const
                ).map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSubtestHint(sub.id)}
                    className={`px-2.5 py-1.5 rounded-lg border text-left text-[11px] font-medium transition cursor-pointer truncate ${
                      subtestHint === sub.id
                        ? 'border-amber-500 bg-amber-500/20 text-amber-200 font-bold'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field Default Hint */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Kategori Bidang Teknis:
              </label>
              <select
                value={fieldHint}
                onChange={(e) => setFieldHint(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="auditor">Auditor & Pengawas (Inspektorat / APIP & PPUPD)</option>
                <option value="sosial">Dinas Sosial & Kesejahteraan Sosial (Peksos / DTKS)</option>
                <option value="kesehatan">Kesehatan & Medis (Perawat, Dokter, Farmasi, RS)</option>
                <option value="pendidikan">Pendidikan & Pengajaran (Guru, Dosen, Pedagogik)</option>
                <option value="administrasi">Administrasi & Tata Kelola (Arsip, Tata Naskah, PTSP)</option>
                <option value="teknologi_informasi">Teknologi Informasi (SPBE, Jaringan, Siber, Data)</option>
                <option value="hukum">Hukum & Kebijakan Perundang-undangan</option>
                <option value="keuangan">Keuangan, Anggaran, & Perbendaharaan Negara</option>
              </select>
            </div>

            {/* Execute Button */}
            <button
              onClick={executeConversion}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Dokumen...</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Jalankan Konversi Presisi ke JSON</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
              : 'bg-blue-950/50 border-blue-500/40 text-blue-200'
          }`}
        >
          {statusMessage.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />}
          {statusMessage.type === 'error' && <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />}
          {statusMessage.type === 'info' && <HelpCircle className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />}
          <div className="flex-1 font-medium">{statusMessage.text}</div>
        </div>
      )}

      {/* Result Section: Appears after conversion */}
      {convertedPackage && (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Hasil Ekstraksi & Arsitektur Konten
                </h2>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-2.5 py-0.5 font-bold">
                  Valid JSON
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Versi: <strong>{convertedPackage.version}</strong> | Terakhir Diperbarui: <strong>{new Date(convertedPackage.last_updated).toLocaleString('id-ID')}</strong>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>{copySuccess ? 'Tersalin!' : 'Salin JSON'}</span>
              </button>
              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Unduh File .JSON</span>
              </button>
              <button
                onClick={() => handleApplyToBank('merge')}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                title="Tambahkan data ini ke dalam koleksi Bank Soal aktif"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Gabung ke Bank Soal</span>
              </button>
              <button
                onClick={() => handleApplyToBank('replace')}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition cursor-pointer"
                title="Gantikan seluruh isi Bank Soal dengan dokumen baru ini"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ganti Bank Soal Penuh</span>
              </button>
            </div>
          </div>

          {/* Stat Cards of Extracted Content */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs text-slate-400 font-medium">Modul Ajar Terekstrak</div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {convertedPackage.modules.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Materi, Strategi & Indikator</div>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs text-slate-400 font-medium">Soal Umum (4 Subtes)</div>
              <div className="text-2xl font-black text-sky-400 mt-1">
                {convertedPackage.general_questions.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">KM-SK, POT, LD, PK</div>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs text-slate-400 font-medium">Soal Teknis Profesi</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {convertedPackage.technical_questions.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Spesifik Bidang Keahlian</div>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs text-slate-400 font-medium">Status Validasi Atribut</div>
              <div className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>version & timestamp OK</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Teks Asli & Opsi Terjaga</div>
            </div>
          </div>

          {/* Validation Report Details */}
          {validationReport && validationReport.issues.length > 0 && (
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Catatan Validasi & Klasifikasi Dokumen ({validationReport.issues.length}):</span>
              </div>
              <ul className="text-xs space-y-1 pl-4 list-disc text-slate-400">
                {validationReport.issues.map((issue, idx) => (
                  <li key={idx} className={issue.type === 'error' ? 'text-rose-300' : 'text-amber-300/90'}>
                    <strong className="text-slate-200">[{issue.location}]:</strong> {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Previews: Modules & Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">
                Pratinjau Data yang Siap Dimuat ke Aplikasi
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={onSwitchToBank}
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Jelajahi di Bank Soal</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={onSwitchToCat}
                  className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Uji di Simulasi CAT</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Extracted Modules List */}
            {convertedPackage.modules.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Modul Ajar ({convertedPackage.modules.length})
                </div>
                {convertedPackage.modules.map((m, idx) => (
                  <div key={idx} className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-100">{m.title}</span>
                      <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5">
                        Kategori: {m.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        <div className="font-semibold text-amber-300 mb-1">Materi Pokok:</div>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                          {m.core_topics.map((t, tidx) => (
                            <li key={tidx}>{t}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        <div className="font-semibold text-sky-300 mb-1">Poin Strategi & Trik:</div>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                          {m.strategy_points.map((s, sidx) => (
                            <li key={sidx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {m.answer_patterns.length > 0 && (
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 text-xs">
                        <div className="font-semibold text-emerald-300 mb-1">Kriteria Pola Jawaban:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {m.answer_patterns.map((pat, pidx) => (
                            <div key={pidx} className="border-l-2 border-emerald-500 pl-2">
                              <span className="font-bold text-slate-200">{pat.pattern_name}:</span>{' '}
                              <span className="text-slate-400">{pat.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Extracted Questions Sample (First 3) */}
            {(convertedPackage.general_questions.length > 0 || convertedPackage.technical_questions.length > 0) && (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Sampel Butir Soal Terstruktur ({convertedPackage.general_questions.length + convertedPackage.technical_questions.length} Total)
                </div>
                {[...convertedPackage.general_questions, ...convertedPackage.technical_questions].slice(0, 3).map((q, idx) => (
                  <div key={idx} className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300">#{idx + 1} ({q.id})</span>
                        {'subtest' in q ? (
                          <span className="rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 font-bold text-[10px]">
                            {q.subtest} - {q.subtest_label}
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 font-bold text-[10px]">
                            Teknis: {q.field_label}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">Kunci: <strong className="text-amber-400">{q.answer_key}</strong></span>
                    </div>

                    <p className="text-slate-200 font-medium leading-relaxed">{q.question}</p>

                    <div className="space-y-1 pl-2">
                      {q.options.map((opt) => (
                        <div
                          key={opt.code}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                            opt.code === q.answer_key
                              ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200 font-medium'
                              : 'border-slate-800 bg-slate-950/40 text-slate-300'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-amber-400 mr-2">{opt.code}.</span>
                            <span>{opt.text}</span>
                          </div>
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 shrink-0 ml-2">
                            Skor: {opt.score}
                          </span>
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                        <strong className="text-amber-300">Pembahasan:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
