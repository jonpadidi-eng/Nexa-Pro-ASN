import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AI Studio environment constraint: Dev server must run on port 3000
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.text({ type: ['text/plain', 'text/plain;charset=utf-8'], limit: '20mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint Penerima Data (Kompatibel dengan kirimDataDenganPencegahError & Google Apps Script)
app.post('/api/submit-data', (req, res) => {
  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        // payload remains string
      }
    }

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({
        result: 'error',
        error: 'Payload tidak ditemukan atau format tidak valid.',
      });
    }

    const { nama, email } = payload;
    if (!nama || !email || !String(nama).trim() || !String(email).trim()) {
      return res.status(400).json({
        result: 'error',
        error: 'Input nama dan email tidak boleh kosong!',
      });
    }

    console.log('🎉 [Server Pro ASN] Data sukses diterima via kirimDataDenganPencegahError:', {
      nama,
      email,
      action: payload.action || 'submit',
      timestamp: new Date().toISOString(),
    });

    return res.json({
      result: 'success',
      message: 'Data sukses tersimpan!',
      received_at: new Date().toISOString(),
      payload_summary: {
        nama,
        email,
        action: payload.action || 'submit',
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error in /api/submit-data:', errorMsg);
    return res.status(500).json({
      result: 'error',
      error: `Internal Server Error: ${errorMsg}`,
    });
  }
});

// AI Document Extraction Endpoint
app.post('/api/extract', async (req, res) => {
  const { rawText, docType, subtestHint, fieldHint } = req.body;

  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return res.status(400).json({
      error: 'Teks dokumen tidak boleh kosong.',
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY belum dikonfigurasi di server. Gunakan Offline Smart Parser bawaan.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `Anda adalah Engine Pengolah Data & Arsitek Konten untuk Aplikasi PWA Bank Soal Pro ASN.
Tugas utama Anda adalah membaca dokumen yang diberikan (Modul Ajar, Soal Umum, Soal Teknis), lalu merapikan, mengklasifikasikan, dan mengonversinya secara presisi ke dalam struktur data JSON statis.

Aturan Klasifikasi:
1. Modul Ajar:
   Ekstrak:
   - id: string unik (misal: "modul-01")
   - category: 'KM-SK' | 'POT' | 'LD' | 'PK' | 'TEKNIS'
   - title: judul materi
   - core_topics: array string materi pokok
   - strategy_points: array string poin strategi & trik menjawab
   - key_indicators: array string indikator utama kompetensi
   - answer_patterns: array objek { pattern_name: string, description: string } (pola jawaban skor tertinggi/terendah)
   - content_markdown: ringkasan materi komprehensif dalam format markdown

2. Soal Umum:
   Kelompokkan ke dalam 4 Subtes Utama Pro ASN:
   - "KM-SK": Manajerial & Sosio-Kultural (Integritas, Kerjasama, Komunikasi, Orientasi Hasil, Pelayanan Publik, Pengembangan Diri, Mengelola Perubahan, Pengambilan Keputusan, Perekat Bangsa). Scoring type "weighted" (skor tiap pilihan 1-5).
   - "POT": Uji Potensi (Penalaran Verbal, Numerik, Logika Silogisme, Figural, dsb). Scoring type "binary" (pilihan benar skor 5, pilihan salah skor 0).
   - "LD": Literasi Digital (Keamanan Digital, Netiket/Etika Digital, Budaya Digital, Keterampilan Digital). Scoring type "binary" atau "weighted".
   - "PK": Preferensi Karir / RIASEC (Realistis, Investigatif, Artistik, Sosial, Kewirausahaan/Enterprising, Konvensional). Scoring type "riasec".

3. Soal Teknis:
   Kelompokkan berdasarkan kategori bidang spesifik:
   - field: misal "kesehatan", "pendidikan", "administrasi", "teknologi_informasi", "hukum", "keuangan", dll.
   - field_label: nama bidang terbaca (misal "Pendidikan & Pengajaran", "Kesehatan & Medis", dll.)
   - topic: topik teknis spesifik
   - scoring_type: "binary" (skor 5 jika benar, 0 jika salah)

Prinsip Output Data:
- Output WAJIB berupa JSON Valid yang memenuhi struktur tepat.
- Selalu sediakan atribut "version": "1.0.0" (atau versi yang sesuai) dan "last_updated" (format ISO string saat ini).
- Pertahankan teks asli soal, pilihan jawaban (A, B, C, D, E), kunci jawaban, dan pembahasan mendalam.
- Jangan ada pembungkus markdown selain JSON mentah (atau gunakan application/json response format).

Target Dokumen yang diminta user: ${docType || 'auto_detect'}
Petunjuk subtest jika ada: ${subtestHint || '-'}
Petunjuk bidang jika ada: ${fieldHint || '-'}

Format Struktur JSON yang wajib dihasilkan:
{
  "version": "1.0.0",
  "last_updated": "${new Date().toISOString()}",
  "meta": {
    "title": "Hasil Ekstraksi Dokumen Pro ASN",
    "total_modules": number,
    "total_general_questions": number,
    "total_technical_questions": number
  },
  "modules": [ ... ],
  "general_questions": [ ... ],
  "technical_questions": [ ... ]
}`;

    const userPrompt = `Berikut adalah isi dokumen yang diunggah / diinputkan oleh pengguna:\n\n---\n${rawText.slice(0, 50000)}\n---`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    const parsedData = JSON.parse(outputText);

    // Ensure version and last_updated are present
    if (!parsedData.version) parsedData.version = '1.0.0';
    if (!parsedData.last_updated) parsedData.last_updated = new Date().toISOString();
    if (!Array.isArray(parsedData.modules)) parsedData.modules = [];
    if (!Array.isArray(parsedData.general_questions)) parsedData.general_questions = [];
    if (!Array.isArray(parsedData.technical_questions)) parsedData.technical_questions = [];

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error in /api/extract:', errorMsg);
    return res.status(500).json({
      error: `Gagal memproses dokumen dengan AI: ${errorMsg}`,
    });
  }
});

// Vite integration or static file serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Pro ASN berjalan pada port ${PORT} (0.0.0.0)`);
  });
}

startServer();
