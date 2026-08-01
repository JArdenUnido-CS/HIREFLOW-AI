import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, MessageSquare, Brain, Sparkles, MapPin, Mail, Phone, ExternalLink, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/shared/PageTransition';
import { sampleInterviews, sampleCandidates, sampleJobs } from '@/data/sampleData';
import { formatDate, cn, getScoreColor } from '@/lib/utils';
import type { InterviewQuestion, Interview } from '@/types';

const generatedQuestions: InterviewQuestion[] = [
  { id: 'q1', question: 'Describe a time you had to optimize a critical rendering path. What metrics did you use to measure improvement?', category: 'technical', difficulty: 'hard', idealAnswer: 'Look for specific metrics (LCP, FID, CLS), tools used (Lighthouse, WebPageTest), and measurable outcomes.' },
  { id: 'q2', question: 'How do you approach building a component library that serves multiple product teams with different needs?', category: 'technical', difficulty: 'medium', idealAnswer: 'Should mention composition patterns, API design principles, documentation, and versioning strategy.' },
  { id: 'q3', question: 'Tell me about a situation where you disagreed with a design decision. How did you handle it?', category: 'behavioral', difficulty: 'medium', idealAnswer: 'Look for collaborative problem-solving, data-driven arguments, and respectful communication.' },
  { id: 'q4', question: 'How would you design a real-time collaborative editing feature similar to Google Docs?', category: 'problem_solving', difficulty: 'hard', idealAnswer: 'Should cover CRDTs or OT, conflict resolution, WebSockets, and eventual consistency.' },
  { id: 'q5', question: 'Describe your approach to mentoring junior developers. Give a specific example of impact.', category: 'leadership', difficulty: 'medium', idealAnswer: 'Look for structured approach, patience, measuring growth, and adapting teaching style.' },
];

const difficultyColors = { easy: 'success', medium: 'warning', hard: 'danger' } as const;
const categoryIcons: Record<string, React.ReactNode> = {
  technical: <Brain size={14} />,
  behavioral: <MessageSquare size={14} />,
  problem_solving: <Sparkles size={14} />,
  leadership: <Video size={14} />,
};

export function InterviewsPage() {
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const getCandidate = (candidateId: string) => sampleCandidates.find((c) => c.id === candidateId);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Interviews</h1>
            <p className="text-surface-500 mt-1">Schedule and manage candidate interviews</p>
          </div>
          <Button variant="primary" icon={<Calendar size={16} />} onClick={() => setShowScheduleModal(true)}>
            Schedule Interview
          </Button>
        </div>

        {/* Upcoming interviews */}
        <StaggerContainer className="space-y-3">
          {sampleInterviews.map((interview) => (
            <StaggerItem key={interview.id}>
              <Card hover className="cursor-pointer" onClick={() => setSelectedInterview(interview)}>
                <div className="flex items-center gap-4">
                  <Avatar name={interview.candidateName} size="lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-surface-900 dark:text-white">{interview.candidateName}</h3>
                    <p className="text-sm text-surface-500">{interview.jobTitle}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                        {formatDate(interview.scheduledAt)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-surface-400">
                        <Clock size={12} />
                        <span>10:00 AM</span>
                      </div>
                    </div>
                    <Badge variant="info">{interview.type}</Badge>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* AI Interview Questions */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
              <Sparkles size={20} className="text-brand-500" />
              AI-Generated Questions
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowQuestions(!showQuestions)}
            >
              {showQuestions ? 'Hide' : 'Generate for Jem Unido'}
            </Button>
          </div>

          {showQuestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              {generatedQuestions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card padding="sm" className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                        {categoryIcons[q.category] || <MessageSquare size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{q.question}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={difficultyColors[q.difficulty]} size="sm">{q.difficulty}</Badge>
                          <Badge variant="default" size="sm">{q.category.replace('_', ' ')}</Badge>
                        </div>
                        {q.idealAnswer && (
                          <p className="text-xs text-surface-400 mt-2 italic">
                            Evaluation tip: {q.idealAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Interview Detail Modal */}
        <Modal
          isOpen={!!selectedInterview}
          onClose={() => setSelectedInterview(null)}
          title="Interview Details"
          size="lg"
        >
          {selectedInterview && (() => {
            const candidate = getCandidate(selectedInterview.candidateId);
            return (
              <div className="space-y-5">
                {/* Candidate info */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <Avatar name={selectedInterview.candidateName} size="xl" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                      {selectedInterview.candidateName}
                    </h3>
                    <p className="text-sm text-surface-500">Applying for {selectedInterview.jobTitle}</p>
                    {candidate && (
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-surface-500">
                        <span className="flex items-center gap-1"><Mail size={12} />{candidate.email}</span>
                        <span className="flex items-center gap-1"><Phone size={12} />{candidate.phone}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} />{candidate.location}</span>
                      </div>
                    )}
                    {candidate && (
                      <div className="flex items-center gap-3 mt-3">
                        <div>
                          <span className="text-xs text-surface-400">AI Score</span>
                          <p className={cn('text-sm font-bold', getScoreColor(candidate.aiScores.overall))}>
                            {candidate.aiScores.overall}/100
                          </p>
                        </div>
                        {candidate.matchScores && (
                          <div>
                            <span className="text-xs text-surface-400">Match</span>
                            <p className={cn('text-sm font-bold', getScoreColor(candidate.matchScores.overall))}>
                              {candidate.matchScores.overall}%
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs text-surface-400">Experience</span>
                          <p className="text-sm font-bold text-surface-800 dark:text-surface-200">
                            {candidate.parsedData.totalYearsExperience}y
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interview details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/30">
                    <p className="text-xs text-surface-400 mb-1">Date & Time</p>
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
                      {formatDate(selectedInterview.scheduledAt)}
                    </p>
                    <p className="text-xs text-surface-500">10:00 AM — 11:00 AM</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/30">
                    <p className="text-xs text-surface-400 mb-1">Interview Type</p>
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200 capitalize">
                      {selectedInterview.type}
                    </p>
                    <p className="text-xs text-surface-500">60 min session</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/30">
                    <p className="text-xs text-surface-400 mb-1">Location</p>
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">Google Meet</p>
                    <p className="text-xs text-brand-500 cursor-pointer hover:underline">Join link</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/30">
                    <p className="text-xs text-surface-400 mb-1">Status</p>
                    <Badge variant="info">{selectedInterview.status}</Badge>
                  </div>
                </div>

                {/* Skills */}
                {candidate && (
                  <div>
                    <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Key Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.parsedData.skills.flatMap((c) => c.skills).slice(0, 8).map((skill) => (
                        <Badge key={skill} variant="default" size="sm">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-surface-100 dark:border-surface-800">
                  <Button variant="primary" size="sm">Reschedule</Button>
                  <Button variant="secondary" size="sm">Add Notes</Button>
                  <Button variant="ghost" size="sm">Cancel Interview</Button>
                </div>
              </div>
            );
          })()}
        </Modal>

        {/* Schedule Interview Modal */}
        <Modal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          title="Schedule New Interview"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Candidate</label>
              <select className="w-full h-11 px-4 rounded-xl text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                {sampleCandidates.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Job Position</label>
              <select className="w-full h-11 px-4 rounded-xl text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                {sampleJobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date" type="date" id="interview-date" />
              <Input label="Time" type="time" id="interview-time" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Interview Type</label>
              <select className="w-full h-11 px-4 rounded-xl text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="coding">Coding</option>
                <option value="hr">HR</option>
                <option value="final">Final Round</option>
              </select>
            </div>
            <Input label="Meeting Link" placeholder="https://meet.google.com/..." id="meeting-link" />
            <Input label="Notes (optional)" placeholder="Topics to cover, preparation notes..." id="interview-notes" />
            <div className="flex gap-2 pt-2">
              <Button variant="primary" onClick={() => setShowScheduleModal(false)}>Schedule</Button>
              <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
}
