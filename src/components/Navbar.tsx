import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Clock,
  BarChart3,
  Briefcase,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  User,
  PlusCircle,
  HardDriveDownload,
  LogOut,
  PlayCircle,
  Award,
  Upload,
  Globe,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { getJobFieldById } from '../data/jobFields';

export type ActiveTab = 'modules' | 'bank' | 'simulation' | 'dashboard' | 'processor' | 'json';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedJobField: string;
  onOpenFieldModal: () => void;
  isOwnerMode: boolean;
  onOpenAuthModal: () => void;
  onOpenAddQuestionModal?: () => void;
  onOpenUploadPdfModal?: () => void;
  onOpenWebhookConfig?: () => void;
  stats: {
    modulesCount: number;
    generalCount: number;
    technicalCount: number;
    version: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedJobField,
  onOpenFieldModal,
  isOwnerMode,
  onOpenAuthModal,
  onOpenAddQuestionModal,
  onOpenUploadPdfModal,
  onOpenWebhookConfig,
  stats,
}) => {
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  // Close admin menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentJob = getJobFieldById(selectedJobField);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-3">
          {/* Left: Branding & Prominent Bidang/Unit Selector */}
          <div className="flex items-center gap-3">
            {/* Logo Mark */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-md shadow-amber-500/25 text-slate-950 font-black text-xl border border-amber-300 shrink-0">
              <span className="tracking-tighter">ASN</span>
            </div>

            {/* Title & Total Soal Indicator (AGAK BESAR) */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-slate-950">
                  BANK SOAL <span className="text-amber-600">PRO ASN</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 border border-amber-300 px-2 py-0.5 text-xs font-black text-amber-900 shadow-2xs">
                  700 SOAL
                </span>
              </div>
              <p className="text-xs text-slate-500">
                500 Soal Umum BKN + 200 Soal Teknis Unit • Standar 4 Jam
              </p>
            </div>

            {/* Prominent Bidang / Unit Tugas Selector Button (AGAK BESAR) */}
            <button
              onClick={onOpenFieldModal}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border-2 border-slate-200 hover:border-amber-400 text-left transition cursor-pointer shadow-xs ml-1"
              title="Klik untuk memilih atau mengganti bidang / unit tugas penempatan"
            >
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Bidang / Unit:
                </div>
                <div className="text-sm font-black text-slate-900 max-w-[150px] lg:max-w-[190px] truncate">
                  {currentJob.shortName}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-0.5" />
            </button>
          </div>

          {/* Center: Primary Navigation (PROMINENT, BESAR, SANGAT JELAS) */}
          <nav className="hidden xl:flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-2xs">
            {/* 1. Modul Ajar */}
            <button
              onClick={() => setActiveTab('modules')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                activeTab === 'modules'
                  ? 'bg-white text-slate-950 shadow-sm border border-slate-300 ring-2 ring-amber-400/50'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/70'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>📚 Modul Ajar</span>
            </button>

            {/* 2. Latihan Soal */}
            <button
              onClick={() => setActiveTab('bank')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                activeTab === 'bank'
                  ? 'bg-white text-slate-950 shadow-sm border border-slate-300 ring-2 ring-amber-400/50'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/70'
              }`}
            >
              <FileText className="w-4 h-4 text-sky-600" />
              <span>📝 Latihan Soal</span>
              <span className="rounded-md bg-amber-100 text-amber-900 px-1.5 py-0.5 text-xs font-bold">
                700
              </span>
            </button>

            {/* 3. Simulasi CAT */}
            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                activeTab === 'simulation'
                  ? 'bg-white text-slate-950 shadow-sm border border-slate-300 ring-2 ring-amber-400/50'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/70'
              }`}
            >
              <Clock className="w-4 h-4 text-purple-600" />
              <span>⏱️ Simulasi CAT (4 Jam)</span>
            </button>

            {/* 4. Progres Belajar */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-950 shadow-sm border border-slate-300 ring-2 ring-amber-400/50'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/70'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>📊 Progres Belajar</span>
            </button>
          </nav>

          {/* Right Actions: PWA Install, Add Question & Owner Access */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <PWAInstallButton />

            {/* Quick Button for Developer / Pembuat to Add Question directly */}
            {isOwnerMode && onOpenAddQuestionModal && (
              <button
                onClick={onOpenAddQuestionModal}
                className="hidden lg:flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black transition cursor-pointer shadow-md shadow-amber-500/20"
                title="Tambah soal teknis bidang baru oleh pembuat"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>+ Buat Soal</span>
              </button>
            )}

            {/* Owner Role Status / Switcher Dropdown */}
            <div className="relative" ref={adminMenuRef}>
              <button
                onClick={() => {
                  if (isOwnerMode) {
                    setShowAdminMenu(!showAdminMenu);
                  } else {
                    onOpenAuthModal();
                  }
                }}
                className={`px-3.5 py-2 rounded-2xl border text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 shadow-2xs ${
                  isOwnerMode
                    ? 'bg-slate-900 text-amber-400 border-slate-800 shadow-sm'
                    : 'bg-white border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                }`}
                title={isOwnerMode ? 'Menu Pemilik / Developer Soal' : 'Klik untuk masuk sebagai Pemilik/Developer'}
              >
                {isOwnerMode ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Akses Pemilik</span>
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="hidden sm:inline">Peserta</span>
                    <span className="text-[11px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md font-extrabold ml-0.5">
                      Masuk Owner
                    </span>
                  </>
                )}
              </button>

              {/* Owner Dropdown Menu */}
              {isOwnerMode && showAdminMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white border border-slate-200 p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <div className="text-[11px] font-black text-amber-700 uppercase tracking-wider">
                      Panel Pembuat & Developer Soal
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Kelola bank soal & tambah butir soal teknis
                    </div>
                  </div>

                  {onOpenAddQuestionModal && (
                    <button
                      onClick={() => {
                        onOpenAddQuestionModal();
                        setShowAdminMenu(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-2xl text-xs sm:text-sm text-left font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer mb-1 border border-transparent"
                    >
                      <PlusCircle className="w-4 h-4 text-amber-600" />
                      <div>
                        <div>+ Tambah Soal Manual</div>
                        <div className="text-[11px] font-normal text-slate-500">Form input 1 butir (Teknis/BKN)</div>
                      </div>
                    </button>
                  )}

                  {onOpenUploadPdfModal && (
                    <button
                      onClick={() => {
                        onOpenUploadPdfModal();
                        setShowAdminMenu(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-2xl text-xs sm:text-sm text-left font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 transition cursor-pointer mb-1.5 border border-amber-300 shadow-2xs"
                    >
                      <Upload className="w-4 h-4 text-amber-700" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>Upload File PDF Soal</span>
                          <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-md font-black">
                            50 Soal
                          </span>
                        </div>
                        <div className="text-[11px] font-normal text-slate-600">Ekstrak otomatis 50 butir per unggahan</div>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('json');
                      setShowAdminMenu(false);
                    }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-2xl text-xs sm:text-sm text-left font-semibold transition cursor-pointer ${
                      activeTab === 'json'
                        ? 'bg-amber-50 text-amber-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <HardDriveDownload className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div>JSON Studio & Cadangan</div>
                      <div className="text-[11px] font-normal text-slate-500">Unduh & simpan backup master 700 soal</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('processor');
                      setShowAdminMenu(false);
                    }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-2xl text-xs sm:text-sm text-left font-semibold transition cursor-pointer ${
                      activeTab === 'processor'
                        ? 'bg-amber-50 text-amber-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-sky-600" />
                    <div>
                      <div>Engine Konversi Dokumen</div>
                      <div className="text-[11px] font-normal text-slate-500">Konversi naskah dokumen PDF/teks</div>
                    </div>
                  </button>

                  {onOpenWebhookConfig && (
                    <button
                      onClick={() => {
                        onOpenWebhookConfig();
                        setShowAdminMenu(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-2xl text-xs sm:text-sm text-left font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>Integrasi Google Apps Script</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold">
                            Pencegah Error
                          </span>
                        </div>
                        <div className="text-[11px] font-normal text-slate-500">Konfigurasi SCRIPT_URL & uji kirim</div>
                      </div>
                    </button>
                  )}

                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowAdminMenu(false);
                        onOpenAuthModal();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-left font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-slate-400" />
                      <span>Kunci & Kembali ke Akses Publik</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medium and Mobile Sub-Navigation Bar (PROMINENT, BERIKON JELAS, BESAR) */}
        <div className="grid grid-cols-4 xl:hidden border-t border-slate-200 py-2.5 bg-white gap-1 text-center">
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition min-h-[48px] cursor-pointer ${
              activeTab === 'modules' ? 'bg-amber-50 text-amber-900 font-black ring-1 ring-amber-300' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <BookOpen className="w-5 h-5 text-amber-600 mb-0.5" />
            <span className="truncate w-full text-[11px] sm:text-xs">📚 Modul</span>
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition min-h-[48px] cursor-pointer ${
              activeTab === 'bank' ? 'bg-amber-50 text-amber-900 font-black ring-1 ring-amber-300' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <FileText className="w-5 h-5 text-sky-600 mb-0.5" />
            <span className="truncate w-full text-[11px] sm:text-xs">📝 Latihan</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition min-h-[48px] cursor-pointer ${
              activeTab === 'simulation' ? 'bg-amber-50 text-amber-900 font-black ring-1 ring-amber-300' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Clock className="w-5 h-5 text-purple-600 mb-0.5" />
            <span className="truncate w-full text-[11px] sm:text-xs">⏱️ CAT 4 Jam</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition min-h-[48px] cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-amber-50 text-amber-900 font-black ring-1 ring-amber-300' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <BarChart3 className="w-5 h-5 text-emerald-600 mb-0.5" />
            <span className="truncate w-full text-[11px] sm:text-xs">📊 Progres</span>
          </button>
        </div>
      </div>
    </header>
  );
};
