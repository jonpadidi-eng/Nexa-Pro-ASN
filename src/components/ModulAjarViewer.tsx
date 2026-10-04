import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Tag,
  Shield,
  Award,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
  Type,
} from 'lucide-react';
import { ProAsnDataPackage, ModulAjar } from '../types/asn';
import { getJobFieldById } from '../data/jobFields';

interface ModulAjarViewerProps {
  dataPackage: ProAsnDataPackage;
  selectedJobField: string;
  onOpenFieldModal: () => void;
  onGoToPractice: (filter?: string) => void;
  onGoToSimulation: () => void;
}

export const ModulAjarViewer: React.FC<ModulAjarViewerProps> = ({
  dataPackage,
  selectedJobField,
  onOpenFieldModal,
  onGoToPractice,
  onGoToSimulation,
}) => {
  const currentJob = getJobFieldById(selectedJobField);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Full Screen Reader Mode state
  const [fullScreenModule, setFullScreenModule] = useState<ModulAjar | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');

  const modules = dataPackage?.modules || [];

  const filteredModules = modules.filter((m) => {
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      (m.core_topics || []).some((t) => t.toLowerCase().includes(q)) ||
      (m.key_indicators || []).some((k) => k.toLowerCase().includes(q)) ||
      (m.strategy_points || []).some((s) => s.toLowerCase().includes(q))
    );
  });

  const categories = [
    { key: 'all', label: 'Semua Modul' },
    { key: 'KM-SK', label: 'Manajerial & Sosio-Kultural' },
    { key: 'POT', label: 'Uji Potensi & Logika' },
    { key: 'LD', label: 'Literasi Digital' },
    { key: 'PK', label: 'Preferensi Karir RIASEC' },
  ];

  // Esc key listener to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullScreenModule) {
        setFullScreenModule(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullScreenModule]);

  // Navigate next / previous module in fullscreen
  const currentIdx = fullScreenModule ? modules.findIndex((m) => m.id === fullScreenModule.id) : -1;
  const handlePrevModule = () => {
    if (currentIdx > 0) {
      setFullScreenModule(modules[currentIdx - 1]);
    }
  };
  const handleNextModule = () => {
    if (currentIdx < modules.length - 1) {
      setFullScreenModule(modules[currentIdx + 1]);
    }
  };

  const getFontSizeClass = () => {
    if (fontSize === 'huge') return 'text-xl leading-relaxed';
    if (fontSize === 'large') return 'text-lg leading-relaxed';
    return 'text-base leading-normal';
  };

  return (
    <div className="space-y-6 pb-12 text-slate-900 font-sans">
      {/* Banner Modul Ajar (Besar, Jelas, dengan Tombol Layar Penuh) */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-xl bg-amber-100 text-amber-900 px-3.5 py-1 text-xs font-black border border-amber-300">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>Katalog Modul Pembelajaran Resmi CASN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Naskah Modul Ajar & Ringkasan Materi Pokok
            </h1>
            <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
              Pelajari ringkasan materi, standar kompetensi MenPAN-RB/BKN, dan strategi cerdas menjawab untuk seluruh subtes seleksi ASN. Dilengkapi mode <strong>Naskah Layar Penuh</strong> untuk kenyamanan membaca tanpa distraksi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Fullscreen Reader Trigger Button */}
            {modules.length > 0 && (
              <button
                onClick={() => setFullScreenModule(modules[0])}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-sm shadow-md transition cursor-pointer"
                title="Buka naskah modul ajar dalam mode tampilan layar penuh"
              >
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <span>📖 Naskah Layar Penuh</span>
              </button>
            )}

            <button
              onClick={() => onGoToPractice()}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>Uji Materi di Latihan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi pokok modul, kata kunci undang-undang, strategi jawaban..."
            className="w-full rounded-2xl bg-white border border-slate-200 pl-12 pr-4 py-3.5 text-base text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 focus:outline-none placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {filteredModules.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">Tidak ada modul yang sesuai pencarian</h3>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs font-bold text-amber-700 underline"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          filteredModules.map((mod) => {
            const isExp = expandedId === mod.id;
            return (
              <div
                key={mod.id}
                className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4 hover:border-slate-300 transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">#{mod.id}</span>
                      <span className="rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-2.5 py-0.5">
                        Kategori: {mod.category}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">{mod.title}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Button Buka Layar Penuh per Modul */}
                    <button
                      onClick={() => setFullScreenModule(mod)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="Buka naskah modul ini dalam mode layar penuh"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Naskah Layar Penuh</span>
                    </button>

                    <button
                      onClick={() => onGoToPractice(mod.category)}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-700" />
                      <span>Latihan Subtes Ini</span>
                    </button>

                    <button
                      onClick={() => setExpandedId(isExp ? null : mod.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <span>{isExp ? 'Tutup Ringkasan' : 'Buka Ringkasan'}</span>
                      {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Core Topics & Strategy Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-2xl bg-amber-50/50 p-4 border border-amber-200">
                    <div className="font-black text-amber-900 flex items-center gap-2 mb-2 text-sm">
                      <Tag className="w-4 h-4 text-amber-700" />
                      <span>Materi Pokok BKN:</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-700 text-sm">
                      {mod.core_topics.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-sky-50/50 p-4 border border-sky-200">
                    <div className="font-black text-sky-900 flex items-center gap-2 mb-2 text-sm">
                      <Shield className="w-4 h-4 text-sky-700" />
                      <span>Poin Strategi & Trik Menjawab:</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-700 text-sm">
                      {mod.strategy_points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-sky-600 font-bold">✓</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Indicators & Answer Patterns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-2xl bg-purple-50/50 p-4 border border-purple-200">
                    <div className="font-black text-purple-900 flex items-center gap-2 mb-2 text-sm">
                      <Award className="w-4 h-4 text-purple-700" />
                      <span>Indikator Penilaian MenPAN-RB:</span>
                    </div>
                    <ul className="space-y-1 text-slate-700 text-sm">
                      {mod.key_indicators.map((ind, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-purple-600 font-bold">→</span>
                          <span>{ind}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-200">
                    <div className="font-black text-emerald-900 flex items-center gap-2 mb-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                      <span>Pola Jawaban Terbaik & Bobot Skor:</span>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      {mod.answer_patterns.map((pat, idx) => (
                        <div key={idx} className="border-l-2 border-emerald-500 pl-2">
                          <span className="font-bold text-slate-800">{pat.pattern_name}:</span>{' '}
                          <span className="text-slate-600">{pat.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* In-Card Markdown Text Preview */}
                {isExp && mod.content_markdown && (
                  <div className="mt-4 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap animate-in fade-in duration-150">
                    <div className="flex items-center justify-between font-black text-slate-900 pb-2 mb-2 border-b border-slate-200">
                      <span>Teks Lengkap Modul Ajar:</span>
                      <button
                        onClick={() => setFullScreenModule(mod)}
                        className="text-xs text-amber-700 hover:text-amber-900 font-bold underline flex items-center gap-1"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Buka Tampilan Penuh</span>
                      </button>
                    </div>
                    {mod.content_markdown}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* TAMPILAN FULL LAYAR NASKAH MODUL AJAR (FULLSCREEN READER) */}
      {/* ======================================================== */}
      {fullScreenModule && (
        <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col h-screen w-screen overflow-hidden text-slate-900 animate-in fade-in duration-150">
          {/* Top Fullscreen Reader Header */}
          <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0 shadow-xs">
            <div className="flex items-center gap-3 truncate">
              <button
                onClick={() => setFullScreenModule(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer shrink-0"
                title="Keluar dari mode layar penuh (Tekan Esc)"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar (Esc)</span>
              </button>

              <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-100 text-amber-950 px-2 py-0.5 text-[11px] font-black border border-amber-300">
                    {fullScreenModule.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">#{fullScreenModule.id}</span>
                </div>
                <h2 className="text-sm sm:text-base font-black text-slate-950 truncate max-w-md sm:max-w-xl">
                  {fullScreenModule.title}
                </h2>
              </div>
            </div>

            {/* Right Tools: Font Size Adjuster, Prev/Next Module & Practice */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Font Size Selector */}
              <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-2 py-1 rounded-lg font-bold ${fontSize === 'normal' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
                  title="Ukuran Font Normal"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-2 py-1 rounded-lg font-bold ${fontSize === 'large' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
                  title="Ukuran Font Besar"
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize('huge')}
                  className={`px-2 py-1 rounded-lg font-black ${fontSize === 'huge' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
                  title="Ukuran Font Sangat Besar"
                >
                  A++
                </button>
              </div>

              {/* Prev / Next Module Navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevModule}
                  disabled={currentIdx <= 0}
                  className="p-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Modul Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-500 px-1 hidden sm:inline">
                  {currentIdx + 1}/{modules.length}
                </span>
                <button
                  onClick={handleNextModule}
                  disabled={currentIdx >= modules.length - 1}
                  className="p-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Modul Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  const cat = fullScreenModule.category;
                  setFullScreenModule(null);
                  onGoToPractice(cat);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Latihan Soal</span>
              </button>

              <button
                onClick={() => setFullScreenModule(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title="Tutup Layar Penuh"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Fullscreen Reading Body (Distraction-Free) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 lg:p-12 shadow-sm space-y-8">
              {/* Document Header */}
              <div className="space-y-3 pb-6 border-b border-slate-100">
                <div className="inline-flex items-center gap-2 rounded-xl bg-amber-100 text-amber-950 px-3 py-1 text-xs font-black border border-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Naskah Pembelajaran Resmi CASN • Subtes {fullScreenModule.category}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                  {fullScreenModule.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-600">
                  Ringkasan komprehensif materi pokok, strategi jawaban tepat, dan kisi-kisi MenPAN-RB.
                </p>
              </div>

              {/* 4 Essential Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Materi Pokok */}
                <div className="rounded-2xl bg-amber-50/60 border border-amber-200 p-5 space-y-2.5">
                  <div className="font-black text-amber-900 flex items-center gap-2 text-base">
                    <Tag className="w-5 h-5 text-amber-700" />
                    <span>Materi Pokok BKN:</span>
                  </div>
                  <ul className="space-y-2 text-slate-800 text-sm">
                    {fullScreenModule.core_topics.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Poin Strategi & Trik Menjawab */}
                <div className="rounded-2xl bg-sky-50/60 border border-sky-200 p-5 space-y-2.5">
                  <div className="font-black text-sky-900 flex items-center gap-2 text-base">
                    <Shield className="w-5 h-5 text-sky-700" />
                    <span>Poin Strategi Menjawab:</span>
                  </div>
                  <ul className="space-y-2 text-slate-800 text-sm">
                    {fullScreenModule.strategy_points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-sky-600 font-bold">✓</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Indikator MenPAN-RB */}
                <div className="rounded-2xl bg-purple-50/60 border border-purple-200 p-5 space-y-2.5">
                  <div className="font-black text-purple-900 flex items-center gap-2 text-base">
                    <Award className="w-5 h-5 text-purple-700" />
                    <span>Indikator Kompetensi BKN:</span>
                  </div>
                  <ul className="space-y-2 text-slate-800 text-sm">
                    {fullScreenModule.key_indicators.map((ind, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-purple-600 font-bold">→</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. Pola Jawaban & Skor */}
                <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200 p-5 space-y-2.5">
                  <div className="font-black text-emerald-900 flex items-center gap-2 text-base">
                    <CheckCircle className="w-5 h-5 text-emerald-700" />
                    <span>Pola Jawaban Berbobot Maksimal:</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {fullScreenModule.answer_patterns.map((pat, idx) => (
                      <div key={idx} className="border-l-3 border-emerald-500 pl-3">
                        <strong className="text-slate-900">{pat.pattern_name}:</strong>{' '}
                        <span className="text-slate-700">{pat.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Naskah Lengkap Modul Pembelajaran */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-lg font-black text-slate-950">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <span>Teks Lengkap Naskah Modul Pembelajaran</span>
                </div>

                <div className={`p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-serif leading-relaxed whitespace-pre-wrap ${getFontSizeClass()}`}>
                  {fullScreenModule.content_markdown || 'Konten naskah modul pembelajaran standar telah dimuat secara optimal sesuai kurikulum BKN.'}
                </div>
              </div>

              {/* Bottom Navigation & CTA */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevModule}
                    disabled={currentIdx <= 0}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Modul Sebelumnya</span>
                  </button>
                  <button
                    onClick={handleNextModule}
                    disabled={currentIdx >= modules.length - 1}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <span>Modul Selanjutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const cat = fullScreenModule.category;
                      setFullScreenModule(null);
                      onGoToPractice(cat);
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-slate-950" />
                    <span>Latihan Soal Subtes Ini</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setFullScreenModule(null)}
                    className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition cursor-pointer"
                  >
                    Tutup Layar Penuh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
