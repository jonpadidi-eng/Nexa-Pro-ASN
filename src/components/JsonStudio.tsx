import React, { useState, useEffect } from 'react';
import {
  Code2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Download,
  Upload,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  Sparkles,
  Layers,
  Database,
  FileDown,
  HardDriveDownload,
  Info,
} from 'lucide-react';
import { ProAsnDataPackage, ValidationReport } from '../types/asn';
import { validateProAsnJson } from '../utils/jsonValidator';

interface JsonStudioProps {
  dataPackage: ProAsnDataPackage;
  onUpdateData: (newData: ProAsnDataPackage) => void;
}

export const JsonStudio: React.FC<JsonStudioProps> = ({ dataPackage, onUpdateData }) => {
  const [jsonString, setJsonString] = useState<string>('');
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [isMinified, setIsMinified] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Sync initial string
  useEffect(() => {
    const formatted = JSON.stringify(dataPackage, null, isMinified ? 0 : 2);
    setJsonString(formatted);
    const report = validateProAsnJson(dataPackage);
    setValidationReport(report);
  }, [dataPackage, isMinified]);

  const handleTextChange = (newVal: string) => {
    setJsonString(newVal);
    const report = validateProAsnJson(newVal);
    setValidationReport(report);
  };

  const handleApplyChanges = () => {
    try {
      const parsed = JSON.parse(jsonString);
      parsed.last_updated = new Date().toISOString();
      const report = validateProAsnJson(parsed);

      if (!report.isValid) {
        setStatusMessage({
          type: 'error',
          text: 'Peringatan: JSON memiliki kesalahan struktur/sintaks. Perbaiki sebelum menyimpan ke Bank Soal.',
        });
        return;
      }

      onUpdateData(parsed as ProAsnDataPackage);
      setStatusMessage({
        type: 'success',
        text: 'Data berhasil divalidasi dan disimpan ke memori Bank Soal Pro ASN!',
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setStatusMessage({
        type: 'error',
        text: `Gagal menyimpan: Format sintaks JSON tidak valid (${errMsg})`,
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadFullBackup = () => {
    try {
      // Prefer parsed editor content if valid, otherwise fallback to dataPackage
      let targetData: ProAsnDataPackage = dataPackage;
      try {
        const parsed = JSON.parse(jsonString);
        if (parsed && typeof parsed === 'object') {
          targetData = parsed as ProAsnDataPackage;
        }
      } catch {
        targetData = dataPackage;
      }

      // Add backup metadata timestamp
      const backupPayload = {
        ...targetData,
        backup_created_at: new Date().toISOString(),
      };

      const jsonBlob = new Blob([JSON.stringify(backupPayload, null, 2)], {
        type: 'application/json;charset=utf-8;',
      });
      const downloadUrl = URL.createObjectURL(jsonBlob);
      const dateStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `cadangan-pro-asn-v${targetData.version || '1.0.0'}-${dateStr}_${timeStr}.json`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setStatusMessage({
        type: 'success',
        text: `Cadangan lokal "${filename}" berhasil diunduh ke perangkat Anda. File ini dapat diimpor kembali sewaktu-waktu.`,
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      console.error('Gagal mengunduh cadangan:', err);
      setStatusMessage({
        type: 'error',
        text: 'Terjadi kendala saat menyiapkan berkas cadangan JSON.',
      });
    }
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleTextChange(content);
      setStatusMessage({
        type: 'info',
        text: `Berkas "${file.name}" (${(file.size / 1024).toFixed(1)} KB) berhasil dimuat ke editor. Klik "Simpan Perubahan ke Bank" untuk menerapkan.`,
      });
    };
    reader.onerror = () => {
      setStatusMessage({
        type: 'error',
        text: 'Gagal membaca berkas JSON yang dipilih.',
      });
    };
    reader.readAsText(file);
  };

  // Calculate payload size
  const totalBytes = new Blob([jsonString]).size;
  const sizeKb = (totalBytes / 1024).toFixed(1);

  const safeModules = dataPackage?.modules || [];
  const safeGeneral = dataPackage?.general_questions || [];
  const safeTechnical = dataPackage?.technical_questions || [];
  const totalItems = safeModules.length + safeGeneral.length + safeTechnical.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">JSON Studio & Arsitektur Validasi Data</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Validasi kepatuhan skema, unduh cadangan lokal (.json), dan manajemen paket data Pro ASN
          </p>
        </div>

        {/* Action Buttons Header */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Impor .JSON</span>
            <input type="file" accept=".json" onChange={handleImportJsonFile} className="hidden" />
          </label>

          <button
            onClick={() => setIsMinified(!isMinified)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
          >
            {isMinified ? 'Format Rapi (Pretty)' : 'Kecilkan (Minify)'}
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>{copySuccess ? 'Tersalin!' : 'Salin JSON'}</span>
          </button>

          <button
            onClick={handleDownloadFullBackup}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <HardDriveDownload className="w-4 h-4" />
            <span>Unduh Cadangan .JSON</span>
          </button>
        </div>
      </div>

      {/* Dedicated Local Backup Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Cadangan Data Lokal Mandiri (Full Backup)</h3>
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  v{dataPackage.version || '1.0.0'}
                </span>
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-700">
                  {sizeKb} KB
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Unduh seluruh data saat ini mencakup <strong>{totalItems} butir item</strong> ({safeModules.length} Modul Ajar, {safeGeneral.length} Soal Umum 4 Subtes, dan {safeTechnical.length} Soal Teknis Jabatan) ke berkas <code>.json</code> murni untuk disimpan secara aman di komputer/HP Anda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleDownloadFullBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/25 transition cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Simpan File .JSON Sekarang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Validation Health Metric Cards */}
      {validationReport && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Syntax Status */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-xs text-slate-400 font-medium">Sintaks Validitas</div>
            <div className="flex items-center gap-2 mt-1">
              {validationReport.isValid ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-base font-bold text-emerald-300">Valid JSON</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span className="text-base font-bold text-rose-400">Ada Galat</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Standar RFC 8259</div>
          </div>

          {/* Version Attribute */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-xs text-slate-400 font-medium">Atribut &quot;version&quot;</div>
            <div className="text-lg font-mono font-bold text-amber-400 mt-1">
              v{validationReport.version || 'Belum Ada'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Pelacakan Versi Dokumen</div>
          </div>

          {/* Last Updated Attribute */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-xs text-slate-400 font-medium">Atribut &quot;last_updated&quot;</div>
            <div className="text-xs font-mono font-bold text-sky-400 mt-1.5 truncate" title={validationReport.lastUpdated}>
              {validationReport.lastUpdated ? new Date(validationReport.lastUpdated).toLocaleDateString('id-ID') : 'Belum Ada'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">ISO 8601 Timestamp</div>
          </div>

          {/* Content Classification Stats */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-xs text-slate-400 font-medium">Total Item Terklasifikasi</div>
            <div className="text-lg font-bold text-white mt-1">
              {totalItems} Item
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {safeModules.length} Modul • {safeGeneral.length} Umum • {safeTechnical.length} Teknis
            </div>
          </div>
        </div>
      )}

      {/* Status Message Toast */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-sm transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-950/70 border-rose-500/50 text-rose-200'
              : 'bg-sky-950/70 border-sky-500/50 text-sky-200'
          }`}
        >
          {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          {statusMessage.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Editor & Validation Issues View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* JSON Code Area (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 shadow-inner space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-900">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-300 font-bold">Editor Kode Sumber JSON</span>
                <span className="text-[10px] text-slate-500">({sizeKb} KB)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadFullBackup}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
                  title="Unduh seluruh data sebagai file JSON"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Unduh .JSON</span>
                </button>

                <button
                  onClick={handleApplyChanges}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan ke Bank</span>
                </button>
              </div>
            </div>

            <textarea
              value={jsonString}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full h-[520px] bg-transparent text-xs text-emerald-400 font-mono leading-relaxed focus:outline-none resize-none selection:bg-amber-500 selection:text-slate-950"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Validation Issues & Schema Checklist (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200">Kepatuhan Arsitektur Data Pro ASN</h3>
            </div>

            {/* Checklist */}
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${validationReport?.isValid ? 'text-emerald-400' : 'text-slate-600'}`} />
                <div>
                  <div className="font-semibold text-slate-200">Sintaks Valid (Valid JSON Only)</div>
                  <div className="text-[11px] text-slate-400">Bebas dari koma gantung atau tanda kurung rusak.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${validationReport?.hasVersion ? 'text-emerald-400' : 'text-slate-600'}`} />
                <div>
                  <div className="font-semibold text-slate-200">Atribut &quot;version&quot; Ada</div>
                  <div className="text-[11px] text-slate-400">Untuk pelacakan pembaruan versi bank soal.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${validationReport?.hasLastUpdated ? 'text-emerald-400' : 'text-slate-600'}`} />
                <div>
                  <div className="font-semibold text-slate-200">Atribut &quot;last_updated&quot; Ada</div>
                  <div className="text-[11px] text-slate-400">Stempel waktu ISO 8601 audit data.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <div className="font-semibold text-slate-200">Modul Ajar Terstruktur</div>
                  <div className="text-[11px] text-slate-400">Materi pokok, strategi, indikator BKN, dan pola skor.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <div className="font-semibold text-slate-200">4 Subtes Utama Pro ASN</div>
                  <div className="text-[11px] text-slate-400">KM-SK, POT, LD, PK RIASEC terpisah presisi.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <div className="font-semibold text-slate-200">Soal Teknis Berdasarkan Bidang</div>
                  <div className="text-[11px] text-slate-400">Auditor/APIP, Dinsos, Kesehatan, Administrasi, dll.</div>
                </div>
              </div>
            </div>

            {/* Validation issues list */}
            {validationReport && validationReport.issues.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-amber-400">Catatan Validasi ({validationReport.issues.length}):</div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {validationReport.issues.map((iss, i) => (
                    <div
                      key={i}
                      className={`text-[11px] p-2 rounded-lg border ${
                        iss.type === 'error'
                          ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                          : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      <strong>{iss.location}:</strong> {iss.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

