import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  BookOpen,
  Award,
  Code,
  Globe,
  RotateCw,
  ChevronDown,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { RadialProgress } from '@/components/shared/RadialProgress';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScoreCard } from '@/components/shared/ScoreCard';
import { candidatesApi, jobsApi } from '@/services/api';
import { cn, getScoreColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Candidate, Job } from '@/types';

export function CandidateDetailPage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobForMatching, setSelectedJobForMatching] = useState<string | null>(null);
  const [matchScores, setMatchScores] = useState<any>(null);
  const [runningMatch, setRunningMatch] = useState(false);

  useEffect(() => {
    fetchCandidate();
    fetchJobs();
  }, [candidateId]);

  const fetchCandidate = async () => {
    if (!candidateId) return;
    setLoading(true);
    try {
      const response = await candidatesApi.getById(candidateId);
      setCandidate(response.data.candidate);
    } catch (error) {
      console.error('Failed to fetch candidate:', error);
      toast.error('Failed to load candidate details');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await jobsApi.getAll();
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const handleRunMatching = async () => {
    if (!selectedJobForMatching || !candidateId) return;

    setRunningMatch(true);
    try {
      const response = await candidatesApi.matchJob(candidateId, selectedJobForMatching);
      setMatchScores(response.data.scores);
      toast.success('Job matching completed');
    } catch (error) {
      console.error('Matching error:', error);
      toast.error('Failed to run job matching');
    } finally {
      setRunningMatch(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-1/4 animate-pulse" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!candidate) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <Button variant="secondary" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
            Back
          </Button>
          <Card className="text-center py-12">
            <p className="text-surface-600 dark:text-surface-400">Candidate not found</p>
          </Card>
        </div>
      </PageTransition>
    );
  }

  const parsedData = candidate.parsedData as any;
  const aiScores = candidate.aiScores as any;
  const selectedJob = jobs.find(j => j.id === selectedJobForMatching);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Candidate Evaluation</h1>
        </div>

        {/* Candidate Header Card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar name={candidate.name} size="xl" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">
                {candidate.name}
              </h2>
              <p className="text-surface-600 dark:text-surface-400 mb-3">
                {parsedData?.summary?.slice(0, 150) || 'No professional summary available'}
              </p>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm text-surface-600 dark:text-surface-400">
                {candidate.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={14} /> {candidate.email}
                  </span>
                )}
                {candidate.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={14} /> {candidate.phone}
                  </span>
                )}
                {candidate.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {candidate.location}
                  </span>
                )}
              </div>

              {/* Links */}
              {(candidate.linkedin || candidate.github || candidate.portfolio) && (
                <div className="flex gap-2 mt-3">
                  {candidate.linkedin && (
                    <a
                      href={candidate.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      LinkedIn
                    </a>
                  )}
                  {candidate.github && (
                    <a
                      href={candidate.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      GitHub
                    </a>
                  )}
                  {candidate.portfolio && (
                    <a
                      href={candidate.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Portfolio
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Overall Score */}
            {aiScores && (
              <div className="flex flex-col items-center justify-center">
                <RadialProgress
                  value={aiScores.overall || 0}
                  size={100}
                  label="Overall"
                />
              </div>
            )}
          </div>
        </Card>

        {/* AI Scores Grid */}
        {aiScores && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
              Candidate Analysis Scores
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ScoreCard
                label="Technical"
                score={aiScores.technical || 0}
                icon={<Code size={16} />}
              />
              <ScoreCard
                label="Experience"
                score={aiScores.experience || 0}
                icon={<Briefcase size={16} />}
              />
              <ScoreCard
                label="Leadership"
                score={aiScores.leadership || 0}
                icon={<Award size={16} />}
              />
              <ScoreCard
                label="Communication"
                score={aiScores.communication || 0}
                icon={<Globe size={16} />}
              />
              <ScoreCard label="Problem Solving" score={aiScores.problemSolving || 0} />
              <ScoreCard label="Teamwork" score={aiScores.teamwork || 0} />
              <ScoreCard label="Learning Potential" score={aiScores.learningPotential || 0} />
              <ScoreCard label="ATS Score" score={aiScores.atsCompatibility || 0} />
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card padding="lg" className="border-l-4 border-emerald-500">
                <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-3">
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {(aiScores.strengths || []).map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-surface-700 dark:text-surface-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card padding="lg" className="border-l-4 border-amber-500">
                <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-3">
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {(aiScores.weaknesses || []).map((w: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-surface-700 dark:text-surface-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Professional Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Experience */}
          {parsedData?.experience && parsedData.experience.length > 0 && (
            <Card padding="lg">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-white mb-4">
                <Briefcase size={20} className="text-brand-500" />
                Experience
              </h3>
              <div className="space-y-4">
                {parsedData.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="pb-4 border-b border-surface-200 dark:border-surface-700 last:border-0">
                    <p className="font-medium text-surface-900 dark:text-white">{exp.title}</p>
                    <p className="text-sm text-surface-600 dark:text-surface-400">
                      {exp.company} • {exp.location}
                    </p>
                    <p className="text-xs text-surface-500 mt-1">
                      {exp.startDate} — {exp.endDate || 'Present'}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 line-clamp-3">
                        {Array.isArray(exp.description) ? exp.description.join(' ') : exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Education */}
          {parsedData?.education && parsedData.education.length > 0 && (
            <Card padding="lg">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-white mb-4">
                <BookOpen size={20} className="text-brand-500" />
                Education
              </h3>
              <div className="space-y-4">
                {parsedData.education.map((edu: any, idx: number) => (
                  <div key={idx} className="pb-4 border-b border-surface-200 dark:border-surface-700 last:border-0">
                    <p className="font-medium text-surface-900 dark:text-white">{edu.degree}</p>
                    <p className="text-sm text-surface-600 dark:text-surface-400">
                      {edu.institution} • {edu.field}
                    </p>
                    <p className="text-xs text-surface-500 mt-1">Graduated: {edu.year}</p>
                    {edu.gpa && <p className="text-xs text-surface-500">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Skills */}
        {parsedData?.skills && parsedData.skills.length > 0 && (
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Skills</h3>
            <div className="space-y-4">
              {parsedData.skills.map((skillItem: any, idx: number) => {
                // Handle both flat array of strings and categorized objects
                if (typeof skillItem === 'string') {
                  // Flat array format - just display as badges
                  return (
                    <div key={idx} className="flex flex-wrap gap-2">
                      <Badge variant="default">{skillItem}</Badge>
                    </div>
                  );
                }
                
                // Categorized format
                if (skillItem.category && Array.isArray(skillItem.skills)) {
                  return (
                    <div key={idx}>
                      <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2 capitalize">
                        {skillItem.category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skillItem.skills.map((skill: string, sidx: number) => (
                          <Badge key={sidx} variant="default">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                return null;
              })}
            </div>
          </Card>
        )}

        {/* Projects */}
        {parsedData?.projects && parsedData.projects.length > 0 && (
          <Card padding="lg">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-white mb-4">
              <Code size={20} className="text-brand-500" />
              Projects
            </h3>
            <div className="space-y-4">
              {parsedData.projects.map((project: any, idx: number) => (
                <div key={idx} className="pb-4 border-b border-surface-200 dark:border-surface-700 last:border-0">
                  <p className="font-medium text-surface-900 dark:text-white">{project.name}</p>
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">{project.description}</p>
                  {project.technologies && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.technologies.map((tech: string, tidx: number) => (
                        <Badge key={tidx} variant="info">{tech}</Badge>
                      ))}
                    </div>
                  )}
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:underline mt-2 inline-block">
                      View Project →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Languages */}
        {parsedData?.languages && parsedData.languages.length > 0 && (
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Languages</h3>
            <div className="space-y-2">
              {parsedData.languages.map((lang: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    {typeof lang === 'string' ? lang : lang.language}
                  </p>
                  {typeof lang !== 'string' && lang.proficiency && (
                    <Badge variant="info">{lang.proficiency}</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
        {parsedData?.certifications && parsedData.certifications.length > 0 && (
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Certifications</h3>
            <ul className="space-y-2">
              {parsedData.certifications.map((cert: any, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-surface-700 dark:text-surface-300">
                  <Award size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{typeof cert === 'string' ? cert : cert.name}</p>
                    {typeof cert !== 'string' && cert.issuer && (
                      <p className="text-xs text-surface-500">{cert.issuer} • {cert.date}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Job Matching Section */}
        <Card padding="lg" className="border-l-4 border-brand-500 bg-gradient-to-br from-brand-50/30 to-violet-50/30 dark:from-brand-900/10 dark:to-violet-900/10">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Job Matching</h3>

          {/* Job Selector */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2 block">
                Select a Job to Match
              </label>
              <div className="relative">
                <select
                  value={selectedJobForMatching || ''}
                  onChange={(e) => {
                    setSelectedJobForMatching(e.target.value || null);
                    setMatchScores(null);
                  }}
                  className="appearance-none w-full px-4 py-2.5 pr-10 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="">-- Select a job --</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"
                />
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleRunMatching}
              disabled={!selectedJobForMatching || runningMatch}
              icon={<RotateCw size={16} className={runningMatch ? 'animate-spin' : ''} />}
            >
              {runningMatch ? 'Matching...' : 'Run Match'}
            </Button>
          </div>

          {/* Match Results */}
          {matchScores && selectedJob && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-700"
            >
              <div className="mb-4">
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  Matching against: <span className="font-semibold text-surface-900 dark:text-white">{selectedJob.title}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                  <p className="text-xs text-surface-500 uppercase tracking-wide mb-1">Overall Match</p>
                  <p className={cn('text-2xl font-bold', getScoreColor(matchScores.overall || 0))}>
                    {matchScores.overall || 0}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                  <p className="text-xs text-surface-500 uppercase tracking-wide mb-1">Skills Match</p>
                  <p className={cn('text-2xl font-bold', getScoreColor(matchScores.skills || 0))}>
                    {matchScores.skills || 0}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                  <p className="text-xs text-surface-500 uppercase tracking-wide mb-1">Experience</p>
                  <p className={cn('text-2xl font-bold', getScoreColor(matchScores.experience || 0))}>
                    {matchScores.experience || 0}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                  <p className="text-xs text-surface-500 uppercase tracking-wide mb-1">Education</p>
                  <p className={cn('text-2xl font-bold', getScoreColor(matchScores.education || 0))}>
                    {matchScores.education || 0}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                  <p className="text-xs text-surface-500 uppercase tracking-wide mb-1">Location</p>
                  <p className={cn('text-2xl font-bold', getScoreColor(matchScores.location || 0))}>
                    {matchScores.location || 0}%
                  </p>
                </div>
              </div>

              {/* Missing Skills */}
              {matchScores.missingSkills && matchScores.missingSkills.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">Missing Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchScores.missingSkills.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="default" className="bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Match Explanation */}
              {matchScores.explanations && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Match Details</p>
                  {Object.entries(matchScores.explanations).map(([key, value]: [string, any]) => (
                    <p key={key} className="text-xs text-surface-600 dark:text-surface-400">
                      <span className="font-medium capitalize">{key}:</span> {value}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </Card>
      </div>
    </PageTransition>
  );
}

export default CandidateDetailPage;
