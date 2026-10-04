// scripts/generateQuestions.js
const fs = require('fs');
const path = require('path');

// 1. GENERATE 500 SOAL UMUM
console.log('Generating 500 Soal Umum...');

const kmskTopics = [
  { topic: 'Integritas & Akuntabilitas', ind: 'Kejujuran moral, transparansi, dan keteguhan menolak gratifikasi atau kompromi ilegal' },
  { topic: 'Orientasi pada Hasil', ind: 'Ketetapan mencapai target kinerja institusi dengan optimalisasi sumber daya yang efisien' },
  { topic: 'Komunikasi & Mediasi Konflik', ind: 'Penyampaian informasi asertif, empati, dan resolusi benturan kepentingan secara damai' },
  { topic: 'Pelayanan Publik Modern', ind: 'Ketanggapan merespons keluhan warga, keramahan, dan pemenuhan Standar Pelayanan Minimal' },
  { topic: 'Kerja Sama & Soliditas Tim', ind: 'Sinergi antar anggota tim yang heterogen serta menghargai kontribusi rekan sejawat' },
  { topic: 'Pengembangan Diri & Orang Lain', ind: 'Pemberian bimbingan (coaching/mentoring) dan dorongan kemandirian belajar berkelanjutan' },
  { topic: 'Mengelola Perubahan', ind: 'Kesiapan mengadopsi transformasi digital dan memfasilitasi rekan yang resisten terhadap inovasi' },
  { topic: 'Pengambilan Keputusan Etis', ind: 'Ketegasan menetapkan langkah kebijakan berbasis bukti hukum di bawah tekanan dilematis' },
  { topic: 'Perekat Bangsa & Sosio-Kultural', ind: 'Penghormatan terhadap kemajemukan suku/agama, pencegahan diskriminasi, dan wawasan kebangsaan' },
  { topic: 'Disiplin ASN & Kode Etik', ind: 'Kepatuhan penuh pada jam kerja, hierarki kedinasan, dan tata tertib aparatur sipil negara' },
];

const potTopics = [
  { topic: 'Penalaran Silogisme Kategorik', ind: 'Penarikan kesimpulan yang sah secara logika dari dua premis mayor dan minor' },
  { topic: 'Penalaran Silogisme Hipotetis / Kondisional', ind: 'Analisis sebab-akibat implikasi logis jika-maka dan modus ponens/tollens' },
  { topic: 'Deret Aritmetika & Geometri', ind: 'Identifikasi pola beda tetap dan rasio geometri pada barisan bilangan' },
  { topic: 'Deret Berseling & Bertingkat', ind: 'Penyelesaian pola kombinasi dua urutan angka yang bersilangan' },
  { topic: 'Penalaran Analitis Urutan & Posisi', ind: 'Penataan jadwal kegiatan, peringkat nilai, dan posisi duduk bersyarat' },
  { topic: 'Penalaran Matriks & Aljabar Aplikatif', ind: 'Perhitungan matematis cepat untuk perbandingan proporsi dan tarif pelayanan' },
];

const ldTopics = [
  { topic: 'Arsitektur SPBE & Keterpaduan Data', ind: 'Interoperabilitas sistem dan bagi pakai data melalui API nasional Satu Data Indonesia' },
  { topic: 'Keamanan Siber & Mitigasi Ransomware', ind: 'Protokol penanganan insiden CSIRT, isolasi jaringan, dan pengamanan RAM forensik' },
  { topic: 'Pelindungan Data Pribadi (UU PDP No. 27/2022)', ind: 'Kewajiban pengendali data menjaga kerahasiaan NIK dan data sensitif masyarakat' },
  { topic: 'Etika Digital & Netiket ASN di Medsos', ind: 'Larangan menyebarkan hoaks, netralitas politik ASN, dan menjaga kehormatan institusi' },
  { topic: 'Tanda Tangan Elektronik & Sertifikat Digital (BSrE)', ind: 'Penggunaan TTE tersertifikasi untuk legalitas surat dinas elektronik pada aplikasi SRIKANDI' },
];

const pkTopics = [
  { topic: 'Profil RIASEC: Realistic vs Artistic', ind: 'Preferensi kerja perakitan mekanis presisi (R) vs estetika rancang grafis (A)' },
  { topic: 'Profil RIASEC: Investigative vs Enterprising', ind: 'Kecenderungan riset analisis data mendalam (I) vs negosiasi dan diplomasi kepemimpinan (E)' },
  { topic: 'Profil RIASEC: Social vs Conventional', ind: 'Orientasi empati pemberdayaan warga (S) vs kepatuhan pencatatan arsip dan pembukuan teratur (C)' },
];

const generalQuestions = [];

for (let i = 1; i <= 500; i++) {
  const pad = String(i).padStart(3, '0');
  const batchNum = Math.ceil(i / 100);
  
  if (i <= 205) {
    // KM-SK (1 - 205)
    const t = kmskTopics[(i - 1) % kmskTopics.length];
    generalQuestions.push({
      id: `UM-${pad}`,
      subtest: 'KM-SK',
      subtest_label: 'KM-SK: Manajerial & Sosio-Kultural',
      topic: t.topic,
      competency_indicator: t.ind,
      question: `[Soal No. ${i} - Batch ${batchNum}] Di lingkungan unit kerja Anda, terjadi situasi dilematis kedinasan terkait ${t.topic.toLowerCase()}. Seorang pegawai senior meminta toleransi pengecualian prosedur dengan alasan mendesak, padahal regulasi SOP yang berlaku menegaskan kepatuhan tanpa syarat. Sikap tindakan yang paling tepat dan profesional Anda ambil adalah...`,
      options: [
        { code: 'A', text: 'Menjelaskan secara santun namun tegas bahwa prosedur SOP wajib dipatuhi demi akuntabilitas dinas, sambil memberikan arahan solusi legal yang tidak melanggar aturan.', score: 5 },
        { code: 'B', text: 'Melaporkan langsung permintaan senior tersebut kepada pimpinan unit kerja untuk meminta arahan resmi sebelum mengambil keputusan.', score: 4 },
        { code: 'C', text: 'Meminta pendapat musyawarah dari rekan kerja satu ruangan lainnya guna menjaga kekompakan dan iklim kerja kondusif.', score: 3 },
        { code: 'D', text: 'Memberikan izin toleransi satu kali saja dengan catatan agar tidak diulangi lagi di masa depan.', score: 2 },
        { code: 'E', text: 'Menolak secara keras di hadapan umum dan menegur pegawai tersebut agar tidak meminta dispensasi aturan.', score: 1 }
      ],
      answer_key: 'A',
      explanation: `Standar Kompetensi ASN PermenPAN-RB No. 38/2017: Opsi A menunjukkan level kompetensi tertinggi (Skor 5) karena mengintegrasikan ketegasan memegang teguh regulasi (Integritas) dengan kemampuan komunikasi asertif dan solusi edukatif konstruktif.`,
      scoring_type: 'weighted'
    });
  } else if (i <= 325) {
    // POT (206 - 325)
    const t = potTopics[(i - 206) % potTopics.length];
    const n1 = (i * 3) % 17 + 2;
    const n2 = n1 * 2;
    const n3 = n2 + 4;
    const n4 = n3 * 2;
    const n5 = n4 + 4;
    const nextVal = n5 * 2;
    
    generalQuestions.push({
      id: `UM-${pad}`,
      subtest: 'POT',
      subtest_label: 'POT: Uji Potensi & Logika',
      topic: t.topic,
      competency_indicator: t.ind,
      question: `[Soal No. ${i} - Batch ${batchNum}] Perhatikan barisan logika dan premis penalaran berikut:\nJika semua aparatur sipil negara di unit kerja patuh pada aturan ${t.topic.toLowerCase()}, maka indeks reformasi birokrasi meningkat tajam.\nDiketahui bahwa pola angka capaian kinerja triwulan membentuk barisan: ${n1}, ${n2}, ${n3}, ${n4}, ${n5}, ...\nAngka kelanjutan pola berikutnya serta kesimpulan logika yang sah adalah...`,
      options: [
        { code: 'A', text: `${nextVal} dan terbukti bahwa reformasi birokrasi meningkat karena aparatur patuh aturan.`, score: 5 },
        { code: 'B', text: `${nextVal + 2} dan belum dapat disimpulkan status reformasi birokrasi.`, score: 0 },
        { code: 'C', text: `${nextVal - 4} dan aparatur tidak mematuhi aturan kedinasan.`, score: 0 },
        { code: 'D', text: `${nextVal + 6} dan reformasi birokrasi mengalami penurunan.`, score: 0 },
        { code: 'E', text: `${nextVal - 2} dan tidak ada hubungan sebab akibat yang valid.`, score: 0 }
      ],
      answer_key: 'A',
      explanation: `Penalaran Matematis & Silogisme: Pola barisan bilangan adalah bergantian dikali 2 lalu ditambah 4 (x2, +4). Suku setelah ${n5} adalah ${n5} x 2 = ${nextVal}. Berdasarkan modus ponens premis, konsekuen sah bernilai benar.`,
      scoring_type: 'binary'
    });
  } else if (i <= 420) {
    // LD (326 - 420)
    const t = ldTopics[(i - 326) % ldTopics.length];
    generalQuestions.push({
      id: `UM-${pad}`,
      subtest: 'LD',
      subtest_label: 'LD: Literasi Digital & SPBE',
      topic: t.topic,
      competency_indicator: t.ind,
      question: `[Soal No. ${i} - Batch ${batchNum}] Dalam penerapan Sistem Pemerintahan Berbasis Elektronik (SPBE), seorang staf unit mendapati insiden keamanan atau transmisi data terkait ${t.topic.toLowerCase()}. Langkah mitigasi teknis dan kepatuhan standar yang wajib diprioritaskan pertama kali adalah...`,
      options: [
        { code: 'A', text: 'Melakukan penanganan sesuai SOP resmi CSIRT/BSSN, mengamankan log akses serta bukti digital tanpa mematikan memori, dan segera berkoordinasi dengan pengelola keamanan informasi.', score: 5 },
        { code: 'B', text: 'Menghapus seluruh file riwayat browsing dan me-restart perangkat secara mandiri tanpa membuat laporan insiden.', score: 0 },
        { code: 'C', text: 'Menyebarkan informasi dugaan insiden ke grup obrolan media sosial umum sebelum diverifikasi.', score: 0 },
        { code: 'D', text: 'Membiarkan sistem tetap berjalan tanpa tindakan penahanan sambil menunggu instruksi dinas pekan depan.', score: 0 },
        { code: 'E', text: 'Mematikan paksa aliran listrik gedung agar seluruh server mati mendadak.', score: 0 }
      ],
      answer_key: 'A',
      explanation: `Protokol Tanggap Insiden Keamanan Informasi SPBE: Penanganan pertama adalah isolasi logis terarah, pemeliharaan bukti digital (*digital forensics*), dan pelaporan ke Unit Pengelola TIK/CSIRT sesuai amanat regulasi BSSN.`,
      scoring_type: 'binary'
    });
  } else {
    // PK (421 - 500)
    const t = pkTopics[(i - 421) % pkTopics.length];
    generalQuestions.push({
      id: `UM-${pad}`,
      subtest: 'PK',
      subtest_label: 'PK: Preferensi Karir RIASEC',
      topic: t.topic,
      competency_indicator: t.ind,
      question: `[Soal No. ${i} - Batch ${batchNum}] Dalam penugasan kedinasan sehari-hari, manakah jenis aktivitas kerja yang lebih mencerminkan minat dominan dan gaya kerja profesional Anda secara konsisten?`,
      options: [
        { code: 'A', text: 'Melakukan telaah data teknis, investigasi bukti operasional, dan merumuskan rekomendasi pemecahan masalah secara terstruktur dan presisi.', score: 5 },
        { code: 'B', text: 'Memimpin presentasi publik, merancang infografis interaktif, dan mengeksplorasi ide-ide desain komunikasi visual yang kreatif.', score: 4 },
        { code: 'C', text: 'Mengorganisir pendampingan sosial warga dan membina jejaring kerja sama lintas kelompok masyarakat.', score: 3 },
        { code: 'D', text: 'Mengelola jadwal pengarsipan administratif berkas dinas secara tertib dan berulang.', score: 3 },
        { code: 'E', text: 'Mengawasi perakitan sarana mekanis dan pengecekan fisik perangkat keras di lapangan.', score: 3 }
      ],
      answer_key: 'A',
      explanation: `Profil Minat Kerja RIASEC: Pilihan ini menunjukkan konsistensi orientasi kerja analitis dan terstruktur yang sangat esensial bagi profesional aparatur sipil negara.`,
      scoring_type: 'riasec'
    });
  }
}

const genFileContent = `import { SoalUmum } from '../types/asn';\n\nexport const fullGeneralQuestions500: SoalUmum[] = ${JSON.stringify(generalQuestions, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '../src/data/generalQuestions500.ts'), genFileContent);
console.log('Successfully generated 500 Soal Umum in src/data/generalQuestions500.ts');

// 2. GENERATE 200 SOAL TEKNIS PER BIDANG / UNIT
console.log('Generating 200 Soal Teknis per Bidang / Unit...');

const fieldsConfig = [
  {
    id: 'auditor',
    label: 'Auditor & Pengawas (Inspektorat / APIP & PPUPD)',
    topics: [
      { topic: 'Standar Audit Intern Pemerintah Indonesia (SAIPI)', ind: 'Kepatuhan kode etik independensi dan objektivitas penugasan audit APIP' },
      { topic: 'Sistem Pengendalian Intern Pemerintah (PP 60/2008)', ind: 'Evaluasi 5 unsur SPIP terintegrasi COSO dalam tata kelola instansi daerah' },
      { topic: 'Probity Audit Pengadaan Barang dan Jasa', ind: 'Pengawasan real-time proses PBJ dari perencanaan, tender, hingga serah terima hasil' },
      { topic: 'Audit Kinerja 3E (Ekonomis, Efisiensi, Efektivitas)', ind: 'Pengujian indikator input, output, dan ketercapaian outcome belanja APBD' },
      { topic: 'Three Lines Model dalam Pengawasan Daerah', ind: 'Penegasan peran lini ketiga asurans independen Inspektorat di bawah Kepala Daerah' },
      { topic: 'Audit Investigatif & Perhitungan Kerugian Negara', ind: 'Pengumpulan bukti forensik pembuktian fraud dan tindak pidana korupsi' },
      { topic: 'Tuntutan Perbendaharaan dan Tuntutan Ganti Rugi (TP-TGR)', ind: 'Mekanisme sidang MP-TGR pemulihan kerugian keuangan dan aset barang daerah' },
      { topic: 'Reviu Laporan Keuangan Pemerintah Daerah (LKPD)', ind: 'Pemberian keyakinan memadai kesesuaian laporan keuangan dengan Standar Akuntansi Pemerintahan (SAP)' },
      { topic: 'Unit Pengendalian Gratifikasi (UPG) & Anti Penyuapan', ind: 'Penerapan batas pelaporan 30 hari kerja KPK dan mitigasi konflik kepentingan' },
      { topic: 'Evaluasi Akuntabilitas Kinerja Instansi Pemerintah (AKIP/LAKIP)', ind: 'Penilaian keselarasan cascading target Renstra, IKU, dan Perjanjian Kinerja OPD' }
    ]
  },
  {
    id: 'sosial',
    label: 'Dinas Sosial & Penyelenggaraan Kesejahteraan Sosial (Peksos / TKSK)',
    topics: [
      { topic: 'Dasar Hukum & Regulasi Kesos (UU 11/2009 & UU 13/2011)', ind: 'Penyelenggaraan kesos dan penanganan fakir miskin berbasis hak martabat manusia' },
      { topic: 'Basis Data Terpadu DTKS & Aplikasi SIKS-NG', ind: 'Verifikasi validasi data kemiskinan berbasis musyawarah desa/kelurahan (Musdes)' },
      { topic: 'Program Keluarga Harapan (PKH) & P2K2/FDS', ind: 'Edukasi peningkatan kemampuan keluarga dan percepatan graduasi mandiri KPM' },
      { topic: 'Sistem Layanan dan Rujukan Terpadu (SLRT) & Puskesos', ind: 'Penyelenggaraan posko aduan dan rujukan masalah sosial terpadu di desa' },
      { topic: 'Taruna Siaga Bencana (TAGANA) & Dapur Umum Lapangan (Dumlap)', ind: 'SOP penyediaan permakanan higienis berstandar gizi 3x sehari saat tanggap bencana' },
      { topic: 'Peradilan Pidana Anak (UU 11/2012) & Peran Pekerja Sosial', ind: 'Penyusunan Penelitian Kemasyarakatan (Litmas) dan musyawarah Diversi ABH' },
      { topic: 'Hak Aksesibilitas Penyandang Disabilitas (UU 8/2016)', ind: 'Penyediaan sarana ramp, guiding block, toilet ramah difabel, dan alat bantu mobilitas' },
      { topic: 'Rehabilitasi Sosial Pemerlu Pelayanan Kesejahteraan Sosial (PPKS)', ind: 'Standar rehabilitasi vokasional dan psikososial lansia telantar, ODGJ, dan anak jalanan' },
      { topic: 'Program Bantuan Pangan Nontunai (BPNT) & Sembako', ind: 'Pengawasan penyaluran bansos tepat sasaran, tepat jumlah, tepat waktu, dan tepat kualitas' },
      { topic: 'Pemberdayaan Karang Taruna & Wahana Kesejahteraan Sosial', ind: 'Pembinaan potensi sumber kesejahteraan sosial (PSKS) berbasis partisipasi pemuda desa' }
    ]
  },
  {
    id: 'kesehatan',
    label: 'Tenaga Kesehatan & Medis (RSUD / Puskesmas / Dinkes)',
    topics: [
      { topic: 'Sasaran Keselamatan Pasien (SKP 1-6)', ind: 'Ketepatan identifikasi minimal dua identitas dan pencegahan risiko jatuh/obat high alert' },
      { topic: 'Triase Instalasi Gawat Darurat (Merah, Kuning, Hijau, Hitam)', ind: 'Ketepatan penentuan prioritas kegawatdaruratan ancaman Airway, Breathing, Circulation' },
      { topic: 'Pencegahan dan Pengendalian Infeksi (PPI)', ind: 'Penerapan 5 momen cuci tangan WHO dan kewaspadaan standar isolasi transmisi' },
      { topic: 'Standar Pelayanan Minimal (SPM) Kesehatan Daerah', ind: 'Cakupan pelayanan kesehatan ibu hamil, balita stunting, hipertensi, dan TB paru' },
      { topic: 'Sistem Rujukan Terpadu (SISRUTE) & PSC 119', ind: 'Mekanisme transfer pasien darurat faskes tingkat pertama ke RS rujukan' }
    ]
  },
  {
    id: 'administrasi',
    label: 'Administrasi Publik & Analis Kebijakan',
    topics: [
      { topic: 'Tata Naskah Dinas Instansi Pemerintah (PermenPAN-RB)', ind: 'Format naskah keputusan (SK), nota dinas, surat edaran, dan tata kearsipan kedinasan' },
      { topic: 'Pengelolaan Arsip Dinamis Aktif & Inaktif (UU 43/2009)', ind: 'Jadwal Retensi Arsip (JRA), pemindahan arsip inaktif, dan pemusnahan arsip legal' },
      { topic: 'Standar Pelayanan Publik (UU 25/2009)', ind: 'Penyusunan Maklumat Pelayanan, Survei Kepuasan Masyarakat (SKM), dan pengelolaan pengaduan' },
      { topic: 'Manajemen Talenta & Sistem Merit ASN (UU 20/2023)', ind: 'Penilaian kinerja pegawai berbasis kuadran talenta, kompetensi, dan kinerja objektif' }
    ]
  },
  {
    id: 'pendidikan',
    label: 'Pendidikan & Tenaga Pendidik (Guru / Pengajar)',
    topics: [
      { topic: 'Pembelajaran Berdiferensiasi Kurikulum Merdeka', ind: 'Penyesuaian konten, proses, dan produk sesuai tingkat kesiapan belajar (readiness) murid' },
      { topic: 'Asesmen Diagnostik, Formatif, dan Sumatif', ind: 'Pemberian umpan balik bermakna (assessment for learning) perbaikan proses pembelajaran' },
      { topic: 'Pendidikan Inklusif & Akomodasi Pembelajaran', ind: 'Penyusunan Program Pembelajaran Individual (PPI) bagi peserta didik berkebutuhan khusus' },
      { topic: 'Teori Konstruktivisme & Pendekatan Deep Learning', ind: 'Penerapan scaffolding Vygotsky dan pembelajaran berbasis penemuan (Inquiry-Based)' }
    ]
  },
  {
    id: 'teknologi_informasi',
    label: 'Pranata Komputer & SPBE (Teknologi Informasi)',
    topics: [
      { topic: 'Arsitektur SPBE & Domain Layanan Pemerintah (Perpres 95/2018)', ind: 'Integrasi sistem berbasis layanan microservices dan portal pelayanan publik terpadu' },
      { topic: 'Keamanan Siber CSIRT & Penanganan Ransomware', ind: 'Protokol penahanan lateral movement, preservasi memory dump, dan isolasi jaringan VLAN' },
      { topic: 'Interoperabilitas RESTful API & Satu Data Indonesia', ind: 'Standardisasi payload JSON, kode referensi data induk, dan pertukaran data web service' },
      { topic: 'Backup & Disaster Recovery Center (DRC)', ind: 'Penerapan strategi cadangan data 3-2-1 dan failover cluster server layanan publik dinas' }
    ]
  }
];

const allTechnicalQuestions = [];

fieldsConfig.forEach((cfg) => {
  for (let i = 1; i <= 200; i++) {
    const pad = String(i).padStart(3, '0');
    const t = cfg.topics[(i - 1) % cfg.topics.length];
    
    allTechnicalQuestions.push({
      id: `TK-${cfg.id.toUpperCase().slice(0, 3)}-${pad}`,
      field: cfg.id,
      field_label: cfg.label,
      topic: t.topic,
      competency_indicator: t.ind,
      question: `[Soal No. ${i} - ${cfg.label}] Dalam pelaksanaan tugas operasional pada unit ${cfg.label}, seorang petugas/pejabat fungsional dihadapkan pada kasus teknis terkait ${t.topic.toLowerCase()}. Berdasarkan ketentuan regulasi, standar operasional prosedur (SOP), dan kode etik yang berlaku, tindakan teknis yang paling tepat dan sah secara hukum adalah...`,
      options: [
        { code: 'A', text: `Melaksanakan tindakan sesuai ketentuan standar operasional prosedur (${t.topic}) dengan mendokumentasikan bukti kepatuhan yang akuntabel dan berkoordinasi secara profesional.`, score: 5 },
        { code: 'B', text: 'Mengabaikan prosedur teknis karena dianggap memperlambat target penyelesaian pekerjaan di lapangan.', score: 0 },
        { code: 'C', text: 'Menyerahkan sepenuhnya penyelesaian masalah kepada pihak ketiga tanpa melakukan verifikasi mandiri.', score: 0 },
        { code: 'D', text: 'Menunda penanganan sampai batas waktu yang tidak ditentukan tanpa memberikan kejelasan kepada pemangku kepentingan.', score: 0 },
        { code: 'E', text: 'Mengubah data pencatatan teknis agar terlihat memenuhi standar tanpa dasar pengujian riil.', score: 0 }
      ],
      answer_key: 'A',
      explanation: `Landasan Regulasi & Prosedur Teknis: Sesuai dengan pedoman kompetensi ${cfg.label}, tindakan pada opsi A mencerminkan kepatuhan penuh terhadap standar mutu, integritas profesional, dan mitigasi risiko mal-administrasi.`,
      scoring_type: 'binary'
    });
  }
});

const techFileContent = `import { SoalTeknis } from '../types/asn';\n\nexport const fullTechnicalQuestions: SoalTeknis[] = ${JSON.stringify(allTechnicalQuestions, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '../src/data/technicalQuestions200.ts'), techFileContent);
console.log(`Successfully generated ${allTechnicalQuestions.length} Soal Teknis across 6 units in src/data/technicalQuestions200.ts`);
