import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MoodRecord, MoodType } from '@/types';
import { MOOD_CONFIG } from '@/utils/constants';
import { formatDate, getPastDays, getDayOfWeek } from '@/utils/date';
import { cn } from '@/lib/utils';

interface MoodChartProps {
  records: MoodRecord[];
  days?: number;
  compact?: boolean;
}

const MOOD_SCORE: Record<MoodType, number> = {
  happy: 5,
  calm: 4,
  anxious: 2,
  sad: 1,
  angry: 1,
  tired: 2,
};

const Y_AXIS_LABELS: Record<number, string> = {
  1: '低落',
  2: '不安',
  3: '一般',
  4: '平稳',
  5: '愉悦',
};

interface ChartDataPoint {
  date: string;
  label: string;
  score: number | null;
  moodLabel: string;
  moodEmoji: string;
}

export default function MoodChart({ records, days = 7, compact = false }: MoodChartProps) {
  const chartData = useMemo((): ChartDataPoint[] => {
    const pastDays = getPastDays(days);

    const recordsByDate = records.reduce<Record<string, MoodRecord[]>>((acc, record) => {
      const date = formatDate(record.createdAt);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {});

    return pastDays.map((dateStr) => {
      const dayRecords = recordsByDate[dateStr] || [];
      const dayOfWeek = getDayOfWeek(dateStr);
      const monthDay = dateStr.slice(5);

      if (dayRecords.length === 0) {
        return {
          date: monthDay,
          label: dayOfWeek,
          score: null,
          moodLabel: '无记录',
          moodEmoji: '❓',
        };
      }

      const totalScore = dayRecords.reduce((sum, r) => {
        const baseScore = MOOD_SCORE[r.moodType];
        const intensityFactor = r.intensity / 10;
        return sum + baseScore + (baseScore * intensityFactor * 0.3);
      }, 0);

      const avgScore = Math.min(5, Math.max(1, totalScore / dayRecords.length));
      const roundedScore = Math.round(avgScore * 10) / 10;

      const moodCount: Record<MoodType, number> = {} as Record<MoodType, number>;
      dayRecords.forEach((r) => {
        moodCount[r.moodType] = (moodCount[r.moodType] || 0) + 1;
      });
      const dominantMood = (Object.keys(moodCount) as MoodType[]).reduce(
        (a, b) => (moodCount[a] > moodCount[b] ? a : b),
        dayRecords[0].moodType
      );

      return {
        date: monthDay,
        label: dayOfWeek,
        score: roundedScore,
        moodLabel: MOOD_CONFIG[dominantMood].label,
        moodEmoji: MOOD_CONFIG[dominantMood].emoji,
      };
    });
  }, [records, days]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataPoint }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.score === null) {
        return (
          <div className="bg-white px-4 py-3 rounded-[20px] shadow-soft-lg border border-warm-100">
            <p className="text-sm font-medium text-gray-600">{data.label}</p>
            <p className="text-xs text-gray-400 mt-1">暂无记录</p>
          </div>
        );
      }
      return (
        <div className="bg-white px-4 py-3 rounded-[20px] shadow-soft-lg border border-warm-100">
          <p className="text-sm font-medium text-gray-600">{data.label}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl">{data.moodEmoji}</span>
            <span className="font-semibold text-gray-800">{data.moodLabel}</span>
          </div>
          <p className="text-xs text-primary-600 mt-1">
            情绪指数: {data.score?.toFixed(1)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn(
      'w-full',
      compact ? '' : 'bg-white rounded-[20px] p-5 shadow-soft'
    )}>
      {!compact && <h3 className="text-lg font-semibold text-gray-800 mb-4">情绪趋势</h3>}

      <div className={compact ? 'h-40' : 'h-64 sm:h-72'}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FFB74D" />
                <stop offset="100%" stopColor="#FF8A65" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F5F5F5"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />

            <YAxis
              domain={[0, 6]}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => {
                if (value === 0 || value === 6) return '';
                return Y_AXIS_LABELS[value] || '';
              }}
              width={45}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FFB74D', strokeDasharray: '5 5' }} />

            <Line
              type="monotone"
              dataKey="score"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={(props: { cx?: number; cy?: number; payload?: ChartDataPoint }) => {
                const { cx, cy, payload } = props;
                if (payload?.score === null) return null;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill="white"
                    stroke="#FFB74D"
                    strokeWidth={3}
                  />
                );
              }}
              activeDot={{ r: 8, fill: '#FF8A65', stroke: 'white', strokeWidth: 2 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {!compact && (
        <div className="flex justify-between mt-4 px-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-400 to-primary-600" />
            <span className="text-xs text-gray-500">情绪指数</span>
          </div>
          <span className="text-xs text-gray-400">近 {days} 天</span>
        </div>
      )}
    </div>
  );
}
