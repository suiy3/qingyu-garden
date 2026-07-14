import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Eye, Shield } from 'lucide-react';
import { MoodRecord } from '@/types';
import { predictMood } from '@/utils/moodForecast';
import { cn } from '@/lib/utils';

interface MoodForecastCardProps {
  moodRecords: MoodRecord[];
}

const RISK_COLORS = {
  low: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-400' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', dot: 'bg-amber-400' },
  high: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', dot: 'bg-rose-400' },
};

// 分值 → 情绪标签
function scoreToMood(score: number): { label: string; emoji: string; color: string } {
  if (score >= 4) return { label: '愉悦', emoji: '😊', color: '#10B981' };
  if (score >= 3) return { label: '平稳', emoji: '😌', color: '#6EE7B7' };
  if (score >= 2) return { label: '一般', emoji: '😐', color: '#FCD34D' };
  if (score >= 1.5) return { label: '偏低', emoji: '😔', color: '#FB923C' };
  return { label: '低落', emoji: '😢', color: '#F87171' };
}

export default function MoodForecastCard({ moodRecords }: MoodForecastCardProps) {
  const navigate = useNavigate();
  const forecast = useMemo(() => predictMood(moodRecords), [moodRecords]);

  if (!forecast) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🔮</span>
          <h3 className="text-sm font-semibold text-gray-700">情绪预测</h3>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          再记录 {5 - moodRecords.length > 0 ? 5 - moodRecords.length : 0} 天情绪，晴语就能预测未来几天的心情走向
        </p>
      </div>
    );
  }

  const alertConfig = {
    none: { icon: Shield, color: 'text-emerald-500', bg: 'from-emerald-500 to-green-500' },
    watch: { icon: Eye, color: 'text-amber-500', bg: 'from-amber-400 to-orange-500' },
    warning: { icon: AlertTriangle, color: 'text-rose-500', bg: 'from-rose-400 to-red-500' },
  };
  const ac = alertConfig[forecast.alert.type];
  const AlertIcon = ac.icon;

  const trendConfig = {
    improving: { icon: TrendingUp, label: '上升趋势', color: 'text-emerald-500' },
    stable: { icon: Minus, label: '保持平稳', color: 'text-blue-500' },
    declining: { icon: TrendingDown, label: '下降趋势', color: 'text-rose-500' },
  };
  const tc = trendConfig[forecast.trend];
  const TrendIcon = tc.icon;

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden">
      {/* 头部 */}
      <div className={cn('bg-gradient-to-r px-4 py-3 text-white', ac.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertIcon size={18} />
            <span className="text-sm font-bold">{forecast.alert.title}</span>
          </div>
          <span className="text-[10px] text-white/70">AI 预测</span>
        </div>
        <p className="text-xs text-white/90 mt-1.5 leading-relaxed">
          {forecast.alert.message}
        </p>
      </div>

      {/* 趋势 + 均分 */}
      <div className="px-4 py-3 grid grid-cols-2 gap-3 border-b border-gray-100">
        <div>
          <p className="text-[10px] text-gray-400 mb-1">近期趋势</p>
          <div className={cn('flex items-center gap-1.5', tc.color)}>
            <TrendIcon size={14} />
            <span className="text-xs font-semibold">{tc.label}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 mb-1">近期均分</p>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-gray-800">{forecast.avgScore}</span>
            <span className="text-[10px] text-gray-400">/ 5</span>
          </div>
        </div>
      </div>

      {/* 未来3天预测 */}
      <div className="px-4 py-3">
        <p className="text-[10px] text-gray-400 mb-2">未来 3 天预测</p>
        <div className="grid grid-cols-3 gap-2">
          {forecast.predictions.map((p, i) => {
            const mood = scoreToMood(p.predictedScore);
            const riskColor = RISK_COLORS[p.riskLevel];
            return (
              <div
                key={i}
                className={cn(
                  'rounded-xl border p-2.5 text-center',
                  riskColor.bg,
                  riskColor.border
                )}
              >
                <p className="text-[10px] text-gray-500 mb-1">{p.dayOfWeek}</p>
                <div className="text-2xl mb-1">{mood.emoji}</div>
                <p className={cn('text-xs font-bold mb-0.5', riskColor.text)}>
                  {mood.label}
                </p>
                <p className="text-[9px] text-gray-400">
                  {p.predictedScore}分 · {p.confidence}%
                </p>
              </div>
            );
          })}
        </div>

        {/* 预测理由 */}
        <div className="mt-3 space-y-1.5">
          {forecast.predictions.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px]">
              <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', RISK_COLORS[p.riskLevel].dot)} />
              <span className="text-gray-400 w-8">{p.dayOfWeek}</span>
              <span className="text-gray-500 flex-1">{p.reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 建议行动 */}
      {forecast.alert.hasAlert && (
        <div className="px-4 pb-3">
          <button
            onClick={() => navigate('/actions')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            {forecast.alert.suggestion.length > 20
              ? '试试微行动缓解'
              : forecast.alert.suggestion}
          </button>
        </div>
      )}
    </div>
  );
}
