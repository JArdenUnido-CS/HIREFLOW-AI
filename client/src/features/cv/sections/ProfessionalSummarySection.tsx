import { FileText } from 'lucide-react';
import type { ParsedCV } from '../CVBuilder';

interface ProfessionalSummarySectionProps {
  cv: ParsedCV;
  setCV: (cv: ParsedCV) => void;
}

export function ProfessionalSummarySection({ cv, setCV }: ProfessionalSummarySectionProps) {
  const handleChange = (value: string) => {
    setCV({ ...cv, summary: value });
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-surface-900 dark:text-white">Professional Summary</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Summary (Optional) - Brief overview of your professional background
        </label>
        <textarea
          value={cv.summary}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Experienced software engineer with 5+ years building scalable web applications. Passionate about clean code and team collaboration."
          rows={5}
          className="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-2">
          {cv.summary.length} characters • Keep it concise (2-4 sentences recommended)
        </p>
      </div>
    </div>
  );
}
