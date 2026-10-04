import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  Award,
  TrendingUp,
  CheckCircle2,
  BookOpen,
  Target,
  Clock,
  Sparkles,
  ArrowRight,
  Bot,
  RotateCcw,
  Briefcase,
  Layers,
  FileText,
  PlayCircle,
  Send,
  User,
  Mail,
  Loader2,
  Globe,
} from 'lucide-react';
import { ProAsnDataPackage } from '../types/asn';
import { ProgressStats, QuestionAnswerRecord } from '../hooks/useUserProgress';
import { getJobFieldById } from '../data/jobFields';
import {
  kirimDataDenganPencegahError,
  getSavedUserInfo,
  saveUserInfo,
  getActiveScriptUrl,
} from '../utils/kirimData';

interface DashboardPanelProps {
  dataPackage: ProAsnDataPackage;
  onNavigateTab: (tab: 'modules' | 'bank' | 'simulation' | 'dashboard' | 'processor' | 'json') => void;
  selectedJobField?: string;
  onOpenFieldModal?: () => void;
  stats: ProgressStats;
  answers: Record<string, QuestionAnswerRecord>;
  onResetProgress: () => void;
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({
  dataPackage,
  onNavigateTab,
  selectedJobField = 'auditor',
  onOpenFieldModal,
  stats,
  answers,
  onResetProgress,
}) => {
  const currentJob = getJobFieldById(selectedJobField);

  // States untuk sinkronisasi progres belajar ke Google Apps Script / Server
  const [syncNama, setSyncNama] = React.useState<string>(() => getSavedUserInfo().nama || '');
  const [syncEmail, setSyncEmail] = React.useState<string>(() => getSavedUserInfo().email || '');
  const [isSyncing, setIsSyncing] = React.useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = React.useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = React.useState<string | null>(null);

  const handleSyncProgress = async () => {
    setIsSyncing(true);
    try {
      const payload = {
        nama: syncNama.trim(),
        email: syncEmail.trim(),
        action: 'sinkronisasi_progres_belajar',
        bidang_id: selectedJobField,
        bidang_nama: currentJob.name,
        total_soal_terjawab: stats.answeredCount,
        total_jawaban_benar: stats.correctCount,
        akurasi_keseluruhan: `${stats.overallAccuracy}%`,
        rincian_kategori: {
          kmsk: { terjawab: stats.categories.kmsk.answered, benar: stats.categories.kmsk.correct, total: stats.categories.kmsk.total },
          pot: { terjawab: stats.categories.pot.answered, benar: stats.categories.pot.correct, total: stats.categories.pot.total },
          ld: { terjawab: stats.categories.ld.answered, benar: stats.categories.ld.correct, total: stats.categories.ld.total },
          pk: { terjawab: stats.categories.pk.answered, total: stats.categories.pk.total },
          teknis: { terjawab: stats.categories.teknis.answered, benar: stats.categories.teknis.correct, total: stats.categories.teknis.total },
        },
        timestamp: new Date().toISOString(),
      };

      const res = await kirimDataDenganPencegahError(payload);
      if (res.success) {
        setSyncSuccess(true);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        saveUserInfo({ nama: syncNama, email: syncEmail });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // 1. Data for Bar Chart: Real answered vs total per category
  const categoryBarData = useMemo(() => {
    const cats = [
      {
        kategori: 'KM-SK (Manajerial)',
        total: stats.categories.kmsk.total,
        terjawab: stats.categories.kmsk.answered,
        benar: stats.categories.kmsk.correct,
      },
      {
        kategori: 'POT (Logika)',
        total: stats.categories.pot.total,
        terjawab: stats.categories.pot.answered,
        benar: stats.categories.pot.correct,
      },
      {
        kategori: 'LD (Digital)',
        total: stats.categories.ld.total,
        terjawab: stats.categories.ld.answered,
        benar: stats.categories.ld.correct,
      },
      {
        kategori: 'PK (RIASEC)',
        total: stats.categories.pk.total,
        terjawab: stats.categories.pk.answered,
        benar: stats.categories.pk.correct,
      },
      {
        kategori: `Teknis ${currentJob.shortName}`,
        total: stats.categories.teknis.total,
        terjawab: stats.categories.teknis.answered,
        benar: stats.categories.teknis.correct,
      },
    ];
    return cats;
  }, [stats, currentJob.shortName]);

  // 2. Data for Composition Pie Chart
  const compositionPieData = useMemo(() => {
    return [
      { name: 'KM-SK', value: stats.categories.kmsk.total, color: '#f59e0b' },
      { name: 'POT', value: stats.categories.pot.total, color: '#0284c7' },
      { name: 'LD', value: stats.categories.ld.total, color: '#9333ea' },
      { name: 'PK', value: stats.categories.pk.total, color: '#e11d48' },
      { name: `Teknis ${currentJob.shortName}`, value: stats.categories.teknis.total, color: '#059669' },
    ];
  }, [stats, currentJob.shortName]);

  // 3. Radar Chart: Real Accuracy per subtest
  const radarData = useMemo(() => {
    return [
      {
        subjek: 'Integritas & Manajerial',
        akurasi: stats.categories.kmsk.accuracy,
        standarBKN: 75,
      },
      {
        subjek: 'Penalaran & Logika (POT)',
        akurasi: stats.categories.pot.accuracy,
        standarBKN: 70,
      },
      {
        subjek: 'Literasi Digital (LD)',
        akurasi: stats.categories.ld.accuracy,
        standarBKN: 80,
      },
      {
        subjek: 'Preferensi RIASEC (PK)',
        akurasi: stats.categories.pk.accuracy,
        standarBKN: 85,
      },
      {
        subjek: `Teknis ${currentJob.shortName}`,
        akurasi: stats.categories.teknis.accuracy,
        standarBKN: 75,
      },
    ];
  }, [stats, currentJob.shortName]);

  // Recent practice answers (last 10 items)
  const recentHistory = useMemo(() => {
    const list = Object.values(answers);
    list.sort((a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime());
    return list.slice(0, 8);
  }, [answers]);

  return (
    <div className="space-y-6 pb-12 text-slate-900 font-sans">
      {/* Banner Utama Analitik Belajar (Besar, Jelas) */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-950 font-black text-xs border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Analitik Belajar Real-Time</span>
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Terakhir Latihan: {stats.formattedLastPracticed}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Monitoring Kesiapan & Rekap Progres Belajar
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Data statistik dihitung secara transparan dari setiap butir soal yang Anda selesaikan pada Mode Latihan dan Simulasi CAT, tersimpan otomatis di peramban Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('bank')}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Lanjut Latihan Soal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigateTab('simulation')}
            className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-amber-400" />
            <span>Simulasi CAT 4 Jam</span>
          </button>
        </div>
      </div>

      {/* 4 Kartu Metrik Utama (BESAR & SANGAT KONTRAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Progress Card */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Total Soal Selesai</span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-950 font-mono">
              {stats.answeredCount}{' '}
              <span className="text-base font-normal text-slate-500 font-sans">
                / {stats.totalQuestions}
              </span>
            </div>
            <div className="text-xs text-slate-600 mt-1">
              <strong>{stats.percentageAnswered}%</strong> dari keseluruhan bank kurikulum 700 soal
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.percentageAnswered}%` }}
            />
          </div>
        </div>

        {/* Akurasi Card */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Tingkat Akurasi</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-800 font-mono">
              {stats.overallAccuracy}%
            </div>
            <div className="text-xs text-slate-600 mt-1">
              <strong>{stats.correctCount}</strong> benar dari {stats.answeredCount} butir yang dijawab
            </div>
          </div>
          <div className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Target Kelulusan BKN: ≥ 75%
          </div>
        </div>

        {/* Bantuan Komputer Card */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Bantuan Komputer</span>
            <Bot className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-sky-900 font-mono">
              {stats.assistedCount}{' '}
              <span className="text-sm font-normal text-slate-500 font-sans">Butir</span>
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {stats.assistedCount > 0
                ? 'Terbantu kunci & penjelasan mesin saat latihan'
                : 'Belum pernah menggunakan bantuan komputer'}
            </div>
          </div>
          <div className="text-xs text-sky-900 font-medium bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
            Mandiri: {stats.answeredCount - stats.assistedCount} • Komputer: {stats.assistedCount}
          </div>
        </div>

        {/* Bidang Aktif Card */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Bidang Tugas Unit</span>
            <Briefcase className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 truncate" title={currentJob.name}>
              {currentJob.shortName}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {stats.categories.teknis.answered} / {stats.categories.teknis.total} Soal Teknis Unit ({stats.categories.teknis.pctAnswered}%)
            </div>
          </div>
          {onOpenFieldModal && (
            <button
              onClick={onOpenFieldModal}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 underline block cursor-pointer"
            >
              Ganti Bidang Unit Tugas →
            </button>
          )}
        </div>
      </div>

      {/* Visual Charts: Bar Chart & Radar Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Statistik Pengerjaan per Subtes
              </h3>
              <p className="text-xs text-slate-500">
                Perbandingan jumlah soal kurikulum, soal terjawab, dan jawaban benar
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="kategori" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="total" name="Total Soal" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="terjawab" name="Sudah Dikerjakan" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="benar" name="Jawaban Benar" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">
              Peta Kompetensi & Akurasi
            </h3>
            <p className="text-xs text-slate-500">
              Tingkat akurasi vs target standar kelulusan MenPAN-RB
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subjek" tick={{ fontSize: 10, fill: '#475569' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Akurasi Anda (%)" dataKey="akurasi" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                <Radar name="Standar BKN (%)" dataKey="standarBKN" stroke="#64748b" fill="#64748b" fillOpacity={0.15} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SINKRONISASI DATA PROGRES BELAJAR (Google Apps Script / Server) */}
      <div className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-slate-50 p-6 sm:p-7 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base sm:text-lg font-black text-emerald-950 tracking-tight">
                  Sinkronisasi Progres Belajar ke Database / Google Sheets
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  Anti-CORS Ready
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Kirimkan catatan kemajuan latihan (total terjawab, akurasi, dan statistik tiap subtes) menggunakan fungsi pencegah error.
              </p>
            </div>
          </div>

          {syncSuccess && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tersimpan {lastSyncTime}</span>
            </div>
          )}
        </div>

        {/* Inputs & Action */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nama Lengkap Peserta:
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={syncNama}
                onChange={(e) => setSyncNama(e.target.value)}
                placeholder="Nama Anda"
                className="w-full rounded-xl bg-white border border-slate-300 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:border-emerald-600 focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Alamat Email Peserta:
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={syncEmail}
                onChange={(e) => setSyncEmail(e.target.value)}
                placeholder="email@anda.com"
                className="w-full rounded-xl bg-white border border-slate-300 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:border-emerald-600 focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-500">
            Target Server: <strong className="font-mono text-slate-800">{getActiveScriptUrl()}</strong> • Total Terjawab: <strong className="text-slate-800">{stats.answeredCount} Soal</strong>
          </div>

          <button
            type="button"
            onClick={handleSyncProgress}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs sm:text-sm font-black shadow-md shadow-emerald-600/25 transition cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>⏳ Mengirim data ke server...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{syncSuccess ? 'Sinkronkan Ulang Progres' : 'Kirim Data Progres Belajar'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Riwayat Latihan Terakhir Log */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Riwayat Aktivitas Pengerjaan Terbaru</span>
            </h3>
            <p className="text-xs text-slate-500">
              Rekaman butir soal terakhir yang Anda jawab beserta status bantuan komputer
            </p>
          </div>
          {stats.answeredCount > 0 && (
            <button
              onClick={onResetProgress}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl cursor-pointer"
            >
              Reset Semua Progres
            </button>
          )}
        </div>

        {recentHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            Belum ada aktivitas pengerjaan soal. Mulailah berlatih di tab <strong>Latihan Soal</strong>!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentHistory.map((item, idx) => (
              <div key={idx} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400">#{item.questionId}</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs">
                    Subtes: {item.category}
                  </span>
                  <span className="text-slate-700">
                    Opsi Dipilih: <strong className="text-slate-900">{item.selectedOption}</strong> (Kunci: {item.correctKey})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {item.isComputerAssisted ? (
                    <span className="inline-flex items-center gap-1 text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200 text-xs font-bold">
                      <Bot className="w-3.5 h-3.5 text-sky-600" />
                      <span>Bantuan Komputer (+{item.score})</span>
                    </span>
                  ) : item.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mandiri Benar (+{item.score})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 text-xs font-bold">
                      <span>Kurang Tepat ({item.score})</span>
                    </span>
                  )}

                  <span className="text-slate-400 text-xs font-mono">
                    {new Date(item.answeredAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
