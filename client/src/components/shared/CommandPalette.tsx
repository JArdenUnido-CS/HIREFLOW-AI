import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Briefcase, Upload, BarChart3, Settings, Sparkles, Kanban, MessageSquare, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { sampleCandidates, sampleJobs } from '@/data/sampleData';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'candidate' | 'job';
}

export function CommandPalette() {
  const { searchOpen, setSearchOpen } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const results = useMemo<SearchResult[]>(() => {
    const nav: SearchResult[] = [
      { id: 'nav-dashboard', label: 'Dashboard', description: 'Go to dashboard', icon: <LayoutDashboard size={16} />, action: () => navigate('/dashboard'), category: 'navigation' },
      { id: 'nav-candidates', label: 'Candidates', description: 'View all candidates', icon: <Users size={16} />, action: () => navigate('/candidates'), category: 'navigation' },
      { id: 'nav-jobs', label: 'Jobs', description: 'Manage job postings', icon: <Briefcase size={16} />, action: () => navigate('/jobs'), category: 'navigation' },
      { id: 'nav-upload', label: 'Upload Resume', description: 'Upload new resumes', icon: <Upload size={16} />, action: () => navigate('/upload'), category: 'navigation' },
      { id: 'nav-pipeline', label: 'Pipeline', description: 'Recruitment pipeline', icon: <Kanban size={16} />, action: () => navigate('/pipeline'), category: 'navigation' },
      { id: 'nav-analysis', label: 'AI Analysis', description: 'AI-powered insights', icon: <Sparkles size={16} />, action: () => navigate('/analysis'), category: 'navigation' },
      { id: 'nav-calendar', label: 'Calendar', description: 'Schedule & manage events', icon: <Search size={16} />, action: () => navigate('/calendar'), category: 'navigation' },
      { id: 'nav-interviews', label: 'Interviews', description: 'Schedule & manage', icon: <MessageSquare size={16} />, action: () => navigate('/interviews'), category: 'navigation' },
      { id: 'nav-analytics', label: 'Analytics', description: 'Reports & metrics', icon: <BarChart3 size={16} />, action: () => navigate('/analytics'), category: 'navigation' },
      { id: 'nav-settings', label: 'Settings', description: 'Account settings', icon: <Settings size={16} />, action: () => navigate('/settings'), category: 'navigation' },
    ];

    const candidates: SearchResult[] = sampleCandidates.map((c) => ({
      id: c.id,
      label: c.name,
      description: `${c.location} · ${c.parsedData.totalYearsExperience}y exp`,
      icon: <Users size={16} />,
      action: () => navigate('/candidates'),
      category: 'candidate',
    }));

    const jobs: SearchResult[] = sampleJobs.map((j) => ({
      id: j.id,
      label: j.title,
      description: `${j.department} · ${j.location}`,
      icon: <Briefcase size={16} />,
      action: () => navigate('/jobs'),
      category: 'job',
    }));

    const all = [...nav, ...candidates, ...jobs];
    if (!query) return nav;
    return all.filter(
      (r) =>
        r.label.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, navigate]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.key === '/' || (e.key === 'k' && e.metaKey)) && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
      if (searchOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
        }
        if (e.key === 'Enter' && results[selectedIndex]) {
          results[selectedIndex].action();
          setSearchOpen(false);
          setQuery('');
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen, results, selectedIndex]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setSearchOpen(false); setQuery(''); }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-white dark:bg-surface-900 rounded-2xl shadow-glass-xl border border-surface-200 dark:border-surface-700 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-200 dark:border-surface-800">
              <Search size={18} className="text-surface-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search candidates, jobs, or navigate..."
                className="flex-1 bg-transparent text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 outline-none"
                autoFocus
              />
              <kbd className="text-xs bg-surface-100 dark:bg-surface-800 text-surface-400 px-1.5 py-0.5 rounded font-mono">
                esc
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[320px] overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="py-8 text-center text-sm text-surface-400">
                  No results found
                </div>
              ) : (
                results.map((result, i) => (
                  <button
                    key={result.id}
                    onClick={() => { result.action(); setSearchOpen(false); setQuery(''); }}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                      selectedIndex === i
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                        : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
                    )}
                  >
                    <span className={cn(
                      'shrink-0',
                      selectedIndex === i ? 'text-brand-500' : 'text-surface-400'
                    )}>
                      {result.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.label}</p>
                      <p className="text-xs text-surface-400 truncate">{result.description}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-surface-400 shrink-0">
                      {result.category === 'navigation' ? 'page' : result.category}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-surface-200 dark:border-surface-800 text-[11px] text-surface-400">
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-surface-100 dark:bg-surface-800 font-mono">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-surface-100 dark:bg-surface-800 font-mono">↵</kbd> Select</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-surface-100 dark:bg-surface-800 font-mono">esc</kbd> Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
