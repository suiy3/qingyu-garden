import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Phone,
  Sparkles,
  LogOut,
  ArrowRight,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Brain,
  ChevronDown,
  Lightbulb,
  Info,
  X,
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import MoodChart from '@/components/mood/MoodChart';
import { useAppStore } from '@/store/useAppStore';
import { MOOD_CONFIG, SUBJECT_CONFIG } from '@/utils/constants';
import { getPastDays, formatDate } from '@/utils/date';
import { MoodType, SubjectType, MoodRecord } from '@/types';
import { discoverPatterns, PatternInsight } from '@/utils/patternEngine';
import { cn } from '@/lib/utils';
import { clearParentAccess } from '@/utils/parentAccess';

const NEGATIVE_MOODS: MoodType[] = ['anxious', 'sad', 'angry', 'tired'];

interface RiskAnalysis {
  hasRisk: boolean;
  level: 'high' | 'medium' | 'low' | 'none';
  consecutiveDays: number;
  negativeDays: number;
  details: { date: string; mood: MoodType; intensity: number }[];
}

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { moodRecords, studyRecords } = useAppStore();
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<7 | 14 | 21>(21);
  const [showRiskGuide, setShowRiskGuide] = useState(false);

  // 跨变量规律发现
  const patterns = useMemo<PatternInsight[]>(
    () => discoverPatterns(moodRecords, studyRecords),
    [moodRecords, studyRecords]
  );

  // 风险分析
  const riskAnalysis = useMemo((): RiskAnalysis => {
    const pastDays = getPastDays(timeRange);

    const recordsByDate = moodRecords.reduce<Record<string, MoodRecord[]>>((acc, record) => {
      const date = formatDate(record.createdAt);
      if (!acc[date]) acc[date] = [];
      acc[date].push(record);
      return acc;
    }, {});

    let negativeDays = 0;
    let maxConsecutive = 0;
    let currentConsecutive = 0;
    let riskDetails: { date: string; mood: MoodType; intensity: number }[] = [];
    let tempDetails: typeof riskDetails = [];

    for (const dateStr of pastDays) {
      const dayRecords = recordsByDate[dateStr] || [];
      const negativeRecords = dayRecords.filter(
        (r) => NEGATIVE_MOODS.includes(r.moodType) && r.intensity >= 6
      );

      if (negativeRecords.length > 0) {
        negativeDays++;
        currentConsecutive++;
        const maxRecord = negativeRecords.reduce((max, r) =>
          r.intensity > max.intensity ? r : max
        );
        tempDetails.push({
          date: dateStr,
          mood: maxRecord.moodType,
          intensity: maxRecord.intensity,
        });
        if (currentConsecutive > maxConsecutive) {
          maxConsecutive = currentConsecutive;
          riskDetails = [...tempDetails];
        }
      } else {
        currentConsecutive = 0;
        tempDetails = [];
      }
    }

    let level: RiskAnalysis['level'] = 'none';
    const thresholdHigh = Math.ceil(timeRange * 0.7);
    const thresholdMed = Math.ceil(timeRange * 0.5);
    const thresholdLow = Math.ceil(timeRange * 0.25);
    if (maxConsecutive >= thresholdHigh || negativeDays >= thresholdHigh) level = 'high';
    else if (maxConsecutive >= 3 || negativeDays >= thresholdMed) level = 'medium';
    else if (negativeDays >= thresholdLow) level = 'low';

    return {
      hasRisk: level === 'high' || level === 'medium',
      level,
      consecutiveDays: maxConsecutive,
      negativeDays,
      details: riskDetails.slice(0, 3),
    };
  }, [moodRecords, timeRange]);

  // 学习数据
  const studyStats = useMemo(() => {
    const pastDays = getPastDays(timeRange);
    const weekRecords = studyRecords.filter((r) =>
      pastDays.includes(formatDate(r.createdAt))
    );

    const totalMinutes = weekRecords.reduce((sum, r) => sum + r.duration, 0);
    const avgDaily = totalMinutes / timeRange;

    const subjectMinutes: Record<string, number> = {};
    weekRecords.forEach((r) => {
      subjectMinutes[r.subject] = (subjectMinutes[r.subject] || 0) + r.duration;
    });

    const pieData = Object.entries(subjectMinutes)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({
        name: SUBJECT_CONFIG[k as SubjectType].label,
        value: v,
        color: SUBJECT_CONFIG[k as SubjectType].color,
      }))
      .sort((a, b) => b.value - a.value);

    return { totalMinutes, avgDaily, pieData };
  }, [studyRecords, timeRange]);

  // 情绪分布
  const moodDistribution = useMemo(() => {
    const pastDays = getPastDays(timeRange);
    const weekRecords = moodRecords.filter((r) =>
      pastDays.includes(formatDate(r.createdAt))
    );

    const moodCount: Record<MoodType, number> = {
      happy: 0, calm: 0, anxious: 0, sad: 0, angry: 0, tired: 0,
    };
    weekRecords.forEach((r) => { moodCount[r.moodType]++; });

    const total = weekRecords.length;
    const positive = moodCount.happy + moodCount.calm;
    const negative = moodCount.anxious + moodCount.sad + moodCount.angry + moodCount.tired;

    return {
      total,
      positivePercent: total > 0 ? Math.round((positive / total) * 100) : 0,
      negativePercent: total > 0 ? Math.round((negative / total) * 100) : 0,
    };
  }, [moodRecords, timeRange]);

  // 趋势对比
  const weeklyTrend = useMemo(() => {
    const pastDays = getPastDays(timeRange);
    const moodByDate: Record<string, number> = {};

    moodRecords.forEach((r) => {
      const date = formatDate(r.createdAt);
      if (pastDays.includes(date)) {
        const score = { happy: 5, calm: 4, tired: 2.5, anxious: 2, sad: 1.5, angry: 1 }[r.moodType];
        if (!moodByDate[date] || score < moodByDate[date]) {
          moodByDate[date] = score;
        }
      }
    });

    const halfLen = Math.floor(timeRange / 2);
    const firstHalf = pastDays.slice(0, halfLen).reduce((s, d) => s + (moodByDate[d] || 0), 0) / halfLen;
    const lastHalf = pastDays.slice(-halfLen).reduce((s, d) => s + (moodByDate[d] || 0), 0) / halfLen;

    if (firstHalf === 0 || lastHalf === 0) return { trend: 'stable', diff: 0 };
    const diff = lastHalf - firstHalf;
    if (diff > 0.4) return { trend: 'up', diff: Math.round(diff * 10) };
    if (diff < -0.4) return { trend: 'down', diff: Math.round(Math.abs(diff) * 10) };
    return { trend: 'stable', diff: 0 };
  }, [moodRecords, timeRange]);

  const handleExit = () => {
    clearParentAccess();
    navigate('/profile');
  };

  const riskConfig = {
    high: { label: '需重点关注', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle },
    medium: { label: '需要留意', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle },
    low: { label: '状态平稳', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle },
    none: { label: '状态良好', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle },
  };
  const risk = riskConfig[riskAnalysis.level];
  const RiskIcon = risk.icon;

  return (
    <PageContainer title="家长守护" showBack backTo="/parent">
      <div className="px-4 py-4 space-y-4 pb-20">
        {/* AI规律发现头条 */}
        {patterns.length > 0 && (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-blue-400" />
                <span className="text-sm font-medium text-white">AI 规律发现</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {patterns.length} 条规律 · 21天分析
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {patterns.map((pattern) => {
                const isExpanded = expandedPattern === pattern.id;
                return (
                  <div key={pattern.id}>
                    <button
                      onClick={() => setExpandedPattern(isExpanded ? null : pattern.id)}
                      className="w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-1 h-12 rounded-full flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: pattern.accentColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                            {pattern.title}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {pattern.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: `${pattern.accentColor}15`,
                                color: pattern.accentColor,
                              }}
                            >
                              置信度 {pattern.confidence}%
                            </span>
                            <span className="text-[10px] text-gray-400">{pattern.dataSource}</span>
                          </div>
                        </div>
                        <ChevronDown
                          size={16}
                          className={cn(
                            'text-gray-400 flex-shrink-0 mt-1 transition-transform',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 animate-fade-in">
                        {/* 反直觉洞察 */}
                        <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3">
                          <Lightbulb size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] font-medium text-amber-700 mb-0.5">
                              你可能没想到
                            </p>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {pattern.counterintuitive}
                            </p>
                          </div>
                        </div>

                        {/* 建议行动 */}
                        <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-3">
                          <ArrowRight size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] font-medium text-blue-700 mb-0.5">
                              建议怎么做
                            </p>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {pattern.suggestion}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 时间范围切换 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[7, 14, 21].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days as 7 | 14 | 21)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  timeRange === days
                    ? 'bg-slate-800 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                )}
              >
                {days}天
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">数据概览</span>
        </div>

        {/* 顶部风险概览 */}
        <div className={cn('rounded-xl border p-4', risk.bg, risk.border)}>
          <div className="flex items-start gap-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', risk.bg, 'border', risk.border)}>
              <RiskIcon size={20} className={risk.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className={cn('text-base font-semibold', risk.color)}>{risk.label}</h3>
                <span className="text-xs text-gray-500">近{timeRange}天</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowRiskGuide(true); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Info size={12} />
                </button>
              </div>
              <div className="flex items-baseline gap-4 mt-1">
                <div>
                  <span className="text-xl font-bold text-gray-900">{riskAnalysis.negativeDays}</span>
                  <span className="text-xs text-gray-500 ml-1">天负面情绪</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">{riskAnalysis.consecutiveDays}</span>
                  <span className="text-xs text-gray-500 ml-1">天连续</span>
                </div>
              </div>
            </div>
            {riskAnalysis.hasRisk && (
              <button
                onClick={() => navigate('/parent/crisis')}
                className="flex-shrink-0 text-xs font-medium text-red-600 flex items-center gap-0.5"
              >
                应对建议
                <ArrowRight size={12} />
              </button>
            )}
          </div>

          {riskAnalysis.details.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200/60 space-y-1.5">
              {riskAnalysis.details.map((d, i) => (
                <div key={i} className="flex items-center text-xs">
                  <span className="w-10 text-gray-400">{d.date.slice(5)}</span>
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: MOOD_CONFIG[d.mood].color }} />
                  <span className="text-gray-600 flex-1">{MOOD_CONFIG[d.mood].label}</span>
                  <span className="text-gray-400">强度 {d.intensity}/10</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 数据概览卡片组 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 情绪状态 */}
          <Card className="p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Activity size={14} className="text-slate-500" />
              <span className="text-xs text-gray-500">情绪状态</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-gray-900">
                {moodDistribution.positivePercent}%
              </span>
              <span className="text-xs text-emerald-600">积极</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {weeklyTrend.trend === 'up' && (
                <TrendingUp size={12} className="text-emerald-500" />
              )}
              {weeklyTrend.trend === 'down' && (
                <TrendingDown size={12} className="text-red-500" />
              )}
              <span className={cn(
                weeklyTrend.trend === 'up' && 'text-emerald-600',
                weeklyTrend.trend === 'down' && 'text-red-600',
                weeklyTrend.trend === 'stable' && 'text-gray-500'
              )}>
                {weeklyTrend.trend === 'up' && `较上周+${weeklyTrend.diff}%`}
                {weeklyTrend.trend === 'down' && `较上周-${weeklyTrend.diff}%`}
                {weeklyTrend.trend === 'stable' && '与上周持平'}
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
                style={{ width: `${moodDistribution.positivePercent}%` }}
              />
            </div>
          </Card>

          {/* 学习时长 */}
          <Card className="p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock size={14} className="text-slate-500" />
              <span className="text-xs text-gray-500">本周学习</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(studyStats.totalMinutes)}
              </span>
              <span className="text-xs text-gray-500">分钟</span>
            </div>
            <div className="text-xs text-gray-500 mb-1.5">
              日均 {Math.round(studyStats.avgDaily)} 分钟
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"
                style={{ width: `${Math.min((studyStats.totalMinutes / 1800) * 100, 100)}%` }}
              />
            </div>
          </Card>
        </div>

        {/* 情绪趋势图 */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-slate-600" />
              <h3 className="text-sm font-semibold text-gray-800">情绪趋势</h3>
              <span className="text-xs text-gray-400">近7天</span>
            </div>
            <button
              onClick={() => navigate('/parent/crisis')}
              className="text-xs text-blue-600 flex items-center gap-0.5"
            >
              详情
              <ArrowRight size={12} />
            </button>
          </div>
          <MoodChart records={moodRecords} days={timeRange} compact />
        </Card>

        {/* 科目分布 */}
        {studyStats.pieData.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <PieChart size={16} className="text-slate-600" />
              <h3 className="text-sm font-semibold text-gray-800">科目分布</h3>
              <span className="text-xs text-gray-400">本周</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-32 h-32 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={studyStats.pieData}
                      cx="50%" cy="50%"
                      innerRadius={28} outerRadius={52}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {studyStats.pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => `${v} 分钟`}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 4px 12px -2px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-1.5">
                {studyStats.pieData.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-gray-600 flex-1 truncate">{item.name}</span>
                    <span className="text-xs font-medium text-gray-800">{item.value}分</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* 功能入口 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/parent/crisis')}
            className="text-left bg-white border border-gray-200 rounded-xl p-3.5 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mb-2.5">
              <Phone size={18} className="text-slate-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-800 mb-0.5">危机引导</h4>
            <p className="text-xs text-gray-500">求助热线与危险信号</p>
          </button>

          <button
            onClick={() => navigate('/parent/communication')}
            className="text-left bg-white border border-gray-200 rounded-xl p-3.5 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-2.5">
              <Sparkles size={18} className="text-blue-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-800 mb-0.5">今日对话卡</h4>
            <p className="text-xs text-gray-500">AI生成 · 拿去就能用</p>
          </button>
        </div>

        {/* 记录日历预览 */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-slate-600" />
            <h3 className="text-sm font-semibold text-gray-800">记录日历</h3>
            <span className="text-xs text-gray-400">近{timeRange}天</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getPastDays(timeRange).map((date) => {
              const dayRecords = moodRecords.filter((r) => formatDate(r.createdAt) === date);
              const hasRecord = dayRecords.length > 0;
              const hasNegative = dayRecords.some(
                (r) => NEGATIVE_MOODS.includes(r.moodType) && r.intensity >= 6
              );
              const hasPositive = dayRecords.some(
                (r) => (r.moodType === 'happy' || r.moodType === 'calm') && r.intensity >= 6
              );

              let dotColor = 'bg-gray-200';
              if (hasNegative) dotColor = 'bg-red-400';
              else if (hasPositive) dotColor = 'bg-emerald-400';
              else if (hasRecord) dotColor = 'bg-amber-400';

              return (
                <div key={date} className="flex flex-col items-center gap-0.5">
                  <div className="w-full aspect-square rounded-md bg-gray-50 flex items-center justify-center">
                    <div className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />
                  </div>
                  <span className="text-[9px] text-gray-400">
                    {date.slice(-2)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-gray-500">积极</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[10px] text-gray-500">一般</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[10px] text-gray-500">负面</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-200" />
              <span className="text-[10px] text-gray-500">无记录</span>
            </div>
          </div>
        </Card>

        {/* 退出按钮 */}
        <Button
          variant="secondary"
          size="md"
          className="w-full border border-gray-200"
          onClick={handleExit}
        >
          <LogOut size={16} className="mr-2" />
          退出守护模式
        </Button>
      </div>

      {/* 风险等级说明弹窗 */}
      {showRiskGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={() => setShowRiskGuide(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 max-w-sm w-full max-h-[75vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">风险等级怎么评定？</h3>
              <button
                onClick={() => setShowRiskGuide(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                风险等级基于孩子近期的情绪记录自动评估，
                <span className="font-medium text-gray-700">不是医学诊断</span>，
                仅作为家长关注的参考。
              </p>

              <div className="space-y-2">
                {[
                  { level: '高风险', color: 'bg-red-500', desc: '负面情绪超过70%的天数，或连续低落超过阈值' },
                  { level: '中风险', color: 'bg-orange-500', desc: '负面情绪超过50%，或连续3天以上低落' },
                  { level: '需关注', color: 'bg-yellow-500', desc: '负面情绪约占25%，还没到连续状态' },
                  { level: '状态良好', color: 'bg-green-500', desc: '大部分时间情绪平稳或积极' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: item.color.includes('red') ? '#ef4444' : item.color.includes('orange') ? '#f97316' : item.color.includes('yellow') ? '#eab308' : '#22c55e' }} />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.level}</p>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                <p className="text-xs font-medium text-gray-700">判定依据：</p>
                <ul className="text-[11px] text-gray-500 space-y-1 leading-relaxed">
                  <li>• 负面情绪 = 难过、焦虑、生气、疲惫 且强度 ≥ 6</li>
                  <li>• 连续负面天数 比 总负面天数 更值得关注</li>
                  <li>• 时间范围越长，统计越有参考价值</li>
                </ul>
              </div>

              <p className="text-[10px] text-gray-400 text-center">
                如持续担心，请寻求专业心理帮助
              </p>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
