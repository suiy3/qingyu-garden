import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight, BarChart3 } from 'lucide-react';
import { Insight } from '@/utils/insightEngine';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  insight: Insight;
  onClick?: () => void;
}

const TYPE_STYLES: Record<Insight['type'], { bg: string; border: string; label: string; labelBg: string }> = {
  pattern: {
    bg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    label: '规律发现',
    labelBg: 'bg-amber-100 text-amber-700',
  },
  correlation: {
    bg: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    label: '关联分析',
    labelBg: 'bg-blue-100 text-blue-700',
  },
  warning: {
    bg: 'from-rose-50 to-red-50',
    border: 'border-rose-200',
    label: '需要关注',
    labelBg: 'bg-rose-100 text-rose-700',
  },
  positive: {
    bg: 'from-green-50 to-emerald-50',
    border: 'border-emerald-200',
    label: '积极信号',
    labelBg: 'bg-emerald-100 text-emerald-700',
  },
};

const SEVERITY_INDICATOR: Record<string, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
};

export default function InsightCard({ insight, onClick }: InsightCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const style = TYPE_STYLES[insight.type];
  const hasMore = insight.evidence && insight.evidence.length > 0;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (insight.actionLink) {
      navigate(insight.actionLink);
    }
  };

  return (
    <div
      onClick={() => {
        if (hasMore) setExpanded(!expanded);
        onClick?.();
      }}
      className={cn(
        'relative rounded-2xl border bg-gradient-to-br overflow-hidden',
        hasMore ? 'cursor-pointer' : 'cursor-default',
        'transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
        style.bg,
        style.border
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0 mt-0.5">
            {insight.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', style.labelBg)}>
                {style.label}
              </span>
              {insight.severity && (
                <span className="text-xs" title={`严重程度: ${insight.severity}`}>
                  {SEVERITY_INDICATOR[insight.severity]}
                </span>
              )}
            </div>

            <h4 className="font-bold text-gray-800 text-sm mb-1.5">
              {insight.title}
            </h4>

            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              {insight.detail}
            </p>

            {insight.suggestion && (
              <div className="flex items-start gap-1.5 mt-2 px-3 py-2 rounded-xl bg-white/70">
                <span className="text-sm flex-shrink-0">💡</span>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {insight.suggestion}
                </p>
              </div>
            )}
          </div>

          {hasMore && (
            <ChevronDown
              size={16}
              className={cn(
                'text-gray-400 flex-shrink-0 mt-1 transition-transform duration-300',
                expanded && 'rotate-180'
              )}
            />
          )}
        </div>
      </div>

      {/* 展开区：数据依据 + 行动按钮 */}
      {hasMore && expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/40 animate-fade-in">
          {/* 数据依据 */}
          {insight.evidence && insight.evidence.length > 0 && (
            <div className="pt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart3 size={12} className="text-gray-500" />
                <span className="text-[11px] font-medium text-gray-500">数据依据</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {insight.evidence.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white/70 rounded-lg px-2.5 py-2"
                  >
                    <p className="text-[10px] text-gray-400 mb-0.5">{item.label}</p>
                    <p className="text-xs font-semibold text-gray-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 行动按钮 */}
          {insight.actionText && insight.actionLink && (
            <button
              onClick={handleActionClick}
              className={cn(
                'w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5',
                'transition-all active:scale-[0.98]',
                insight.type === 'warning'
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : insight.type === 'positive'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-white/80 hover:bg-white text-gray-700 border border-gray-200'
              )}
            >
              {insight.actionText}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
