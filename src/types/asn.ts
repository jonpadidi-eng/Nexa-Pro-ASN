export type SubtestType = 'KM-SK' | 'POT' | 'LD' | 'PK';

export type ScoringType = 'weighted' | 'binary' | 'riasec';

export interface AnswerPattern {
  pattern_name: string;
  description: string;
  score_weight?: string | number;
}

export interface ModulAjar {
  id: string;
  category: 'KM-SK' | 'POT' | 'LD' | 'PK' | 'TEKNIS' | 'UMUM';
  title: string;
  core_topics: string[];
  strategy_points: string[];
  key_indicators: string[];
  answer_patterns: AnswerPattern[];
  content_markdown?: string;
}

export interface QuestionOption {
  code: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  score: number; // 1-5 for KM-SK, 0 or 5 for POT/Teknis
}

export interface SoalUmum {
  id: string;
  subtest: SubtestType;
  subtest_label: string;
  topic: string;
  competency_indicator: string;
  question: string;
  options: QuestionOption[];
  answer_key: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  scoring_type: ScoringType;
  batch_code?: string;
  is_new_upload?: boolean;
  uploaded_at?: string;
}

export interface SoalTeknis {
  id: string;
  field: string; // e.g. "kesehatan", "pendidikan", "administrasi", "teknologi_informasi", "hukum", "keuangan"
  field_label: string;
  topic: string;
  competency_indicator: string;
  question: string;
  options: QuestionOption[];
  answer_key: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  scoring_type: ScoringType;
  batch_code?: string;
  is_new_upload?: boolean;
  uploaded_at?: string;
}

export interface PackageMetadata {
  title: string;
  description?: string;
  target?: string;
  publisher?: string;
  total_modules?: number;
  total_general_questions?: number;
  total_technical_questions?: number;
}

export interface ProAsnDataPackage {
  version: string;
  last_updated: string;
  meta: PackageMetadata;
  modules: ModulAjar[];
  general_questions: SoalUmum[];
  technical_questions: SoalTeknis[];
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  location: string;
  message: string;
}

export interface ValidationReport {
  isValid: boolean;
  hasVersion: boolean;
  hasLastUpdated: boolean;
  version: string;
  lastUpdated: string;
  issues: ValidationIssue[];
  stats: {
    totalModules: number;
    totalGeneralQuestions: number;
    subtestBreakdown: Record<string, number>;
    totalTechnicalQuestions: number;
    fieldBreakdown: Record<string, number>;
  };
}
