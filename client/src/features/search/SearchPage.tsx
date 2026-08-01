import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { PageTransition } from '@/components/shared/PageTransition';
import { sampleCandidates, sampleJobs } from '@/data/sampleData';
import { cn, getScoreColor, getStageColor } from '@/lib/utils';

const stageLabels: Record<string, string> = {
  applied: 'Applied', screening: 'Screening', shortlisted: 'Shortlisted',
  interview: 'Interview', technical_test: 'Technical Test', offer: 'Offer', hired: 'Hired',
};

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<string[]>([]);

  const allSkills = [...new Set(sampleCandidates.flatMap((c) => c.parsedData.skills.flatMap((s) => s.skills)))];

  const filteredCandidates = sampleCandidates.filter((c) => {
    const matchesQuery = !query || 
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.location.toLowerCase().includes(query.toLowerCase()) ||
      c.parsedData.skills.some((cat) => cat.skills.some((s) => s.toLowerCase().includes(query.toLowerCase())));
    const matchesFilters = filters.length === 0 ||
      filters.some((f) => c.parsedData.skills.some((cat) => cat.skills.includes(f)));
    return matchesQuery && matchesFilters;
  });

  const toggleFilter = (skill: string) => {
    setFilters((prev) => prev.includes(skill) ? prev.filter((f) => f !== skill) : [...prev, skill]);
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Search</h1>
          <p className="text-surface-500 mt-1">Find candidates by name, skill, or location</p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates, skills, locations..."
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 text-base placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 shadow-card transition-all"
            autoFocus
          />
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap gap-2">
          {allSkills.slice(0, 10).map((skill) => (
            <button
              key={skill}
              onClick={() => toggleFilter(skill)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filters.includes(skill)
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 ring-1 ring-brand-300 dark:ring-brand-700'
                  : 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
              )}
            >
              {skill}
            </button>
          ))}
        </div>

        {/* Active filters */}
        <AnimatePresence>
          {filters.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2">
              <span className="text-xs text-surface-500">Filters:</span>
              {filters.map((f) => (
                <Badge key={f} variant="brand">
                  {f}
                  <button onClick={() => toggleFilter(f)} className="ml-1"><X size={10} /></button>
                </Badge>
              ))}
              <button onClick={() => setFilters([])} className="text-xs text-red-500 hover:text-red-600 ml-2">Clear all</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="space-y-3">
          <p className="text-sm text-surface-500">{filteredCandidates.length} results</p>
          {filteredCandidates.map((candidate, i) => {
            const job = sampleJobs.find((j) => j.id === candidate.jobId);
            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card hover className="cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Avatar name={candidate.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-surface-900 dark:text-white">{candidate.name}</h3>
                      <p className="text-sm text-surface-500">{candidate.location} · {candidate.parsedData.totalYearsExperience}y experience</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {candidate.parsedData.skills[0]?.skills.slice(0, 4).map((s) => (
                          <Badge key={s} variant="default" size="sm">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-2">
                      <span className={cn('text-lg font-bold', getScoreColor(candidate.aiScores.overall))}>
                        {candidate.aiScores.overall}
                      </span>
                      <Badge className={getStageColor(candidate.status)}>{stageLabels[candidate.status]}</Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
