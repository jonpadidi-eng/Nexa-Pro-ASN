export interface JobField {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  description: string;
  icon: string;
}

export const AVAILABLE_JOB_FIELDS: JobField[] = [
  {
    id: 'auditor',
    name: 'Auditor & Pengawas (Inspektorat / APIP & PPUPD)',
    shortName: 'Inspektorat / Auditor',
    badge: 'Unit APIP & PPUPD',
    description: 'Pengawasan intern pemerintah, audit 3E, SPIP, probity audit, TP-TGR, dan pencegahan fraud.',
    icon: 'Shield',
  },
  {
    id: 'sosial',
    name: 'Dinas Sosial & Penyelenggaraan Kesejahteraan Sosial (Peksos / TKSK)',
    shortName: 'Dinas Sosial',
    badge: 'Unit Kesos & DTKS',
    description: 'Penanganan fakir miskin, DTKS/SIKS-NG, bansos PKH/BPNT, Tagana, perlindungan anak (ABH), dan disabilitas.',
    icon: 'HeartHandshake',
  },
  {
    id: 'kesehatan',
    name: 'Tenaga Kesehatan & Medis (RSUD / Puskesmas / Dinkes)',
    shortName: 'Kesehatan & Medis',
    badge: 'Unit Medis / RSUD',
    description: 'Sasaran Keselamatan Pasien (SKP), triase IGD, etika profesi medis, dan Standar Pelayanan Minimal kesehatan.',
    icon: 'HeartPulse',
  },
  {
    id: 'administrasi',
    name: 'Administrasi Publik & Analis Kebijakan (Sekretariat / Bappeda)',
    shortName: 'Administrasi & Kebijakan',
    badge: 'Tata Kelola & ASN',
    description: 'Tata Naskah Dinas, kearsipan dinamis, manajemen ASN berbasis meritokrasi, dan standar pelayanan publik.',
    icon: 'Building',
  },
  {
    id: 'pendidikan',
    name: 'Pendidikan & Tenaga Pendidik (Dinas Pendidikan / Sekolah)',
    shortName: 'Pendidikan & Guru',
    badge: 'Unit Sekolah / Dikdas',
    description: 'Pembelajaran berdiferensiasi, asesmen diagnostik/formatif, pedagogik, dan psikologi pendidikan.',
    icon: 'GraduationCap',
  },
  {
    id: 'teknologi_informasi',
    name: 'Pranata Komputer & SPBE (Diskominfo / Pusat Data)',
    shortName: 'TI, Kominfo & SPBE',
    badge: 'Unit Siber & SPBE',
    description: 'Arsitektur SPBE, keamanan siber CSIRT, penanganan insiden malware/ransomware, dan interoperabilitas API.',
    icon: 'Cpu',
  },
  {
    id: 'all',
    name: 'Semua Bidang & Unit Tugas (Kurikulum Lengkap 700 Soal)',
    shortName: 'Semua Bidang / Unit',
    badge: '700 Soal (4 Jam)',
    description: 'Kurikulum lengkap: 500 Soal Umum standar BKN ditambah 200 Soal Teknis spesifik per bidang tugas.',
    icon: 'Layers',
  },
];

export const getJobFieldById = (id: string): JobField => {
  return AVAILABLE_JOB_FIELDS.find((f) => f.id.toLowerCase() === id.toLowerCase()) || AVAILABLE_JOB_FIELDS[0];
};
