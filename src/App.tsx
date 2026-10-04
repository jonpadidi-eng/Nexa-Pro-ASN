/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardPanel } from './components/DashboardPanel';
import { DocumentProcessor } from './components/DocumentProcessor';
import { BankSoalViewer } from './components/BankSoalViewer';
import { CatSimulation } from './components/CatSimulation';
import { ModulAjarViewer } from './components/ModulAjarViewer';
import { ProgressDashboardWidget } from './components/ProgressDashboardWidget';
import { JsonStudio } from './components/JsonStudio';
import { OfflineIndicator } from './components/OfflineIndicator';
import { JobFieldModal } from './components/JobFieldModal';
import { OwnerAuthModal } from './components/OwnerAuthModal';
import { AddQuestionModal } from './components/AddQuestionModal';
import { ActivationModal } from './components/ActivationModal';
import { WebhookConfigModal } from './components/WebhookConfigModal';
import { getStoredLicense, clearLicenseFromStorage } from './utils/licenseValidator';
import { ProAsnDataPackage, SoalTeknis, SoalUmum } from './types/asn';
import { initialProAsnData } from './data/initialData';
import { getJobFieldById } from './data/jobFields';
import { generate500GeneralQuestions, generate200TechnicalQuestionsForField } from './data/questionGenerator';
import { useUserProgress } from './hooks/useUserProgress';

const STORAGE_KEY = 'pro_asn_bank_soal_v1';
const JOB_FIELD_KEY = 'pro_asn_selected_job_field';
const OWNER_MODE_KEY = 'pro_asn_is_owner_mode';

function normalizeDataPackage(pkg: unknown): ProAsnDataPackage {
  const p = (pkg && typeof pkg === 'object' ? pkg : {}) as Partial<ProAsnDataPackage>;

  const rawGeneral = Array.isArray(p.general_questions) && p.general_questions.length >= 500
    ? p.general_questions
    : generate500GeneralQuestions(Array.isArray(p.general_questions) ? p.general_questions : initialProAsnData.general_questions);

  const rawTech = Array.isArray(p.technical_questions) ? p.technical_questions : initialProAsnData.technical_questions;
  const technical_questions = rawTech.length < 200
    ? [
        ...generate200TechnicalQuestionsForField('auditor', rawTech),
        ...generate200TechnicalQuestionsForField('sosial', rawTech),
        ...generate200TechnicalQuestionsForField('kesehatan', rawTech),
        ...generate200TechnicalQuestionsForField('pendidikan', rawTech),
        ...generate200TechnicalQuestionsForField('administrasi', rawTech),
        ...generate200TechnicalQuestionsForField('teknologi_informasi', rawTech),
      ]
    : rawTech;

  return {
    version: typeof p.version === 'string' && p.version ? p.version : '1.0.0',
    last_updated: typeof p.last_updated === 'string' && p.last_updated ? p.last_updated : new Date().toISOString(),
    meta: {
      ...(p.meta || initialProAsnData.meta),
      total_general_questions: rawGeneral.length,
      total_technical_questions: technical_questions.length,
    },
    modules: Array.isArray(p.modules) ? p.modules : initialProAsnData.modules,
    general_questions: rawGeneral,
    technical_questions,
  };
}

export default function App() {
  // Default to 'bank' (Latihan Soal) so users immediately see questions
  const [activeTab, setActiveTab] = useState<ActiveTab>('bank');
  const [bankSubtestFilter, setBankSubtestFilter] = useState<'all' | 'KM-SK' | 'POT' | 'LD' | 'PK' | 'teknis' | 'umum' | 'new_uploads'>('all');
  const [lastUpdateNotice, setLastUpdateNotice] = useState<{
    count: number;
    batchCode: string;
    timestamp: string;
  } | null>(null);

  // Job field state: check if user already selected a unit
  const [selectedJobField, setSelectedJobField] = useState<string>(() => {
  try {
    const saved = localStorage.getItem(JOB_FIELD_KEY);
    if (saved && saved !== 'null' && saved !== 'undefined' && saved.trim() !== '') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'auditor';
  });

  // Modal open on first launch if user hasn't chosen a unit yet
  const [isFieldModalOpen, setIsFieldModalOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(JOB_FIELD_KEY) === null;
    } catch {
      return false;
    }
  });

  // Public vs Owner Access State
  const [isOwnerMode, setIsOwnerMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(OWNER_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState<boolean>(false);
  const [addQuestionInitialTab, setAddQuestionInitialTab] = useState<'manual' | 'pdf'>('manual');
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState<boolean>(false);

  // License Key Verification System (Lock Screen)
  const [licenseState, setLicenseState] = useState<{ isActivated: boolean; licenseKey: string | null }>(() => {
    return getStoredLicense();
  });
  const [isActivationModalOpen, setIsActivationModalOpen] = useState<boolean>(() => {
    return !getStoredLicense().isActivated;
  });

  const handleLicenseActivated = (key: string) => {
    setLicenseState({ isActivated: true, licenseKey: key });
    setIsActivationModalOpen(false);
  };

  const handleResetLicense = () => {
    clearLicenseFromStorage();
    setLicenseState({ isActivated: false, licenseKey: null });
    setIsActivationModalOpen(true);
  };

 const [dataPackage, setDataPackage] = useState<ProAsnDataPackage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== 'null' && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return normalizeDataPackage(parsed);
        }
      }
    } catch (e) {
      console.warn("Fallback to initial Pro ASN data:", e);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (_) {}
    }
    return initialProAsnData;
  });

  // Persistent User Progress Tracker Hook
  const {
    answers: userProgressAnswers,
    stats: userProgressStats,
    recordAnswer: handleRecordAnswer,
    resetProgress: handleResetProgress,
  } = useUserProgress(dataPackage, selectedJobField);

  // Sync to local storage safely
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataPackage));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [dataPackage]);

  const handleSelectField = (fieldId: string) => {
    setSelectedJobField(fieldId);
    try {
      localStorage.setItem(JOB_FIELD_KEY, fieldId);
    } catch {
      // ignore
    }
    setIsFieldModalOpen(false);
  };

  const handleToggleOwnerMode = (enable: boolean) => {
    setIsOwnerMode(enable);
    try {
      localStorage.setItem(OWNER_MODE_KEY, enable ? 'true' : 'false');
    } catch {
      // ignore
    }
  };

  const handleAddQuestion = (newQuestion: SoalTeknis | SoalUmum) => {
    const isUmum = 'subtest' in newQuestion;
    const batchCode = newQuestion.batch_code || `MANUAL-${Math.floor(1000 + Math.random() * 9000)}`;
    setDataPackage((prev) => ({
      ...prev,
      last_updated: new Date().toISOString(),
      general_questions: isUmum
        ? [newQuestion as SoalUmum, ...(prev.general_questions || [])]
        : prev.general_questions,
      technical_questions: !isUmum
        ? [newQuestion as SoalTeknis, ...(prev.technical_questions || [])]
        : prev.technical_questions,
    }));
    setLastUpdateNotice({
      count: 1,
      batchCode,
      timestamp: new Date().toLocaleTimeString('id-ID'),
    });
  };

  const handleAddQuestions = (newQuestions: (SoalTeknis | SoalUmum)[]) => {
    if (newQuestions.length === 0) return;
    const batchCode = newQuestions[0]?.batch_code || `BATCH-${Math.floor(1000 + Math.random() * 9000)}`;
    setDataPackage((prev) => {
      const umums = newQuestions.filter((q) => 'subtest' in q) as SoalUmum[];
      const tekniss = newQuestions.filter((q) => !('subtest' in q)) as SoalTeknis[];
      return {
        ...prev,
        last_updated: new Date().toISOString(),
        general_questions: umums.length > 0 ? [...umums, ...(prev.general_questions || [])] : prev.general_questions,
        technical_questions: tekniss.length > 0 ? [...tekniss, ...(prev.technical_questions || [])] : prev.technical_questions,
      };
    });
    setLastUpdateNotice({
      count: newQuestions.length,
      batchCode,
      timestamp: new Date().toLocaleTimeString('id-ID'),
    });
  };

  const handleUpdateData = (newData: ProAsnDataPackage) => {
    setDataPackage(normalizeDataPackage(newData));
  };

  const handleResetToDefault = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setDataPackage(initialProAsnData);
    handleResetProgress();
  };

  const safeModules = dataPackage?.modules || [];
  const safeGeneral = dataPackage?.general_questions || [];
  const safeTechnical = dataPackage?.technical_questions || [];

  const stats = {
    modulesCount: safeModules.length,
    generalCount: safeGeneral.length,
    technicalCount: safeTechnical.length,
    version: dataPackage?.version || '1.0.0',
  };

  let formattedDate = 'Hari ini';
  try {
    if (dataPackage?.last_updated) {
      const d = new Date(dataPackage.last_updated);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleString('id-ID');
      }
    }
  } catch {
    formattedDate = 'Hari ini';
  }

  const currentJob = getJobFieldById(selectedJobField);

  // Jump from Modul Ajar to practice filtered by that subtest
  const handleGoToPracticeFromModule = (filterCategory?: string) => {
    if (filterCategory === 'KM-SK' || filterCategory === 'POT' || filterCategory === 'LD' || filterCategory === 'PK') {
      setBankSubtestFilter(filterCategory);
    } else {
      setBankSubtestFilter('all');
    }
    setActiveTab('bank');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Sticky Modern Navigation (Prominent, High-Contrast) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedJobField={selectedJobField}
        onOpenFieldModal={() => setIsFieldModalOpen(true)}
        isOwnerMode={isOwnerMode}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAddQuestionModal={() => {
          setAddQuestionInitialTab('manual');
          setIsAddQuestionModalOpen(true);
        }}
        onOpenUploadPdfModal={() => {
          setAddQuestionInitialTab('pdf');
          setIsAddQuestionModalOpen(true);
        }}
        onOpenWebhookConfig={() => setIsWebhookModalOpen(true)}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Notifikasi Ter-update & Kode Soal */}
        {lastUpdateNotice && (
          <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-4 sm:p-5 shadow-lg border border-emerald-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-white text-emerald-800 font-black shrink-0 shadow-sm">
                <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ✓ Update Berhasil Masuk Sistem
                  </span>
                  <span className="font-mono text-xs font-black bg-emerald-950/70 px-2.5 py-0.5 rounded-lg border border-emerald-400/50 text-emerald-200">
                    KODE BATCH: {lastUpdateNotice.batchCode}
                  </span>
                  <span className="text-xs text-emerald-200">
                    • Waktu: {lastUpdateNotice.timestamp}
                  </span>
                </div>
                <div className="text-sm sm:text-base font-bold text-white mt-1">
                  Sebanyak <strong>{lastUpdateNotice.count} Butir Soal Baru</strong> telah berhasil di-update dan aktif di sistem bank soal.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setBankSubtestFilter('new_uploads');
                  setActiveTab('bank');
                }}
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-emerald-950 font-black text-xs sm:text-sm shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Lihat {lastUpdateNotice.count} Soal Ini</span>
                <ArrowRight className="w-4 h-4 text-emerald-800" />
              </button>
              <button
                onClick={() => setLastUpdateNotice(null)}
                className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Tutup Notifikasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Real-Time User Progress Dashboard Widget (Prominently at the Top) */}
        {activeTab !== 'simulation' && activeTab !== 'processor' && activeTab !== 'json' && (
          <ProgressDashboardWidget
            stats={userProgressStats}
            selectedJobField={selectedJobField}
            onOpenFieldModal={() => setIsFieldModalOpen(true)}
            onStartPractice={() => setActiveTab('bank')}
            onStartSimulation={() => setActiveTab('simulation')}
            onViewDetailedProgress={() => setActiveTab('dashboard')}
            onResetProgress={handleResetProgress}
          />
        )}

        {/* Tab 1: Modul Ajar */}
        {activeTab === 'modules' && (
          <ModulAjarViewer
            dataPackage={dataPackage}
            selectedJobField={selectedJobField}
            onOpenFieldModal={() => setIsFieldModalOpen(true)}
            onGoToPractice={handleGoToPracticeFromModule}
            onGoToSimulation={() => setActiveTab('simulation')}
          />
        )}

        {/* Tab 2: Latihan Soal */}
        {activeTab === 'bank' && (
          <BankSoalViewer
            dataPackage={dataPackage}
            selectedJobField={selectedJobField}
            onOpenFieldModal={() => setIsFieldModalOpen(true)}
            onOpenSimulation={() => setActiveTab('simulation')}
            isOwnerMode={isOwnerMode}
            onOpenAddQuestionModal={() => setIsAddQuestionModalOpen(true)}
            userAnswers={userProgressAnswers}
            onRecordAnswer={handleRecordAnswer}
            onResetAnswers={handleResetProgress}
            initialFilter={bankSubtestFilter}
          />
        )}

        {/* Tab 3: Simulasi CAT */}
        {activeTab === 'simulation' && (
          <CatSimulation
            dataPackage={dataPackage}
            selectedJobField={selectedJobField}
            onBackToBank={() => setActiveTab('bank')}
            onRecordAnswer={handleRecordAnswer}
          />
        )}

        {/* Tab 4: Progres Belajar Detil */}
        {activeTab === 'dashboard' && (
          <DashboardPanel
            dataPackage={dataPackage}
            selectedJobField={selectedJobField}
            onOpenFieldModal={() => setIsFieldModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            stats={userProgressStats}
            answers={userProgressAnswers}
            onResetProgress={handleResetProgress}
          />
        )}

        {/* Developer / Pembuat Tools: Dokumen Processor */}
        {activeTab === 'processor' && (
          <DocumentProcessor
            currentData={dataPackage}
            onUpdateData={handleUpdateData}
            onSwitchToBank={() => setActiveTab('bank')}
            onSwitchToCat={() => setActiveTab('simulation')}
          />
        )}

        {/* Developer / Pembuat Tools: JSON Studio */}
        {activeTab === 'json' && (
          <JsonStudio
            dataPackage={dataPackage}
            onUpdateData={handleUpdateData}
          />
        )}
      </main>

      {/* Clean Modern Bright Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-2.5">
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-600 font-medium">
            <span>Standar BKN & PermenPAN-RB</span>
            <span>•</span>
            <span>Bidang / Unit Tugas: <strong className="text-amber-700">{currentJob.shortName}</strong></span>
            <span>•</span>
            <button
              onClick={() => setIsFieldModalOpen(true)}
              className="text-amber-700 hover:text-amber-900 font-bold hover:underline cursor-pointer"
            >
              Ganti Bidang/Unit
            </button>
            <span>•</span>
            <span>Kurikulum: <strong>500 Umum + 200 Teknis (700 Soal • 4 Jam)</strong></span>
            <span>•</span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              {isOwnerMode ? '👑 Akses Pemilik Aktif' : '🔐 Masuk Pemilik / Pengembang'}
            </button>
            {isOwnerMode && (
              <>
                <span>•</span>
                <button
                  onClick={() => setActiveTab('json')}
                  className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  Cadangan JSON
                </button>
              </>
            )}
            <span>•</span>
            <button
              onClick={handleResetToDefault}
              className="text-slate-400 hover:text-rose-600 underline cursor-pointer"
            >
              Reset Data Standar
            </button>
          </div>
          <p className="text-slate-400 text-[11px]">
            Platform Uji Kompetensi CASN Modern, PWA & CAT Terarah • Terakhir Diperbarui {formattedDate}
          </p>
        </div>
      </footer>

      {/* Job Field Selection Modal */}
      <JobFieldModal
        isOpen={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        selectedField={selectedJobField}
        onSelectField={handleSelectField}
      />

      {/* Owner Auth Modal */}
      <OwnerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isOwnerMode={isOwnerMode}
        onToggleOwnerMode={handleToggleOwnerMode}
      />

      {/* Add Technical Question Modal */}
      <AddQuestionModal
        isOpen={isAddQuestionModalOpen}
        onClose={() => setIsAddQuestionModalOpen(false)}
        onAddQuestion={handleAddQuestion}
        onAddQuestions={handleAddQuestions}
        defaultField={selectedJobField === 'all' ? 'auditor' : selectedJobField}
        initialTab={addQuestionInitialTab}
      />

      {/* Google Apps Script / Webhook Configuration Modal */}
      <WebhookConfigModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
