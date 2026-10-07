import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [email, setEmail] = useState('JardenUnido@hireflow.ai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Navigate based on role - will be done by App.tsx
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(authError || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-surface-50 dark:bg-surface-950">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-400/20 dark:bg-brand-400/10 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-400/15 dark:bg-violet-400/8 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-cyan-400/10 dark:bg-cyan-400/5 blur-[80px]"
        />
      </div>

      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-md relative z-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow-lg">
              <Sparkles size={24} className="text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
              HireFlow AI
            </span>
          </div>
          <h1 className="text-4xl font-bold text-surface-900 dark:text-white mb-4 leading-tight">
            Intelligent Recruitment,{' '}
            <span className="bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-transparent">
              Simplified
            </span>
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-400 leading-relaxed">
            AI-powered resume screening, candidate ranking, and recruitment pipeline management. Find the best talent faster.
          </p>

          {/* Feature highlights */}
          <div className="mt-10 space-y-4">
            {['AI Resume Analysis', 'Intelligent Job Matching', 'Visual Pipeline Management'].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-brand-500 to-violet-500" />
                <span className="text-surface-700 dark:text-surface-300 font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8 lg:p-10">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
                HireFlow AI
              </span>
            </div>

            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
              Welcome back
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mb-8">
              Sign in to your recruitment dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                icon={<Mail size={18} />}
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  icon={<Lock size={18} />}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-surface-400 hover:text-surface-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
                  <span className="text-sm text-surface-600 dark:text-surface-400">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              {authError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"
                >
                  {authError}
                </motion.p>
              )}

              <Button type="submit" loading={isLoading} className="w-full" size="lg">
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-surface-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
                Create account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
