import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ChartData } from '@/types';

interface HiringFunnelChartProps {
  data: ChartData[];
}

export function HiringFunnelChart({ data }: HiringFunnelChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #edf0f4)" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary, #6b7a8d)' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary, #6b7a8d)' }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--glass-bg, rgba(255,255,255,0.9))',
              border: '1px solid var(--glass-border, rgba(0,0,0,0.1))',
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            cursor={{ fill: 'rgba(92, 124, 250, 0.05)' }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#4c6ef5'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
