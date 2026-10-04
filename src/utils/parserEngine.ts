import {
  ModulAjar,
  SoalUmum,
  SoalTeknis,
  ProAsnDataPackage,
  QuestionOption,
  SubtestType,
} from '../types/asn';

export interface ParseOptions {
  docType?: 'auto' | 'modul' | 'soal_umum' | 'soal_teknis';
  defaultSubtest?: SubtestType;
  defaultField?: string;
}

export function parseRawDocumentToPackage(
  rawText: string,
  options: ParseOptions = {}
): ProAsnDataPackage {
  const version = '1.0.0';
  const last_updated = new Date().toISOString();

  const lines = rawText.split('\n');

  // Check if raw text is already valid JSON
  try {
    const trimmed = rawText.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      if (parsed.modules || parsed.general_questions || parsed.technical_questions) {
        return {
          version: parsed.version || version,
          last_updated: parsed.last_updated || last_updated,
          meta: parsed.meta || {
            title: 'Bank Soal & Modul Pro ASN',
            total_modules: (parsed.modules || []).length,
            total_general_questions: (parsed.general_questions || []).length,
            total_technical_questions: (parsed.technical_questions || []).length,
          },
          modules: Array.isArray(parsed.modules) ? parsed.modules : [],
          general_questions: Array.isArray(parsed.general_questions) ? parsed.general_questions : [],
          technical_questions: Array.isArray(parsed.technical_questions) ? parsed.technical_questions : [],
        };
      }
    }
  } catch {
    // Continue with text parsing
  }

  const modules: ModulAjar[] = [];
  const generalQuestions: SoalUmum[] = [];
  const technicalQuestions: SoalTeknis[] = [];

  const lowerRaw = rawText.toLowerCase();

  // Determine intent
  const isModulSection =
    lowerRaw.includes('materi pokok') ||
    lowerRaw.includes('poin strategi') ||
    lowerRaw.includes('indikator utama') ||
    lowerRaw.includes('modul ajar');

  if (isModulSection) {
    const parsedModules = parseModulesFromText(rawText);
    modules.push(...parsedModules);
  }

  // Parse questions
  const parsedQuestions = parseQuestionsFromText(rawText, options);

  parsedQuestions.forEach((q) => {
    if (q.isTechnical) {
      technicalQuestions.push({
        id: q.id,
        field: q.field || options.defaultField || 'administrasi',
        field_label: q.fieldLabel || 'Administrasi & Tata Kelola',
        topic: q.topic || 'Kompetensi Bidang',
        competency_indicator: q.competencyIndicator || 'Penguasaan Tugas Teknis Jabatan',
        question: q.question,
        options: q.options,
        answer_key: q.answerKey,
        explanation: q.explanation,
        scoring_type: 'binary',
      });
    } else {
      generalQuestions.push({
        id: q.id,
        subtest: q.subtest || options.defaultSubtest || 'KM-SK',
        subtest_label: getSubtestLabel(q.subtest || options.defaultSubtest || 'KM-SK'),
        topic: q.topic || 'Kompetensi Umum',
        competency_indicator: q.competencyIndicator || 'Penerapan Standar Kompetensi ASN',
        question: q.question,
        options: q.options,
        answer_key: q.answerKey,
        explanation: q.explanation,
        scoring_type: q.subtest === 'KM-SK' ? 'weighted' : 'binary',
      });
    }
  });

  return {
    version,
    last_updated,
    meta: {
      title: 'Hasil Konversi Dokumen Pro ASN',
      publisher: 'Engine Pengolah Data Pro ASN',
      total_modules: modules.length,
      total_general_questions: generalQuestions.length,
      total_technical_questions: technicalQuestions.length,
    },
    modules,
    general_questions: generalQuestions,
    technical_questions: technicalQuestions,
  };
}

interface RawParsedQuestion {
  id: string;
  isTechnical: boolean;
  field?: string;
  fieldLabel?: string;
  subtest?: SubtestType;
  topic?: string;
  competencyIndicator?: string;
  question: string;
  options: QuestionOption[];
  answerKey: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
}

function parseQuestionsFromText(text: string, options: ParseOptions): RawParsedQuestion[] {
  const result: RawParsedQuestion[] = [];
  const lines = text.split('\n');

  // Split text by numbered questions
  // Matches "1.", "1)", "Soal 1:", "No. 1", "[1]"
  const questionHeaderRegex = /^(?:soal\s+|no\.?\s*)?(\d{1,3})[\.\)\:\-]\s*(.*)$/i;

  const questionBlocks: { num: number; headerText: string; lines: string[] }[] = [];
  let currentBlock: { num: number; headerText: string; lines: string[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(questionHeaderRegex);

    // Filter false positives like "1. Materi Pokok" in module header
    const isModuleHeader = line.toLowerCase().includes('materi pokok') || line.toLowerCase().includes('poin strategi');

    if (match && !isModuleHeader) {
      if (currentBlock) {
        questionBlocks.push(currentBlock);
      }
      currentBlock = {
        num: parseInt(match[1], 10),
        headerText: match[2],
        lines: [match[2]],
      };
    } else if (currentBlock) {
      currentBlock.lines.push(line);
    }
  }

  if (currentBlock) {
    questionBlocks.push(currentBlock);
  }

  // If no numbered blocks were found, check if it's a single question
  if (questionBlocks.length === 0 && (text.includes('A.') || text.includes('a.') || text.includes('Kunci:'))) {
    questionBlocks.push({
      num: 1,
      headerText: '',
      lines: lines,
    });
  }

  questionBlocks.forEach((block, idx) => {
    const rawContent = block.lines.join('\n');
    const parsed = parseSingleQuestionBlock(rawContent, idx + 1, options);
    if (parsed) {
      result.push(parsed);
    }
  });

  return result;
}

function parseSingleQuestionBlock(
  blockText: string,
  index: number,
  options: ParseOptions
): RawParsedQuestion | null {
  const lines = blockText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  let questionText = '';
  const optionsMap: Record<string, { text: string; score: number }> = {};
  let answerKey: 'A' | 'B' | 'C' | 'D' | 'E' = 'A';
  let explanation = '';
  let subtest: SubtestType | undefined = options.defaultSubtest;
  let isTechnical = options.docType === 'soal_teknis';
  let field = options.defaultField || '';

  let currentSection: 'question' | 'option' | 'key' | 'explanation' = 'question';
  let currentOptCode: 'A' | 'B' | 'C' | 'D' | 'E' | null = null;

  // Regexes
  const optionRegex = /^([A-Ea-e])[\.\)\:\-]\s*(.*)$/;
  const keyRegex = /^(?:kunci(?:\s+jawaban)?|jawaban(?:\s+benar)?|ans|key)\s*[\:\=]\s*([A-Ea-e])/i;
  const explanationRegex = /^(?:pembahasan|penjelasan|solusi|analisis|alasan)\s*[\:\=]\s*(.*)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check key
    const keyMatch = line.match(keyRegex);
    if (keyMatch) {
      answerKey = keyMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';
      currentSection = 'key';
      continue;
    }

    // Check explanation
    const expMatch = line.match(explanationRegex);
    if (expMatch) {
      explanation = expMatch[1] || '';
      currentSection = 'explanation';
      continue;
    }

    // Check option
    const optMatch = line.match(optionRegex);
    if (optMatch && ['A', 'B', 'C', 'D', 'E'].includes(optMatch[1].toUpperCase())) {
      currentOptCode = optMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';
      currentSection = 'option';

      let optContent = optMatch[2] || '';
      let score = 0;

      // Extract explicit score if present e.g. "teks opsi (Skor 5)"
      const scoreMatch = optContent.match(/[\(\[\{]\s*(?:skor|bobot|nilai)?\s*(\d+)\s*[\)\]\}]$/i);
      if (scoreMatch) {
        score = parseInt(scoreMatch[1], 10);
        optContent = optContent.replace(scoreMatch[0], '').trim();
      }

      optionsMap[currentOptCode] = {
        text: optContent,
        score,
      };
      continue;
    }

    // Continue current section
    if (currentSection === 'question') {
      questionText += (questionText ? ' ' : '') + line;
    } else if (currentSection === 'option' && currentOptCode) {
      optionsMap[currentOptCode].text += ' ' + line;
    } else if (currentSection === 'explanation') {
      explanation += (explanation ? ' ' : '') + line;
    }
  }

  // Format options
  const formattedOptions: QuestionOption[] = (['A', 'B', 'C', 'D', 'E'] as const)
    .filter((code) => optionsMap[code])
    .map((code) => {
      let score = optionsMap[code].score;
      if (score === 0) {
        // If no explicit score was tagged:
        if (code === answerKey) score = 5;
      }
      return {
        code,
        text: optionsMap[code].text.trim(),
        score,
      };
    });

  if (!questionText && formattedOptions.length === 0) {
    return null;
  }

  // Auto classify subtest or technical
  const fullText = (questionText + ' ' + explanation).toLowerCase();

  // Check technical field indicators
  if (
    fullText.includes('pasien') ||
    fullText.includes('rumah sakit') ||
    fullText.includes('obat') ||
    fullText.includes('medis') ||
    fullText.includes('perawat') ||
    fullText.includes('dokter') ||
    fullText.includes('triage') ||
    fullText.includes('kesehatan')
  ) {
    isTechnical = true;
    field = 'kesehatan';
  } else if (
    fullText.includes('siswa') ||
    fullText.includes('guru') ||
    fullText.includes('kurikulum') ||
    fullText.includes('pembelajaran') ||
    fullText.includes('pedagogik') ||
    fullText.includes('sekolah') ||
    fullText.includes('didik') ||
    fullText.includes('asesmen')
  ) {
    isTechnical = true;
    field = 'pendidikan';
  } else if (
    fullText.includes('database') ||
    fullText.includes('jaringan') ||
    fullText.includes('coding') ||
    fullText.includes('server') ||
    fullText.includes('spbe') ||
    fullText.includes('api') ||
    fullText.includes('algoritma')
  ) {
    isTechnical = true;
    field = 'teknologi_informasi';
  } else if (
    fullText.includes('naskah dinas') ||
    fullText.includes('arsip') ||
    fullText.includes('sop pelayanan') ||
    fullText.includes('surat keputusan')
  ) {
    isTechnical = true;
    field = 'administrasi';
  }

  // Check subtest if not technical
  if (!isTechnical) {
    if (
      fullText.includes('keamanan siber') ||
      fullText.includes('phishing') ||
      fullText.includes('password') ||
      fullText.includes('digital') ||
      fullText.includes('email') ||
      fullText.includes('netiket')
    ) {
      subtest = 'LD';
    } else if (
      fullText.includes('deret') ||
      fullText.includes('silogisme') ||
      fullText.includes('analogi') ||
      fullText.includes('semua') ||
      fullText.includes('beberapa') ||
      fullText.includes('pola') ||
      fullText.includes('angka')
    ) {
      subtest = 'POT';
    } else if (
      fullText.includes('riasec') ||
      fullText.includes('holland') ||
      fullText.includes('preferensi karir') ||
      fullText.includes('minat')
    ) {
      subtest = 'PK';
    } else {
      subtest = 'KM-SK'; // Default for situational judgment
    }
  }

  // If KM-SK, assign 1-5 progressive scores if all were 0
  if (subtest === 'KM-SK' && formattedOptions.length >= 4) {
    const hasScores = formattedOptions.some((o) => o.score > 0);
    if (!hasScores) {
      formattedOptions.forEach((opt) => {
        if (opt.code === answerKey) opt.score = 5;
        else opt.score = Math.max(1, Math.min(4, 5 - Math.abs(opt.code.charCodeAt(0) - answerKey.charCodeAt(0))));
      });
    }
  }

  return {
    id: `q-${isTechnical ? 'tek' : subtest ? subtest.toLowerCase() : 'gen'}-${String(index).padStart(3, '0')}`,
    isTechnical,
    field: field || 'administrasi',
    fieldLabel: getFieldLabel(field || 'administrasi'),
    subtest: subtest || 'KM-SK',
    topic: detectTopic(questionText, subtest || 'KM-SK', field),
    competencyIndicator: detectIndicator(questionText, subtest || 'KM-SK', field),
    question: questionText || 'Butir pertanyaan belum terisi lengkap.',
    options: formattedOptions.length > 0 ? formattedOptions : [
      { code: 'A', text: 'Pilihan A', score: 5 },
      { code: 'B', text: 'Pilihan B', score: 3 },
      { code: 'C', text: 'Pilihan C', score: 1 },
      { code: 'D', text: 'Pilihan D', score: 2 },
    ],
    answerKey,
    explanation: explanation || 'Belum ada pembahasan mendalam untuk butir soal ini.',
  };
}

function parseModulesFromText(text: string): ModulAjar[] {
  const modules: ModulAjar[] = [];
  const lines = text.split('\n');

  let title = 'Panduan & Modul Strategi Pro ASN';
  const core_topics: string[] = [];
  const strategy_points: string[] = [];
  const key_indicators: string[] = [];
  const answer_patterns: { pattern_name: string; description: string }[] = [];

  let currentCategory: ModulAjar['category'] = 'KM-SK';
  let mode: 'none' | 'topics' | 'strategies' | 'indicators' | 'patterns' = 'none';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect title
    if (line.startsWith('#') || line.toLowerCase().startsWith('modul:') || line.toLowerCase().startsWith('judul:')) {
      title = line.replace(/^[#\:\s]+/, '').replace(/^modul\s*\:?/i, '').replace(/^judul\s*\:?/i, '').trim();
      continue;
    }

    // Detect Section
    const l = line.toLowerCase();
    if (l.includes('materi pokok') || l.includes('topik utama')) {
      mode = 'topics';
      continue;
    }
    if (l.includes('poin strategi') || l.includes('strategi menjawab') || l.includes('trik menjawab')) {
      mode = 'strategies';
      continue;
    }
    if (l.includes('indikator utama') || l.includes('indikator kompetensi')) {
      mode = 'indicators';
      continue;
    }
    if (l.includes('pola jawaban') || l.includes('kriteria skor')) {
      mode = 'patterns';
      continue;
    }

    // Parse list items
    const cleanItem = line.replace(/^[\*\-\•\d+\.]\s*/, '').trim();
    if (cleanItem) {
      if (mode === 'topics') {
        core_topics.push(cleanItem);
      } else if (mode === 'strategies') {
        strategy_points.push(cleanItem);
      } else if (mode === 'indicators') {
        key_indicators.push(cleanItem);
      } else if (mode === 'patterns') {
        const parts = cleanItem.split(/[\:\-]/);
        if (parts.length > 1) {
          answer_patterns.push({
            pattern_name: parts[0].trim(),
            description: parts.slice(1).join(':').trim(),
          });
        } else {
          answer_patterns.push({
            pattern_name: `Pola ${answer_patterns.length + 1}`,
            description: cleanItem,
          });
        }
      }
    }
  }

  // Fallbacks if empty
  if (core_topics.length === 0) {
    core_topics.push('Nilai Inti ASN BerAKHLAK', 'Standar Kompetensi Jabatan ASN');
  }
  if (strategy_points.length === 0) {
    strategy_points.push(
      'Utamakan kepatuhan terhadap regulasi dan etika pelayanan publik tanpa kompromi.',
      'Identifikasi kata kunci dalam studi kasus situasi kerja sebelum menentukan opsi tindakan.'
    );
  }
  if (key_indicators.length === 0) {
    key_indicators.push(
      'Integritas & Akuntabilitas Moral',
      'Pelayanan Prima dan Efisiensi Tata Kelola'
    );
  }
  if (answer_patterns.length === 0) {
    answer_patterns.push(
      {
        pattern_name: 'Pola Skor 5 (Maksimal)',
        description: 'Tindakan proaktif, mengambil inisiatif mandiri, dan mengutamakan integritas institusi.',
      },
      {
        pattern_name: 'Pola Skor 1-2 (Dihindari)',
        description: 'Sikap pasif, melempar tanggung jawab, atau berkompromi dengan pelanggaran SOP.',
      }
    );
  }

  // Category detection
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('digital') || lowerTitle.includes('siber')) currentCategory = 'LD';
  else if (lowerTitle.includes('potensi') || lowerTitle.includes('logika')) currentCategory = 'POT';
  else if (lowerTitle.includes('karir') || lowerTitle.includes('riasec')) currentCategory = 'PK';
  else if (lowerTitle.includes('teknis')) currentCategory = 'TEKNIS';

  modules.push({
    id: `modul-${currentCategory.toLowerCase()}-01`,
    category: currentCategory,
    title,
    core_topics,
    strategy_points,
    key_indicators,
    answer_patterns,
    content_markdown: text,
  });

  return modules;
}

function getSubtestLabel(subtest: SubtestType): string {
  switch (subtest) {
    case 'KM-SK':
      return 'Kompetensi Manajerial & Sosio-Kultural';
    case 'POT':
      return 'Uji Potensi (Penalaran, Numerik, Logika)';
    case 'LD':
      return 'Literasi Digital ASN';
    case 'PK':
      return 'Preferensi Karir (RIASEC)';
    default:
      return 'Kompetensi ASN';
  }
}

function getFieldLabel(field: string): string {
  const norm = field.toLowerCase();
  switch (norm) {
    case 'kesehatan':
      return 'Kesehatan & Medis';
    case 'pendidikan':
      return 'Pendidikan & Pengajaran';
    case 'administrasi':
      return 'Administrasi & Tata Kelola';
    case 'teknologi_informasi':
    case 'ti':
      return 'Teknologi Informasi & SPBE';
    case 'hukum':
      return 'Hukum & Perundang-undangan';
    case 'keuangan':
      return 'Keuangan & Perbendaharaan';
    default:
      return field.charAt(0).toUpperCase() + field.slice(1);
  }
}

function detectTopic(question: string, subtest: SubtestType, field?: string): string {
  const q = question.toLowerCase();
  if (field === 'kesehatan') {
    if (q.includes('infeksi') || q.includes('steril')) return 'Pencegahan dan Pengendalian Infeksi';
    if (q.includes('pasien') || q.includes('skp')) return 'Sasaran Keselamatan Pasien';
    return 'Pelayanan Kesehatan';
  }
  if (field === 'pendidikan') {
    if (q.includes('evaluasi') || q.includes('asesmen')) return 'Asesmen & Evaluasi Hasil Belajar';
    if (q.includes('diferensiasi')) return 'Pembelajaran Berdiferensiasi';
    return 'Pedagogik & Desain Pembelajaran';
  }
  if (subtest === 'KM-SK') {
    if (q.includes('uang') || q.includes('hadiah') || q.includes('gratifikasi') || q.includes('jujur')) return 'Integritas';
    if (q.includes('tim') || q.includes('rekan') || q.includes('konflik kelompok')) return 'Kerja Sama';
    if (q.includes('warga') || q.includes('masyarakat') || q.includes('pelayanan')) return 'Pelayanan Publik';
    if (q.includes('perubahan') || q.includes('teknologi baru')) return 'Mengelola Perubahan';
    return 'Kompetensi Manajerial';
  }
  if (subtest === 'POT') {
    if (q.includes('semua') || q.includes('premis') || q.includes('kesimpulan')) return 'Silogisme & Penalaran Logis';
    if (q.includes('deret') || q.includes('angka') || q.includes('pola')) return 'Deret Angka & Numerik';
    return 'Penalaran Analitis';
  }
  if (subtest === 'LD') {
    if (q.includes('sandi') || q.includes('otp') || q.includes('phishing')) return 'Keamanan Digital (Digital Safety)';
    if (q.includes('hoaks') || q.includes('etika') || q.includes('medsos')) return 'Etika Digital (Digital Ethics)';
    return 'Kecakapan Digital ASN';
  }
  if (subtest === 'PK') {
    return 'Minat Karir RIASEC';
  }
  return 'Kompetensi Terapan';
}

function detectIndicator(question: string, subtest: SubtestType, field?: string): string {
  if (subtest === 'KM-SK') {
    return 'Mengambil keputusan beretika, konsisten terhadap SOP, dan menolak gratifikasi';
  }
  if (subtest === 'POT') {
    return 'Menganalisis hubungan antar premis dan menarik simpulan yang sahih';
  }
  if (subtest === 'LD') {
    return 'Menerapkan protokol perlindungan data sensitif institusi dan netiket dinas';
  }
  if (subtest === 'PK') {
    return 'Menilai keselarasan orientasi kerja dengan karakteristik jabatan ASN';
  }
  return 'Menerapkan pengetahuan teknis operasional dalam tugas kedinasan';
}
