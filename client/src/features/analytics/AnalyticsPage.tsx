import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/shared/PageTransition';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { hiringFunnelData, monthlyApplicationsData, topSkillsData } from '@/data/sampleData';
import { useState } from 'react';
import toast from 'react-hot-toast';

const departmentData = [
  { name: 'Engineering', value: 456, color: '#4c6ef5' },
  { name: 'Design', value: 189, color: '#7c3aed' },
  { name: 'AI/ML', value: 234, color: '#06b6d4' },
  { name: 'Product', value: 145, color: '#f59e0b' },
  { name: 'Marketing', value: 98, color: '#10b981' },
];

const metrics = [
  { label: 'Acceptance Rate', value: 23, suffix: '%', color: 'text-emerald-500' },
  { label: 'Avg Time to Hire', value: 18, suffix: ' days', color: 'text-brand-500' },
  { label: 'Offer Accept Rate', value: 87, suffix: '%', color: 'text-violet-500' },
  { label: 'Cost Per Hire', value: 4200, prefix: '$', color: 'text-amber-500' },
];

export function AnalyticsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh (analytics uses static data in demo)
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Analytics data refreshed');
    } catch (error) {
      toast.error('Failed to refresh analytics');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics</h1>
            <p className="text-surface-500 mt-1">Recruitment performance metrics and insights</p>
          </div>
          <Button 
            variant="secondary" 
            icon={<RotateCw size={16} />} 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Key Metrics */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <StaggerItem key={metric.label}>
              <Card>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">{metric.label}</p>
                <p className={`text-3xl font-bold mt-2 ${metric.color}`}>
                  <AnimatedCounter value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
                </p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Applications Over Time</h3>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyApplicationsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #edf0f4)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7a8d' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7a8d' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid #edf0f4',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#4c6ef5"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#4c6ef5' }}
                      activeDot={{ r: 6, fill: '#4c6ef5' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">By Department</h3>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      stroke="none"
                    >
                      {departmentData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {departmentData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-surface-500">{d.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Top Skills */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Top Skills in Applicant Pool</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSkillsData} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border, #edf0f4)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7a8d' }} />
                  <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7a8d' }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4c6ef5" radius={[0, 6, 6, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
