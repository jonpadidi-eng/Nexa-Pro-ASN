import React, { useState, useRef, useEffect } from 'react';
import {
  PlusCircle,
  X,
  Briefcase,
  HelpCircle,
  Sparkles,
  Upload,
  FileText,
  FileCheck2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SoalTeknis, SoalUmum, SubtestType } from '../types/asn';
import { AVAILABLE_JOB_FIELDS } from '../data/jobFields';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { parseRawDocumentToPackage } from '../utils/parserEngine';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (newQuestion: SoalTeknis | SoalUmum) => void;
  onAddQuestions?: (newQuestions: (SoalTeknis | SoalUmum)[]) => void;
  defaultField?: string;
  initialTab?: 'manual' | 'pdf';
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  isOpen,
  onClose,
  onAddQuestion,
  onAddQuestions,
  defaultField = 'auditor',
  initialTab = 'manual',
}) => {
  // Mode: manual single question vs batch PDF upload (up to 50 questions)
  const [modalTab, setModalTab] = useState<'manual' | 'pdf'>(initialTab);

  // Sync tab when opening
  useEffect(() => {
    if (isOpen && initialTab) {
      setModalTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Manual form state
  const [questionCategory, setQuestionCategory] = useState<'teknis' | 'umum'>('teknis');
  const [field, setField] = useState<string>(defaultField);
  const [subtest, setSubtest] = useState<SubtestType>('KM-SK');
  const [topic, setTopic] = useState('');
  const [competencyIndicator, setCompetencyIndicator] = useState('');
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [optionE, setOptionE] = useState('');
  const [answerKey, setAnswerKey] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [explanation, setExplanation] = useState('');

  // PDF / Batch Upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractSuccessMsg, setExtractSuccessMsg] = useState<string | null>(null);
  const [extractedQuestions, setExtractedQuestions] = useState<(SoalTeknis | SoalUmum)[]>([]);
  const [batchTarget, setBatchTarget] = useState<'teknis' | 'umum'>('teknis');
  const [batchField, setBatchField] = useState<string>(defaultField);
  const [batchSubtest, setBatchSubtest] = useState<SubtestType>('KM-SK');
  const [showPasteFallback, setShowPasteFallback] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');
  const [expandedPreviewId, setExpandedPreviewId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle single manual submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !optionA.trim() || !optionB.trim()) return;

    if (questionCategory === 'teknis') {
      const matchedField = AVAILABLE_JOB_FIELDS.find((f) => f.id === field);
      const fieldLabel = matchedField ? matchedField.shortName : field;
      const batchCode = `MANUAL-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowIso = new Date().toISOString();

      const newQ: SoalTeknis = {
        id: `q-tek-${field}-${Date.now().toString().slice(-4)}`,
        field: field,
        field_label: fieldLabel,
        topic: topic.trim() || 'Standar Teknis Penugasan Jabatan',
        competency_indicator: competencyIndicator.trim() || 'Penerapan standar operasional prosedur dan kepatuhan regulasi',
        question: question.trim(),
        options: [
          { code: 'A', text: optionA.trim(), score: answerKey === 'A' ? 5 : 0 },
          { code: 'B', text: optionB.trim(), score: answerKey === 'B' ? 5 : 0 },
          { code: 'C', text: optionC.trim() || 'Opsi C', score: answerKey === 'C' ? 5 : 0 },
          { code: 'D', text: optionD.trim() || 'Opsi D', score: answerKey === 'D' ? 5 : 0 },
          { code: 'E', text: optionE.trim() || 'Opsi E', score: answerKey === 'E' ? 5 : 0 },
        ],
        answer_key: answerKey,
        explanation: explanation.trim() || 'Pembahasan analitis sesuai dengan regulasi dan kode etik kedinasan yang berlaku.',
        scoring_type: 'binary',
        batch_code: batchCode,
        is_new_upload: true,
        uploaded_at: nowIso,
      };
      onAddQuestion(newQ);
    } else {
      const subtestLabels: Record<SubtestType, string> = {
        'KM-SK': 'Kompetensi Manajerial & Sosio-Kultural',
        'POT': 'Uji Potensi & Logika',
        'LD': 'Literasi Digital & SPBE',
        'PK': 'Preferensi Karir RIASEC',
      };
      const batchCode = `MANUAL-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowIso = new Date().toISOString();

      const newQ: SoalUmum = {
        id: `q-um-${subtest.toLowerCase()}-${Date.now().toString().slice(-4)}`,
        subtest: subtest,
        subtest_label: subtestLabels[subtest],
        topic: topic.trim() || 'Materi Pokok Standar BKN',
        competency_indicator: competencyIndicator.trim() || 'Penguasaan kompetensi dasar CASN sesuai PermenPAN-RB',
        question: question.trim(),
        options: [
          { code: 'A', text: optionA.trim(), score: subtest === 'KM-SK' ? (answerKey === 'A' ? 5 : 3) : (answerKey === 'A' ? 5 : 0) },
          { code: 'B', text: optionB.trim(), score: subtest === 'KM-SK' ? (answerKey === 'B' ? 5 : 3) : (answerKey === 'B' ? 5 : 0) },
          { code: 'C', text: optionC.trim() || 'Opsi C', score: subtest === 'KM-SK' ? (answerKey === 'C' ? 5 : 2) : (answerKey === 'C' ? 5 : 0) },
          { code: 'D', text: optionD.trim() || 'Opsi D', score: subtest === 'KM-SK' ? (answerKey === 'D' ? 5 : 2) : (answerKey === 'D' ? 5 : 0) },
          { code: 'E', text: optionE.trim() || 'Opsi E', score: subtest === 'KM-SK' ? (answerKey === 'E' ? 5 : 1) : (answerKey === 'E' ? 5 : 0) },
        ],
        answer_key: answerKey,
        explanation: explanation.trim() || 'Pembahasan berdasarkan standar kompetensi dan regulasi kepegawaian negara.',
        scoring_type: subtest === 'KM-SK' ? 'weighted' : 'binary',
        batch_code: batchCode,
        is_new_upload: true,
        uploaded_at: nowIso,
      };
      onAddQuestion(newQ);
    }

    onClose();
  };

  // Process raw text extracted from PDF or template
  const processRawTextToQuestions = (rawText: string) => {
    const pkg = parseRawDocumentToPackage(rawText, {
      docType: batchTarget === 'teknis' ? 'soal_teknis' : 'soal_umum',
      defaultField: batchField,
      defaultSubtest: batchSubtest,
    });

    const list: (SoalTeknis | SoalUmum)[] = [
      ...pkg.general_questions,
      ...pkg.technical_questions,
    ];

    // Limit to 50 questions per upload if exceeded
    const clamped = list.slice(0, 50);

    if (clamped.length === 0) {
      throw new Error('Tidak ditemukan butir soal berformat valid (No. 1, Pilihan A-E, dan Kunci Jawaban) dalam berkas dokumen.');
    }

    const batchCode = `UPDATE-PDF-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const taggedQuestions = clamped.map((q, idx) => ({
      ...q,
      id: q.id ? `${q.id}-${batchCode.toLowerCase()}` : `q-batch-${batchCode.toLowerCase()}-${idx + 1}`,
      batch_code: batchCode,
      is_new_upload: true,
      uploaded_at: nowIso,
    }));

    setExtractedQuestions(taggedQuestions);
    setExtractSuccessMsg(`Berhasil mengekstrak ${taggedQuestions.length} butir soal dengan KODE BATCH: ${batchCode}. Siap dimasukkan ke sistem.`);
  };

  // Handle PDF file selection
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFile(file);
    setIsExtracting(true);
    setExtractError(null);
    setExtractSuccessMsg(null);
    setExtractedQuestions([]);

    try {
      let rawText = '';
      if (file.name.toLowerCase().endsWith('.pdf')) {
        rawText = await extractTextFromPdf(file);
      } else {
        // Fallback for txt / docx / markdown
        rawText = await file.text();
      }

      if (!rawText.trim()) {
        throw new Error('Berkas PDF tidak mengandung lapisan teks yang dapat dibaca. Pastikan bukan PDF hasil pemindaian/scan murni.');
      }

      processRawTextToQuestions(rawText);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setExtractError(`Gagal mengekstrak PDF: ${msg}`);
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle paste text extraction
  const handleExtractFromPastedText = () => {
    if (!pastedText.trim()) {
      setExtractError('Silakan tempel teks naskah soal terlebih dahulu.');
      return;
    }
    setIsExtracting(true);
    setExtractError(null);
    setExtractSuccessMsg(null);
    try {
      processRawTextToQuestions(pastedText);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setExtractError(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  // Helper to load 50 realistic sample questions for testing PDF batch upload flow
  const handleLoadSample50Questions = () => {
    setIsExtracting(true);
    setExtractError(null);
    setExtractSuccessMsg(null);
    try {
      const matchedField = AVAILABLE_JOB_FIELDS.find((f) => f.id === batchField) || AVAILABLE_JOB_FIELDS[1];
      const sampleLines: string[] = [];
      const keys: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];

      for (let i = 1; i <= 50; i++) {
        const key = keys[(i - 1) % 5];
        if (batchTarget === 'teknis') {
          sampleLines.push(`
Soal ${i}: Terkait prosedur operasional teknis standar pada unit ${matchedField.shortName} butir nomor ${i}, apa tindakan kedinasan paling tepat yang wajib dijalankan oleh aparatur?
A. Melakukan verifikasi faktual dan mencatat seluruh berkas dalam dokumen berita acara serah terima secara transparan.
B. Menyelesaikan instruksi secara terburu-buru tanpa sinkronisasi lintas bidang demi mengejar efisiensi waktu penugasan.
C. Menyerahkan seluruh tanggung jawab telaah kepada pihak ketiga tanpa melakukan uji kepatuhan internal.
D. Menunda pelaksanaan prosedur operasional hingga triwulan anggaran berikutnya tanpa pemberitahuan resmi.
E. Mengabaikan pedoman standar teknis demi kemudahan koordinasi informal non-kedinasan.
Kunci: ${key}
Pembahasan: Pilihan ${key} mencerminkan implementasi prinsip akuntabilitas kinerja, kepatuhan kode etik, dan regulasi teknis kedinasan BKN.`);
        } else {
          sampleLines.push(`
Soal ${i}: Dalam rangka penguatan kompetensi ASN subtes ${batchSubtest} butir nomor ${i}, bagaimana sikap kerja terbaik yang mencerminkan nilai BerAKHLAK?
A. Mengedepankan integritas, berorientasi pelayanan publik, dan menjaga koordinasi harmonis dengan seluruh pemangku kepentingan.
B. Menghindari penugasan baru yang memiliki tingkat kompleksitas tinggi agar terhindar dari risiko audit kedinasan.
C. Mendelegasikan seluruh kewenangan strategis kepada staf honorer tanpa melakukan supervisi berkala.
D. Mengutamakan kepentingan golongan tertentu dalam penyusunan kebijakan tata kelola birokrasi pemerintahan.
E. Menolak adaptasi teknologi digital dan tetap mempertahankan proses manual konvensional yang tidak efisien.
Kunci: ${key}
Pembahasan: Opsi ${key} merupakan jawaban dengan bobot tertinggi karena selaras dengan core values ASN BerAKHLAK dan standar uji kompetensi BKN.`);
        }
      }

      processRawTextToQuestions(sampleLines.join('\n\n'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setExtractError(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  // Confirm inserting batch extracted questions into system
  const handleConfirmBatchInsert = () => {
    if (extractedQuestions.length === 0) return;

    if (onAddQuestions) {
      onAddQuestions(extractedQuestions);
    } else {
      extractedQuestions.forEach((q) => onAddQuestion(q));
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-sm shrink-0">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight flex items-center gap-2">
                <span>Manajemen Tambah Soal (Akses Pemilik)</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-950 text-[11px] font-black px-2.5 py-0.5 border border-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Mode Developer
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tambahkan butir soal secara manual atau <strong>Upload File PDF (50 Soal Sekaligus)</strong> yang akan diekstrak otomatis oleh aplikasi dan masuk ke sistem soal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Manual Input vs Upload PDF (50 Soal) */}
        <div className="px-5 sm:px-6 pt-4 pb-1 flex items-center gap-2 border-b border-slate-100 bg-white shrink-0">
          <button
            onClick={() => setModalTab('manual')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black border transition cursor-pointer flex items-center gap-2 ${
              modalTab === 'manual'
                ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Input Manual (1 Butir)</span>
          </button>

          <button
            onClick={() => setModalTab('pdf')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black border transition cursor-pointer flex items-center gap-2 ${
              modalTab === 'pdf'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File PDF (50 Soal / Batch)</span>
            <span className="rounded-md bg-slate-950/10 px-1.5 py-0.5 text-[10px] font-black">
              Ekstrak Otomatis
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {modalTab === 'manual' ? (
            /* MANUAL SINGLE QUESTION FORM */
            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              {/* Question Type Toggle */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 text-xs">Pilih Kategori Butir Soal:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuestionCategory('teknis')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      questionCategory === 'teknis'
                        ? 'bg-amber-50 border-amber-500 text-amber-950'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Soal Teknis Bidang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionCategory('umum')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      questionCategory === 'umum'
                        ? 'bg-amber-50 border-amber-500 text-amber-950'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Soal Umum BKN</span>
                  </button>
                </div>
              </div>

              {/* Specific Field or Subtest Selection */}
              {questionCategory === 'teknis' ? (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 text-xs">Bidang / Unit Kerja ASN:</label>
                  <select
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {AVAILABLE_JOB_FIELDS.filter((f) => f.id !== 'all').map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.badge})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 text-xs">Subtes Umum BKN:</label>
                  <select
                    value={subtest}
                    onChange={(e) => setSubtest(e.target.value as SubtestType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="KM-SK">KM-SK: Manajerial & Sosio-Kultural (1-5 Berbobot)</option>
                    <option value="POT">POT: Uji Potensi & Logika (5 atau 0)</option>
                    <option value="LD">LD: Literasi Digital & SPBE (5 atau 0)</option>
                    <option value="PK">PK: Preferensi Karir RIASEC (Minat Jabatan)</option>
                  </select>
                </div>
              )}

              {/* Topic & Competency Indicator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Materi Pokok / Topik:</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Contoh: Audit Forensik & Kode Etik APIP"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Indikator Kompetensi:</label>
                  <input
                    type="text"
                    value={competencyIndicator}
                    onChange={(e) => setCompetencyIndicator(e.target.value)}
                    placeholder="Contoh: Kepatuhan Standar Audit Internal"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Naskah Butir Soal:</span>
                  <span className="text-[11px] text-slate-400 font-normal">Wajib diisi</span>
                </label>
                <textarea
                  rows={4}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Tuliskan narasi pertanyaan atau kasus kontekstual kedinasan di sini..."
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Options A - E */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Pilihan Jawaban (A - E):</label>
                {(['A', 'B', 'C', 'D', 'E'] as const).map((opt) => {
                  const val =
                    opt === 'A'
                      ? optionA
                      : opt === 'B'
                      ? optionB
                      : opt === 'C'
                      ? optionC
                      : opt === 'D'
                      ? optionD
                      : optionE;
                  const setVal =
                    opt === 'A'
                      ? setOptionA
                      : opt === 'B'
                      ? setOptionB
                      : opt === 'C'
                      ? setOptionC
                      : opt === 'D'
                      ? setOptionD
                      : setOptionE;

                  return (
                    <div key={opt} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700 shrink-0">
                        {opt}
                      </span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        placeholder={`Teks pilihan jawaban ${opt}...`}
                        required={opt === 'A' || opt === 'B'}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Answer Key & Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kunci Jawaban Resmi:</label>
                  <select
                    value={answerKey}
                    onChange={(e) => setAnswerKey(e.target.value as 'A' | 'B' | 'C' | 'D' | 'E')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-amber-950 focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="A">Opsi A (Paling Tepat / Bobot 5)</option>
                    <option value="B">Opsi B (Paling Tepat / Bobot 5)</option>
                    <option value="C">Opsi C (Paling Tepat / Bobot 5)</option>
                    <option value="D">Opsi D (Paling Tepat / Bobot 5)</option>
                    <option value="E">Opsi E (Paling Tepat / Bobot 5)</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Dasar Hukum & Landasan Pembahasan:</label>
                  <input
                    type="text"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Contoh: Sesuai UU ASN No 20/2023 Pasal 12 dan PermenPAN-RB..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Simpan & Masukkan 1 Butir Soal ke Bank Soal
                </button>
              </div>
            </form>
          ) : (
            /* UPLOAD FILE PDF (50 SOAL SEKALIGUS) */
            <div className="space-y-5">
              {/* Batch Configuration */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="font-black text-slate-950 text-xs flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>1. Tentukan Kategori Target untuk 50 Soal yang Diunggah:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Jenis Soal:</label>
                    <select
                      value={batchTarget}
                      onChange={(e) => setBatchTarget(e.target.value as 'teknis' | 'umum')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    >
                      <option value="teknis">Soal Teknis Bidang / Unit Tugas</option>
                      <option value="umum">Soal Umum BKN (KM-SK, POT, LD, PK)</option>
                    </select>
                  </div>

                  {batchTarget === 'teknis' ? (
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Bidang / Unit Penempatan:</label>
                      <select
                        value={batchField}
                        onChange={(e) => setBatchField(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                      >
                        {AVAILABLE_JOB_FIELDS.filter((f) => f.id !== 'all').map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.badge})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Subtes Umum BKN:</label>
                      <select
                        value={batchSubtest}
                        onChange={(e) => setBatchSubtest(e.target.value as SubtestType)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                      >
                        <option value="KM-SK">KM-SK: Manajerial & Sosio-Kultural</option>
                        <option value="POT">POT: Uji Potensi & Logika</option>
                        <option value="LD">LD: Literasi Digital & SPBE</option>
                        <option value="PK">PK: Preferensi Karir RIASEC</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* PDF Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-3xl p-6 sm:p-8 text-center bg-amber-50/40 hover:bg-amber-50/70 transition cursor-pointer space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePdfUpload}
                  accept=".pdf,.txt,.docx,.json"
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-md shadow-amber-500/20">
                  {isExtracting ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <Upload className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900">
                    {pdfFile ? pdfFile.name : 'Pilih Berkas PDF Soal (50 Soal Sekali Unggah)'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                    Klik atau seret file PDF naskah soal Anda ke sini. Aplikasi akan membaca dan mengekstrak otomatis hingga <strong>50 butir soal</strong> (pertanyaan, opsi A-E, kunci, dan pembahasan) untuk langsung masuk ke sistem soal.
                  </p>
                </div>

                {isExtracting && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengekstrak teks & struktur 50 soal dari dokumen PDF...</span>
                  </div>
                )}
              </div>

              {/* Quick Template Testing Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 block">
                    ⚡ Belum memiliki berkas PDF siap pakai?
                  </span>
                  <span className="text-slate-500">
                    Uji coba ekstraksi langsung dengan 50 butir soal terstruktur otomatis:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSample50Questions}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold transition cursor-pointer shrink-0 shadow-xs"
                  >
                    ⚡ Muat Contoh 50 Soal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasteFallback(!showPasteFallback)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold transition cursor-pointer border border-slate-300"
                  >
                    {showPasteFallback ? 'Tutup Input Teks' : '📋 Tempel Teks'}
                  </button>
                </div>
              </div>

              {/* Paste Text Fallback Area */}
              {showPasteFallback && (
                <div className="p-4 rounded-2xl bg-white border border-slate-300 space-y-3">
                  <label className="text-xs font-bold text-slate-800 block">
                    Tempelkan Teks Naskah PDF (Format: Soal 1, Opsi A-E, Kunci, Pembahasan):
                  </label>
                  <textarea
                    rows={6}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={`Soal 1: ...\nA. ...\nB. ...\nC. ...\nD. ...\nE. ...\nKunci: A\nPembahasan: ...`}
                    className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={handleExtractFromPastedText}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
                  >
                    Ekstrak 50 Soal dari Teks Ini
                  </button>
                </div>
              )}

              {/* Success Notification */}
              {extractSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  <span className="font-semibold">{extractSuccessMsg}</span>
                </div>
              )}

              {/* Error Notification */}
              {extractError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{extractError}</span>
                </div>
              )}

              {/* Extracted Questions Preview */}
              {extractedQuestions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-black text-slate-950">
                        Hasil Ekstraksi: {extractedQuestions.length} Butir Soal Siap Masuk
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                      Format Terverifikasi
                    </span>
                  </div>

                  {/* List Preview (Scrollable) */}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {extractedQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 transition"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
                              {idx + 1}
                            </span>
                            <span>Butir #{idx + 1}</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {q.batch_code && (
                              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded border border-emerald-300">
                                KODE: {q.batch_code}
                              </span>
                            )}
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-bold">
                              Kunci: {q.answer_key}
                            </span>
                            <button
                              type="button"
                              onClick={() => setExpandedPreviewId(expandedPreviewId === idx ? null : idx)}
                              className="text-slate-500 hover:text-slate-800 p-0.5"
                            >
                              {expandedPreviewId === idx ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <p className="text-slate-800 line-clamp-2 font-medium">{q.question}</p>

                        {expandedPreviewId === idx && (
                          <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-600">
                            <div className="font-semibold text-slate-700">Pilihan Jawaban:</div>
                            {q.options.map((opt) => (
                              <div key={opt.code} className="flex gap-2">
                                <span className={`font-mono font-bold ${opt.code === q.answer_key ? 'text-emerald-700' : 'text-slate-500'}`}>
                                  {opt.code}.
                                </span>
                                <span className={opt.code === q.answer_key ? 'text-emerald-800 font-bold' : ''}>
                                  {opt.text}
                                </span>
                              </div>
                            ))}
                            {q.explanation && (
                              <div className="text-[11px] pt-1 text-slate-500 italic">
                                <strong>Pembahasan:</strong> {q.explanation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submit Batch Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmBatchInsert}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Masukkan {extractedQuestions.length} Soal ke Sistem Bank Soal Sekarang</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
