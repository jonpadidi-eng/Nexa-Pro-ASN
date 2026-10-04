import { ProAsnDataPackage, ValidationReport, ValidationIssue } from '../types/asn';

export function validateProAsnJson(jsonInput: string | object): ValidationReport {
  const issues: ValidationIssue[] = [];
  let parsed: unknown;

  // Step 1: Parse JSON syntax
  if (typeof jsonInput === 'string') {
    try {
      parsed = JSON.parse(jsonInput);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        isValid: false,
        hasVersion: false,
        hasLastUpdated: false,
        version: '',
        lastUpdated: '',
        issues: [
          {
            type: 'error',
            location: 'Sintaks JSON',
            message: `Format JSON tidak valid: ${errMsg}`,
          },
        ],
        stats: {
          totalModules: 0,
          totalGeneralQuestions: 0,
          subtestBreakdown: {},
          totalTechnicalQuestions: 0,
          fieldBreakdown: {},
        },
      };
    }
  } else {
    parsed = jsonInput;
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      isValid: false,
      hasVersion: false,
      hasLastUpdated: false,
      version: '',
      lastUpdated: '',
      issues: [
        {
          type: 'error',
          location: 'Root JSON',
          message: 'Root JSON harus berupa Objek {} (bukan array atau nilai primitif).',
        },
      ],
      stats: {
        totalModules: 0,
        totalGeneralQuestions: 0,
        subtestBreakdown: {},
        totalTechnicalQuestions: 0,
        fieldBreakdown: {},
      },
    };
  }

  const pkg = parsed as Partial<ProAsnDataPackage>;

  // Step 2: Check required root attributes "version" and "last_updated"
  const hasVersion = Boolean(pkg.version && typeof pkg.version === 'string' && pkg.version.trim().length > 0);
  if (!hasVersion) {
    issues.push({
      type: 'error',
      location: 'root.version',
      message: 'Atribut "version" wajib ada untuk pelacakan versi dokumen (misal: "1.0.0").',
    });
  }

  const hasLastUpdated = Boolean(pkg.last_updated && typeof pkg.last_updated === 'string' && pkg.last_updated.trim().length > 0);
  if (!hasLastUpdated) {
    issues.push({
      type: 'error',
      location: 'root.last_updated',
      message: 'Atribut "last_updated" wajib ada dalam format ISO timestamp (misal: "2026-10-04T00:00:00.000Z").',
    });
  } else {
    const d = new Date(pkg.last_updated as string);
    if (isNaN(d.getTime())) {
      issues.push({
        type: 'warning',
        location: 'root.last_updated',
        message: 'Nilai "last_updated" bukan format tanggal ISO yang valid.',
      });
    }
  }

  // Step 3: Validate Modul Ajar
  const totalModules = Array.isArray(pkg.modules) ? pkg.modules.length : 0;
  if (!Array.isArray(pkg.modules)) {
    issues.push({
      type: 'warning',
      location: 'root.modules',
      message: 'Array "modules" tidak ditemukan atau bukan array.',
    });
  } else {
    pkg.modules.forEach((mod, idx) => {
      const loc = `modules[${idx}] (${mod.title || mod.id || 'tanpa judul'})`;
      if (!mod.id) {
        issues.push({ type: 'warning', location: loc, message: 'ID modul belum didefinisikan.' });
      }
      if (!mod.title || mod.title.trim().length === 0) {
        issues.push({ type: 'error', location: loc, message: 'Judul modul (title) tidak boleh kosong.' });
      }
      // Rule 1: Ekstrak materi pokok
      if (!Array.isArray(mod.core_topics) || mod.core_topics.length === 0) {
        issues.push({ type: 'error', location: loc, message: 'Materi pokok (core_topics) wajib berisi minimal 1 topik.' });
      }
      // Rule 1: Poin strategi
      if (!Array.isArray(mod.strategy_points) || mod.strategy_points.length === 0) {
        issues.push({ type: 'warning', location: loc, message: 'Poin strategi & trik (strategy_points) disarankan diisi.' });
      }
      // Rule 1: Indikator utama
      if (!Array.isArray(mod.key_indicators) || mod.key_indicators.length === 0) {
        issues.push({ type: 'error', location: loc, message: 'Indikator utama (key_indicators) wajib dicantumkan sesuai standar BKN/MenPAN-RB.' });
      }
      // Rule 1: Pola jawaban
      if (!Array.isArray(mod.answer_patterns) || mod.answer_patterns.length === 0) {
        issues.push({ type: 'warning', location: loc, message: 'Pola jawaban (answer_patterns) disarankan ada untuk panduan pengerjaan.' });
      }
    });
  }

  // Step 4: Validate Soal Umum (4 Subtes Utama: KM-SK, POT, LD, PK)
  const subtestBreakdown: Record<string, number> = {
    'KM-SK': 0,
    'POT': 0,
    'LD': 0,
    'PK': 0,
  };
  const validSubtests = ['KM-SK', 'POT', 'LD', 'PK'];

  const totalGeneral = Array.isArray(pkg.general_questions) ? pkg.general_questions.length : 0;
  if (!Array.isArray(pkg.general_questions)) {
    issues.push({
      type: 'warning',
      location: 'root.general_questions',
      message: 'Array "general_questions" tidak ditemukan.',
    });
  } else {
    pkg.general_questions.forEach((q, idx) => {
      const loc = `general_questions[${idx}] (${q.id || `No.${idx + 1}`})`;

      if (!q.subtest || !validSubtests.includes(q.subtest)) {
        issues.push({
          type: 'error',
          location: loc,
          message: `Subtes "${q.subtest}" tidak valid! Wajib salah satu dari 4 Subtes Utama Pro ASN: KM-SK, POT, LD, PK.`,
        });
      } else {
        subtestBreakdown[q.subtest] = (subtestBreakdown[q.subtest] || 0) + 1;
      }

      // Check text original question
      if (!q.question || q.question.trim().length === 0) {
        issues.push({ type: 'error', location: loc, message: 'Teks asli butir soal (question) tidak boleh kosong.' });
      }

      // Check options
      if (!Array.isArray(q.options) || q.options.length < 2) {
        issues.push({ type: 'error', location: loc, message: 'Pilihan jawaban (options) harus memiliki minimal pilihan A-D/E.' });
      } else {
        const codes = q.options.map((opt) => opt.code);
        if (q.answer_key && !codes.includes(q.answer_key)) {
          issues.push({
            type: 'error',
            location: loc,
            message: `Kunci jawaban "${q.answer_key}" tidak ditemukan dalam pilihan opsi yang tersedia (${codes.join(', ')}).`,
          });
        }
      }

      // Check answer key
      if (!q.answer_key) {
        issues.push({ type: 'error', location: loc, message: 'Kunci jawaban (answer_key) wajib ditentukan.' });
      }

      // Check explanation
      if (!q.explanation || q.explanation.trim().length === 0) {
        issues.push({ type: 'warning', location: loc, message: 'Pembahasan soal (explanation) kosong.' });
      }
    });
  }

  // Step 5: Validate Soal Teknis
  const fieldBreakdown: Record<string, number> = {};
  const totalTechnical = Array.isArray(pkg.technical_questions) ? pkg.technical_questions.length : 0;

  if (!Array.isArray(pkg.technical_questions)) {
    issues.push({
      type: 'warning',
      location: 'root.technical_questions',
      message: 'Array "technical_questions" tidak ditemukan.',
    });
  } else {
    pkg.technical_questions.forEach((q, idx) => {
      const loc = `technical_questions[${idx}] (${q.id || `No.${idx + 1}`})`;

      if (!q.field || q.field.trim().length === 0) {
        issues.push({
          type: 'error',
          location: loc,
          message: 'Kategori bidang teknis (field) wajib diisi (misal: "kesehatan", "pendidikan", "administrasi", dll.).',
        });
      } else {
        const normField = q.field.toLowerCase().trim();
        fieldBreakdown[normField] = (fieldBreakdown[normField] || 0) + 1;
      }

      if (!q.question || q.question.trim().length === 0) {
        issues.push({ type: 'error', location: loc, message: 'Teks soal teknis tidak boleh kosong.' });
      }

      if (!Array.isArray(q.options) || q.options.length < 2) {
        issues.push({ type: 'error', location: loc, message: 'Opsi jawaban teknis belum lengkap.' });
      } else {
        const codes = q.options.map((opt) => opt.code);
        if (q.answer_key && !codes.includes(q.answer_key)) {
          issues.push({
            type: 'error',
            location: loc,
            message: `Kunci jawaban teknis "${q.answer_key}" tidak cocok dengan kode pilihan.`,
          });
        }
      }

      if (!q.answer_key) {
        issues.push({ type: 'error', location: loc, message: 'Kunci jawaban teknis wajib ada.' });
      }
    });
  }

  const hasFatalErrors = issues.some((i) => i.type === 'error');

  return {
    isValid: !hasFatalErrors,
    hasVersion,
    hasLastUpdated,
    version: pkg.version || '1.0.0',
    lastUpdated: pkg.last_updated || new Date().toISOString(),
    issues,
    stats: {
      totalModules,
      totalGeneralQuestions: totalGeneral,
      subtestBreakdown,
      totalTechnicalQuestions: totalTechnical,
      fieldBreakdown,
    },
  };
}
