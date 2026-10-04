import { useState, useEffect, useCallback, useMemo } from 'react';
import { ProAsnDataPackage } from '../types/asn';

export interface QuestionAnswerRecord {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | 'E';
  correctKey: 'A' | 'B' | 'C' | 'D' | 'E';
  isCorrect: boolean;
  score: number;
  category: 'KM-SK' | 'POT' | 'LD' | 'PK' | 'teknis';
  isComputerAssisted: boolean;
  answeredAt: string;
}

export interface CategoryProgress {
  category: string;
  label: string;
  color: string;
  total: number;
  answered: number;
  correct: number;
  assisted: number;
  pctAnswered: number;
  accuracy: number;
}

export interface ProgressStats {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  assistedCount: number;
  percentageAnswered: number;
  overallAccuracy: number;
  lastPracticedAt: string | null;
  formattedLastPracticed: string;
  categories: {
    kmsk: CategoryProgress;
    pot: CategoryProgress;
    ld: CategoryProgress;
    pk: CategoryProgress;
    teknis: CategoryProgress;
  };
}

const STORAGE_KEY = 'pro_asn_unified_progress_v2';

export function useUserProgress(dataPackage: ProAsnDataPackage, selectedJobField: string) {
  const [answers, setAnswers] = useState<Record<string, QuestionAnswerRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse progress from localStorage:', e);
    }
    return {};
  });

  const [lastPracticedAt, setLastPracticedAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`${STORAGE_KEY}_last_time`) || null;
    } catch {
      return null;
    }
  });

  // Save to localStorage whenever answers change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
      if (lastPracticedAt) {
        localStorage.setItem(`${STORAGE_KEY}_last_time`, lastPracticedAt);
      }
    } catch (e) {
      console.warn('Failed to save progress to localStorage:', e);
    }
  }, [answers, lastPracticedAt]);

  const recordAnswer = useCallback(
    (record: Omit<QuestionAnswerRecord, 'answeredAt'>) => {
      const now = new Date().toISOString();
      setAnswers((prev) => {
        const updated = {
          ...prev,
          [record.questionId]: {
            ...record,
            answeredAt: now,
          },
        };
        return updated;
      });
      setLastPracticedAt(now);
    },
    []
  );

  const resetProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`${STORAGE_KEY}_last_time`);
    } catch {
      // ignore
    }
    setAnswers({});
    setLastPracticedAt(null);
  }, []);

  // Filter questions for the active field
  const safeGeneral = dataPackage?.general_questions || [];
  const safeTechnical = dataPackage?.technical_questions || [];

  const relevantTechnical = useMemo(() => {
    return safeTechnical.filter(
      (q) => selectedJobField === 'all' || q.field.toLowerCase() === selectedJobField.toLowerCase()
    );
  }, [safeTechnical, selectedJobField]);

  const stats: ProgressStats = useMemo(() => {
    const kmskTotal = safeGeneral.filter((q) => q.subtest === 'KM-SK').length || 150;
    const potTotal = safeGeneral.filter((q) => q.subtest === 'POT').length || 150;
    const ldTotal = safeGeneral.filter((q) => q.subtest === 'LD').length || 100;
    const pkTotal = safeGeneral.filter((q) => q.subtest === 'PK').length || 100;
    const teknisTotal = relevantTechnical.length || 200;

    const totalQuestions = kmskTotal + potTotal + ldTotal + pkTotal + teknisTotal;

    let kmskAnswered = 0;
    let kmskCorrect = 0;
    let kmskAssisted = 0;

    let potAnswered = 0;
    let potCorrect = 0;
    let potAssisted = 0;

    let ldAnswered = 0;
    let ldCorrect = 0;
    let ldAssisted = 0;

    let pkAnswered = 0;
    let pkCorrect = 0;
    let pkAssisted = 0;

    let teknisAnswered = 0;
    let teknisCorrect = 0;
    let teknisAssisted = 0;

    Object.values(answers).forEach((item) => {
      if (item.category === 'KM-SK') {
        kmskAnswered++;
        if (item.isCorrect) kmskCorrect++;
        if (item.isComputerAssisted) kmskAssisted++;
      } else if (item.category === 'POT') {
        potAnswered++;
        if (item.isCorrect) potCorrect++;
        if (item.isComputerAssisted) potAssisted++;
      } else if (item.category === 'LD') {
        ldAnswered++;
        if (item.isCorrect) ldCorrect++;
        if (item.isComputerAssisted) ldAssisted++;
      } else if (item.category === 'PK') {
        pkAnswered++;
        if (item.isCorrect) pkCorrect++;
        if (item.isComputerAssisted) pkAssisted++;
      } else if (item.category === 'teknis') {
        teknisAnswered++;
        if (item.isCorrect) teknisCorrect++;
        if (item.isComputerAssisted) teknisAssisted++;
      }
    });

    const answeredCount = Object.keys(answers).length;
    const correctCount = kmskCorrect + potCorrect + ldCorrect + pkCorrect + teknisCorrect;
    const assistedCount = kmskAssisted + potAssisted + ldAssisted + pkAssisted + teknisAssisted;

    const percentageAnswered = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    const overallAccuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    const calcAccuracy = (corr: number, ans: number) => (ans > 0 ? Math.round((corr / ans) * 100) : 0);
    const calcPct = (ans: number, tot: number) => (tot > 0 ? Math.min(100, Math.round((ans / tot) * 100)) : 0);

    let formattedLastPracticed = 'Belum pernah latihan';
    if (lastPracticedAt) {
      try {
        const d = new Date(lastPracticedAt);
        if (!isNaN(d.getTime())) {
          formattedLastPracticed = d.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WIB';
        }
      } catch {
        formattedLastPracticed = 'Baru saja';
      }
    }

    return {
      totalQuestions,
      answeredCount,
      correctCount,
      assistedCount,
      percentageAnswered,
      overallAccuracy,
      lastPracticedAt,
      formattedLastPracticed,
      categories: {
        kmsk: {
          category: 'KM-SK',
          label: 'Manajerial & Sosio-Kultural',
          color: 'from-amber-500 to-amber-600',
          total: kmskTotal,
          answered: kmskAnswered,
          correct: kmskCorrect,
          assisted: kmskAssisted,
          pctAnswered: calcPct(kmskAnswered, kmskTotal),
          accuracy: calcAccuracy(kmskCorrect, kmskAnswered),
        },
        pot: {
          category: 'POT',
          label: 'Uji Potensi & Logika',
          color: 'from-sky-500 to-sky-600',
          total: potTotal,
          answered: potAnswered,
          correct: potCorrect,
          assisted: potAssisted,
          pctAnswered: calcPct(potAnswered, potTotal),
          accuracy: calcAccuracy(potCorrect, potAnswered),
        },
        ld: {
          category: 'LD',
          label: 'Literasi Digital & SPBE',
          color: 'from-purple-500 to-purple-600',
          total: ldTotal,
          answered: ldAnswered,
          correct: ldCorrect,
          assisted: ldAssisted,
          pctAnswered: calcPct(ldAnswered, ldTotal),
          accuracy: calcAccuracy(ldCorrect, ldAnswered),
        },
        pk: {
          category: 'PK',
          label: 'Preferensi Karir RIASEC',
          color: 'from-rose-500 to-rose-600',
          total: pkTotal,
          answered: pkAnswered,
          correct: pkCorrect,
          assisted: pkAssisted,
          pctAnswered: calcPct(pkAnswered, pkTotal),
          accuracy: calcAccuracy(pkCorrect, pkAnswered),
        },
        teknis: {
          category: 'TEKNIS',
          label: 'Kompetensi Teknis Unit',
          color: 'from-emerald-500 to-emerald-600',
          total: teknisTotal,
          answered: teknisAnswered,
          correct: teknisCorrect,
          assisted: teknisAssisted,
          pctAnswered: calcPct(teknisAnswered, teknisTotal),
          accuracy: calcAccuracy(teknisCorrect, teknisAnswered),
        },
      },
    };
  }, [safeGeneral, relevantTechnical, answers, lastPracticedAt]);

  return {
    answers,
    stats,
    recordAnswer,
    resetProgress,
  };
}
