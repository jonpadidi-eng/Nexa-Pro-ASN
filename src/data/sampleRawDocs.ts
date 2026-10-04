export interface SampleDoc {
  id: string;
  name: string;
  category: 'modul' | 'soal_umum' | 'soal_teknis' | 'campuran';
  description: string;
  content: string;
}

export const sampleDocuments: SampleDoc[] = [
  {
    id: 'sample-modul-ajar',
    name: 'Dokumen Modul Ajar: Integritas & Pelayanan Publik Modern',
    category: 'modul',
    description: 'Format dokumen materi pokok, strategi menjawab, indikator BKN, dan kriteria pola skor.',
    content: `# MODUL AJAR: PENGUATAN INTEGRITAS & TRANSFORMASI PELAYANAN PUBLIK ASN

Materi Pokok:
- Internalisasi Nilai BerAKHLAK (Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif)
- Tata Kelola Anti-Korupsi, Penolakan Gratifikasi, dan Pengendalian Konflik Kepentingan
- Pengambilan Keputusan Etis pada Kondisi Dilematis Birokrasi
- Manajemen Pelayanan Prima Berbasis Empati dan Standar Pelayanan Minimal (SPM)

Poin Strategi & Trik Menjawab:
- Prioritaskan tindakan yang menunjukkan kemandirian etika moral tinggi tanpa menunggu komando jika sudah diatur dalam SOP.
- Dalam situasi benturan kepentingan keluarga/teman vs dinas, pilih opsi yang memisahkan urusan personal secara lugas.
- Hindari opsi jawaban yang membiarkan atau berkompromi dengan penyimpangan kecil demi popularitas kelompok.
- Pilih solusi win-win yang tetap mengedepankan transparansi anggaran dan akuntabilitas publik.

Indikator Utama Kompetensi:
- Integritas: Konsistensi antara tindakan dengan norma etika birokrasi dan hukum.
- Pelayanan Publik: Kecepatan, keramahan, keadilan, dan ketepatan pemenuhan hak masyarakat pengguna layanan.
- Mengelola Perubahan: Kesiapan memimpin adaptasi sistem kerja digital dan meninggalkan budaya lambat.

Pola Jawaban Terbaik & Bobot Nilai:
- Pola Skor 5: Tindakan proaktif, berani menolak suap/gratifikasi, memberikan alternatif legal, dan melapor ke UPG/atasan.
- Pola Skor 4: Mematuhi aturan namun bersikap pasif atau menunggu instruksi atasan secara penuh.
- Pola Skor 3: Bersikap netral namun tidak berinisiatif menyelesaikan masalah.
- Pola Skor 2: Mentoleransi kesalahan kecil demi kebersamaan tim.
- Pola Skor 1: Menyalahgunakan wewenang atau menerima kompromi ilegal.
`,
  },
  {
    id: 'sample-soal-umum',
    name: 'Kumpulan Soal Umum (KM-SK, POT, LD, PK)',
    category: 'soal_umum',
    description: 'Kumpulan butir soal 4 subtes Pro ASN lengkap dengan opsi A-E, skor, kunci, dan pembahasan.',
    content: `1. Anda bertugas di loket pelayanan perizinan. Seorang pemohon yang izinnya ditolak karena dokumen AMDAL tidak lengkap mendatangi Anda dan marah-marah di hadapan antrean warga lainnya, menuduh kantor Anda sengaja mempersulit. Sikap yang Anda ambil adalah:
A. Mendengarkan dengan tenang tanpa memotong keluhannya, mengajaknya ke ruang konsultasi khusus agar antrean tetap kondusif, lalu menjelaskan secara detail dokumen AMDAL yang kurang disertai panduan pengurusannya (Skor 5)
B. Menjelaskan di loket dengan suara lantang bahwa penolakan sudah sesuai peraturan agar warga lain paham (Skor 2)
C. Memanggil petugas keamanan untuk langsung membawa pemohon tersebut keluar dari gedung pelayanan (Skor 3)
D. Mengabaikan amarahnya dan melanjutkan memanggil nomor antrean berikutnya (Skor 1)
E. Memberitahu atasan Anda dan meminta atasan yang menghadapi pemohon yang emosional tersebut (Skor 4)
Kunci Jawaban: A
Pembahasan: Indikator Pelayanan Publik & Pengendalian Emosi: Menjaga ketenangan publik, memindahkan interaksi ke ruang mediasi/konsultasi, serta memberikan solusi konkret edukatif meraih poin tertinggi 5.

2. Semua aparatur pemerintah yang jujur tidak menerima gratifikasi.
Sebagian bendahara instansi menerima hadiah dari penyedia jasa.
Kesimpulan yang sah secara logika adalah:
A. Sebagian bendahara instansi bukan aparatur pemerintah yang jujur
B. Semua bendahara instansi jujur
C. Tidak ada bendahara instansi yang menerima hadiah
D. Semua penyedia jasa memberikan hadiah kepada aparatur pemerintah
E. Sebagian aparatur pemerintah menerima gratifikasi secara sah
Kunci: A
Pembahasan: Menggunakan silogisme kategorik: Premis 1 menyatakan P -> ~Q. Premis 2 menyatakan sebagian R adalah Q. Maka kesimpulan validnya adalah sebagian R bukan P (sebagian bendahara bukan aparatur pemerintah yang jujur).

3. Anda menerima tautan di grup dinas yang mengklaim bantuan dana insentif ASN dengan meminta login akun Google dinas dan nomor OTP yang masuk ke SMS. Langkah literasi digital yang tepat:
A. Tidak mengklik tautan, memperingatkan anggota grup tentang bahaya phishing pencurian kredensial akun dinas, dan melaporkannya ke pranata komputer kantor
B. Mencoba login menggunakan password palsu untuk mengetes apakah situs tersebut penipu
C. Mengisi data karena penasaran dengan nominal insentifnya
D. Meneruskan tautan ke grup dinas daerah tetangga
E. Menyimpan tautan tersebut untuk dibuka di komputer kantor
Kunci: A
Pembahasan: Mengamankan akun dinas dari bahaya social engineering dan credential harvesting (phishing) adalah kompetensi utama Digital Safety ASN.

4. Dalam tes minat karir RIASEC, kegiatan manakah yang paling Anda minati jika ditempatkan pada jabatan Fungsional Perencana Ahli Pertama?
A. Menganalisis data tren pembangunan, membuat proyeksi statistik ekonomi daerah, dan menyusun dokumen rencana pembangunan jangka menengah (Skor 5)
B. Mengorganisir acara panggung hiburan festival rakyat kota (Skor 3)
C. Memperbaiki mesin genset dan kelistrikan di gedung kantor (Skor 2)
D. Mengetik surat undangan rapat berkali-kali setiap hari (Skor 2)
E. Melakukan demonstrasi mogok kerja menuntut kenaikan anggaran (Skor 1)
Kunci: A
Pembahasan: Jabatan analis/perencana sangat sesuai dengan tipologi Investigative (I) dan Conventional (C) yang bertumpu pada kajian data dan proyeksi terukur.
`,
  },
  {
    id: 'sample-soal-teknis',
    name: 'Kumpulan Soal Teknis (Kesehatan, Pendidikan, IT, Administrasi)',
    category: 'soal_teknis',
    description: 'Soal teknis spesifik bidang profesi ASN dengan pembahasan standar kompetensi jabatan.',
    content: `1. [Bidang: Pendidikan]
Guru mengamati beberapa peserta didik mengalami kesulitan membaca teks panjang dalam pelajaran sains. Guru kemudian menyiapkan alternatif berupa infografis visual dan rekaman audio penjelasan konsep untuk kelompok tersebut. Strategi pembelajaran ini disebut:
A. Pembelajaran Berdiferensiasi pada aspek konten dan proses
B. Pembelajaran Klasikal Seragam
C. Asesmen Sumatif Terstandar
D. Metode Ceramah Konvensional
E. Evaluasi Remedial Hukuman
Kunci: A
Pembahasan: Menyediakan materi dalam berbagai modalitas belajar (visual, auditori, infografis) adalah wujud penerapan diferensiasi konten dan proses untuk mengakomodasi keberagaman kesiapan belajar murid.

2. [Bidang: Kesehatan]
Prinsip 5 Momen Cuci Tangan (*5 Moments for Hand Hygiene*) menurut Organisasi Kesehatan Dunia (WHO) yang wajib diterapkan oleh tenaga kesehatan di fasilitas pelayanan kesehatan meliputi waktu:
A. Sebelum menyentuh pasien, sebelum tindakan aseptik, setelah terkena cairan tubuh pasien, setelah menyentuh pasien, dan setelah menyentuh lingkungan sekitar pasien
B. Hanya setelah selesai memeriksa seluruh pasien di bangsal
C. Hanya sebelum menyentuh pasien dan setelah melepas sarung tangan
D. Setiap kali pergantian shift kerja tanpa memandang kontak pasien
E. Sebelum sarapan dan setelah jam istirahat siang
Kunci: A
Pembahasan: WHO 5 Moments for Hand Hygiene adalah standar baku pencegahan dan pengendalian infeksi (PPI) nosokomial di rumah sakit dan puskesmas.

3. [Bidang: Teknologi Informasi]
Dalam implementasi Arsitektur SPBE Nasional, prinsip pemanfaatan pusat data nasional (Government Cloud) bertujuan untuk:
A. Meningkatkan efisiensi belanja infrastruktur TIK, menjamin standar keamanan data nasional, dan mempermudah interoperabilitas data antar instansi
B. Membuat setiap instansi wajib membeli server fisik sendiri di kantor masing-masing
C. Menghapus seluruh arsip digital lama
D. Mengisolasi jaringan pemerintah agar tidak bisa diakses publik
E. Menyerahkan seluruh data negara ke server swasta tanpa enkripsi
Kunci: A
Pembahasan: Pusat Data Nasional (PDN) SPBE mencegah pemborosan pengadaan server di tiap dinas dan memastikan standar keamanan informasi tersentralisasi sesuai regulasi BSSN dan Kemenkominfo.
`,
  },
];
