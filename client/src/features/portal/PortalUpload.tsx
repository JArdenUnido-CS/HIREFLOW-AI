import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageTransition } from '@/components/shared/PageTransition';
import { cn } from '@/lib/utils';

export function PortalUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'done'>('idle');

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setStatus('uploading');
    setProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setStatus('parsing');
        setTimeout(() => setStatus('done'), 1800);
      }
      setProgress(Math.min(p, 100));
    }, 150);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Resume</h1>
          <p className="text-surface-500 mt-1">Upload or update your resume to improve your matches</p>
        </div>

        {/* Current resume status */}
        <Card padding="lg" className="bg-gradient-to-br from-brand-50/50 to-violet-50/50 dark:from-brand-900/10 dark:to-violet-900/10 border-brand-200/30 dark:border-brand-800/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-surface-800 flex items-center justify-center shadow-sm">
              <FileText size={22} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
                {status === 'done' || (file === null && status === 'idle') ? 'Resume_EmilyZhang_2026.pdf' : file?.name}
              </p>
              <p className="text-xs text-surface-500">Last updated July 20, 2026 · Analyzed by AI</p>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </Card>

        {/* Upload new */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200',
            isDragging
              ? 'border-brand-400 bg-brand-50/50 dark:bg-brand-900/10'
              : 'border-surface-300 dark:border-surface-700 hover:border-brand-300 dark:hover:border-brand-700'
          )}
        >
          {status === 'idle' && (
            <>
              <Upload size={36} className="mx-auto text-surface-400 mb-3" />
              <h3 className="text-base font-semibold text-surface-700 dark:text-surface-300 mb-1">
                Upload a new resume
              </h3>
              <p className="text-sm text-surface-500 mb-5">
                Drag and drop or browse to replace your current resume
              </p>
              <label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="sr-only"
                />
                <Button variant="primary" className="cursor-pointer" onClick={() => {}}>
                  Choose File
                </Button>
              </label>
              <p className="text-xs text-surface-400 mt-3">PDF, DOCX, TXT · Max 10MB</p>
            </>
          )}

          {(status === 'uploading' || status === 'parsing') && (
            <div className="space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                {status === 'uploading' ? (
                  <Upload size={24} className="text-brand-500 animate-pulse" />
                ) : (
                  <Sparkles size={24} className="text-brand-500 animate-pulse" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{file?.name}</p>
                <p className="text-xs text-surface-500 mt-1">
                  {status === 'uploading' ? `Uploading... ${Math.round(progress)}%` : 'AI is analyzing your resume...'}
                </p>
              </div>
              <div className="w-full max-w-xs mx-auto h-1.5 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: status === 'parsing' ? '100%' : `${progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
                />
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className="space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <CheckCircle size={28} className="text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Resume uploaded and analyzed</p>
              <p className="text-xs text-surface-500">Your profile has been updated with the latest information</p>
              <Button variant="secondary" size="sm" onClick={() => { setFile(null); setStatus('idle'); }}>
                Upload Another
              </Button>
            </div>
          )}
        </div>

        {/* Tips */}
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Tips for a better match</h3>
          <ul className="space-y-2">
            {[
              'Include specific technologies and tools you have experience with',
              'Quantify your achievements (e.g. "increased conversion by 25%")',
              'Keep your resume to 1-2 pages for best ATS compatibility',
              'Use standard section headings: Experience, Education, Skills',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-400">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageTransition>
  );
}
