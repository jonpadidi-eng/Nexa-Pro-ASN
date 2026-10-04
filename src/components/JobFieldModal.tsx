import React from 'react';
import {
  Shield,
  HeartHandshake,
  HeartPulse,
  Building,
  GraduationCap,
  Cpu,
  Layers,
  CheckCircle2,
  X,
  ArrowRight,
  Briefcase,
  Sparkles,
  Clock,
  BookOpen,
} from 'lucide-react';
import { AVAILABLE_JOB_FIELDS, JobField } from '../data/jobFields';

interface JobFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedField: string;
  onSelectField: (fieldId: string) => void;
}

export const JobFieldModal: React.FC<JobFieldModalProps> = ({
  isOpen,
  onClose,
  selectedField,
  onSelectField,
}) => {
  if (!isOpen) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-5 h-5 text-amber-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5 text-emerald-600" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case 'Building':
        return <Building className="w-5 h-5 text-sky-600" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-indigo-600" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-teal-600" />;
      default:
        return <Layers className="w-5 h-5 text-amber-600" />;
    }
  };

  const handlePick = (id: string) => {
    onSelectField(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-slate-900">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-100 rounded-full blur-3xl pointer-events-none opacity-60" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-sky-100 rounded-full blur-3xl pointer-events-none opacity-60" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-sm">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Pilih Bidang atau Unit Tugas Anda</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 border border-amber-200">
                  <Sparkles className="w-3 h-3 text-amber-600" /> Wajib Dipilih
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Semua bidang tetap mengerjakan <strong>500 Soal Umum</strong> ditambah <strong>200 Soal Teknis Unit</strong> (Total 700 Soal • Estimasi 4 Jam).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Field Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-5 max-h-[60vh] overflow-y-auto pr-1 relative z-10">
          {AVAILABLE_JOB_FIELDS.map((field) => {
            const isSelected = selectedField.toLowerCase() === field.id.toLowerCase();
            return (
              <button
                key={field.id}
                onClick={() => handlePick(field.id)}
                className={`flex flex-col text-left p-4 rounded-2xl border transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-amber-50/70 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                    : 'bg-slate-50/80 border-slate-200/90 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 w-full">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      {renderIcon(field.icon)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {field.shortName}
                      </div>
                      <span className="text-[10px] font-medium text-slate-500">
                        {field.badge}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                  {field.description}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-semibold text-amber-700 group-hover:translate-x-0.5 transition-transform">
                  <span>Pilih Bidang / Unit Ini</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Estimasi 700 soal: <strong>4 Jam</strong> (Dapat dipecah per subtes)</span>
          </div>
          <button
            onClick={() => handlePick('all')}
            className="text-amber-700 hover:text-amber-800 hover:underline font-bold text-xs cursor-pointer"
          >
            Lihat Semua Butir Soal &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
