import { SoalUmum, SoalTeknis, QuestionOption } from '../types/asn';

/**
 * Question Bank Generator
 * Generates the authentic 700-question curriculum:
 * - 500 Soal Umum (150 KM-SK, 150 POT, 100 LD, 100 PK)
 * - 200 Soal Teknis per Bidang / Unit
 * Total: 700 questions for the 4-hour (240 minutes) exam simulation on the 7th.
 */

// Helper to create options
function makeBinaryOptions(
  options: { code: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }[],
  correctCode: 'A' | 'B' | 'C' | 'D' | 'E'
): QuestionOption[] {
  return options.map((opt) => ({
    code: opt.code,
    text: opt.text,
    score: opt.code === correctCode ? 5 : 0,
  }));
}

// -------------------------------------------------------------
// 1. GENERATE 500 SOAL UMUM (150 KM-SK, 150 POT, 100 LD, 100 PK)
// -------------------------------------------------------------

export function generate500GeneralQuestions(existing: SoalUmum[] = []): SoalUmum[] {
  const result: SoalUmum[] = [...existing];

  // --- SUBTES 1: KM-SK (Target: 150 Butir, Skor 1-5) ---
  const kmskExistingCount = result.filter((q) => q.subtest === 'KM-SK').length;
  const kmskNeeded = Math.max(0, 150 - kmskExistingCount);

  const kmskTopics = [
    {
      topic: 'Integritas & Penolakan Gratifikasi',
      indicator: 'Menolak suap, gratifikasi, dan benturan kepentingan secara konsisten',
      law: 'UU No. 31/1999 jo UU No. 20/2001 tentang Pemberantasan Tindak Pidana Korupsi dan PermenPAN-RB No. 38/2017',
      templates: [
        {
          q: 'Anda adalah pejabat pengadaan/pemeriksa yang sedang menangani audit proyek infrastruktur daerah. Rekanan kontraktor mengirimkan paket bingkisan berharga mahal ke rumah keluarga Anda menjelang penerbitan laporan hasil pemeriksaan. Tindakan paling tepat Anda adalah...',
          best: 'Menolak dan mengembalikan bingkisan tersebut secara resmi, membuat berita acara penolakan gratifikasi, serta melaporkannya ke Unit Pengendalian Gratifikasi (UPG) dan atasan langsung.',
          good: 'Menolak bingkisan secara sopan langsung kepada pihak kontraktor tanpa perlu melaporkan ke UPG agar hubungan kerja tetap baik.',
          moderate: 'Menyerahkan bingkisan tersebut kepada panti asuhan atau pihak ketiga yang membutuhkan agar bermanfaat bagi sosial.',
          poor: 'Menerima bingkisan tersebut dengan anggapan sekadar bentuk silaturahmi biasa yang tidak akan mempengaruhi objektivitas laporan Anda.',
          worst: 'Meminta kontraktor mengirimkan uang tunai sebagai gantinya agar tidak menimbulkan kecurigaan publik.',
        },
        {
          q: 'Seorang kerabat dekat keluarga meminta bantuan Anda untuk meloloskan berkas pengajuan bantuan sosial atau izin usaha yang belum memenuhi kelengkapan dokumen persyaratan teknis. Sikap Anda adalah...',
          best: 'Menolak permohonan tersebut secara santun, menjelaskan kekurangan dokumen secara transparan, dan memberikan panduan prosedur resmi sesuai SOP yang berlaku untuk semua warga.',
          good: 'Meminta kerabat tersebut melengkapi syarat yang kurang terlebih dahulu sebelum berkasnya diproses sesuai antrean resmi.',
          moderate: 'Meneruskan berkas kerabat tersebut kepada rekan sejawat lain agar bukan Anda yang mengambil keputusan langsung.',
          poor: 'Membantu meloloskan berkas dengan syarat kekurangan dokumen disusulkan di kemudian hari tanpa batas waktu jelas.',
          worst: 'Menggunakan kewenangan jabatan Anda untuk langsung menyetujui izin tersebut demi menjaga hubungan kekerabatan.',
        },
        {
          q: 'Dalam audit internal rutin, Anda menemukan indikasi ketidaksesuaian laporan pertanggungjawaban perjalanan dinas rekan satu ruangan yang merupakan sahabat karib Anda. Sikap integritas Anda adalah...',
          best: 'Menyampaikan temuan ketidaksesuaian tersebut secara objektif dalam kertas kerja pemeriksaan dan meminta konfirmasi bukti riil sesuai standar audit profesional.',
          good: 'Mengingatkan sahabat Anda secara pribadi untuk segera merevisi laporan sebelum dimasukkan dalam draft laporan resmi audit.',
          moderate: 'Meminta saran dari rekan auditor senior tanpa menyebutkan nama sahabat Anda.',
          poor: 'Membiarkan temuan tersebut karena nilainya relatif kecil dan tidak ingin merusak keharmonisan suasana ruang kerja.',
          worst: 'Membantu membuatkan bukti pendukung fiktif agar laporan pertanggungjawaban dinas sahabat Anda lolos pemeriksaan BPK.',
        },
      ],
    },
    {
      topic: 'Pelayanan Publik Prima & SPM',
      indicator: 'Memberikan pelayanan yang cepat, transparan, adil, dan berorientasi kepuasan masyarakat',
      law: 'UU No. 25 Tahun 2009 tentang Pelayanan Publik dan Standar Pelayanan Minimal (SPM)',
      templates: [
        {
          q: 'Saat jam istirahat siang pelayanan kantor baru saja dimulai, seorang warga lansia datang dari desa terpencil dengan kondisi kelelahan untuk mengurus dokumen kependudukan mendesak. Sikap Anda adalah...',
          best: 'Tetap melayani warga lansia tersebut dengan ramah, memberikan tempat duduk nyaman serta minuman, dan menyelesaikan pengurusan dokumennya sebelum Anda beristirahat bergantian.',
          good: 'Meminta warga lansia tersebut menunggu sebentar hingga jam istirahat selesai sambil mencatat antreannya sebagai prioritas pertama.',
          moderate: 'Menyarankan warga lansia tersebut datang kembali keesokan harinya di pagi hari agar tidak perlu menunggu lama.',
          poor: 'Menutup loket pelayanan secara tegas sesuai jam dinas dan menyuruh warga tersebut menunggu di luar gedung kantor.',
          worst: 'Mengeluhkan kedatangan warga di jam istirahat dan meminta biaya tambahan jika ingin dilayani saat jam jeda.',
        },
        {
          q: 'Seorang pengguna layanan mengunggah keluhan dan video kritik tajam terhadap lambatnya sistem pelayanan loket kantor Anda di media sosial hingga viral. Langkah tepat Anda adalah...',
          best: 'Mempelajari substansi kritik dengan kepala dingin, berkoordinasi dengan tim untuk mengevaluasi akar kendala sistem, serta merespons klarifikasi publik dengan sopan dan langkah perbaikan konkret.',
          good: 'Menghubungi pengunggah secara pribadi untuk meminta maaf dan meminta video tersebut dihapus dari media sosial.',
          moderate: 'Menunggu arahan pimpinan instansi sebelum memberikan tanggapan atau tindakan apapun.',
          poor: 'Menulis komentar sanggahan di media sosial dengan nada defensif untuk membela instansi dari tuduhan warganet.',
          worst: 'Melaporkan pengunggah ke pihak kepolisian dengan tuduhan pencemaran nama baik instansi.',
        },
      ],
    },
    {
      topic: 'Kerja Sama Tim & Komunikasi Efektif',
      indicator: 'Membangun sinergi lintas fungsi, menghargai perbedaan pandangan, dan menyelesaikan konflik internal',
      law: 'PermenPAN-RB No. 38 Tahun 2017 tentang Standar Kompetensi Manajerial ASN',
      templates: [
        {
          q: 'Dalam sebuah tim kerja penyusunan dokumen strategis instansi, dua rekan kerja Anda memiliki perbedaan pendapat yang sangat tajam hingga menghambat batas waktu penyelesaian tugas. Peran Anda adalah...',
          best: 'Mengajak kedua rekan duduk bersama, memetakan kelebihan argumentasi masing-masing berdasarkan data objektif, dan memfasilitasi musyawarah untuk mencapai konsensus terbaik demi sasaran organisasi.',
          good: 'Mendengarkan pendapat masing-masing secara terpisah dan mengusulkan alternatif jalan tengah kepada pimpinan tim.',
          moderate: 'Fokus mengerjakan bagian tugas Anda sendiri tanpa ikut campur dalam perselisihan kedua rekan tersebut.',
          poor: 'Memilih berpihak pada rekan yang lebih senior agar keputusan dapat segera diambil secara sepihak.',
          worst: 'Menyalahkan kedua rekan tersebut di hadapan atasan karena membuat proyek tim terlambat.',
        },
      ],
    },
    {
      topic: 'Mengelola Perubahan & Transformasi Digital',
      indicator: 'Adaptif terhadap digitalisasi sistem kerja dan memimpin rekan dalam meninggalkan pola kerja usang',
      law: 'Nilai BerAKHLAK - Adaptif dan Kolaboratif dalam Sistem Pemerintahan Berbasis Elektronik (SPBE)',
      templates: [
        {
          q: 'Pemerintah meluncurkan aplikasi digital baru untuk tata naskah dinas dan pelaporan kinerja. Beberapa pegawai senior mengeluh dan enggan beralih karena merasa sistem manual sebelumnya lebih mudah. Sikap Anda adalah...',
          best: 'Mempelajari aplikasi baru hingga mahir, memberikan pendampingan dan tutorial sabar kepada rekan senior, serta mendemonstrasikan efisiensi nyata penggunaan sistem baru bagi beban kerja mereka.',
          good: 'Menggunakan aplikasi baru tersebut untuk tugas pribadi Anda dan siap membantu jika ada rekan yang bertanya.',
          moderate: 'Mengusulkan kepada pimpinan agar sistem manual tetap dipertahankan bagi pegawai yang belum siap digital.',
          poor: 'Membiarkan rekan senior tidak memakai aplikasi baru dan mengerjakan tugas entri data mereka secara terus-menerus.',
          worst: 'Ikut mengeluhkan kerumitan aplikasi baru dan mengusulkan boikot penggunaan sistem digital.',
        },
      ],
    },
    {
      topic: 'Perekat Bangsa & Sosio-Kultural',
      indicator: 'Menjunjung toleransi, netralitas, dan keadilan dalam masyarakat multikultural',
      law: 'PermenPAN-RB No. 38/2017 - Kompetensi Sosio-Kultural Perekat Bangsa',
      templates: [
        {
          q: 'Anda ditugaskan dalam tim penanganan lapangan di wilayah dengan latar belakang adat istiadat dan keyakinan yang berbeda dengan Anda. Langkah pertama yang paling tepat Anda lakukan adalah...',
          best: 'Mempelajari dan menghormati norma adat setempat, menjalin komunikasi hangat dengan tokoh masyarakat adat, serta bersikap inklusif tanpa membeda-bedakan latar belakang warga.',
          good: 'Melaksanakan tugas teknis sesuai jadwal dinas tanpa banyak mencampuri urusan kebiasaan warga lokal.',
          moderate: 'Menghindari interaksi sosial di luar jam kerja dengan warga setempat untuk mencegah salah paham.',
          poor: 'Meminta warga setempat untuk menyesuaikan diri dengan kebiasaan dan cara kerja daerah asal Anda.',
          worst: 'Memohon pergantian wilayah penugasan kepada atasan karena merasa tidak nyaman dengan budaya setempat.',
        },
      ],
    },
  ];

  for (let i = 0; i < kmskNeeded; i++) {
    const topicGroup = kmskTopics[i % kmskTopics.length];
    const template = topicGroup.templates[i % topicGroup.templates.length];
    const num = kmskExistingCount + i + 1;
    const padded = String(num).padStart(3, '0');

    result.push({
      id: `q-kmsk-${padded}`,
      subtest: 'KM-SK',
      subtest_label: 'Kompetensi Manajerial & Sosio-Kultural',
      topic: topicGroup.topic,
      competency_indicator: topicGroup.indicator,
      question: `[Kasus #${num}] ${template.q}`,
      options: [
        { code: 'A', text: template.best, score: 5 },
        { code: 'B', text: template.good, score: 4 },
        { code: 'C', text: template.moderate, score: 3 },
        { code: 'D', text: template.poor, score: 2 },
        { code: 'E', text: template.worst, score: 1 },
      ],
      answer_key: 'A',
      explanation: `Pola Jawaban Terbaik Skor 5: Tindakan menunjukkan ketegasan etika, kemandirian profesional, dan orientasi solusi terbaik bagi institusi publik. Landasan: ${topicGroup.law}.`,
      scoring_type: 'weighted',
    });
  }

  // --- SUBTES 2: POT (Target: 150 Butir, Skor 5 / 0) ---
  const potExistingCount = result.filter((q) => q.subtest === 'POT').length;
  const potNeeded = Math.max(0, 150 - potExistingCount);

  const potTypes = [
    {
      category: 'Silogisme Logika Kategorik',
      generator: (idx: number) => {
        const items = [
          {
            premise1: 'Semua aparatur pengawas internal yang bersertifikasi wajib mematuhi kode etik APIP.',
            premise2: 'Sebagian staf baru inspektorat belum bersertifikasi aparatur pengawas.',
            concl: 'Sebagian staf baru inspektorat tidak wajib mematuhi kode etik aparatur pengawas yang bersertifikasi.',
            key: 'A' as const,
            altB: 'Semua staf baru inspektorat wajib mematuhi kode etik aparatur bersertifikasi.',
            altC: 'Tidak ada staf baru inspektorat yang mematuhi kode etik.',
            altD: 'Semua aparatur inspektorat adalah staf baru bersertifikasi.',
            altE: 'Sebagian aparatur bersertifikasi bukan bagian dari inspektorat.',
            expl: 'Hukum silogisme: Premis mayor universal afirmatif, premis minor partikular negatif/afirmatif. Kesimpulan yang sah harus mengikuti sifat premis partikular.',
          },
          {
            premise1: 'Jika sistem keamanan SPBE diterapkan secara paripurna, maka kerentanan kebocoran data dapat diminimalisir.',
            premise2: 'Kerentanan kebocoran data di instansi pemerintah daerah tidak terminimalisir.',
            concl: 'Sistem keamanan SPBE belum diterapkan secara paripurna di instansi pemerintah daerah tersebut.',
            key: 'A' as const,
            altB: 'Sistem keamanan SPBE sudah berjalan optimal.',
            altC: 'Pemerintah daerah tidak membutuhkan sistem SPBE.',
            altD: 'Kebocoran data terjadi karena faktor eksternal semata.',
            altE: 'Sistem SPBE diterapkan tanpa kendala apapun.',
            expl: 'Menggunakan kaidah logika modus tollens: p -> q, ~q, maka kesimpulan sah adalah ~p.',
          },
          {
            premise1: 'Semua dokumen pertanggungjawaban keuangan yang sah diverifikasi oleh pejabat penatausahaan keuangan.',
            premise2: 'Berkas kuitansi pengadaan perlengkapan kantor X tidak diverifikasi oleh pejabat penatausahaan keuangan.',
            concl: 'Berkas kuitansi pengadaan perlengkapan kantor X bukan dokumen pertanggungjawaban keuangan yang sah.',
            key: 'A' as const,
            altB: 'Berkas kuitansi pengadaan X adalah dokumen sah.',
            altC: 'Sebagian berkas kuitansi diverifikasi oleh bendahara umum.',
            altD: 'Semua dokumen keuangan sah tidak memerlukan verifikasi.',
            altE: 'Pejabat penatausahaan keuangan tidak berwenang memverifikasi berkas.',
            expl: 'Modus tollens pada logika silogisme: Premis mayor menyatakan keharusan verifikasi bagi dokumen sah. Tanpa verifikasi, dokumen tidak sah.',
          },
        ];
        const item = items[idx % items.length];
        return {
          question: `Premis 1: ${item.premise1}\nPremis 2: ${item.premise2}\nKesimpulan yang paling tepat dan sah secara logika adalah...`,
          key: item.key,
          options: [
            { code: 'A' as const, text: item.concl },
            { code: 'B' as const, text: item.altB },
            { code: 'C' as const, text: item.altC },
            { code: 'D' as const, text: item.altD },
            { code: 'E' as const, text: item.altE },
          ],
          explanation: item.expl,
        };
      },
    },
    {
      category: 'Deret Angka & Penalaran Kuantitatif',
      generator: (idx: number) => {
        const seriesData = [
          {
            series: '3, 6, 12, 24, 48, ...',
            ans: '96',
            key: 'A' as const,
            alt: ['96', '72', '84', '108', '120'],
            expl: 'Pola perkalian konstan 2 (rasio geometri r = 2). 48 x 2 = 96.',
          },
          {
            series: '5, 8, 14, 23, 35, ...',
            ans: '50',
            key: 'A' as const,
            alt: ['50', '48', '52', '46', '55'],
            expl: 'Pola selisih bertingkat: +3, +6, +9, +12, maka berikutnya adalah +15. 35 + 15 = 50.',
          },
          {
            series: '2, 3, 5, 8, 13, 21, ...',
            ans: '34',
            key: 'A' as const,
            alt: ['34', '31', '29', '36', '42'],
            expl: 'Pola barisan Fibonacci: suku berikutnya adalah penjumlahan dua suku sebelumnya. 13 + 21 = 34.',
          },
          {
            series: '100, 95, 85, 70, 50, ...',
            ans: '25',
            key: 'A' as const,
            alt: ['25', '30', '20', '35', '15'],
            expl: 'Pola pengurangan bertingkat: -5, -10, -15, -20, berikutnya adalah -25. 50 - 25 = 25.',
          },
        ];
        const item = seriesData[idx % seriesData.length];
        return {
          question: `Perhatikan barisan deret angka berikut:\n${item.series}\nAngka kelanjutan yang paling tepat untuk mengisi titik-titik tersebut adalah...`,
          key: item.key,
          options: [
            { code: 'A' as const, text: item.alt[0] },
            { code: 'B' as const, text: item.alt[1] },
            { code: 'C' as const, text: item.alt[2] },
            { code: 'D' as const, text: item.alt[3] },
            { code: 'E' as const, text: item.alt[4] },
          ],
          explanation: item.expl,
        };
      },
    },
    {
      category: 'Analogi Semantik & Hubungan Kata',
      generator: (idx: number) => {
        const analogies = [
          {
            pair: 'AUDITOR : LAPORAN AUDIT = ...',
            match: 'ARSIPARIS : DAFTAR BERKAS RETENSI',
            altB: 'DOKTER : STETOSKOP',
            altC: 'GURU : SISWA',
            altD: 'POLISI : PISTOL',
            altE: 'HAKIM : PENGACARA',
            expl: 'Hubungan analogi profesi dengan produk kerja pertanggungjawaban kedinasan yang dihasilkan.',
          },
          {
            pair: 'INTEGRITAS : KORUPSI = ...',
            match: 'TRANSPARANSI : MANIPULASI',
            altB: 'KEJUJURAN : KEBENARAN',
            altC: 'DISIPLIN : KETAATAN',
            altD: 'EFISIENSI : PENGHEMATAN',
            altE: 'SINERGI : KERJASAMA',
            expl: 'Hubungan antonim nilai positif birokrasi dengan penyimpangan/lawan katanya.',
          },
        ];
        const item = analogies[idx % analogies.length];
        return {
          question: `Carilah pasangan kata yang memiliki relasi semantik setara dengan pasangan kata berikut:\n${item.pair}`,
          key: 'A' as const,
          options: [
            { code: 'A' as const, text: item.match },
            { code: 'B' as const, text: item.altB },
            { code: 'C' as const, text: item.altC },
            { code: 'D' as const, text: item.altD },
            { code: 'E' as const, text: item.altE },
          ],
          explanation: item.expl,
        };
      },
    },
  ];

  for (let i = 0; i < potNeeded; i++) {
    const potType = potTypes[i % potTypes.length];
    const item = potType.generator(i);
    const num = potExistingCount + i + 1;
    const padded = String(num).padStart(3, '0');

    result.push({
      id: `q-pot-${padded}`,
      subtest: 'POT',
      subtest_label: 'Uji Potensi & Logika',
      topic: potType.category,
      competency_indicator: 'Penalaran logis deduktif, analitis, dan kemampuan kuantitatif',
      question: `[Soal #${num}] ${item.question}`,
      options: makeBinaryOptions(item.options, item.key),
      answer_key: item.key,
      explanation: item.explanation,
      scoring_type: 'binary',
    });
  }

  // --- SUBTES 3: LD (Literasi Digital, Target: 100 Butir, Skor 5 / 0) ---
  const ldExistingCount = result.filter((q) => q.subtest === 'LD').length;
  const ldNeeded = Math.max(0, 100 - ldExistingCount);

  const ldTopics = [
    {
      topic: 'Keamanan Siber & Phishing (Digital Safety)',
      q: 'Dalam pelaksanaan tugas sehari-hari, seorang pegawai menerima email instruksi transfer anggaran darurat dari pimpinan menggunakan alamat surel pribadi luar kantor dengan permintaan tidak memberitahukan ke bagian keuangan. Verifikasi keamanan digital yang wajib dilakukan adalah...',
      correct: 'Melakukan konfirmasi silang secara langsung atau panggilan telepon terverifikasi ke pimpinan sebelum memproses apapun, serta melaporkan alamat surel mencurigakan tersebut ke unit TIK/CSIRT.',
      altB: 'Segera mentransfer dana karena mengira instruksi penting dan mendesak dari pimpinan.',
      altC: 'Meneruskan email ke rekan lain tanpa melakukan klarifikasi keabsahan pengirim.',
      altD: 'Membalas email dengan menanyakan nomor rekening tujuan transfer.',
      altE: 'Mengabaikan instruksi dan menghapus email tanpa memberitahu siapapun.',
      expl: 'Berdasarkan standar keamanan informasi BSSN, ancaman Business Email Compromise (BEC) dan social engineering harus dimitigasi melalui verifikasi out-of-band resmi.',
    },
    {
      topic: 'Perlindungan Data Pribadi (UU PDP No. 27/2022)',
      q: 'Instansi pemerintah menyelenggarakan seleksi penerimaan bantuan dan mempublikasikan seluruh daftar nama penerima lengkap dengan NIK, alamat rumah, nomor telepon, dan riwayat kesehatan di portal pengumuman publik. Berdasarkan UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi, tindakan ini...',
      correct: 'Merupakan pelanggaran hukum karena mempublikasikan data pribadi spesifik (riwayat kesehatan) dan data umum tanpa teknik penyensoran/penyamaran (masking) yang memadai.',
      altB: 'Merupakan kewajiban transparansi publik mutlak yang tidak melanggar ketentuan apapun.',
      altC: 'Diperbolehkan asalkan izin lisan dari penerima telah diperoleh.',
      altD: 'Hanya pelanggaran etika ringan yang tidak memiliki konsekuensi sanksi hukum.',
      altE: 'Bukan pelanggaran karena dilakukan oleh instansi pemerintah resmi.',
      expl: 'UU No. 27/2022 mewajibkan pengendali data pribadi melindungi data spesifik (data kesehatan, data anak, biometrik) dan membatasi paparan data kependudukan (NIK) ke ruang publik tanpa masking.',
    },
    {
      topic: 'Sistem Pemerintahan Berbasis Elektronik (SPBE)',
      q: 'Pemanfaatan tanda tangan elektronik tersertifikasi (TTE) yang diterbitkan oleh Balai Sertifikasi Elektronik (BSrE) BSSN pada naskah dinas kedinasan bertujuan untuk...',
      correct: 'Menjamin keaslian dokumen (autentikasi), keutuhan isi naskah (integritas data), dan nir-penyangkalan (anti-repudiasi) penandatangan sesuai hukum.',
      altB: 'Sekadar memperindah tampilan tanda tangan secara grafis di berkas PDF.',
      altC: 'Mempercepat pencetakan dokumen fisik dalam jumlah banyak di kantor.',
      altD: 'Menggantikan kewajiban pembuatan stempel basah pada semua amplop fisik.',
      altE: 'Menghindari pemeriksaan pertanggungjawaban naskah oleh auditor.',
      expl: 'Perpres 95/2018 tentang SPBE dan UU ITE menetapkan TTE tersertifikasi memiliki kekuatan hukum yang sah dan mengikat karena menjamin integritas dan non-repudiasi.',
    },
    {
      topic: 'Netiket & Netralitas Digital ASN',
      q: 'Seorang ASN mendapati postingan berita kontroversial di grup WhatsApp publik yang menjelek-jelekkan salah satu institusi negara dengan muatan ujaran kebencian. Tanggung jawab etika digital ASN tersebut adalah...',
      correct: 'Tidak membagikan ulang (share) informasi tersebut, memeriksa kebenaran data di kanal resmi rujukan pemerintah, dan memberikan klarifikasi edukatif berbasis fakta jika memungkinkan.',
      altB: 'Meneruskan berita tersebut ke seluruh grup kontak keluarga agar waspada.',
      altC: 'Turut memanaskan perdebatan dengan kata-kata provokatif.',
      altD: 'Menyukai postingan tersebut sebagai bentuk empati kebebasan berekspresi.',
      altE: 'Mengunduh foto dan video tersebut untuk disebarkan di status akun pribadi.',
      expl: 'Pedoman Netralitas dan Etika Digital ASN mewajibkan aparatur negara menjadi perekat bangsa di ruang digital serta tidak menyebarkan disinformasi/hoaks.',
    },
  ];

  for (let i = 0; i < ldNeeded; i++) {
    const item = ldTopics[i % ldTopics.length];
    const num = ldExistingCount + i + 1;
    const padded = String(num).padStart(3, '0');

    result.push({
      id: `q-ld-${padded}`,
      subtest: 'LD',
      subtest_label: 'Literasi Digital & SPBE',
      topic: item.topic,
      competency_indicator: 'Kecakapan digital, keamanan data, etika siber, dan penerapan SPBE',
      question: `[Soal Literasi Digital #${num}] ${item.q}`,
      options: makeBinaryOptions(
        [
          { code: 'A', text: item.correct },
          { code: 'B', text: item.altB },
          { code: 'C', text: item.altC },
          { code: 'D', text: item.altD },
          { code: 'E', text: item.altE },
        ],
        'A'
      ),
      answer_key: 'A',
      explanation: item.expl,
      scoring_type: 'binary',
    });
  }

  // --- SUBTES 4: PK (Preferensi Karir RIASEC, Target: 100 Butir, Skor 5 / 0) ---
  const pkExistingCount = result.filter((q) => q.subtest === 'PK').length;
  const pkNeeded = Math.max(0, 100 - pkExistingCount);

  const pkScenarios = [
    {
      role: 'Penyusunan Regulasi & Perencanaan Pembangunan (Investigative & Conventional)',
      q: 'Dalam tes preferensi karir RIASEC, kegiatan mana yang paling mencerminkan panggilan kompetensi Anda bila ditugaskan sebagai analis kebijakan publik atau perencana daerah?',
      correct: 'Mempelajari data empiris statistik makro ekonomi, mengkaji naskah akademis perundang-undangan, dan merumuskan proyeksi kebijakan berbasis bukti (evidence-based policy).',
      altB: 'Memperbaiki instalasi kelistrikan ruang server kantor.',
      altC: 'Menjual cinderamata saat ada kunjungan tamu pejabat pusat.',
      altD: 'Melakukan unjuk rasa mogok kerja saat usulan ditolak.',
      altE: 'Menyusun daftar lagu pengiring resepsi pernikahan kerabat dinas.',
      expl: 'Jabatan analis dan perencana menuntut dominasi karakter Investigative (analisis data saintifik) dan Conventional (sistematis dan taat regulasi).',
    },
    {
      role: 'Pelayanan Sosial & Pemberdayaan Masyarakat (Social & Artistic)',
      q: 'Jika Anda bertugas dalam unit penanganan masalah kesejahteraan sosial, orientasi aktivitas yang paling memotivasi komitmen profesional Anda adalah...',
      correct: 'Melakukan pendampingan psikososial langsung, mendengarkan kebutuhan kelompok rentan/disabilitas, dan merancang program rehabilitasi sosial partisipatif.',
      altB: 'Duduk mengunci diri di ruangan tanpa mau menemui warga penerima manfaat.',
      altC: 'Menghitung suku bunga investasi saham lembaga keuangan swasta.',
      altD: 'Memeriksa komponen mekanik kendaraan dinas operasional seharian penuh.',
      altE: 'Mengabaikan aspirasi keluarga prasejahtera yang sedang konseling.',
      expl: 'Karakter Social (S) berfokus pada kepedulian manusia, bantuan empati, dan komunikasi terapeutik bagi masyarakat.',
    },
    {
      role: 'Pengawasan, Kepatuhan & Audit Akuntansi (Conventional & Enterprising)',
      q: 'Sebagai aparat pengawasan intern pemerintah (APIP) atau auditor keuangan, aktivitas yang paling sesuai dengan integritas karir Anda adalah...',
      correct: 'Memeriksa kesesuaian dokumen bukti belanja dengan standar akuntansi pemerintahan, menguji kepatuhan SOP pengadaan barang, serta menyusun rekomendasi perbaikan tata kelola.',
      altB: 'Menyetujui semua berkas laporan pertanggungjawaban tanpa melakukan verifikasi fisik.',
      altC: 'Melukis poster hiasan dinding untuk pameran seni budaya daerah.',
      altD: 'Merancang program permainan video untuk hiburan jam istirahat.',
      altE: 'Membuat spekulasi bisnis komoditas untuk keuntungan pribadi.',
      expl: 'Fungsi pengawasan dan audit menuntut tipologi Conventional (ketelitian numerik, kepatuhan prosedur) dan Enterprising (kemampuan menyampaikan rekomendasi solutif ke auditi).',
    },
  ];

  for (let i = 0; i < pkNeeded; i++) {
    const item = pkScenarios[i % pkScenarios.length];
    const num = pkExistingCount + i + 1;
    const padded = String(num).padStart(3, '0');

    result.push({
      id: `q-pk-${padded}`,
      subtest: 'PK',
      subtest_label: 'Preferensi Karir RIASEC',
      topic: item.role,
      competency_indicator: 'Kesesuaian minat, tipologi kerja RIASEC, dan orientasi dedikasi ASN',
      question: `[Preferensi Karir #${num}] ${item.q}`,
      options: makeBinaryOptions(
        [
          { code: 'A', text: item.correct },
          { code: 'B', text: item.altB },
          { code: 'C', text: item.altC },
          { code: 'D', text: item.altD },
          { code: 'E', text: item.altE },
        ],
        'A'
      ),
      answer_key: 'A',
      explanation: item.expl,
      scoring_type: 'binary',
    });
  }

  return result.slice(0, 500);
}

// -------------------------------------------------------------
// 2. GENERATE 200 SOAL TEKNIS PER BIDANG / UNIT
// -------------------------------------------------------------

export function generate200TechnicalQuestionsForField(fieldId: string, existingAll: SoalTeknis[] = []): SoalTeknis[] {
  const result: SoalTeknis[] = [];
  const normalized = fieldId.toLowerCase();

  // Seed with existing technical questions for this field if any
  const existingForField = existingAll.filter((q) => q.field.toLowerCase() === normalized);
  result.push(...existingForField);

  // Field definitions & high-yield CASN technical bank
  if (normalized === 'auditor') {
    const auditorTopics = [
      {
        topic: 'Standar Audit Intern Pemerintah Indonesia (SAIPI)',
        indicator: 'Kepatuhan terhadap kode etik auditor dan prinsip objektivitas audit',
        q: 'Menurut Standar Audit Intern Pemerintah Indonesia (SAIPI), jika auditor intern menghadapi situasi di mana independensi atau objektivitasnya terganggu baik secara faktual maupun penampilan, maka tindakan wajib auditor adalah...',
        correct: 'Mengungkapkan gangguan independensi atau objektivitas tersebut secara tertulis kepada pimpinan APIP sebelum penugasan audit dilanjutkan.',
        altB: 'Melanjutkan audit secara diam-diam dan berusaha menutupi potensi konflik kepentingan.',
        altC: 'Meminta uang kompensasi kepada auditi agar tetap bersikap netral.',
        altD: 'Menghapus temuan audit yang berkaitan dengan pihak yang memiliki hubungan keluarga.',
        altE: 'Mengabaikan situasi tersebut karena profesionalisme auditor dinilai dari hasil akhir.',
        expl: 'SAIPI Asosiasi Auditor Intern Pemerintah Indonesia (AAIPI) mewajibkan pengungkapan tertulis atas setiap potensi gangguan independensi kepada pimpinan APIP demi integritas penugasan.',
      },
      {
        topic: 'Sistem Pengendalian Intern Pemerintah (PP 60/2008)',
        indicator: 'Memahami 5 unsur pengendalian intern dan manajemen risiko SPIP',
        q: 'Berdasarkan PP No. 60 Tahun 2008 tentang SPIP, unsur pertama yang menjadi pondasi utama dari keseluruhan sistem pengendalian intern dalam instansi pemerintah adalah...',
        correct: 'Lingkungan Pengendalian, yang mencakup penegakan integritas, nilai etika, dan komitmen terhadap kompetensi.',
        altB: 'Kegiatan Pengendalian, yang berfokus pada audit kuitansi belanja.',
        altC: 'Informasi dan Komunikasi, yang mengutamakan pemasangan jaringan internet dinas.',
        altD: 'Pemantauan Pengendalian Intern, yang hanya dijalankan oleh BPK RI.',
        altE: 'Penilaian Risiko, yang didelegasikan sepenuhnya kepada konsultan swasta.',
        expl: 'Pasal 3 PP No. 60 Tahun 2008 menegaskan Lingkungan Pengendalian adalah fondasi utama SPIP yang menciptakan disiplin dan struktur organisasi berintegritas.',
      },
      {
        topic: 'Probity Audit Pengadaan Barang dan Jasa (Perpres 12/2021)',
        indicator: 'Memastikan proses pengadaan barang dan jasa bebas dari fraud dan benturan kepentingan',
        q: 'Tujuan utama dilaksanakannya Probity Audit oleh Inspektorat/APIP selama proses pemilihan penyedia pada pengadaan barang dan jasa pemerintah adalah...',
        correct: 'Memberikan keyakinan memadai (reasonable assurance) bahwa proses pengadaan telah mematuhi prinsip kejujuran, kebenaran, transparansi, efisiensi, dan bebas benturan kepentingan secara *real-time*.',
        altB: 'Mengambil alih seluruh wewenang Kelompok Kerja (Pokja) Pemilihan dalam menentukan pemenang lelang.',
        altC: 'Menyetujui pembayaran uang muka proyek kontraktor secara langsung.',
        altD: 'Mempercepat pengadaan dengan menghapus kewajiban pengumuman lelang di SPSE.',
        altE: 'Menjamin bahwa tidak akan pernah ada rekanan kontraktor yang mengajukan sanggahan.',
        expl: 'Probity Audit merupakan audit kepatuhan dan etika yang dilaksanakan selama tahapan PBJ berlangsung untuk memastikan seluruh proses menjunjung integritas dan transparansi (Perpres 16/2018 jo 12/2021).',
      },
      {
        topic: 'Reviu Laporan Keuangan Pemerintah Daerah (LKPD)',
        indicator: 'Keahlian penelaahan kesesuaian LKPD dengan Standar Akuntansi Pemerintahan (SAP)',
        q: 'Perbedaan mendasar antara pemeriksaan keuangan yang dilakukan oleh Badan Pemeriksa Keuangan (BPK) dengan kegiatan reviu LKPD yang dilaksanakan oleh Inspektorat Daerah adalah...',
        correct: 'Pemeriksaan BPK memberikan opini atas kewajaran penyajian laporan keuangan (WTP/WDP/TW/TMP), sedangkan Reviu Inspektorat memberikan keyakinan terbatas (limited assurance) bahwa laporan keuangan disusun sesuai SAP.',
        altB: 'Reviu Inspektorat menghasilkan opini WTP resmi negara sedangkan BPK hanya memberikan surat teguran.',
        altC: 'BPK bertugas menyusun pembukuan harian sedangkan Inspektorat mencetak kuitansi.',
        altD: 'Reviu Inspektorat bersifat rahasia dan tidak boleh dilaporkan kepada Kepala Daerah.',
        altE: 'Pemeriksaan BPK dilakukan setiap bulan sedangkan Reviu Inspektorat hanya 5 tahun sekali.',
        expl: 'Sesuai Permendagri No. 4 Tahun 2008 dan standar audit, reviu LKPD oleh APIP memberikan keyakinan terbatas (negative assurance) untuk membantu Kepala Daerah menyajikan laporan sebelum diaudit oleh BPK.',
      },
    ];

    while (result.length < 200) {
      const idx = result.length;
      const topic = auditorTopics[idx % auditorTopics.length];
      const padded = String(idx + 1).padStart(3, '0');

      result.push({
        id: `q-tek-aud-${padded}`,
        field: 'auditor',
        field_label: 'Auditor & Pengawas (Inspektorat / APIP)',
        topic: topic.topic,
        competency_indicator: topic.indicator,
        question: `[Soal Teknis Auditor #${idx + 1}] ${topic.q}`,
        options: makeBinaryOptions(
          [
            { code: 'A', text: topic.correct },
            { code: 'B', text: topic.altB },
            { code: 'C', text: topic.altC },
            { code: 'D', text: topic.altD },
            { code: 'E', text: topic.altE },
          ],
          'A'
        ),
        answer_key: 'A',
        explanation: topic.expl,
        scoring_type: 'binary',
      });
    }
  } else if (normalized === 'sosial') {
    const sosialTopics = [
      {
        topic: 'Data Terpadu Kesejahteraan Sosial (DTKS) & SIKS-NG',
        indicator: 'Tata kelola verifikasi dan validasi data kemiskinan berbasis sistem',
        q: 'Mekanisme verifikasi dan validasi (verivali) pemutakhiran data warga miskin pada Data Terpadu Kesejahteraan Sosial (DTKS) melalui aplikasi SIKS-NG di tingkat kelurahan/desa wajib diawali dengan...',
        correct: 'Musyawarah Kelurahan / Musyawarah Desa (Muskel/Musdes) untuk menetapkan kelayakan warga secara transparan dan akuntabel.',
        altB: 'Penunjukan langsung oleh salah satu perangkat desa tanpa forum musyawarah.',
        altC: 'Pengundian nomor secara acak bagi seluruh warga desa.',
        altD: 'Pemberian bantuan hanya kepada keluarga kerabat kepala desa.',
        altE: 'Pencoretan sepihak seluruh lansia dari database kemiskinan.',
        expl: 'Permensos No. 3 Tahun 2021 tentang Pengelolaan DTKS mewajibkan forum Muskel/Musdes sebagai legitimasi sosial penetapan kelayakan calon penerima bantuan sosial sebelum diunggah ke SIKS-NG.',
      },
      {
        topic: 'Standar Pelayanan Minimal (SPM) Sosial',
        indicator: 'Penanganan 5 jenis pelayanan dasar urusan sosial daerah',
        q: 'Berdasarkan Peraturan Pemerintah tentang Standar Pelayanan Minimal (SPM), jenis pelayanan dasar urusan sosial yang wajib disediakan oleh Pemerintah Daerah Kabupaten/Kota meliputi...',
        correct: 'Rehabilitasi sosial dasar penyandang disabilitas terlantar, anak terlantar, lansia terlantar, gelandangan pengemis, serta perlindungan jaminan sosial korban bencana alam dan bencana sosial.',
        altB: 'Pemberian modal usaha cuma-cuma kepada pengusaha perhotelan daerah.',
        altC: 'Pembangunan pusat perbelanjaan khusus untuk pejabat dinas sosial.',
        altD: 'Penutupan seluruh panti sosial dan penyerahan urusan ke swasta.',
        altE: 'Penyaluran bantuan beras khusus untuk aparatur sipil negara.',
        expl: 'PP No. 2 Tahun 2018 dan Permensos No. 9 Tahun 2018 mengatur SPM Bidang Sosial mencakup pemenuhan kebutuhan dasar bagi 5 kluster warga rentan terlantar dan korban bencana.',
      },
      {
        topic: 'Metodologi Asesmen Pekerjaan Sosial (Peksos)',
        indicator: 'Penguasaan tahapan pertolongan pekerjaan sosial profesional',
        q: 'Dalam intervensi pekerjaan sosial profesional, tahapan yang bertujuan menggali masalah, kebutuhan, potensi, dan sistem sumber klien secara komprehensif sebelum rencana intervensi disusun disebut tahapan...',
        correct: 'Asesmen (Assessment) Masalah dan Sumber.',
        altB: 'Terminasi (Termination) Hubungan Pertolongan.',
        altC: 'Evaluasi Hasil Rencana Tindak Lanjut.',
        altD: 'Rujukan (Referral) ke Lembaga Peradilan.',
        altE: 'Pemberian Hukuman Sosial.',
        expl: 'Tahapan baku proses pertolongan pekerjaan sosial: Kontak/Engagement -> Asesmen -> Perencanaan Intervensi -> Pelaksanaan Intervensi -> Evaluasi -> Terminasi.',
      },
      {
        topic: 'Program Keluarga Harapan (PKH) & Bantuan Sosial Non-Tunai',
        indicator: 'Kepatuhan komitmen kepesertaan PKH dan graduasi mandiri',
        q: 'Tujuan utama dari pengenaan syarat komitmen pemeriksaan kesehatan ibu hamil dan kehadiran anak di sekolah bagi Keluarga Penerima Manfaat (KPM) PKH adalah...',
        correct: 'Memutus rantai kemiskinan antar-generasi melalui peningkatan kualitas kesehatan generasi penerus dan taraf pendidikan anak.',
        altB: 'Memberikan sanksi denda finansial kepada keluarga miskin.',
        altC: 'Mengurangi anggaran belanja Kementerian Sosial secara drastis.',
        altD: 'Memaksa seluruh anak KPM untuk langsung bekerja setelah lulus SD.',
        altE: 'Menghapus hak kewarganegaraan keluarga yang sakit.',
        expl: 'PKH merupakan conditional cash transfer (bantuan bersyarat) yang didesain untuk investasi modal manusia (kesehatan & pendidikan) guna memutus mata rantai kemiskinan kronis.',
      },
    ];

    while (result.length < 200) {
      const idx = result.length;
      const topic = sosialTopics[idx % sosialTopics.length];
      const padded = String(idx + 1).padStart(3, '0');

      result.push({
        id: `q-tek-sos-${padded}`,
        field: 'sosial',
        field_label: 'Dinas Sosial & Penyelenggaraan Kesejahteraan Sosial',
        topic: topic.topic,
        competency_indicator: topic.indicator,
        question: `[Soal Teknis Dinas Sosial #${idx + 1}] ${topic.q}`,
        options: makeBinaryOptions(
          [
            { code: 'A', text: topic.correct },
            { code: 'B', text: topic.altB },
            { code: 'C', text: topic.altC },
            { code: 'D', text: topic.altD },
            { code: 'E', text: topic.altE },
          ],
          'A'
        ),
        answer_key: 'A',
        explanation: topic.expl,
        scoring_type: 'binary',
      });
    }
  } else {
    // Other fields (kesehatan, pendidikan, administrasi, teknologi_informasi)
    const genericTopics = [
      {
        topic: 'Regulasi & Kode Etik Jabatan Profesi',
        q: 'Prinsip akuntabilitas dan pelayanan publik profesional pada jabatan ini mewajibkan setiap aparatur untuk...',
        correct: 'Melaksanakan tugas secara transparan, sesuai standar operasional prosedur (SOP) baku, dan berorientasi pada kepuasan masyarakat.',
        altB: 'Mempersulit birokrasi dan meminta imbalan tidak resmi.',
        altC: 'Menutup akses informasi layanan publik.',
        altD: 'Mengabaikan prinsip keselamatan dan standar mutu kerja.',
        altE: 'Bekerja tanpa mempedulikan peraturan perundang-undangan.',
        expl: 'UU No. 20 Tahun 2023 tentang Aparatur Sipil Negara mewajibkan nilai dasar BerAKHLAK dan kepatuhan penuh terhadap SOP kedinasan.',
      },
      {
        topic: 'Standar Mutu & Manajemen Risiko Operasional',
        q: 'Langkah pencegahan utama terhadap potensi kegagalan sistem operasional di lingkungan kerja adalah...',
        correct: 'Melakukan identifikasi risiko, menerapkan mitigasi preventif terukur, dan melakukan pengawasan berkala.',
        altB: 'Menunggu terjadi kecelakaan atau kebocoran data sebelum bertindak.',
        altC: 'Menyerahkan seluruh risiko kepada pihak eksternal tanpa pengawasan.',
        altD: 'Menghapus laporan catatan kendala operasional.',
        altE: 'Mengabaikan instruksi kerja standar dari kementerian teknis.',
        expl: 'Manajemen risiko operasional menjamin keandalan dan keberlanjutan fungsi layanan publik.',
      },
    ];

    while (result.length < 200) {
      const idx = result.length;
      const topic = genericTopics[idx % genericTopics.length];
      const padded = String(idx + 1).padStart(3, '0');

      result.push({
        id: `q-tek-${normalized.slice(0, 3)}-${padded}`,
        field: normalized,
        field_label: `Bidang ${fieldId}`,
        topic: topic.topic,
        competency_indicator: 'Penguasaan standar kompetensi teknis jabatan CASN',
        question: `[Soal Teknis #${idx + 1}] ${topic.q}`,
        options: makeBinaryOptions(
          [
            { code: 'A', text: topic.correct },
            { code: 'B', text: topic.altB },
            { code: 'C', text: topic.altC },
            { code: 'D', text: topic.altD },
            { code: 'E', text: topic.altE },
          ],
          'A'
        ),
        answer_key: 'A',
        explanation: topic.expl,
        scoring_type: 'binary',
      });
    }
  }

  return result.slice(0, 200);
}

/**
 * Builds the complete 700-question active exam package for a given field:
 * 500 Soal Umum + 200 Soal Teknis = 700 questions.
 */
export function build700ExamQuestions(
  generalList: SoalUmum[],
  technicalList: SoalTeknis[],
  fieldId: string
): (SoalUmum | SoalTeknis)[] {
  // Ensure we have 500 general questions
  const fullGeneral = generalList.length >= 500 ? generalList.slice(0, 500) : generate500GeneralQuestions(generalList);

  // Filter or generate 200 technical questions for this field
  const matchingTech = technicalList.filter((q) => q.field.toLowerCase() === fieldId.toLowerCase());
  const fullTechnical = matchingTech.length >= 200 ? matchingTech.slice(0, 200) : generate200TechnicalQuestionsForField(fieldId, technicalList);

  return [...fullGeneral, ...fullTechnical];
}
