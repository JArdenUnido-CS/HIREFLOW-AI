import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, X, Sparkles, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/shared/PageTransition';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'parsing' | 'complete' | 'error';
}

export function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const simulateUpload = useCallback((file: File) => {
    const id = Math.random().toString(36).substring(7);
    const uploadedFile: UploadedFile = {
      id,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
    };

    setFiles((prev) => [...prev, uploadedFile]);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress: 100, status: 'parsing' } : f))
        );
        // Simulate parsing
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, status: 'complete' } : f))
          );
        }, 1500);
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress } : f))
        );
      }
    }, 200);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach(simulateUpload);
    },
    [simulateUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      selectedFiles.forEach(simulateUpload);
    },
    [simulateUpload]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Upload Resumes</h1>
          <p className="text-surface-500 mt-1">
            Upload PDF, DOCX, or TXT files. Our AI will automatically parse and analyze them.
          </p>
        </div>

        {/* Drop zone */}
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          animate={isDragging ? { scale: 1.01 } : { scale: 1 }}
          className={cn(
            'relative rounded-2xl border-2 border-dashed transition-all duration-300 p-12',
            isDragging
              ? 'border-brand-400 bg-brand-50/50 dark:bg-brand-900/10'
              : 'border-surface-300 dark:border-surface-700 hover:border-brand-300 dark:hover:border-brand-700'
          )}
        >
          <div className="flex flex-col items-center text-center">
            <motion.div
              animate={isDragging ? { y: -8, scale: 1.1 } : { y: 0, scale: 1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-900/30 dark:to-violet-900/30 flex items-center justify-center mb-4"
            >
              <Upload size={28} className="text-brand-600 dark:text-brand-400" />
            </motion.div>
            <h3 className="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-1">
              {isDragging ? 'Drop files here' : 'Drag and drop resumes'}
            </h3>
            <p className="text-sm text-surface-500 mb-6">
              or click to browse from your computer
            </p>
            <label>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileSelect}
                className="sr-only"
              />
              <Button variant="primary" className="cursor-pointer" onClick={() => {}}>
                Browse Files
              </Button>
            </label>
            <p className="text-xs text-surface-400 mt-4">
              Supported: PDF, DOCX, TXT · Max 10MB per file
            </p>
          </div>
        </motion.div>

        {/* Upload queue */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                Upload Queue ({files.length})
              </h3>
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  layout
                >
                  <Card padding="sm" className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        file.status === 'complete' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                        file.status === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
                        'bg-brand-50 dark:bg-brand-900/20'
                      )}>
                        {file.status === 'complete' ? (
                          <CheckCircle size={18} className="text-emerald-500" />
                        ) : file.status === 'error' ? (
                          <AlertCircle size={18} className="text-red-500" />
                        ) : file.status === 'parsing' ? (
                          <Sparkles size={18} className="text-brand-500 animate-pulse" />
                        ) : (
                          <FileText size={18} className="text-brand-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-surface-400">
                          {file.status === 'uploading' && `Uploading... ${Math.round(file.progress)}%`}
                          {file.status === 'parsing' && 'AI is parsing resume...'}
                          {file.status === 'complete' && 'Parsed successfully'}
                          {file.status === 'error' && 'Upload failed'}
                        </p>
                        {file.status === 'uploading' && (
                          <div className="mt-2 h-1.5 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${file.progress}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
                            />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                        aria-label="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
