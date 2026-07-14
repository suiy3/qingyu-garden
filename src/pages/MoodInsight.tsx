import { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Flame, Sparkles, Calendar, Info, X } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/common/Card';
import MoodChart from '@/components/mood/MoodChart';
import MoodHeatmap from '@/components/mood/MoodHeatmap';
import { useAppStore } from '@/store/useAppStore';
import { MOOD_CONFIG, TRIGGER_CONFIG } from '@/utils/constants';
import { formatDate, getPastDays } from '@/utils/date';
import { MoodType, TriggerType } from '@/types';
import { cn } from '@/lib/utils';

export default function MoodInsight() {
  const { moodRecords } = useAppStore();
  const [chartDays, setChartDays] = useState<7 | 14 | 21>(7);
  const [showScoreGuide, setShowScoreGuide] = useState(false);

  const moodDistribution = useMemo(() => {
    const count: Record<MoodType, number> = {
      happy: 0,
      calm: 0,
      anxious: 0,
      sad: 0,
      angry: 0,
      tired: 0,
    };

    moodRecords.forEach((record) => {
      count[record.moodType] = (count[record.moodType] || 0) + 1;
    });

    const total = moodRecords.length;

    return (Object.keys(count) as MoodType[])
      .filter((mood) => count[mood] > 0)
      .map((mood) => ({
        name: MOOD_CONFIG[mood].label,
        value: count[mood],
        percentage: total > 0 ? Math.round((count[mood] / total) * 100) : 0,
        color: MOOD_CONFIG[mood].color,
        emoji: MOOD_CONFIG[mood].emoji,
      }))
      .sort((a, b) => b.value - a.value);
  }, [moodRecords]);

  const triggerAnalysis = useMemo(() => {
    const count: Record<TriggerType, number> = {
      study: 0,
      relationship: 0,
      family: 0,
      health: 0,
      other: 0,
    };

    moodRecords.forEach((record) => {
      record.triggers.forEach((trigger) => {
        count[trigger] = (count[trigger] || 0) + 1;
      });
    });

    return (Object.keys(count) as TriggerType[])
      .map((trigger) => ({
        name: TRIGGER_CONFIG[trigger].label,
        value: count[trigger],
        emoji: TRIGGER_CONFIG[trigger].emoji,
      }))
      .sort((a, b) => b.value - a.value);
  }, [moodRecords]);

  const streakDays = useMemo(() => {
    const pastDays = getPastDays(30);
    let streak = 0;

    const recordDates = new Set(
      moodRecords.map((record) => formatDate(record.createdAt))
    );

    for (let i = pastDays.length - 1; i >= 0; i--) {
      if (recordDates.has(pastDays[i])) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [moodRecords]);

  const insightText = useMemo(() => {
    if (moodRecords.length === 0) {
      return '还没有记录哦，开始记录你的第一份心情吧～';
    }

    const dominantMood = moodDistribution[0];
    const avgIntensity =
      moodRecords.reduce((sum, r) => sum + r.intensity, 0) / moodRecords.length;

    let text = '';

    if (dominantMood) {
      if (dominantMood.name === '开心' || dominantMood.name === '平静') {
        text = `最近你的心情整体不错呢！${dominantMood.emoji} 继续保持这份好心情，生活中的小确幸值得被珍藏。`;
      } else if (dominantMood.name === '焦虑' || dominantMood.name === '难过' || dominantMood.name === '生气') {
        text = `最近${dominantMood.name}的情绪出现得比较多 ${dominantMood.emoji} 没关系的，每个人都会有这样的时候。试着做一些让自己放松的事情，慢慢会好起来的～`;
      } else if (dominantMood.name === '疲惫') {
        text = `最近感觉有点累呢 ${dominantMood.emoji} 记得好好休息，照顾好自己的身体最重要。适当放松一下吧～`;
      }
    }

    if (streakDays >= 3) {
      text += ` 你已经连续记录 ${streakDays} 天了，真棒！`;
    }

    if (avgIntensity >= 7) {
      text += ' 情绪强度偏高的时候，试试深呼吸或正念练习来调节一下～';
    }

    return text;
  }, [moodRecords, moodDistribution, streakDays]);

  const totalRecords = moodRecords.length;

  const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof moodDistribution[0] }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 rounded-2xl shadow-soft-lg border border-warm-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">{data.emoji}</span>
            <span className="font-semibold text-gray-800">{data.name}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {data.value} 次 · {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof triggerAnalysis[0] }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 rounded-2xl shadow-soft-lg border border-warm-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">{data.emoji}</span>
            <span className="font-semibold text-gray-800">{data.name}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">出现 {data.value} 次</p>
        </div>
      );
    }
    return null;
  };

  return (
    <PageContainer title="情绪洞察" showBack>
      <div className="px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-soft">
                <Calendar className="text-orange-500" size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalRecords}</p>
                <p className="text-sm text-gray-500">总记录数</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 to-pink-100 border-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-soft">
                <Flame className="text-rose-500" size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{streakDays}</p>
                <p className="text-sm text-gray-500">连续记录</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-orange-50 via-amber-50 to-pink-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex-shrink-0 flex items-center justify-center shadow-soft">
              <Sparkles className="text-orange-400" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">小晴对你说</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{insightText}</p>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-gray-700">情绪趋势</h3>
            <button
              onClick={() => setShowScoreGuide(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Info size={14} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            {[7, 14, 21].map((days) => (
              <button
                key={days}
                onClick={() => setChartDays(days as 7 | 14 | 21)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors',
                  chartDays === days
                    ? 'bg-primary-500 text-white'
                    : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                )}
              >
                {days}天
              </button>
            ))}
          </div>
        </div>
        <MoodChart records={moodRecords} days={chartDays} />

        {/* 情绪热力图 */}
        <Card className="overflow-hidden">
          <MoodHeatmap records={moodRecords} weeks={13} />
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">情绪分布</h3>
          {moodDistribution.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {moodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {moodDistribution.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.emoji} {item.name}</span>
                    <span className="text-sm font-medium text-gray-800 ml-auto">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              暂无数据
            </div>
          )}
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">触发因素分析</h3>
          {triggerAnalysis.some((t) => t.value > 0) ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={triggerAnalysis}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F48FB1" />
                        <stop offset="100%" stopColor="#FF8A65" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#F5F5F5"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(244, 143, 177, 0.1)' }} />
                    <Bar
                      dataKey="value"
                      fill="url(#barGradient)"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {triggerAnalysis
                  .filter((t) => t.value > 0)
                  .map((item) => (
                    <span
                      key={item.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 text-sm"
                    >
                      <span>{item.emoji}</span>
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-medium text-orange-600">{item.value}</span>
                    </span>
                  ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              暂无数据
            </div>
          )}
        </Card>
      </div>

      {/* 分数说明弹窗 */}
      {showScoreGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setShowScoreGuide(false)}>
          <div
            className="bg-white rounded-2xl p-5 max-w-sm w-full max-h-[70vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">情绪分数怎么算？</h3>
              <button
                onClick={() => setShowScoreGuide(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
              情绪采用<span className="font-medium text-gray-700">5 分制</span>，
              分数越高表示情绪越好。不是考试分数，没有"及格不及格"的说法。
              </p>

              <div className="space-y-2.5">
                {[
                  { score: 5, mood: '开心', color: 'bg-green-500', desc: '今天特别好，活力满满' },
                  { score: 4, mood: '平静', color: 'bg-blue-400', desc: '还行，比较放松' },
                  { score: 3, mood: '一般', color: 'bg-yellow-400', desc: '没什么特别的感觉' },
                  { score: 2, mood: '低落', color: 'bg-orange-400', desc: '有点不开心，但还能承受' },
                  { score: 1, mood: '难受', color: 'bg-red-500', desc: '很难受，需要帮助' },
                ].map((item) => (
                  <div key={item.score} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: item.color.includes('green') ? '#22c55e' : item.color.includes('blue') ? '#60a5fa' : item.color.includes('yellow') ? '#facc15' : item.color.includes('orange') ? '#fb923c' : '#ef4444' }}>
                      {item.score}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.mood}</p>
                      <p className="text-[11px] text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-warm-50 rounded-xl p-3 mt-2">
                <p className="text-[11px] text-warm-700 leading-relaxed">
                  💡 <span className="font-medium">为什么不用100分？</span><br />
                  情绪本来就没有精确到个位，5个等级更诚实。
                  趋势图和平均分的小数点，是多天数据合起来看的趋势，不是某天的精确分数。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
