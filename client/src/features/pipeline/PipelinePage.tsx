import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PageTransition } from '@/components/shared/PageTransition';
import { sampleCandidates, sampleJobs } from '@/data/sampleData';
import { cn, getScoreColor } from '@/lib/utils';
import type { Candidate, PipelineStage } from '@/types';

const stages: { id: PipelineStage; label: string; color: string }[] = [
  { id: 'applied', label: 'Applied', color: 'bg-slate-400' },
  { id: 'screening', label: 'Screening', color: 'bg-blue-500' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-violet-500' },
  { id: 'interview', label: 'Interview', color: 'bg-amber-500' },
  { id: 'technical_test', label: 'Technical', color: 'bg-cyan-500' },
  { id: 'offer', label: 'Offer', color: 'bg-emerald-500' },
  { id: 'hired', label: 'Hired', color: 'bg-green-500' },
];

export function PipelinePage() {
  const [candidates, setCandidates] = useState(sampleCandidates);
  const [draggedCandidate, setDraggedCandidate] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleDragStart = (candidateId: string) => {
    setDraggedCandidate(candidateId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDropTarget(stageId);
  };

  const handleDrop = (stageId: PipelineStage) => {
    if (draggedCandidate) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === draggedCandidate ? { ...c, status: stageId } : c))
      );
    }
    setDraggedCandidate(null);
    setDropTarget(null);
  };

  const getCandidatesForStage = (stageId: PipelineStage) =>
    candidates.filter((c) => c.status === stageId);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Recruitment Pipeline</h1>
          <p className="text-surface-500 mt-1">Drag and drop candidates between stages</p>
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {stages.map((stage) => {
              const stageCandidates = getCandidatesForStage(stage.id);
              const isDropping = dropTarget === stage.id;

              return (
                <div
                  key={stage.id}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={() => setDropTarget(null)}
                  onDrop={() => handleDrop(stage.id)}
                  className={cn(
                    'w-72 flex-shrink-0 rounded-2xl p-3 transition-all duration-200',
                    'bg-surface-100/50 dark:bg-surface-900/50 border border-surface-200/50 dark:border-surface-800/50',
                    isDropping && 'border-brand-400 bg-brand-50/30 dark:bg-brand-900/10 ring-2 ring-brand-400/20'
                  )}
                >
                  {/* Stage header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2.5 h-2.5 rounded-full', stage.color)} />
                      <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                        {stage.label}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-surface-400 bg-surface-200/50 dark:bg-surface-800 px-2 py-0.5 rounded-full">
                      {stageCandidates.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2.5 min-h-[100px]">
                    {stageCandidates.map((candidate) => (
                      <PipelineCard
                        key={candidate.id}
                        candidate={candidate}
                        onDragStart={() => handleDragStart(candidate.id)}
                        isDragging={draggedCandidate === candidate.id}
                        onClick={() => setSelectedCandidate(candidate)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Candidate Detail Modal */}
        <Modal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title="Candidate Details"
          size="lg"
        >
          {selectedCandidate && (() => {
            const job = sampleJobs.find((j) => j.id === selectedCandidate.jobId);
            return (
              <div className="space-y-5">
                {/* Header */}
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

                {/* Summary */}
                <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                  {selectedCandidate.parsedData.summary}
                </p>

                {/* Scores */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/30 text-center">
                    <p className="text-xs text-surface-400">AI Score</p>
                    <p className={cn('text-xl font-bold', getScoreColor(selectedCandidate.aiScores.overall))}>
                      {selectedCandidate.aiScores.overall}
                    </p>
                  </div>
                  {selectedCandidate.matchScores && (
                    <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/30 text-center">
                      <p className="text-xs text-surface-400">Match</p>
                      <p className={cn('text-xl font-bold', getScoreColor(selectedCandidate.matchScores.overall))}>
                        {selectedCandidate.matchScores.overall}%
                      </p>
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/30 text-center">
                    <p className="text-xs text-surface-400">Experience</p>
                    <p className="text-xl font-bold text-surface-800 dark:text-surface-200">
                      {selectedCandidate.parsedData.totalYearsExperience}y
                    </p>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.parsedData.skills.flatMap((c) => c.skills).slice(0, 10).map((skill) => (
                      <Badge key={skill} variant="default" size="sm">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Recent Experience</p>
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

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-surface-100 dark:border-surface-800">
                  <Button variant="primary" size="sm">Move Stage</Button>
                  <Button variant="secondary" size="sm">Schedule Interview</Button>
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

function PipelineCard({
  candidate,
  onDragStart,
  isDragging,
  onClick,
}: {
  candidate: Candidate;
  onDragStart: () => void;
  isDragging: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      className={cn(
        'p-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50',
        'shadow-sm hover:shadow-card cursor-grab active:cursor-grabbing transition-shadow',
        isDragging && 'ring-2 ring-brand-400/30'
      )}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <Avatar name={candidate.name} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">
            {candidate.name}
          </p>
          <p className="text-xs text-surface-400 truncate">{candidate.location}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {candidate.parsedData.skills[0]?.skills.slice(0, 2).map((skill) => (
            <span key={skill} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400">
              {skill}
            </span>
          ))}
        </div>
        <span className={cn('text-xs font-bold', getScoreColor(candidate.aiScores.overall))}>
          {candidate.aiScores.overall}
        </span>
      </div>
    </motion.div>
  );
}
