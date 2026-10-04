import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Flag,
  Calendar,
  Zap,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Layers,
  ArrowRight,
  Bot,
  Maximize2,
  Minimize2,
  X,
  Target,
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Send,
  User,
  Mail,
  Loader2,
  Globe,
} from 'lucide-react';
import { ProAsnDataPackage, SoalUmum, SoalTeknis } from '../types/asn';
import { getJobFieldById } from '../data/jobFields';
import { build700ExamQuestions } from '../data/questionGenerator';
import { QuestionAnswerRecord } from '../hooks/useUserProgress';
import {
  kirimDataDenganPencegahError,
  getSavedUserInfo,
  saveUserInfo,
  getActiveScriptUrl,
} from '../utils/kirimData';

interface CatSimulationProps {
  dataPackage: ProAsnDataPackage;
  onBackToBank: () => void;
  selectedJobField?: string;
  onRecordAnswer?: (record: Omit<QuestionAnswerRecord, 'answeredAt'>) => void;
}

type CombinedQuestion = (SoalUmum | SoalTeknis) & { isTeknis: boolean };

export const CatSimulation: React.FC<CatSimulationProps> = ({
  dataPackage,
  onBackToBank,
  selectedJobField = 'auditor',
  onRecordAnswer,
}) => {
  const currentJob = getJobFieldById(selectedJobField);

  // Combine questions tailored to the selected job field using the 700 question curriculum generator
  const safeGeneral = dataPackage?.general_questions || [];
  const safeTechnical = dataPackage?.technical_questions || [];

  // Default mode: 'full' (700 Soal • 4 Jam = 240 Menit = 14.400 Detik)
  const [examMode, setExamMode] = useState<'full' | 'standard' | 'quick'>('full');

  // Full Screen examination mode state
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const allQuestions: CombinedQuestion[] = useMemo(() => {
    const list = build700ExamQuestions(safeGeneral, safeTechnical, selectedJobField);
    const combined: CombinedQuestion[] = list.map((q) => ({
      ...q,
      isTeknis: 'field' in q,
    }));

    if (examMode === 'quick') {
      return combined.slice(0, 30);
    }
    if (examMode === 'standard') {
      return combined.slice(0, 100);
    }
    return combined; // Full 700 questions (500 Umum + 200 Teknis)
  }, [safeGeneral, safeTechnical, selectedJobField, examMode]);

  // Duration in seconds: 4 hours (14,400s) for full 700 soal, 90 mins (5,400s) for standard, 30 mins (1,800s) for quick
  const getDurationForMode = useCallback((mode: 'full' | 'standard' | 'quick') => {
    if (mode === 'quick') return 30 * 60;
    if (mode === 'standard') return 90 * 60;
    return 4 * 60 * 60; // 4 Jam = 240 Menit = 14.400 detik
  }, []);

  const totalDuration = getDurationForMode(examMode);
  const storageKey = `pro_asn_cat_progress_${selectedJobField}_${examMode}`;

  // Restore saved session if exists
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) return parsed.answers;
      }
    } catch {
      // ignore
    }
    return {};
  });

  const [flagged, setFlagged] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.flagged) return parsed.flagged;
      }
    } catch {
      // ignore
    }
    return {};
  });

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.timeLeft === 'number' && parsed.timeLeft > 0) {
          return parsed.timeLeft;
        }
      }
    } catch {
      // ignore
    }
    return getDurationForMode('full');
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [navSectionFilter, setNavSectionFilter] = useState<'all' | 'unanswered' | 'flagged' | 'kmsk' | 'pot' | 'ld' | 'pk' | 'teknis'>('all');
  const [pageBlock, setPageBlock] = useState<number>(0);

  // States untuk pengiriman hasil evaluasi ke server / Google Apps Script
  const [submitNama, setSubmitNama] = useState<string>(() => getSavedUserInfo().nama || '');
  const [submitEmail, setSubmitEmail] = useState<string>(() => getSavedUserInfo().email || '');
  const [isSubmittingData, setIsSubmittingData] = useState<boolean>(false);
  const [dataSubmittedSuccess, setDataSubmittedSuccess] = useState<boolean>(false);
  const [submittedTimestamp, setSubmittedTimestamp] = useState<string | null>(null);

  // Esc listener to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => {
      const next = !prev;
      if (next) {
        try {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {});
          }
        } catch {
          // ignore
        }
      } else {
        try {
          if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
          }
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  // Auto-save answers and state to localStorage
  useEffect(() => {
    if (isFinished) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          answers,
          flagged,
          timeLeft,
          lastUpdated: new Date().toISOString(),
        })
      );
    } catch {
      // ignore
    }
  }, [answers, flagged, timeLeft, isFinished, storageKey]);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || isFinished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isFinished]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentQ = allQuestions[currentIndex];

  const handleSelectOption = (code: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (isFinished || !currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: code }));

    // Also sync to global user progress if callback provided
    if (onRecordAnswer) {
      const isCorrect = code === currentQ.answer_key;
      const selectedOpt = currentQ.options.find((o) => o.code === code);
      const score = selectedOpt ? selectedOpt.score : isCorrect ? 5 : 0;
      const category = currentQ.isTeknis
        ? 'teknis'
        : 'subtest' in currentQ
        ? currentQ.subtest
        : 'KM-SK';

      onRecordAnswer({
        questionId: currentQ.id,
        selectedOption: code,
        correctKey: currentQ.answer_key,
        isCorrect,
        score,
        category: category as 'KM-SK' | 'POT' | 'LD' | 'PK' | 'teknis',
        isComputerAssisted: false,
      });
    }
  };

  const handleToggleFlag = () => {
    if (!currentQ) return;
    setFlagged((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleRestart = (newMode?: 'full' | 'standard' | 'quick') => {
    const targetMode = newMode || examMode;
    if (newMode) setExamMode(newMode);
    try {
      localStorage.removeItem(`pro_asn_cat_progress_${selectedJobField}_${targetMode}`);
    } catch {
      // ignore
    }
    setAnswers({});
    setFlagged({});
    setTimeLeft(getDurationForMode(targetMode));
    setIsFinished(false);
    setCurrentIndex(0);
    setPageBlock(0);
    setIsTimerRunning(true);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || showConfirmModal) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
        handleSelectOption(key as 'A' | 'B' | 'C' | 'D' | 'E');
      } else if (key === '1') handleSelectOption('A');
      else if (key === '2') handleSelectOption('B');
      else if (key === '3') handleSelectOption('C');
      else if (key === '4') handleSelectOption('D');
      else if (key === '5') handleSelectOption('E');
      else if (key === 'R') handleToggleFlag();
      else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(allQuestions.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinished, showConfirmModal, allQuestions.length, currentQ]);

  // Jump to next unanswered question
  const handleJumpNextUnanswered = () => {
    const nextIdx = allQuestions.findIndex((q, idx) => idx > currentIndex && !answers[q.id]);
    if (nextIdx !== -1) {
      setCurrentIndex(nextIdx);
      setPageBlock(Math.floor(nextIdx / 100));
    } else {
      const firstUnanswered = allQuestions.findIndex((q) => !answers[q.id]);
      if (firstUnanswered !== -1) {
        setCurrentIndex(firstUnanswered);
        setPageBlock(Math.floor(firstUnanswered / 100));
      }
    }
  };

  // Calculations for scores & results
  let totalScoreKmsk = 0;
  let maxScoreKmsk = 0;
  let correctPot = 0;
  let totalPot = 0;
  let correctLd = 0;
  let totalLd = 0;
  let correctPk = 0;
  let totalPk = 0;
  let correctTeknis = 0;
  let totalTeknis = 0;

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = allQuestions.length - answeredCount;

  allQuestions.forEach((q) => {
    const userAns = answers[q.id];
    const selectedOpt = q.options.find((o) => o.code === userAns);

    if (!q.isTeknis && 'subtest' in q) {
      if (q.subtest === 'KM-SK') {
        maxScoreKmsk += 5;
        if (selectedOpt) totalScoreKmsk += selectedOpt.score;
      } else if (q.subtest === 'POT') {
        totalPot += 1;
        if (userAns === q.answer_key) correctPot += 1;
      } else if (q.subtest === 'LD') {
        totalLd += 1;
        if (userAns === q.answer_key) correctLd += 1;
      } else if (q.subtest === 'PK') {
        totalPk += 1;
        if (userAns === q.answer_key) correctPk += 1;
      }
    } else {
      totalTeknis += 1;
      if (userAns === q.answer_key) correctTeknis += 1;
    }
  });

  // Calculate live and final cumulative scores
  const scoreKmsk = totalScoreKmsk;
  const scorePot = correctPot * 5;
  const scoreLd = correctLd * 5;
  const scorePk = correctPk * 5;
  const scoreTeknis = correctTeknis * 5;

  const currentTotalScore = scoreKmsk + scorePot + scoreLd + scorePk + scoreTeknis;
  const maxPossibleScore = maxScoreKmsk + (totalPot * 5) + (totalLd * 5) + (totalPk * 5) + (totalTeknis * 5);

  // Passing grade targets (MenPAN-RB / BKN Standards)
  // Scaling appropriately based on current question count vs 700 full exam
  const ratio = allQuestions.length / 700;
  const targetKmsk = Math.max(10, Math.round(166 * (maxScoreKmsk > 0 ? maxScoreKmsk / 750 : ratio)));
  const targetPot = Math.max(10, Math.round(80 * (totalPot > 0 ? totalPot / 150 : ratio)));
  const targetLd = Math.max(10, Math.round(50 * (totalLd > 0 ? totalLd / 100 : ratio)));
  const targetTeknis = Math.max(10, Math.round(100 * (totalTeknis > 0 ? totalTeknis / 200 : ratio)));

  const isKmskPass = scoreKmsk >= targetKmsk;
  const isPotPass = scorePot >= targetPot;
  const isLdPass = scoreLd >= targetLd;
  const isTeknisPass = scoreTeknis >= targetTeknis;
  const passingMetCount = [isKmskPass, isPotPass, isLdPass, isTeknisPass].filter(Boolean).length;
  const isOverallPass = passingMetCount === 4;

  // Final evaluation predicate
  const finalPercentage = maxPossibleScore > 0 ? Math.round((currentTotalScore / maxPossibleScore) * 100) : 0;
  let finalPredicate = 'Cukup (Perlu Peningkatan Latihan)';
  if (finalPercentage >= 85) {
    finalPredicate = 'Sangat Memuaskan (Rekomendasi Prioritas ASN)';
  } else if (finalPercentage >= 70) {
    finalPredicate = 'Memuaskan (Memenuhi Standar Kelulusan)';
  }

  // Pacing & duration bar calculations
  const elapsedTime = totalDuration - timeLeft;
  const elapsedPct = totalDuration > 0 ? Math.min(100, Math.round((elapsedTime / totalDuration) * 100)) : 0;
  const remainingPct = 100 - elapsedPct;
  const questionProgressPct = allQuestions.length > 0 ? Math.round((answeredCount / allQuestions.length) * 100) : 0;

  // Expected answered questions at current elapsed time
  const expectedAnswers = totalDuration > 0 ? Math.round((elapsedTime / totalDuration) * allQuestions.length) : 0;
  const pacingDiff = answeredCount - expectedAnswers;

  // Ideal seconds per question for this exam
  const idealSecPerQuestion = allQuestions.length > 0 ? Math.round(totalDuration / allQuestions.length) : 20;
  const remainingSecPerQuestion = unansweredCount > 0 ? Math.round(timeLeft / unansweredCount) : 0;

  // Sync all answers when finishing exam
  const handleFinishExam = () => {
    setShowConfirmModal(false);
    setIsFinished(true);

    if (onRecordAnswer) {
      allQuestions.forEach((q) => {
        const userAns = answers[q.id];
        if (userAns) {
          const isCorrect = userAns === q.answer_key;
          const opt = q.options.find((o) => o.code === userAns);
          const score = opt ? opt.score : isCorrect ? 5 : 0;
          const category = q.isTeknis ? 'teknis' : 'subtest' in q ? q.subtest : 'KM-SK';
          onRecordAnswer({
            questionId: q.id,
            selectedOption: userAns,
            correctKey: q.answer_key,
            isCorrect,
            score,
            category: category as 'KM-SK' | 'POT' | 'LD' | 'PK' | 'teknis',
            isComputerAssisted: false,
          });
        }
      });
    }
  };

  // Pengiriman data rekapitulasi ujian ke Google Apps Script / Server
  const handleKirimHasilUjian = async () => {
    setIsSubmittingData(true);
    try {
      const payload = {
        nama: submitNama.trim(),
        email: submitEmail.trim(),
        action: 'hasil_evaluasi_cat',
        bidang_id: selectedJobField,
        bidang_nama: currentJob.name,
        mode_ujian: examMode,
        skor_total: currentTotalScore,
        skor_maksimal: maxPossibleScore,
        persentase: `${finalPercentage}%`,
        predikat: finalPredicate,
        status_kelulusan: isOverallPass
          ? 'LULUS MEMENUHI PASSING GRADE BKN'
          : 'BELUM MEMENUHI PASSING GRADE',
        soal_terjawab: answeredCount,
        soal_total: allQuestions.length,
        rincian_subtes: {
          kmsk: { skor: scoreKmsk, target: targetKmsk, lulus: isKmskPass },
          pot: { skor: scorePot, benar: correctPot, target: targetPot, lulus: isPotPass },
          ld: { skor: scoreLd, benar: correctLd, target: targetLd, lulus: isLdPass },
          pk: { skor: scorePk, benar: correctPk },
          teknis: { skor: scoreTeknis, benar: correctTeknis, target: targetTeknis, lulus: isTeknisPass },
        },
        timestamp: new Date().toISOString(),
      };

      const res = await kirimDataDenganPencegahError(payload);
      if (res.success) {
        setDataSubmittedSuccess(true);
        setSubmittedTimestamp(new Date().toLocaleTimeString('id-ID'));
        saveUserInfo({ nama: submitNama, email: submitEmail });
      }
    } finally {
      setIsSubmittingData(false);
    }
  };

  if (allQuestions.length === 0) {
    return (
      <div className="text-center py-16 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <Award className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Belum Ada Soal di Bank Soal</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Silakan muat bank soal melalui katalog latihan atau hubungi administrator pemilik akun.
        </p>
        <button
          onClick={onBackToBank}
          className="rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition cursor-pointer"
        >
          Kembali ke Katalog Latihan
        </button>
      </div>
    );
  }

  // WIDGET NILAI SEMENTARA & MONITORING PACING
  const NilaiSementaraWidget = (
    <div className={`rounded-3xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3 ${isFullScreen ? 'mx-4 mt-2' : ''}`}>
      {/* Row 1: Nilai Sementara (Live Temporary Score) & Pacing Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shrink-0 font-black text-xs shadow-xs">
            ⚡ LIVE
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <span>Nilai Sementara (Live Running Score):</span>
              <span className="text-[10px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                Update Real-Time
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-950 font-mono">
                {currentTotalScore}
              </span>
              <span className="text-xs text-slate-600 font-semibold">
                / {maxPossibleScore} Poin Maksimal ({answeredCount} / {allQuestions.length} Soal Dijawab)
              </span>
            </div>
          </div>
        </div>

        {/* Live Subtest Passing Status Indicators */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-500 font-semibold mr-1">Rincian Sementara:</span>
          <span className={`px-2 py-0.5 rounded-lg border font-mono font-bold ${isKmskPass ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-200'}`} title={`KM-SK: ${scoreKmsk}/${targetKmsk}`}>
            KM-SK: {scoreKmsk}
          </span>
          <span className={`px-2 py-0.5 rounded-lg border font-mono font-bold ${isPotPass ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-200'}`} title={`POT: ${scorePot}/${targetPot}`}>
            POT: {scorePot}
          </span>
          <span className={`px-2 py-0.5 rounded-lg border font-mono font-bold ${isLdPass ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-200'}`} title={`LD: ${scoreLd}/${targetLd}`}>
            LD: {scoreLd}
          </span>
          <span className={`px-2 py-0.5 rounded-lg border font-mono font-bold ${isTeknisPass ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-200'}`} title={`Teknis: ${scoreTeknis}/${targetTeknis}`}>
            Teknis: {scoreTeknis}
          </span>

          <span className="text-[11px] font-black ml-1 text-slate-700">
            ({passingMetCount}/4 Ambang Batas)
          </span>
        </div>
      </div>

      {/* Row 2: Duration Timeline Bar & Pacing Speed */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>
            Waktu Terpakai: <strong className="text-slate-900 font-mono">{formatTime(elapsedTime)}</strong> ({elapsedPct}%)
          </span>
          <span>
            Sisa Waktu: <strong className="text-amber-800 font-mono">{formatTime(timeLeft)}</strong> ({remainingPct}%)
          </span>
        </div>

        {/* Combined 2-part Bar (Elapsed vs Remaining) */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex border border-slate-200">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-600 h-full transition-all duration-500"
            style={{ width: `${elapsedPct}%` }}
          />
          <div
            className="bg-slate-200 h-full transition-all duration-500"
            style={{ width: `${remainingPct}%` }}
          />
        </div>
      </div>

      {/* Row 3: Question Progress vs Pacing Indicator */}
      <div className="space-y-1 pt-1.5 border-t border-slate-100">
        <div className="flex flex-wrap items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Progres Pengerjaan:</span>
            <span className="font-mono font-black text-slate-950">
              {answeredCount} / {allQuestions.length} Soal ({questionProgressPct}%)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>Target Ideal: <strong>{expectedAnswers} Soal</strong></span>
            <span>•</span>
            <span>
              Sisa Waktu:{' '}
              <strong className="text-amber-800 font-mono">
                {remainingSecPerQuestion} dtk / sisa soal
              </strong>
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${questionProgressPct}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={
        isFullScreen
          ? 'fixed inset-0 z-50 bg-slate-100 flex flex-col h-screen w-screen overflow-hidden text-slate-900 font-sans'
          : 'space-y-6 pb-12 text-slate-900 font-sans'
      }
    >
      {/* Test Notice (Only in standard mode) */}
      {!isFullScreen && (
        <div className="bg-amber-500 text-slate-950 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm border border-amber-400 text-sm font-semibold">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-slate-950 shrink-0" />
            <span>
              <strong>Simulasi CAT Standar Ujian CASN:</strong> Wajib menyelesaikan <strong>700 Butir Soal</strong> (500 Soal Umum + 200 Soal Teknis {currentJob.shortName}) dengan alokasi waktu <strong>4 Jam (240 Menit)</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-black">
            <span className="bg-slate-950 text-amber-300 px-3 py-1 rounded-xl">
              BKN Standard Exam
            </span>
          </div>
        </div>
      )}

      {/* Top Header Bar for CAT Exam */}
      <div
        className={
          isFullScreen
            ? 'h-20 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0 shadow-xs'
            : 'flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs'
        }
      >
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-2xs shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-950">
                {isFullScreen ? 'SIMULASI CAT BKN:' : 'Simulasi Ujian CAT:'} {currentJob.name}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-950 border border-amber-300 font-black">
                {currentJob.badge}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-0.5">
              <span>Kurikulum: <strong>{allQuestions.length} Soal</strong></span>
              <span>•</span>
              <span className="text-emerald-800 font-bold">Terjawab: {answeredCount}</span>
              <span>•</span>
              <span className="text-amber-800 font-bold">Ragu: {flaggedCount}</span>
              <span>•</span>
              <span className="text-slate-500">Sisa: {unansweredCount}</span>
            </div>
          </div>
        </div>

        {/* Timer, Mode Switcher, Fullscreen Button & Selesai Ujian */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Mode Switcher Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => handleRestart('full')}
              className={`px-3 py-1.5 rounded-lg font-black transition cursor-pointer flex items-center gap-1 ${
                examMode === 'full' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>700 Soal (4 Jam)</span>
            </button>
            <button
              onClick={() => handleRestart('standard')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                examMode === 'standard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              100 Soal
            </button>
            <button
              onClick={() => handleRestart('quick')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                examMode === 'quick' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Soal
            </button>
          </div>

          {/* Countdown Clock with 4 Hours Default (BESAR & JELAS) */}
          <div
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-mono text-base sm:text-lg font-black shadow-sm border ${
              timeLeft < 900
                ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                : 'bg-slate-950 text-amber-400 border-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* TAMPILAN FULL LAYAR TOGGLE BUTTON */}
          <button
            onClick={toggleFullScreen}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-black border transition cursor-pointer shadow-xs ${
              isFullScreen
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-900'
            }`}
            title={isFullScreen ? 'Keluar dari Tampilan Layar Penuh (Esc)' : 'Buka Ujian dalam Tampilan Layar Penuh'}
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar Layar Penuh (Esc)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <span>🖥️ Layar Penuh</span>
              </>
            )}
          </button>

          {!isFinished ? (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="rounded-2xl bg-emerald-700 hover:bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-md shadow-emerald-700/20 transition cursor-pointer"
            >
              Selesai Ujian
            </button>
          ) : (
            <button
              onClick={() => handleRestart()}
              className="rounded-2xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs sm:text-sm font-black text-slate-950 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Ujian</span>
            </button>
          )}
        </div>
      </div>

      {/* VISUALISASI NILAI SEMENTARA & BAR DURASI REAL-TIME */}
      {!isFinished && NilaiSementaraWidget}

      {/* Main Examination View */}
      {isFinished ? (
        /* ======================================================== */
        /* LAPORAN NILAI AKHIR LENGKAP & REKAPITULASI KELULUSAN BKN */
        /* ======================================================== */
        <div
          className={
            isFullScreen
              ? 'flex-1 overflow-y-auto p-4 sm:p-8'
              : 'rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm'
          }
        >
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-8 shadow-sm max-w-5xl mx-auto">
            {/* Header Laporan Nilai Akhir */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 px-3.5 py-1 text-xs font-black mb-2">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>Sertifikat Hasil Evaluasi CAT Resmi</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  Laporan Rekapitulasi Nilai Akhir Ujian CAT
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Penilaian resmi berdasarkan standar Keputusan MenPAN-RB dan BKN untuk formasi <strong>{currentJob.name}</strong>.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRestart()}
                  className="flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 shadow-sm transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ulangi Simulasi</span>
                </button>
                <button
                  onClick={onBackToBank}
                  className="flex items-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-3 text-sm font-bold transition cursor-pointer border border-slate-200"
                >
                  <span>Kembali ke Latihan</span>
                </button>
              </div>
            </div>

            {/* Giant Nilai Akhir Scoreboard */}
            <div className={`p-6 sm:p-8 rounded-3xl border-2 space-y-4 ${
              isOverallPass
                ? 'bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-white border-emerald-400 text-emerald-950'
                : 'bg-gradient-to-br from-amber-50 via-amber-100/50 to-white border-amber-400 text-amber-950'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Nilai Akhir Kumulatif:
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-slate-950">
                      {currentTotalScore}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-500">
                      / {maxPossibleScore} Nilai Maksimal
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-2">
                    Predikat Hasil Ujian: <strong className="text-slate-950">{finalPredicate}</strong>
                  </div>
                </div>

                {/* Status Kelulusan BKN Badge */}
                <div className="text-left md:text-right">
                  <div className="text-xs font-bold text-slate-500 mb-1">Status Kelulusan Ambang Batas:</div>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black border shadow-xs ${
                    isOverallPass
                      ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300'
                      : 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-300'
                  }`}>
                    {isOverallPass ? <CheckCircle2 className="w-5 h-5 text-white" /> : <AlertTriangle className="w-5 h-5 text-slate-950" />}
                    <span>{isOverallPass ? 'LULUS MEMENUHI PASSING GRADE BKN' : 'BELUM MEMENUHI PASSING GRADE'}</span>
                  </span>
                  <div className="text-xs text-slate-600 mt-1.5">
                    {passingMetCount} dari 4 subtes berambang batas terpenuhi
                  </div>
                </div>
              </div>
            </div>

            {/* PENGIRIMAN DATA HASIL EVALUASI UJIAN (Google Apps Script / Server) */}
            <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 p-6 sm:p-7 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base sm:text-lg font-black text-indigo-950 tracking-tight">
                        Kirim & Arsipkan Hasil CAT ke Database / Google Sheets
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase tracking-wider">
                        Anti-CORS Ready
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Mengirimkan rekapitulasi nilai kumulatif, predikat, dan 5 subtes secara aman menggunakan fungsi pencegah error.
                    </p>
                  </div>
                </div>

                {dataSubmittedSuccess && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tersimpan {submittedTimestamp}</span>
                  </div>
                )}
              </div>

              {/* Form Input Nama & Email */}
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
                      value={submitNama}
                      onChange={(e) => setSubmitNama(e.target.value)}
                      placeholder="Nama Lengkap Anda"
                      className="w-full rounded-xl bg-white border border-slate-300 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:border-indigo-600 focus:outline-none transition shadow-2xs"
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
                      value={submitEmail}
                      onChange={(e) => setSubmitEmail(e.target.value)}
                      placeholder="email.peserta@domain.com"
                      className="w-full rounded-xl bg-white border border-slate-300 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:border-indigo-600 focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Target Server URL Info */}
              <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/80 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span>Target Server / SCRIPT_URL: <strong className="font-mono text-slate-800">{getActiveScriptUrl()}</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Skor: <strong className="text-slate-900 font-bold">{currentTotalScore} / {maxPossibleScore}</strong></span>
                  <span>Status: <strong className={isOverallPass ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>{isOverallPass ? 'LULUS BKN' : 'BELUM LULUS'}</strong></span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleKirimHasilUjian}
                  disabled={isSubmittingData}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs sm:text-sm font-black shadow-md shadow-indigo-600/25 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingData ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>⏳ Mengirim data ke server...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{dataSubmittedSuccess ? 'Kirim Ulang Data Hasil CAT' : 'Kirim Data Hasil CAT Sekarang'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* TABEL RINCIAN NILAI AKHIR RESMI PER SUBTES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-amber-600" />
                  <span>Rincian Nilai Akhir per Subtes & Ambang Batas BKN</span>
                </h4>
                <span className="text-xs text-slate-500 font-semibold">
                  Total {allQuestions.length} Butir Soal Teruji
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 font-black">
                      <th className="p-3.5">Mata Uji / Subtes</th>
                      <th className="p-3.5 text-center">Soal Diuji</th>
                      <th className="p-3.5 text-center">Jawaban Benar / Skor</th>
                      <th className="p-3.5 text-center">Nilai Ambang Batas</th>
                      <th className="p-3.5 text-center">Nilai Maksimal</th>
                      <th className="p-3.5 text-center">Status Kelulusan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {/* KM-SK */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">1. KM-SK: Manajerial & Sosio-Kultural</div>
                        <div className="text-[11px] text-slate-500">Skala Skor 1 – 5 Berbobot</div>
                      </td>
                      <td className="p-3.5 text-center font-mono">{maxScoreKmsk / 5}</td>
                      <td className="p-3.5 text-center font-mono font-black text-slate-900">{scoreKmsk} Poin</td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-600">≥ {targetKmsk}</td>
                      <td className="p-3.5 text-center font-mono text-slate-500">{maxScoreKmsk}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${isKmskPass ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                          {isKmskPass ? 'LULUS' : 'TIDAK LULUS'}
                        </span>
                      </td>
                    </tr>

                    {/* POT */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">2. POT: Uji Potensi & Logika</div>
                        <div className="text-[11px] text-slate-500">Skor 5 per Jawaban Benar</div>
                      </td>
                      <td className="p-3.5 text-center font-mono">{totalPot}</td>
                      <td className="p-3.5 text-center font-mono font-black text-slate-900">{scorePot} Poin ({correctPot} Benar)</td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-600">≥ {targetPot}</td>
                      <td className="p-3.5 text-center font-mono text-slate-500">{totalPot * 5}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${isPotPass ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                          {isPotPass ? 'LULUS' : 'TIDAK LULUS'}
                        </span>
                      </td>
                    </tr>

                    {/* LD */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">3. LD: Literasi Digital & SPBE</div>
                        <div className="text-[11px] text-slate-500">Skor 5 per Jawaban Benar</div>
                      </td>
                      <td className="p-3.5 text-center font-mono">{totalLd}</td>
                      <td className="p-3.5 text-center font-mono font-black text-slate-900">{scoreLd} Poin ({correctLd} Benar)</td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-600">≥ {targetLd}</td>
                      <td className="p-3.5 text-center font-mono text-slate-500">{totalLd * 5}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${isLdPass ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                          {isLdPass ? 'LULUS' : 'TIDAK LULUS'}
                        </span>
                      </td>
                    </tr>

                    {/* PK */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">4. PK: Preferensi Karir RIASEC</div>
                        <div className="text-[11px] text-slate-500">Pemetaan Minat & Kesesuaian Jabatan</div>
                      </td>
                      <td className="p-3.5 text-center font-mono">{totalPk}</td>
                      <td className="p-3.5 text-center font-mono font-black text-slate-900">{scorePk} Poin ({correctPk} Sesuai)</td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-600">-</td>
                      <td className="p-3.5 text-center font-mono text-slate-500">{totalPk * 5}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-sky-100 text-sky-900">
                          SESUAI
                        </span>
                      </td>
                    </tr>

                    {/* Teknis */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">5. Soal Teknis Unit: {currentJob.shortName}</div>
                        <div className="text-[11px] text-slate-500">Kompetensi Bidang Spesifik Penugasan</div>
                      </td>
                      <td className="p-3.5 text-center font-mono">{totalTeknis}</td>
                      <td className="p-3.5 text-center font-mono font-black text-slate-900">{scoreTeknis} Poin ({correctTeknis} Benar)</td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-600">≥ {targetTeknis}</td>
                      <td className="p-3.5 text-center font-mono text-slate-500">{totalTeknis * 5}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${isTeknisPass ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                          {isTeknisPass ? 'LULUS' : 'TIDAK LULUS'}
                        </span>
                      </td>
                    </tr>

                    {/* TOTAL FINAL ROW */}
                    <tr className="bg-slate-50 font-black text-slate-950 border-t-2 border-slate-300">
                      <td className="p-4 uppercase">TOTAL NILAI AKHIR UJIAN</td>
                      <td className="p-4 text-center font-mono">{allQuestions.length}</td>
                      <td className="p-4 text-center font-mono text-base text-amber-900">{currentTotalScore} Poin</td>
                      <td className="p-4 text-center font-mono">≥ {targetKmsk + targetPot + targetLd + targetTeknis}</td>
                      <td className="p-4 text-center font-mono">{maxPossibleScore}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-black ${isOverallPass ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'}`}>
                          {isOverallPass ? 'LULUS' : 'BELUM LULUS'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comprehensive Review of Questions */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-slate-900">
                  Pembahasan & Kunci Jawaban Lengkap ({allQuestions.length} Soal)
                </h4>
                <span className="text-xs text-slate-500 font-semibold">
                  Terjawab: {answeredCount} • Kosong: {unansweredCount}
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {allQuestions.map((q, idx) => {
                  const userAns = answers[q.id];
                  const isCorrect = userAns === q.answer_key;
                  const isKmsk = !q.isTeknis && 'subtest' in q && q.subtest === 'KM-SK';
                  const userOpt = q.options.find((o) => o.code === userAns);

                  return (
                    <div
                      key={q.id}
                      className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2.5 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-black text-slate-950">
                          #{idx + 1} • {q.isTeknis ? `Teknis ${currentJob.shortName}` : 'subtest' in q ? q.subtest : 'Umum'} ({q.id})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700">
                            Jawaban Anda: <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{userAns || 'Tidak Dijawab'}</strong>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-700">
                            Kunci Resmi: <strong className="text-amber-800">{q.answer_key}</strong>
                          </span>
                          {isKmsk && userOpt && (
                            <span className="rounded-lg bg-amber-100 text-amber-900 px-2.5 py-0.5 text-xs font-bold">
                              Skor: {userOpt.score}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-slate-900 font-bold text-base leading-relaxed">{q.question}</p>

                      <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <strong className="text-amber-800">Pembahasan & Landasan Regulasi:</strong> {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Question Display & Navigation Grid */
        <div
          className={
            isFullScreen
              ? 'flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 p-4'
              : 'grid grid-cols-1 lg:grid-cols-12 gap-6'
          }
        >
          {/* Main Question Area (8 cols) */}
          <div
            className={
              isFullScreen
                ? 'lg:col-span-8 flex flex-col h-full overflow-hidden'
                : 'lg:col-span-8 space-y-4'
            }
          >
            {currentQ && (
              <div
                className={
                  isFullScreen
                    ? 'rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 flex flex-col justify-between h-full overflow-y-auto shadow-xs'
                    : 'rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs'
                }
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="rounded-xl bg-amber-100 text-amber-950 border border-amber-300 px-3.5 py-1.5 text-sm font-black shadow-2xs">
                        Soal No. {currentIndex + 1} dari {allQuestions.length}
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-slate-900 text-amber-300 px-2.5 py-1 text-xs font-mono font-bold">
                        <span>Nilai Sementara:</span>
                        <strong className="text-white">{currentTotalScore}</strong>
                      </span>
                      {currentQ.batch_code && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 text-white px-2.5 py-1 text-xs font-mono font-bold shadow-2xs">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>KODE: {currentQ.batch_code}</span>
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-mono">ID: {currentQ.id}</span>
                    </div>

                    {/* Flag Button & Jump Next Unanswered */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleJumpNextUnanswered}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition cursor-pointer"
                        title="Lompat ke butir soal berikutnya yang belum diisi"
                      >
                        Soal Kosong Berikutnya →
                      </button>
                      <button
                        onClick={handleToggleFlag}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          flagged[currentQ.id]
                            ? 'bg-amber-100 border-amber-300 text-amber-950 ring-1 ring-amber-300'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Flag className="w-4 h-4" />
                        <span>{flagged[currentQ.id] ? 'Ditandai Ragu (R)' : 'Ragu-ragu (R)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Subtest / Topic Header */}
                  <div className="text-xs sm:text-sm text-slate-600 flex flex-wrap items-center gap-2">
                    {'subtest_label' in currentQ && (
                      <span className="px-3 py-1 rounded-lg bg-sky-50 text-sky-900 font-black border border-sky-200">
                        Subtes: {currentQ.subtest_label}
                      </span>
                    )}
                    {'field_label' in currentQ && (
                      <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-black border border-emerald-200">
                        Bidang / Unit: {currentQ.field_label}
                      </span>
                    )}
                    <span>Topik: <strong className="text-slate-900">{currentQ.topic}</strong></span>
                  </div>

                  {/* Authentic Question Text (BESAR & SANGAT NYAMAN DIBACA - MINIMAL 16px) */}
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-slate-950 leading-relaxed whitespace-pre-wrap">
                    {currentQ.question}
                  </div>

                  {/* Options List A - E (HITBOX BESAR MIN 56px) */}
                  <div className="space-y-3 pt-2">
                    {currentQ.options.map((opt) => {
                      const isSelected = answers[currentQ.id] === opt.code;
                      return (
                        <button
                          key={opt.code}
                          onClick={() => handleSelectOption(opt.code as 'A' | 'B' | 'C' | 'D' | 'E')}
                          className={`w-full text-left flex items-start gap-4 p-4 sm:p-5 rounded-2xl border text-sm sm:text-base leading-relaxed transition-all cursor-pointer min-h-[56px] ${
                            isSelected
                              ? 'bg-amber-50 border-amber-500 text-slate-950 font-bold ring-2 ring-amber-400 shadow-xs'
                              : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-white'
                          }`}
                        >
                          <span
                            className={`flex items-center justify-center w-8 h-8 rounded-xl text-sm font-black shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'bg-white border border-slate-300 text-slate-700'
                            }`}
                          >
                            {opt.code}
                          </span>
                          <span className="leading-normal">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Navigation & Keyboard tip */}
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                  <div className="text-xs text-slate-500 text-center">
                    Tip Keyboard: Tekan tombol <strong>A-E</strong> atau <strong>1-5</strong> untuk menjawab • Tombol panah <strong>← / →</strong> untuk navigasi • Tekan <strong>R</strong> untuk ragu-ragu
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentIndex === 0}
                      className="flex items-center gap-1.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold border border-slate-300 text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer min-h-[44px]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Sebelumnya (←)</span>
                    </button>

                    <span className="text-xs sm:text-sm font-bold text-slate-700">
                      {currentIndex + 1} / {allQuestions.length} Butir
                    </span>

                    <button
                      onClick={() => setCurrentIndex((prev) => Math.min(allQuestions.length - 1, prev + 1))}
                      disabled={currentIndex === allQuestions.length - 1}
                      className="flex items-center gap-1.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-slate-950 hover:bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer min-h-[44px]"
                    >
                      <span>Berikutnya (→)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Question Grid Navigator (4 cols) */}
          <div
            className={
              isFullScreen
                ? 'lg:col-span-4 flex flex-col h-full overflow-hidden'
                : 'lg:col-span-4 space-y-4'
            }
          >
            <div
              className={
                isFullScreen
                  ? 'rounded-3xl bg-white border border-slate-200 p-5 flex flex-col h-full overflow-hidden shadow-xs'
                  : 'rounded-3xl bg-white border border-slate-200 p-5 space-y-4 shadow-xs'
              }
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                <span className="text-sm font-black text-slate-900">Navigasi {allQuestions.length} Soal</span>
                <span className="text-xs text-slate-700 font-bold">
                  {answeredCount}/{allQuestions.length} Terjawab
                </span>
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1 text-[11px] py-2 shrink-0">
                <button
                  onClick={() => setNavSectionFilter('all')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    navSectionFilter === 'all' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Semua ({allQuestions.length})
                </button>
                <button
                  onClick={() => setNavSectionFilter('unanswered')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    navSectionFilter === 'unanswered' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Kosong ({unansweredCount})
                </button>
                <button
                  onClick={() => setNavSectionFilter('flagged')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    navSectionFilter === 'flagged' ? 'bg-amber-500 text-slate-950' : 'bg-amber-100 text-amber-950 hover:bg-amber-200'
                  }`}
                >
                  Ragu ({flaggedCount})
                </button>
                <button
                  onClick={() => setNavSectionFilter('teknis')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    navSectionFilter === 'teknis' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  Teknis ({allQuestions.filter((q) => q.isTeknis).length})
                </button>
              </div>

              {/* Question Number Buttons Grid (100 block paging) */}
              <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                {allQuestions.length > 100 && (
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100 shrink-0">
                    <span className="text-slate-500 font-medium">Blok Soal:</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(allQuestions.length / 100) }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setPageBlock(i)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            pageBlock === i
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {i * 100 + 1}-{Math.min((i + 1) * 100, allQuestions.length)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-1.5 overflow-y-auto pr-1 flex-1">
                  {allQuestions
                    .slice(pageBlock * 100, (pageBlock + 1) * 100)
                    .map((q, localIdx) => {
                      const idx = pageBlock * 100 + localIdx;
                      const isCurrent = currentIndex === idx;
                      const hasAnswer = Boolean(answers[q.id]);
                      const isFlagged = Boolean(flagged[q.id]);

                      let btnStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                      if (isCurrent) {
                        btnStyle = 'ring-2 ring-amber-500 border-amber-600 bg-amber-500 text-slate-950 font-black';
                      } else if (isFlagged) {
                        btnStyle = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                      } else if (hasAnswer) {
                        btnStyle = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIndex(idx)}
                          className={`h-9 rounded-xl border text-xs font-semibold flex items-center justify-center transition cursor-pointer ${btnStyle}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-emerald-600" />
                  <span>Sudah Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-300" />
                  <span>Ragu-ragu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-200" />
                  <span>Belum Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-amber-500" />
                  <span>Soal Aktif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-950">Konfirmasi Selesai Ujian CAT</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Anda telah menjawab <strong>{answeredCount}</strong> dari total <strong>{allQuestions.length}</strong> butir soal. Masih terdapat <strong>{unansweredCount}</strong> soal yang belum dijawab dan <strong>{flaggedCount}</strong> soal bertanda ragu-ragu.
            </p>
            <p className="text-xs text-slate-500">
              Apakah Anda yakin ingin mengakhiri sesi simulasi CAT dan melihat skor evaluasi sekarang?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Lanjutkan Ujian
              </button>
              <button
                onClick={handleFinishExam}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black shadow-sm transition cursor-pointer"
              >
                Ya, Selesaikan Ujian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
