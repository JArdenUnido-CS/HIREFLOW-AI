import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, Upload, FileText, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function RegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password) setStep(2);
  };

  const handleFileSelect = useCallback((file: File) => {
    setResumeFile(file);
    setUploadProgress(0);
    setUploadDone(false);
    // Simulate upload
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
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFinalSubmit = async () => {
    await register(name, email, password);
    navigate('/portal');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-surface-50 dark:bg-surface-950">
      {/* Background orbs */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-brand-400/15 dark:bg-brand-400/8 blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full bg-violet-400/15 dark:bg-violet-400/8 blur-[80px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 lg:p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
              HireFlow AI
            </span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={cn('w-8 h-1 rounded-full transition-colors', step >= 1 ? 'bg-brand-500' : 'bg-surface-200 dark:bg-surface-700')} />
            <div className={cn('w-8 h-1 rounded-full transition-colors', step >= 2 ? 'bg-brand-500' : 'bg-surface-200 dark:bg-surface-700')} />
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Account details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
                  Create your account
                </h2>
                <p className="text-surface-500 dark:text-surface-400 mb-6">
                  Join HireFlow to find your dream job
                </p>

                <form onSubmit={handleStep1} className="space-y-4">
                  <Input
                    id="name"
                    label="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    icon={<User size={18} />}
                    required
                  />
                  <Input
                    id="email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    icon={<Mail size={18} />}
                    required
                  />
                  <div className="relative">
                    <Input
                      id="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      icon={<Lock size={18} />}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-surface-400 hover:text-surface-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <Button type="submit" className="w-full" size="lg" icon={<ArrowRight size={16} />}>
                    Continue
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Resume upload */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
                  Upload your resume
                </h2>
                <p className="text-surface-500 dark:text-surface-400 mb-6">
                  Our AI will analyze your resume to match you with the best opportunities
                </p>

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
                      <p className="text-xs text-surface-400 mb-4">PDF, DOCX, or TXT (max 10MB)</p>
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
                          Resume uploaded successfully
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <Button variant="ghost" onClick={() => setStep(1)} icon={<ArrowLeft size={16} />}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    size="lg"
                    loading={isLoading}
                    onClick={handleFinalSubmit}
                  >
                    {resumeFile ? 'Create Account' : 'Skip & Create Account'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-6 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
