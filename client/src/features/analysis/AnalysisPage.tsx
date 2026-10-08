import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronDown, Brain, Target, Award, TrendingUp, RotateCw } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ScoreCard } from '@/components/shared/ScoreCard';
import { RadialProgress } from '@/components/shared/RadialProgress';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/shared/PageTransition';
import { sampleCandidates } from '@/data/sampleData';
import { cn, getScoreColor } from '@/lib/utils';
import { candidatesApi } from '@/services/api';
import toast from 'react-hot-toast';

export function AnalysisPage() {
  const [selectedCandidate, setSelectedCandidate] = useState(sampleCandidates[0]);
  const [allCandidates, setAllCandidates] = useState(sampleCandidates);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await candidatesApi.getAll({ limit: 1000 });
      const apiCandidates = response.data.candidates || [];
      if (apiCandidates.length > 0) {
        setAllCandidates(apiCandidates);
        setSelectedCandidate(apiCandidates[0]);
      }
      toast.success('Analysis data refreshed');
    } catch (error) {
      toast.error('Failed to refresh analysis data');
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const radarData = [
    { subject: 'Technical', value: selectedCandidate.aiScores.technical },
    { subject: 'Experience', value: selectedCandidate.aiScores.experience },
    { subject: 'Leadership', value: selectedCandidate.aiScores.leadership },
    { subject: 'Communication', value: selectedCandidate.aiScores.communication },
    { subject: 'Problem Solving', value: selectedCandidate.aiScores.problemSolving },
    { subject: 'Teamwork', value: selectedCandidate.aiScores.teamwork },
    { subject: 'Learning', value: selectedCandidate.aiScores.learningPotential },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <Sparkles size={24} className="text-brand-500" />
              AI Analysis
            </h1>
            <p className="text-surface-500 mt-1">Deep AI-powered insights for each candidate</p>
          </div>

          {/* Candidate Selector and Refresh */}
          <div className="flex gap-2 items-center">
            <div className="relative">
              <select
                value={selectedCandidate.id}
                onChange={(e) => {
                  const c = allCandidates.find((c) => c.id === e.target.value);
                  if (c) setSelectedCandidate(c);
                }}
                className="appearance-none px-4 py-2.5 pr-10 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                {allCandidates.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
            </div>
            <Button 
              variant="secondary" 
              icon={<RotateCw size={16} />} 
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="sm"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Candidate Info Bar */}
        <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar name={selectedCandidate.name} size="xl" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">{selectedCandidate.name}</h2>
            <p className="text-surface-500">{selectedCandidate.parsedData.summary.slice(0, 100)}...</p>
          </div>
          <div className="flex items-center gap-6">
            <RadialProgress value={selectedCandidate.aiScores.overall} size={70} label="Overall" />
            {selectedCandidate.matchScores && (
              <RadialProgress value={selectedCandidate.matchScores.overall} size={70} label="Match" />
            )}
          </div>
        </Card>

        {/* Score Cards Grid */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StaggerItem>
            <ScoreCard label="Technical" score={selectedCandidate.aiScores.technical} icon={<Brain size={16} />} delay={0} />
          </StaggerItem>
          <StaggerItem>
            <ScoreCard label="Experience" score={selectedCandidate.aiScores.experience} icon={<Award size={16} />} delay={0.1} />
          </StaggerItem>
          <StaggerItem>
            <ScoreCard label="Leadership" score={selectedCandidate.aiScores.leadership} icon={<TrendingUp size={16} />} delay={0.2} />
          </StaggerItem>
          <StaggerItem>
            <ScoreCard label="Communication" score={selectedCandidate.aiScores.communication} icon={<Target size={16} />} delay={0.3} />
          </StaggerItem>
          <StaggerItem>
            <ScoreCard label="Problem Solving" score={selectedCandidate.aiScores.problemSolving} delay={0.4} />
          </StaggerItem>
          <StaggerItem>
            <ScoreCard label="Teamwork" score={selectedCandidate.aiScores.teamwork} delay={0.5} />
          </StaggerItem>
          <StaggerItem>
            <ScoreCard label="Learning Potential" score={selectedCandidate.aiScores.learningPotential} delay={0.6} />
          </StaggerItem>
          <StaggerItem>
            <ScoreCard label="ATS Score" score={selectedCandidate.aiScores.atsCompatibility} delay={0.7} />
          </StaggerItem>
        </StaggerContainer>

        {/* Radar Chart + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Skills Radar</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--color-border, #edf0f4)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 11, fill: 'var(--color-text-secondary, #6b7a8d)' }}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#4c6ef5"
                      fill="#4c6ef5"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-4">
            {/* Strengths */}
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-3">
                Strengths
              </h3>
              <ul className="space-y-2">
                {selectedCandidate.aiScores.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-700 dark:text-surface-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Weaknesses */}
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-3">
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {selectedCandidate.aiScores.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-700 dark:text-surface-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Recommendation */}
            <Card padding="lg" className="bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-900/10 dark:to-violet-900/10 border-brand-200/50 dark:border-brand-800/30">
              <h3 className="text-sm font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wide mb-2">
                AI Recommendation
              </h3>
              <p className="text-sm text-surface-700 dark:text-surface-300">
                {selectedCandidate.aiScores.recommendations[0]}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-surface-500">Confidence:</span>
                <Badge variant="brand">{selectedCandidate.aiScores.confidenceLevel}%</Badge>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
