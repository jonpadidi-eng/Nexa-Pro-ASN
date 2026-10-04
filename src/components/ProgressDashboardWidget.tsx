import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  Bot,
  RotateCcw,
  BookOpen,
  Briefcase,
  PlayCircle,
  BarChart3,
  Layers,
} from 'lucide-react';
import { ProgressStats } from '../hooks/useUserProgress';
import { getJobFieldById } from '../data/jobFields';

interface ProgressDashboardWidgetProps {
  stats: ProgressStats;
  selectedJobField: string;
  onOpenFieldModal: () => void;
  onStartPractice: () => void;
  onStartSimulation: () => void;
  onViewDetailedProgress: () => void;
  onResetProgress: () => void;
}

export const ProgressDashboardWidget: React.FC<ProgressDashboardWidgetProps> = ({
  stats,
  selectedJobField,
  onOpenFieldModal,
  onStartPractice,
  onStartSimulation,
  onViewDetailedProgress,
  onResetProgress,
}) => {
  const currentJob = getJobFieldById(selectedJobField);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const categoryList = [
    { key: 'kmsk', ...stats.categories.kmsk, badgeColor: 'bg-amber-100 text-amber-900 border-amber-300' },
    { key: 'pot', ...stats.categories.pot, badgeColor: 'bg-sky-100 text-sky-900 border-sky-300' },
    { key: 'ld', ...stats.categories.ld, badgeColor: 'bg-purple-100 text-purple-900 border-purple-300' },
    { key: 'pk', ...stats.categories.pk, badgeColor: 'bg-rose-100 text-rose-900 border-rose-300' },
    { key: 'teknis', ...stats.categories.teknis, badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300', label: `Teknis ${currentJob.shortName}` },
  ];

  return (
    <section aria-label="Widget Progres Belajar Saya" className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Top Row: Bidang Aktif Banner & Headline */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900 bg-amber-100/90 border border-amber-300 px-3 py-1 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Bidang / Unit Tugas Aktif: {currentJob.name}</span>
            </span>

            <button
              onClick={onOpenFieldModal}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-4 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-amber-50 transition"
              title="Klik untuk mengganti unit atau bidang tugas penempatan"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Ganti Bidang Unit</span>
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Progres Belajar Saya
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Pantau kesiapan ujian CASN secara real-time. Data progres latihan dan simulasi CAT tersimpan aman secara otomatis di peramban Anda.
          </p>
        </div>

        {/* Primary Large CTA: Mulai Latihan Cepat / Lanjutkan Belajar */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onStartPractice}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <BookOpen className="w-5 h-5 text-slate-950" />
            <span>{stats.answeredCount > 0 ? 'Lanjutkan Belajar' : 'Mulai Latihan Cepat'}</span>
            <ArrowRight className="w-4 h-4 text-slate-950 ml-1" />
          </button>

          <button
            onClick={onStartSimulation}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-amber-400" />
            <span>Simulasi CAT 4 Jam</span>
          </button>
        </div>
      </div>

      {/* Main 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Questions Progress (LARGE) */}
        <div className="rounded-2xl bg-amber-50/60 border border-amber-200 p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span>Total Soal Dikerjakan</span>
            <span className="font-mono text-base font-black text-amber-900">{stats.percentageAnswered}%</span>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
              {stats.answeredCount}{' '}
              <span className="text-base sm:text-lg font-medium text-slate-500 font-sans">
                / {stats.totalQuestions} Soal
              </span>
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {stats.totalQuestions - stats.answeredCount > 0 ? (
                <span>Tersisa <strong>{stats.totalQuestions - stats.answeredCount}</strong> soal belum dikerjakan</span>
              ) : (
                <span className="text-emerald-700 font-bold">Semua 700 butir soal telah terselesaikan!</span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-amber-200/70 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(stats.answeredCount > 0 ? 3 : 0, stats.percentageAnswered))}%` }}
            />
          </div>
        </div>

        {/* Card 2: Average Accuracy Rate */}
        <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200 p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
            <span>Rata-Rata Akurasi Jawaban</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-800 font-mono tracking-tight">
              {stats.overallAccuracy}%
            </div>
            <div className="text-xs text-slate-600 mt-1">
              <strong>{stats.correctCount}</strong> jawaban benar dari total {stats.answeredCount} yang dikerjakan
            </div>
          </div>

          <div className="text-[11px] text-emerald-800 font-semibold bg-white/80 px-2.5 py-1.5 rounded-xl border border-emerald-200">
            Target Kelulusan BKN: ≥ 75%
          </div>
        </div>

        {/* Card 3: Computer-Assisted Answers (Bantuan Jawaban Komputer) */}
        <div className="rounded-2xl bg-sky-50/60 border border-sky-200 p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-sky-900">
            <span>Bantuan Jawaban Komputer</span>
            <Bot className="w-4 h-4 text-sky-600" />
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-sky-900 font-mono tracking-tight">
              {stats.assistedCount}{' '}
              <span className="text-sm font-medium text-slate-500 font-sans">Butir</span>
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {stats.assistedCount > 0
                ? 'Soal dijawab setelah bantuan kunci & penjelasan komputer'
                : 'Murni dijawab mandiri tanpa bantuan komputer'}
            </div>
          </div>

          <div className="text-[11px] text-slate-600 bg-white/80 px-2.5 py-1.5 rounded-xl border border-sky-200">
            {stats.answeredCount > 0 ? (
              <span>Mandiri: <strong>{stats.answeredCount - stats.assistedCount}</strong> • Bantuan: <strong>{stats.assistedCount}</strong></span>
            ) : (
              <span>Fitur siap aktif saat latihan</span>
            )}
          </div>
        </div>

        {/* Card 4: Last Practiced Time & Actions */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Waktu Latihan Terakhir</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>

          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {stats.formattedLastPracticed}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Tersimpan otomatis di penyimpanan lokal browser
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
            <button
              onClick={onViewDetailedProgress}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Lihat Detail Statistik</span>
            </button>

            {stats.answeredCount > 0 && (
              <div>
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Reset data progres latihan"
                  >
                    Reset
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        onResetProgress();
                        setShowResetConfirm(false);
                      }}
                      className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-300 cursor-pointer"
                    >
                      Ya, Hapus
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Progress Bars (KM-SK, POT, LD, RIASEC/PK, TEKNIS) */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Grafik Progres Belajar per Kategori Subtes (5 Kategori)</span>
          </h3>
          <span className="text-xs text-slate-500">
            Total 700 Butir Soal (500 Umum + 200 Teknis {currentJob.shortName})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {categoryList.map((cat) => (
            <div
              key={cat.key}
              className="rounded-2xl bg-slate-50/80 border border-slate-200/90 p-4 space-y-2.5 hover:bg-slate-50 hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${cat.badgeColor}`}>
                  {cat.category}
                </span>
                <span className="text-xs font-mono font-black text-slate-900">
                  {cat.answered} / {cat.total} ({cat.pctAnswered}%)
                </span>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-800 truncate" title={cat.label}>
                  {cat.label}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                  <span>Akurasi: <strong className="text-slate-800 font-mono">{cat.accuracy}%</strong></span>
                  {cat.assisted > 0 && (
                    <span className="text-sky-700">({cat.assisted} via komputer)</span>
                  )}
                </div>
              </div>

              {/* Progress Bar for Category */}
              <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${cat.color} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(cat.answered > 0 ? 4 : 0, cat.pctAnswered))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
