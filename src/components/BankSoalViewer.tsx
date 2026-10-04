import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  CheckCircle,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Tag,
  Shield,
  Briefcase,
  Cpu,
  GraduationCap,
  HeartPulse,
  Scale,
  Building,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  PlusCircle,
  Bot,
  ArrowRight,
  X,
  FileCheck2,
} from 'lucide-react';
import { ProAsnDataPackage, SubtestType, SoalUmum, SoalTeknis } from '../types/asn';
import { QuestionAnswerRecord } from '../hooks/useUserProgress';
import { getJobFieldById } from '../data/jobFields';

interface BankSoalViewerProps {
  dataPackage: ProAsnDataPackage;
  onOpenSimulation: () => void;
  selectedJobField?: string;
  onOpenFieldModal?: () => void;
  isOwnerMode?: boolean;
  onOpenAddQuestionModal?: () => void;
  userAnswers: Record<string, QuestionAnswerRecord>;
  onRecordAnswer: (record: Omit<QuestionAnswerRecord, 'answeredAt'>) => void;
  onResetAnswers: () => void;
  initialFilter?: 'all' | 'KM-SK' | 'POT' | 'LD' | 'PK' | 'teknis' | 'umum' | 'new_uploads';
}

export const BankSoalViewer: React.FC<BankSoalViewerProps> = ({
  dataPackage,
  onOpenSimulation,
  selectedJobField = 'auditor',
  onOpenFieldModal,
  isOwnerMode = false,
  onOpenAddQuestionModal,
  userAnswers,
  onRecordAnswer,
  onResetAnswers,
  initialFilter = 'all',
}) => {
  const currentJob = getJobFieldById(selectedJobField);

  // Filter states
  const [activeFilter, setActiveFilter] = useState<'all' | 'KM-SK' | 'POT' | 'LD' | 'PK' | 'teknis' | 'umum' | 'new_uploads'>(initialFilter);
  const [technicalFieldFilter, setTechnicalFieldFilter] = useState<string>(() => {
    return selectedJobField && selectedJobField !== 'all' ? selectedJobField : 'all';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterAnswerStatus, setFilterAnswerStatus] = useState<'all' | 'unanswered' | 'answered'>('all');
  const [showNilaiAkhirModal, setShowNilaiAkhirModal] = useState<boolean>(false);

  // Sync technicalFieldFilter when selectedJobField prop updates
  useEffect(() => {
    if (selectedJobField && selectedJobField !== 'all') {
      setTechnicalFieldFilter(selectedJobField);
    } else {
      setTechnicalFieldFilter('all');
    }
  }, [selectedJobField]);

  // Sync initialFilter prop if changed
  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSelectOption = (
    questionId: string,
    optionCode: 'A' | 'B' | 'C' | 'D' | 'E',
    correctKey: 'A' | 'B' | 'C' | 'D' | 'E',
    category: 'KM-SK' | 'POT' | 'LD' | 'PK' | 'teknis',
    options: { code: string; score: number }[]
  ) => {
    const isCorrect = optionCode === correctKey;
    const selectedOpt = options.find((o) => o.code === optionCode);
    const score = selectedOpt ? selectedOpt.score : isCorrect ? 5 : 0;

    onRecordAnswer({
      questionId,
      selectedOption: optionCode,
      correctKey,
      isCorrect,
      score,
      category,
      isComputerAssisted: false,
    });
  };

  const handleRequestComputerAssistance = (
    questionId: string,
    correctKey: 'A' | 'B' | 'C' | 'D' | 'E',
    category: 'KM-SK' | 'POT' | 'LD' | 'PK' | 'teknis',
    options: { code: string; score: number }[]
  ) => {
    const selectedOpt = options.find((o) => o.code === correctKey);
    const score = selectedOpt ? selectedOpt.score : 5;

    onRecordAnswer({
      questionId,
      selectedOption: correctKey,
      correctKey,
      isCorrect: true,
      score,
      category,
      isComputerAssisted: true,
    });

    setExpandedId(questionId); // automatically expand explanation
  };

  // Pagination states (20 items per page)
  const PAGE_SIZE = 20;
  const [techPage, setTechPage] = useState<number>(1);
  const [genPage, setGenPage] = useState<number>(1);

  // Reset page when filter or search changes
  useEffect(() => {
    setTechPage(1);
    setGenPage(1);
  }, [activeFilter, technicalFieldFilter, searchQuery, filterAnswerStatus]);

  // Safe arrays
  const safeGeneral = dataPackage?.general_questions || [];
  const safeTechnical = dataPackage?.technical_questions || [];

  // Filter general questions
  const filteredGeneral = safeGeneral.filter((q) => {
    if (activeFilter === 'new_uploads') {
      if (!q.is_new_upload && !q.batch_code) return false;
    } else {
      if (activeFilter === 'teknis') return false;
      if (activeFilter !== 'all' && activeFilter !== 'umum' && activeFilter !== q.subtest) return false;
    }

    // Answer status filter
    const isAnswered = Boolean(userAnswers[q.id]);
    if (filterAnswerStatus === 'answered' && !isAnswered) return false;
    if (filterAnswerStatus === 'unanswered' && isAnswered) return false;

    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      (q.question || '').toLowerCase().includes(s) ||
      (q.topic || '').toLowerCase().includes(s) ||
      (q.explanation || '').toLowerCase().includes(s) ||
      (q.competency_indicator || '').toLowerCase().includes(s) ||
      (q.batch_code || '').toLowerCase().includes(s)
    );
  });

  // Filter technical questions
  const filteredTechnical = safeTechnical.filter((q) => {
    if (activeFilter === 'new_uploads') {
      if (!q.is_new_upload && !q.batch_code) return false;
    } else {
      if (activeFilter === 'umum' || (activeFilter !== 'all' && activeFilter !== 'teknis')) {
        return false;
      }
      if (technicalFieldFilter !== 'all' && (q.field || '').toLowerCase() !== technicalFieldFilter.toLowerCase()) {
        return false;
      }
    }

    // Answer status filter
    const isAnswered = Boolean(userAnswers[q.id]);
    if (filterAnswerStatus === 'answered' && !isAnswered) return false;
    if (filterAnswerStatus === 'unanswered' && isAnswered) return false;

    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      (q.question || '').toLowerCase().includes(s) ||
      (q.topic || '').toLowerCase().includes(s) ||
      (q.field_label || '').toLowerCase().includes(s) ||
      (q.explanation || '').toLowerCase().includes(s) ||
      (q.competency_indicator || '').toLowerCase().includes(s) ||
      (q.batch_code || '').toLowerCase().includes(s)
    );
  });

  const getSubtestBadge = (subtest: SubtestType) => {
    switch (subtest) {
      case 'KM-SK':
        return { label: 'KM-SK: Manajerial & Sosio-Kultural', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'POT':
        return { label: 'POT: Uji Potensi & Logika', color: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'LD':
        return { label: 'LD: Literasi Digital & SPBE', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'PK':
        return { label: 'PK: Preferensi Karir RIASEC', color: 'bg-rose-100 text-rose-900 border-rose-300' };
      default:
        return { label: subtest, color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const getFieldIcon = (field: string) => {
    const f = field.toLowerCase();
    if (f.includes('aud') || f.includes('inspek')) return <Shield className="w-4 h-4 text-amber-600" />;
    if (f.includes('sos')) return <HeartPulse className="w-4 h-4 text-emerald-600" />;
    if (f.includes('kes')) return <HeartPulse className="w-4 h-4 text-rose-600" />;
    if (f.includes('pend')) return <GraduationCap className="w-4 h-4 text-sky-600" />;
    if (f.includes('ti') || f.includes('komputer')) return <Cpu className="w-4 h-4 text-teal-600" />;
    if (f.includes('huk')) return <Scale className="w-4 h-4 text-amber-600" />;
    if (f.includes('adm')) return <Building className="w-4 h-4 text-indigo-600" />;
    return <Briefcase className="w-4 h-4 text-slate-600" />;
  };

  const currentFieldTechCount = safeTechnical.filter(
    (q) => selectedJobField === 'all' || q.field.toLowerCase() === selectedJobField.toLowerCase()
  ).length;

  const totalResults = filteredGeneral.length + filteredTechnical.length;
  const answeredCount = Object.keys(userAnswers).length;

  // Practice temporary score calculation
  const practiceAnswersList = Object.values(userAnswers);
  const practiceScore = practiceAnswersList.reduce((sum, item) => sum + (item.score || 0), 0);
  const correctCount = practiceAnswersList.filter((item) => item.isCorrect).length;
  const assistedCount = practiceAnswersList.filter((item) => item.isComputerAssisted).length;
  const accuracyPct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  // Subtest scores for practice
  const scoreKmskPractice = practiceAnswersList
    .filter((a) => a.category === 'KM-SK')
    .reduce((sum, a) => sum + (a.score || 0), 0);
  const countKmskPractice = practiceAnswersList.filter((a) => a.category === 'KM-SK').length;

  const scorePotPractice = practiceAnswersList
    .filter((a) => a.category === 'POT')
    .reduce((sum, a) => sum + (a.score || 0), 0);
  const countPotPractice = practiceAnswersList.filter((a) => a.category === 'POT').length;

  const scoreLdPractice = practiceAnswersList
    .filter((a) => a.category === 'LD')
    .reduce((sum, a) => sum + (a.score || 0), 0);
  const countLdPractice = practiceAnswersList.filter((a) => a.category === 'LD').length;

  const scorePkPractice = practiceAnswersList
    .filter((a) => a.category === 'PK')
    .reduce((sum, a) => sum + (a.score || 0), 0);
  const countPkPractice = practiceAnswersList.filter((a) => a.category === 'PK').length;

  const scoreTeknisPractice = practiceAnswersList
    .filter((a) => a.category === 'teknis')
    .reduce((sum, a) => sum + (a.score || 0), 0);
  const countTeknisPractice = practiceAnswersList.filter((a) => a.category === 'teknis').length;

  const newUploadsCount =
    safeGeneral.filter((q) => q.is_new_upload || q.batch_code).length +
    safeTechnical.filter((q) => q.is_new_upload || q.batch_code).length;

  return (
    <div className="space-y-6 pb-12 text-slate-900 font-sans">
      {/* Prominent Unit & Curriculum Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 px-3.5 py-1 text-xs font-black shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>Bidang / Unit Tugas Aktif: {currentJob.badge}</span>
              </span>

              {onOpenFieldModal && (
                <button
                  onClick={onOpenFieldModal}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-950 font-bold underline underline-offset-4 cursor-pointer ml-1 py-1 px-2 rounded-lg hover:bg-amber-50 transition"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Ganti Unit Tugas</span>
                </button>
              )}

              {isOwnerMode && (
                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-1 border border-emerald-300">
                  Mode Pemilik Akun Aktif
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
              Bank Soal Latihan: {currentJob.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              {currentJob.description} Klik pada pilihan jawaban (A, B, C, D, E) untuk berlatih. Apabila terjadi kekeliruan jawaban, gunakan tombol <strong>Bantuan Jawaban Komputer</strong> untuk melihat kunci resmi dan dasar hukumnya.
            </p>

            {/* Standard Curriculum Explanation: 500 Soal Umum + 200 Soal Teknis = 700 Soal */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm text-slate-700 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span><strong>500</strong> Soal Umum BKN (KM-SK, POT, LD, PK)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>200</strong> Soal Teknis Unit ({currentFieldTechCount} Tersedia)</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Total 700 Soal • Standar 4 Jam</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={onOpenSimulation}
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-6 py-4 text-base font-black text-slate-950 shadow-md shadow-amber-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Award className="w-5 h-5 text-slate-950" />
              <span>Simulasi CAT 4 Jam</span>
            </button>

            {isOwnerMode && onOpenAddQuestionModal && (
              <button
                onClick={onOpenAddQuestionModal}
                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-4 py-3 text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>+ Tambah Butir Soal Baru</span>
              </button>
            )}

            {answeredCount > 0 && (
              <button
                onClick={onResetAnswers}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Jawaban ({answeredCount} Tersimpan)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls (BESAR, BERSIH, MUDAH DIKLIK) */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi pokok, kata kunci undang-undang, indikator kompetensi BKN, atau pembahasan..."
            className="w-full rounded-2xl bg-white border border-slate-200 pl-12 pr-4 py-3.5 text-sm sm:text-base text-slate-950 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 focus:outline-none placeholder:text-slate-400 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-100 px-2 py-1 rounded-lg"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Clean Filter Tabs for Subtests */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer min-h-[44px] ${
              activeFilter === 'all'
                ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-950'
            }`}
          >
            Semua Soal ({safeGeneral.length + filteredTechnical.length})
          </button>

          <button
            onClick={() => setActiveFilter('teknis')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer min-h-[44px] ${
              activeFilter === 'teknis'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Soal Teknis {currentJob.shortName} ({safeTechnical.filter((q) => technicalFieldFilter === 'all' || q.field.toLowerCase() === technicalFieldFilter.toLowerCase()).length})
          </button>

          <button
            onClick={() => setActiveFilter('KM-SK')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer min-h-[44px] ${
              activeFilter === 'KM-SK'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
            }`}
          >
            KM-SK: Manajerial ({safeGeneral.filter((q) => q.subtest === 'KM-SK').length})
          </button>

          <button
            onClick={() => setActiveFilter('POT')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer min-h-[44px] ${
              activeFilter === 'POT'
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-white text-sky-900 border-sky-200 hover:bg-sky-50'
            }`}
          >
            Uji Potensi/POT ({safeGeneral.filter((q) => q.subtest === 'POT').length})
          </button>

          <button
            onClick={() => setActiveFilter('LD')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer min-h-[44px] ${
              activeFilter === 'LD'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-50'
            }`}
          >
            Literasi Digital ({safeGeneral.filter((q) => q.subtest === 'LD').length})
          </button>

          <button
            onClick={() => setActiveFilter('PK')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer min-h-[44px] ${
              activeFilter === 'PK'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white text-rose-900 border-rose-200 hover:bg-rose-50'
            }`}
          >
            RIASEC / PK ({safeGeneral.filter((q) => q.subtest === 'PK').length})
          </button>

          {newUploadsCount > 0 && (
            <button
              onClick={() => setActiveFilter('new_uploads')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black border transition cursor-pointer min-h-[44px] flex items-center gap-2 ${
                activeFilter === 'new_uploads'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                  : 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>✨ Soal Ter-update ({newUploadsCount})</span>
            </button>
          )}
        </div>

        {/* Answer Status Filter (Semua vs Belum Dikerjakan vs Sudah Dikerjakan) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Status Pengerjaan:</span>
            <button
              onClick={() => setFilterAnswerStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                filterAnswerStatus === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Semua Butir
            </button>
            <button
              onClick={() => setFilterAnswerStatus('unanswered')}
              className={`px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                filterAnswerStatus === 'unanswered'
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
              }`}
            >
              Belum Dikerjakan
            </button>
            <button
              onClick={() => setFilterAnswerStatus('answered')}
              className={`px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                filterAnswerStatus === 'answered'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              Sudah Dijawab ({answeredCount})
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Ditemukan <strong>{totalResults}</strong> butir soal
          </div>
        </div>

        {/* Technical Sub-filter for switching disciplines */}
        {(activeFilter === 'all' || activeFilter === 'teknis') && safeTechnical.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/80 text-xs">
            <span className="text-xs text-slate-500 font-bold mr-1">Pilih Bidang Unit Teknis:</span>
            {[
              { key: 'all', label: 'Semua Bidang' },
              { key: 'auditor', label: 'Inspektorat / Auditor' },
              { key: 'sosial', label: 'Dinas Sosial' },
              { key: 'kesehatan', label: 'Kesehatan & Medis' },
              { key: 'pendidikan', label: 'Pendidikan & Guru' },
              { key: 'administrasi', label: 'Administrasi Publik' },
              { key: 'teknologi_informasi', label: 'TI & SPBE' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTechnicalFieldFilter(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  technicalFieldFilter === key
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nilai Sementara Latihan Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-amber-50/90 border border-amber-300 text-xs sm:text-sm shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shrink-0 shadow-xs">
            ⚡ LIVE
          </div>
          <div>
            <div className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Nilai Sementara Latihan Mandiri:</span>
              <span className="text-[10px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                Real-time
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
              <span className="font-mono font-black text-2xl sm:text-3xl text-slate-950">
                {practiceScore} Poin
              </span>
              <span className="text-xs sm:text-sm text-slate-600 font-semibold">
                ({correctCount} Benar dari {answeredCount} Soal Dijawab • Akurasi {accuracyPct}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {assistedCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-sky-800 bg-sky-100/90 border border-sky-300 px-3.5 py-2 rounded-xl font-bold">
              <Bot className="w-4 h-4 text-sky-600" />
              <span>{assistedCount} Bantuan Jawaban Komputer</span>
            </div>
          )}

          {answeredCount > 0 && (
            <button
              onClick={() => setShowNilaiAkhirModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>📊 Rincian Nilai Akhir Latihan</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Stream */}
      <div className="space-y-6">
        {/* Soal Teknis Unit */}
        {filteredTechnical.length > 0 && (() => {
          const totalTechPages = Math.ceil(filteredTechnical.length / PAGE_SIZE);
          const pagedTechnical = filteredTechnical.slice((techPage - 1) * PAGE_SIZE, techPage * PAGE_SIZE);
          const startIdx = (techPage - 1) * PAGE_SIZE;

          return (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-700" />
                  <span>Soal Teknis Bidang / Unit ({filteredTechnical.length})</span>
                </div>
                {totalTechPages > 1 && (
                  <span className="text-slate-500 font-normal normal-case">
                    Hal {techPage} / {totalTechPages}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5">
                {pagedTechnical.map((q, localIdx) => {
                  const idx = startIdx + localIdx;
                  const isExp = expandedId === q.id;
                  const answerRecord = userAnswers[q.id];
                  const userChoice = answerRecord?.selectedOption;
                  const isAnswered = Boolean(answerRecord);
                  const isComputerAssisted = Boolean(answerRecord?.isComputerAssisted);
                  const isUserCorrect = answerRecord?.isCorrect;

                  return (
                    <div
                      key={q.id}
                      className={`rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 transition ${
                        q.batch_code || q.is_new_upload
                          ? 'bg-emerald-50/25 border-2 border-emerald-400 ring-2 ring-emerald-300/30 shadow-emerald-500/10'
                          : 'bg-white border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1} ({q.id})</span>
                          {q.batch_code && (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-3 py-1 text-xs font-mono font-black shadow-xs ring-1 ring-emerald-400">
                              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                              <span>TER-UPDATE • KODE: {q.batch_code}</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1 text-xs font-bold">
                            {getFieldIcon(q.field)}
                            <span>{q.field_label}</span>
                          </span>
                          <span className="text-xs text-slate-600">Topik: <strong className="text-slate-900">{q.topic}</strong></span>
                        </div>

                        {/* Status Feedback Badge */}
                        <div className="text-xs">
                          {isAnswered ? (
                            isComputerAssisted ? (
                              <span className="inline-flex items-center gap-1.5 text-sky-800 font-bold bg-sky-50 px-3 py-1 rounded-xl border border-sky-300">
                                <Bot className="w-4 h-4 text-sky-600" />
                                <span>Bantuan Jawaban Komputer (+5)</span>
                              </span>
                            ) : isUserCorrect ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Jawaban Mandiri Tepat (+5)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-rose-800 font-bold bg-rose-50 px-3 py-1 rounded-xl border border-rose-300">
                                <XCircle className="w-4 h-4 text-rose-600" />
                                <span>Jawaban Anda Belum Tepat</span>
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 text-xs">Pilih opsi jawaban di bawah</span>
                          )}
                        </div>
                      </div>

                      {/* Competency Indicator */}
                      <div className="text-xs sm:text-sm text-slate-700 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
                        <strong className="text-slate-900">Standar Kompetensi Jabatan:</strong> {q.competency_indicator}
                      </div>

                      {/* Question Text (BESAR & SANGAT NYAMAN DIBACA - MINIMAL 16px) */}
                      <div className="text-base sm:text-lg font-bold text-slate-950 leading-relaxed whitespace-pre-wrap">
                        {q.question}
                      </div>

                      {/* Touch-Friendly Options A - E (HITBOX BESAR MIN 56px) */}
                      <div className="space-y-2.5 pt-1">
                        {q.options.map((opt) => {
                          const isCorrectKey = opt.code === q.answer_key;
                          const isUserSelected = userChoice === opt.code;

                          let cardStyle = 'bg-slate-50/70 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100/70';
                          let badgeStyle = 'bg-slate-200 text-slate-800';

                          if (isAnswered) {
                            if (isCorrectKey) {
                              cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-2 ring-emerald-400 shadow-2xs';
                              badgeStyle = 'bg-emerald-600 text-white font-black';
                            } else if (isUserSelected) {
                              cardStyle = 'bg-rose-50 border-rose-500 text-rose-950 font-medium ring-2 ring-rose-400';
                              badgeStyle = 'bg-rose-600 text-white font-black';
                            }
                          }

                          return (
                            <button
                              key={opt.code}
                              onClick={() => handleSelectOption(q.id, opt.code, q.answer_key, 'teknis', q.options)}
                              className={`w-full text-left flex items-start justify-between p-4 sm:p-5 rounded-2xl border text-sm sm:text-base leading-relaxed transition-all cursor-pointer min-h-[56px] ${cardStyle}`}
                            >
                              <div className="flex items-start gap-3.5">
                                <span
                                  className={`flex items-center justify-center w-8 h-8 rounded-xl text-sm font-black shrink-0 mt-0.5 ${badgeStyle}`}
                                >
                                  {opt.code}
                                </span>
                                <span className="leading-normal">{opt.text}</span>
                              </div>
                              {isAnswered && (
                                <span
                                  className={`ml-3 shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold border ${
                                    isCorrectKey
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}
                                >
                                  Skor: {opt.score}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Computer Assistance Button (Bantuan Jawaban Komputer jika salah) */}
                      {isAnswered && !isUserCorrect && !isComputerAssisted && (
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                          <div className="text-xs text-amber-900">
                            <strong>Jawaban Anda salah:</strong> Anda dapat meminta bantuan komputer untuk melihat kunci jawaban yang tepat dan landasan aturannya.
                          </div>
                          <button
                            onClick={() => handleRequestComputerAssistance(q.id, q.answer_key, 'teknis', q.options)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition cursor-pointer shrink-0"
                          >
                            <Bot className="w-4 h-4" />
                            <span>Bantuan Jawaban Komputer</span>
                          </button>
                        </div>
                      )}

                      {/* Explanation toggle & block */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <button
                          onClick={() => toggleExpand(q.id)}
                          className="flex items-center gap-1.5 text-xs sm:text-sm text-amber-800 hover:text-amber-950 font-bold cursor-pointer py-1"
                        >
                          <HelpCircle className="w-4 h-4 text-amber-600" />
                          <span>{isExp ? 'Tutup Pembahasan' : 'Lihat Pembahasan & Landasan Regulasi'}</span>
                          {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {isComputerAssisted && (
                          <span className="text-[11px] text-sky-800 font-semibold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                            * Jawaban ini tercatat sebagai bantuan komputer
                          </span>
                        )}
                      </div>

                      {isExp && (
                        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2 animate-in fade-in duration-150">
                          <div className="font-black text-amber-900 text-sm">
                            Kunci Resmi BKN: Opsi {q.answer_key} • Landasan Regulasi & Analisis:
                          </div>
                          <p className="whitespace-pre-wrap">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Technical Questions Pagination Controls */}
              {totalTechPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs sm:text-sm">
                  <span className="text-slate-600">
                    Menampilkan <strong>{startIdx + 1}</strong> – <strong>{Math.min(startIdx + PAGE_SIZE, filteredTechnical.length)}</strong> dari <strong>{filteredTechnical.length}</strong> Soal Teknis
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTechPage((p) => Math.max(1, p - 1))}
                      disabled={techPage === 1}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition cursor-pointer"
                    >
                      ← Sebelumnya
                    </button>
                    <span className="px-3 font-bold text-slate-900">
                      Hal {techPage} / {totalTechPages}
                    </span>
                    <button
                      onClick={() => setTechPage((p) => Math.min(totalTechPages, p + 1))}
                      disabled={techPage === totalTechPages}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition cursor-pointer"
                    >
                      Berikutnya →
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Soal Umum (500 Soal Standar BKN: KM-SK, POT, LD, PK) */}
        {filteredGeneral.length > 0 && (() => {
          const totalGenPages = Math.ceil(filteredGeneral.length / PAGE_SIZE);
          const pagedGeneral = filteredGeneral.slice((genPage - 1) * PAGE_SIZE, genPage * PAGE_SIZE);
          const startIdx = (genPage - 1) * PAGE_SIZE;

          return (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-sky-800">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-sky-700" />
                  <span>500 Soal Umum Standar BKN ({filteredGeneral.length})</span>
                </div>
                {totalGenPages > 1 && (
                  <span className="text-slate-500 font-normal normal-case">
                    Hal {genPage} / {totalGenPages}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5">
                {pagedGeneral.map((q, localIdx) => {
                  const idx = startIdx + localIdx;
                  const badge = getSubtestBadge(q.subtest);
                  const isExp = expandedId === q.id;
                  const answerRecord = userAnswers[q.id];
                  const userChoice = answerRecord?.selectedOption;
                  const isAnswered = Boolean(answerRecord);
                  const isComputerAssisted = Boolean(answerRecord?.isComputerAssisted);
                  const isUserCorrect = answerRecord?.isCorrect;

                  return (
                    <div
                      key={q.id}
                      className={`rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 transition ${
                        q.batch_code || q.is_new_upload
                          ? 'bg-emerald-50/25 border-2 border-emerald-400 ring-2 ring-emerald-300/30 shadow-emerald-500/10'
                          : 'bg-white border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1} ({q.id})</span>
                          {q.batch_code && (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-3 py-1 text-xs font-mono font-black shadow-xs ring-1 ring-emerald-400">
                              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                              <span>TER-UPDATE • KODE: {q.batch_code}</span>
                            </span>
                          )}
                          <span className={`rounded-lg border px-3 py-1 text-xs font-bold ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs text-slate-600">Topik: <strong className="text-slate-900">{q.topic}</strong></span>
                        </div>

                        {/* Status Feedback Badge */}
                        <div className="text-xs">
                          {isAnswered ? (
                            isComputerAssisted ? (
                              <span className="inline-flex items-center gap-1.5 text-sky-800 font-bold bg-sky-50 px-3 py-1 rounded-xl border border-sky-300">
                                <Bot className="w-4 h-4 text-sky-600" />
                                <span>Bantuan Komputer ({answerRecord.score} Poin)</span>
                              </span>
                            ) : isUserCorrect ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Jawaban Mandiri Tepat (+{answerRecord.score} Poin)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-rose-800 font-bold bg-rose-50 px-3 py-1 rounded-xl border border-rose-300">
                                <XCircle className="w-4 h-4 text-rose-600" />
                                <span>Jawaban Kurang Tepat ({answerRecord.score} Poin)</span>
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 text-xs">Pilih opsi jawaban</span>
                          )}
                        </div>
                      </div>

                      {/* Competency Indicator */}
                      <div className="text-xs sm:text-sm text-slate-700 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
                        <strong className="text-slate-900">Indikator Kompetensi BKN:</strong> {q.competency_indicator}
                      </div>

                      {/* Question Text (BESAR & SANGAT NYAMAN DIBACA - MINIMAL 16px) */}
                      <div className="text-base sm:text-lg font-bold text-slate-950 leading-relaxed whitespace-pre-wrap">
                        {q.question}
                      </div>

                      {/* Touch-Friendly Options A - E (HITBOX BESAR MIN 56px) */}
                      <div className="space-y-2.5 pt-1">
                        {q.options.map((opt) => {
                          const isCorrectKey = opt.code === q.answer_key;
                          const isUserSelected = userChoice === opt.code;

                          let cardStyle = 'bg-slate-50/70 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100/70';
                          let badgeStyle = 'bg-slate-200 text-slate-800';

                          if (isAnswered) {
                            if (isCorrectKey) {
                              cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-2 ring-emerald-400 shadow-2xs';
                              badgeStyle = 'bg-emerald-600 text-white font-black';
                            } else if (isUserSelected) {
                              cardStyle = 'bg-rose-50 border-rose-500 text-rose-950 font-medium ring-2 ring-rose-400';
                              badgeStyle = 'bg-rose-600 text-white font-black';
                            }
                          }

                          return (
                            <button
                              key={opt.code}
                              onClick={() => handleSelectOption(q.id, opt.code, q.answer_key, q.subtest, q.options)}
                              className={`w-full text-left flex items-start justify-between p-4 sm:p-5 rounded-2xl border text-sm sm:text-base leading-relaxed transition-all cursor-pointer min-h-[56px] ${cardStyle}`}
                            >
                              <div className="flex items-start gap-3.5">
                                <span
                                  className={`flex items-center justify-center w-8 h-8 rounded-xl text-sm font-black shrink-0 mt-0.5 ${badgeStyle}`}
                                >
                                  {opt.code}
                                </span>
                                <span className="leading-normal">{opt.text}</span>
                              </div>
                              {isAnswered && (
                                <span
                                  className={`ml-3 shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold border ${
                                    isCorrectKey
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}
                                >
                                  Skor: {opt.score}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Computer Assistance Button (Bantuan Jawaban Komputer jika salah) */}
                      {isAnswered && !isUserCorrect && !isComputerAssisted && (
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                          <div className="text-xs text-amber-900">
                            <strong>Jawaban Anda belum maksimal:</strong> Minta bantuan komputer untuk meninjau kunci berbobot nilai tertinggi dan regulasi dasarnya.
                          </div>
                          <button
                            onClick={() => handleRequestComputerAssistance(q.id, q.answer_key, q.subtest, q.options)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition cursor-pointer shrink-0"
                          >
                            <Bot className="w-4 h-4" />
                            <span>Bantuan Jawaban Komputer</span>
                          </button>
                        </div>
                      )}

                      {/* Explanation toggle & block */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <button
                          onClick={() => toggleExpand(q.id)}
                          className="flex items-center gap-1.5 text-xs sm:text-sm text-amber-800 hover:text-amber-950 font-bold cursor-pointer py-1"
                        >
                          <HelpCircle className="w-4 h-4 text-amber-600" />
                          <span>{isExp ? 'Tutup Pembahasan' : 'Lihat Pembahasan & Landasan Regulasi'}</span>
                          {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {isComputerAssisted && (
                          <span className="text-[11px] text-sky-800 font-semibold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                            * Jawaban ini tercatat sebagai bantuan komputer
                          </span>
                        )}
                      </div>

                      {isExp && (
                        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2 animate-in fade-in duration-150">
                          <div className="font-black text-amber-900 text-sm">
                            Kunci Resmi BKN: Opsi {q.answer_key} • Landasan Regulasi & Analisis:
                          </div>
                          <p className="whitespace-pre-wrap">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* General Questions Pagination Controls */}
              {totalGenPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs sm:text-sm">
                  <span className="text-slate-600">
                    Menampilkan <strong>{startIdx + 1}</strong> – <strong>{Math.min(startIdx + PAGE_SIZE, filteredGeneral.length)}</strong> dari <strong>{filteredGeneral.length}</strong> Soal Umum
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGenPage((p) => Math.max(1, p - 1))}
                      disabled={genPage === 1}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition cursor-pointer"
                    >
                      ← Sebelumnya
                    </button>
                    <span className="px-3 font-bold text-slate-900">
                      Hal {genPage} / {totalGenPages}
                    </span>
                    <button
                      onClick={() => setGenPage((p) => Math.min(totalGenPages, p + 1))}
                      disabled={genPage === totalGenPages}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition cursor-pointer"
                    >
                      Berikutnya →
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* MODAL REKAPITULASI NILAI AKHIR LATIHAN */}
      {showNilaiAkhirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-900 font-sans max-h-[92vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-sm">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                    Laporan Hasil Belajar
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-950">
                    Rekapitulasi Nilai Akhir Latihan Mandiri
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bidang Aktif: <strong>{currentJob.name}</strong> • Total {answeredCount} Soal Diselesaikan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNilaiAkhirModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Giant Score Summary */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 via-amber-100/50 to-white border-2 border-amber-300 text-slate-950 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-amber-900">
                    Nilai Akhir Latihan Kumulatif:
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl sm:text-5xl font-black font-mono text-slate-950">
                      {practiceScore}
                    </span>
                    <span className="text-base text-slate-600 font-bold">
                      Poin ({answeredCount} Butir Dikerjakan)
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs font-bold text-slate-500">Tingkat Akurasi Jawaban:</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
                    {accuracyPct}%
                  </div>
                  <div className="text-xs text-slate-600">
                    {correctCount} Benar / {answeredCount} Soal
                  </div>
                </div>
              </div>

              {/* Assistance Breakdown Pill */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/80 text-xs">
                <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-slate-800 font-semibold">
                  Jawaban Mandiri: <strong>{Math.max(0, correctCount - assistedCount)} Soal</strong>
                </span>
                {assistedCount > 0 ? (
                  <span className="px-2.5 py-1 rounded-xl bg-sky-100 border border-sky-300 text-sky-900 font-bold flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-sky-700" />
                    <span>Bantuan Komputer: <strong>{assistedCount} Soal</strong> (Terekap)</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold">
                    ✓ 100% Pengerjaan Murni Tanpa Bantuan
                  </span>
                )}
              </div>
            </div>

            {/* Subtest Breakdown Table */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-700" />
                <span>Rincian Nilai per Subtes & Bidang Tugas</span>
              </h4>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 font-black">
                      <th className="p-3">Mata Uji</th>
                      <th className="p-3 text-center">Soal Dikerjakan</th>
                      <th className="p-3 text-center">Perolehan Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">1. KM-SK: Manajerial & Sosio-Kultural</td>
                      <td className="p-3 text-center font-mono">{countKmskPractice} Soal</td>
                      <td className="p-3 text-center font-mono font-black text-slate-900">{scoreKmskPractice} Poin</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">2. POT: Uji Potensi & Logika</td>
                      <td className="p-3 text-center font-mono">{countPotPractice} Soal</td>
                      <td className="p-3 text-center font-mono font-black text-slate-900">{scorePotPractice} Poin</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">3. LD: Literasi Digital & SPBE</td>
                      <td className="p-3 text-center font-mono">{countLdPractice} Soal</td>
                      <td className="p-3 text-center font-mono font-black text-slate-900">{scoreLdPractice} Poin</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">4. PK: Preferensi Karir RIASEC</td>
                      <td className="p-3 text-center font-mono">{countPkPractice} Soal</td>
                      <td className="p-3 text-center font-mono font-black text-slate-900">{scorePkPractice} Poin</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">5. Soal Teknis Unit: {currentJob.shortName}</td>
                      <td className="p-3 text-center font-mono">{countTeknisPractice} Soal</td>
                      <td className="p-3 text-center font-mono font-black text-slate-900">{scoreTeknisPractice} Poin</td>
                    </tr>
                    <tr className="bg-slate-50 font-black text-slate-950 border-t-2 border-slate-300">
                      <td className="p-3 uppercase">TOTAL NILAI LATIHAN</td>
                      <td className="p-3 text-center font-mono">{answeredCount} Soal</td>
                      <td className="p-3 text-center font-mono text-amber-900 text-base">{practiceScore} Poin</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowNilaiAkhirModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                Tutup & Lanjutkan Latihan
              </button>
              <button
                onClick={() => {
                  setShowNilaiAkhirModal(false);
                  onOpenSimulation();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>Uji Kemampuan di Simulasi CAT 4 Jam</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
