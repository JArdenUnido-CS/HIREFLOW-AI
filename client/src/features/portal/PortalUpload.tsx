import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export function PortalUpload() {
  const { user } = useAuthStore();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }
    setResumeFile(file);
    setUploadProgress(0);
    setUploadDone(false);
    simulateUpload();
  }, []);

  const simulateUpload = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadDone(true);
      }
      setUploadProgress(Math.min(progress, 100));
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async () => {
    if (!resumeUrl.trim() && !resumeFile) {
      toast.error('Please provide a resume URL or upload a file');
      return;
    }

    setUploading(true);
    try {
      // Update candidate with resume
      await api.patch(`/api/candidates/${user?.id}`, {
        resume_url: resumeUrl || `file://${resumeFile?.name}`,
      });

      toast.success('Resume updated successfully!');
      setResumeFile(null);
      setResumeUrl('');
      setUploadProgress(0);
      setUploadDone(false);
    } catch (error) {
      console.error('Failed to upload resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Upload Your Resume</h1>
        <p className="text-lg text-surface-600 dark:text-surface-400">Share your resume so admins can review your qualifications</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8 space-y-6"
      >
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200',
            isDragging
              ? 'border-brand-400 bg-brand-50/50 dark:bg-brand-900/10'
              : resumeFile
                ? 'border-emerald-300 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-900/10'
                : 'border-surface-300 dark:border-surface-700 hover:border-brand-300'
          )}
        >
          {!resumeFile ? (
            <>
              <Upload size={32} className="mx-auto text-surface-400 mb-3" />
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Drag and drop your resume
              </p>
              <p className="text-xs text-surface-400 mb-4">PDF, DOC, DOCX, or TXT (max 10MB)</p>
              <label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="sr-only"
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium cursor-pointer hover:bg-brand-700 transition-colors">
                  Browse Files
                </span>
              </label>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                {uploadDone ? (
                  <CheckCircle size={20} className="text-emerald-500" />
                ) : (
                  <FileText size={20} className="text-brand-500" />
                )}
                <span className="text-sm font-medium text-surface-800 dark:text-surface-200">
                  {resumeFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setResumeFile(null);
                    setUploadProgress(0);
                    setUploadDone(false);
                  }}
                  className="text-surface-400 hover:text-red-500 ml-2"
                >
                  <X size={16} />
                </button>
              </div>
              {!uploadDone && (
                <div className="w-full max-w-xs mx-auto">
                  <div className="h-1.5 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
                    />
                  </div>
                  <p className="text-xs text-surface-400 mt-1">{Math.round(uploadProgress)}% uploaded</p>
                </div>
              )}
              {uploadDone && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Resume ready to submit
                </p>
              )}
            </div>
          )}
        </div>

        {/* OR divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-200 dark:border-surface-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-surface-900 text-surface-500">Or provide URL</span>
          </div>
        </div>

        {/* URL input */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Resume URL (Google Drive, Dropbox, etc)
          </label>
          <input
            type="url"
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
            placeholder="https://example.com/resume.pdf"
            className="w-full px-4 py-2 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-xs text-surface-500 mt-2">
            💡 Tip: Share a public link to your resume on Google Drive, Dropbox, or your personal website
          </p>
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          loading={uploading}
          disabled={(!resumeFile && !resumeUrl.trim())}
          className="w-full"
          size="lg"
        >
          {resumeFile || resumeUrl ? 'Submit Resume' : 'Enter Resume Details'}
        </Button>
      </motion.div>
    </div>
  );
}

export default PortalUpload;
