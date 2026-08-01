import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, Grid3X3, List, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/shared/PageTransition';
import { sampleCandidates, sampleJobs } from '@/data/sampleData';
import { cn, getStageColor, getScoreColor } from '@/lib/utils';
import type { Candidate } from '@/types';

const stageLabels: Record<string, string> = {
  applied: 'Applied',
  screening: 'Screening',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  technical_test: 'Technical Test',
  hr_interview: 'HR Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};

export function CandidatesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const filteredCandidates = sampleCandidates.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.parsedData.skills.some((cat) => cat.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Candidates</h1>
            <p className="text-surface-500 mt-1">{sampleCandidates.length} total candidates in your pipeline</p>
          </div>
          <Button variant="primary" icon={<Filter size={16} />}>
            Add Candidate
          </Button>
        </div>

        {/* Filters bar */}
        <Card padding="sm" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search by name, skill, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<SlidersHorizontal size={14} />}>
              Filters
            </Button>
            <div className="flex items-center rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'text-surface-400 hover:text-surface-600'
                )}
                aria-label="Grid view"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'text-surface-400 hover:text-surface-600'
                )}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </Card>

        {/* Candidates Grid */}
        {viewMode === 'grid' ? (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCandidates.map((candidate) => (
              <StaggerItem key={candidate.id}>
                <CandidateCard candidate={candidate} onClick={() => setSelectedCandidate(candidate)} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <StaggerContainer className="space-y-3">
            {filteredCandidates.map((candidate) => (
              <StaggerItem key={candidate.id}>
                <CandidateRow candidate={candidate} onClick={() => setSelectedCandidate(candidate)} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Candidate Detail Modal */}
        <Modal isOpen={!!selectedCandidate} onClose={() => setSelectedCandidate(null)} title="Candidate Profile" size="lg">
          {selectedCandidate && (() => {
            const job = sampleJobs.find((j) => j.id === selectedCandidate.jobId);
            return (
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <Avatar name={selectedCandidate.name} size="xl" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white">{selectedCandidate.name}</h3>
                    {job && <p className="text-sm text-surface-500">Applying for {job.title}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-surface-500">
                      <span className="flex items-center gap-1"><Mail size={12} />{selectedCandidate.email}</span>
                      <span className="flex items-center gap-1"><Phone size={12} />{selectedCandidate.phone}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} />{selectedCandidate.location}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-surface-600 dark:text-surface-400">{selectedCandidate.parsedData.summary}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/30 text-center">
                    <p className="text-xs text-surface-400">AI Score</p>
                    <p className={cn('text-xl font-bold', getScoreColor(selectedCandidate.aiScores.overall))}>{selectedCandidate.aiScores.overall}</p>
                  </div>
                  {selectedCandidate.matchScores && (
                    <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/30 text-center">
                      <p className="text-xs text-surface-400">Match</p>
                      <p className={cn('text-xl font-bold', getScoreColor(selectedCandidate.matchScores.overall))}>{selectedCandidate.matchScores.overall}%</p>
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/30 text-center">
                    <p className="text-xs text-surface-400">Experience</p>
                    <p className="text-xl font-bold text-surface-800 dark:text-surface-200">{selectedCandidate.parsedData.totalYearsExperience}y</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.parsedData.skills.flatMap((c) => c.skills).slice(0, 10).map((skill) => (
                      <Badge key={skill} variant="default" size="sm">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Experience</p>
                  {selectedCandidate.parsedData.experience.slice(0, 2).map((exp, i) => (
                    <div key={i} className="flex items-start gap-3 py-2">
                      <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
                        <Briefcase size={14} className="text-surface-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{exp.title}</p>
                        <p className="text-xs text-surface-500">{exp.company} · {exp.startDate} — {exp.endDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t border-surface-100 dark:border-surface-800">
                  <Button variant="primary" size="sm">Schedule Interview</Button>
                  <Button variant="secondary" size="sm">Move Stage</Button>
                  <Button variant="ghost" size="sm">Reject</Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      </div>
    </PageTransition>
  );
}

function CandidateCard({ candidate, onClick }: { candidate: Candidate; onClick: () => void }) {
  const job = sampleJobs.find((j) => j.id === candidate.jobId);

  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={candidate.name} size="lg" />
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-white">{candidate.name}</h3>
            <p className="text-xs text-surface-500">{candidate.location}</p>
          </div>
        </div>
        <Badge className={getStageColor(candidate.status)}>
          {stageLabels[candidate.status]}
        </Badge>
      </div>

      {job && (
        <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
          Applied for <span className="font-medium text-surface-700 dark:text-surface-300">{job.title}</span>
        </p>
      )}

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {candidate.parsedData.skills[0]?.skills.slice(0, 4).map((skill) => (
          <Badge key={skill} variant="default" size="sm">{skill}</Badge>
        ))}
        {(candidate.parsedData.skills[0]?.skills.length || 0) > 4 && (
          <Badge variant="default" size="sm">+{(candidate.parsedData.skills[0]?.skills.length || 0) - 4}</Badge>
        )}
      </div>

      {/* Scores */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-surface-400">AI Score</p>
            <p className={cn('text-sm font-bold', getScoreColor(candidate.aiScores.overall))}>
              {candidate.aiScores.overall}/100
            </p>
          </div>
          {candidate.matchScores && (
            <div>
              <p className="text-xs text-surface-400">Match</p>
              <p className={cn('text-sm font-bold', getScoreColor(candidate.matchScores.overall))}>
                {candidate.matchScores.overall}%
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-surface-400">{candidate.parsedData.totalYearsExperience}y exp</p>
      </div>
    </Card>
  );
}

function CandidateRow({ candidate, onClick }: { candidate: Candidate; onClick: () => void }) {
  const job = sampleJobs.find((j) => j.id === candidate.jobId);

  return (
    <Card padding="sm" hover className="cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-4 p-2">
        <Avatar name={candidate.name} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-surface-900 dark:text-white truncate">{candidate.name}</h3>
          <p className="text-xs text-surface-500 truncate">{job?.title} · {candidate.location}</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <p className={cn('text-sm font-bold', getScoreColor(candidate.aiScores.overall))}>
              {candidate.aiScores.overall}
            </p>
            <p className="text-xs text-surface-400">AI Score</p>
          </div>
          {candidate.matchScores && (
            <div className="text-right">
              <p className={cn('text-sm font-bold', getScoreColor(candidate.matchScores.overall))}>
                {candidate.matchScores.overall}%
              </p>
              <p className="text-xs text-surface-400">Match</p>
            </div>
          )}
        </div>
        <Badge className={getStageColor(candidate.status)}>
          {stageLabels[candidate.status]}
        </Badge>
      </div>
    </Card>
  );
}
