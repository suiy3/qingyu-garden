import { useMemo, useState } from 'react';
import { MoodRecord, MoodType } from '@/types';
import { MOOD_CONFIG } from '@/utils/constants';
import { formatDate } from '@/utils/date';
import { cn } from '@/lib/utils';

interface MoodHeatmapProps {
  records: MoodRecord[];
  weeks?: number; // 显示多少周，默认13周（约3个月）
}

// 情绪分值映射
const MOOD_SCORE: Record<MoodType, number> = {
  happy: 5,
  calm: 4,
  tired: 2.5,
  anxious: 2,
  sad: 1.5,
  angry: 1,
};

// 分值 → 颜色（GitHub风格梯度，但用情绪语义色）
function scoreToColor(score: number | null, intensity: number): string {
  if (score === null) return '#F3F4F6'; // 无记录：浅灰
  const adjusted = score * (0.6 + intensity / 10 * 0.4); // 考虑强度
  if (adjusted >= 4.5) return '#10B981'; // 愉悦：深绿
  if (adjusted >= 3.5) return '#6EE7B7'; // 平稳：浅绿
  if (adjusted >= 2.5) return '#FCD34D'; // 一般：黄
  if (adjusted >= 1.5) return '#FB923C'; // 不太好：橙
  return '#F87171'; // 低落：红
}

function scoreToLabel(score: number | null): string {
  if (score === null) return '无记录';
  if (score >= 4.5) return '愉悦';
  if (score >= 3.5) return '平稳';
  if (score >= 2.5) return '一般';
  if (score >= 1.5) return '不太好';
  return '低落';
}

// 获取最近N周的日期数组（按周分组，每周7天）
function getRecentWeeks(weeks: number): string[][] {
  const today = new Date();
  const result: string[][] = [];
  // 找到本周周日（让最右一列是当前周）
  const dayOfWeek = today.getDay();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - dayOfWeek - (weeks - 1) * 7);

  for (let w = 0; w < weeks; w++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      // 只显示过去的日期（包括今天）
      if (date <= today) {
        week.push(formatDate(date));
      } else {
        week.push('');
      }
    }
    result.push(week);
  }
  return result;
}

export default function MoodHeatmap({ records, weeks = 13 }: MoodHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    mood?: MoodRecord;
    score: number | null;
    x: number;
    y: number;
  } | null>(null);

  // 按日期聚合情绪（取最强的一条）
  const moodByDate = useMemo(() => {
    const map = new Map<string, MoodRecord>();
    records.forEach((r) => {
      const date = formatDate(r.createdAt);
      const existing = map.get(date);
      if (!existing || r.intensity > existing.intensity) {
        map.set(date, r);
      }
    });
    return map;
  }, [records]);

  const weekData = useMemo(() => getRecentWeeks(weeks), [weeks]);

  // 统计数据
  const stats = useMemo(() => {
    const allDates = weekData.flat().filter(Boolean);
    const recorded = allDates.filter((d) => moodByDate.has(d));
    const scores = recorded.map((d) => {
      const m = moodByDate.get(d)!;
      return MOOD_SCORE[m.moodType] * (0.6 + m.intensity / 10 * 0.4);
    });
    const avg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
    const goodDays = scores.filter((s) => s >= 3.5).length;
    const badDays = scores.filter((s) => s < 2.5).length;

    return {
      total: allDates.length,
      recorded: recorded.length,
      avgScore: avg,
      goodDays,
      badDays,
    };
  }, [weekData, moodByDate]);

  const dayLabels = ['一', '', '三', '', '五', '', '日'];

  return (
    <div className="relative">
      {/* 标题 + 统计 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎨</span>
          <h3 className="text-sm font-semibold text-gray-700">情绪热力图</h3>
          <span className="text-xs text-gray-400">近{weeks}周</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-emerald-600 font-medium">好 {stats.goodDays}天</span>
          <span className="text-rose-500 font-medium">差 {stats.badDays}天</span>
        </div>
      </div>

      {/* 热力图主体 */}
      <div className="relative overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1 min-w-full">
          {/* 星期标签 + 网格 */}
          <div className="flex gap-1">
            {/* 星期标签列 */}
            <div className="flex flex-col gap-1 pr-1">
              {dayLabels.map((label, i) => (
                <div key={i} className="h-3.5 flex items-center">
                  <span className="text-[9px] text-gray-400">{label}</span>
                </div>
              ))}
            </div>
            {/* 热力格子 */}
            <div className="flex gap-1 flex-1">
              {weekData.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((date, di) => {
                    if (!date) {
                      return <div key={di} className="w-3.5 h-3.5" />;
                    }
                    const mood = moodByDate.get(date);
                    const score = mood ? MOOD_SCORE[mood.moodType] : null;
                    const color = mood
                      ? scoreToColor(score, mood.intensity)
                      : '#F3F4F6';

                    return (
                      <div
                        key={di}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            date,
                            mood,
                            score,
                            x: rect.left,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={(e) => {
                          if (mood) {
                            const rect = (
                              e.currentTarget as HTMLElement
                            ).getBoundingClientRect();
                            setTooltip({
                              date,
                              mood,
                              score,
                              x: rect.left,
                              y: rect.top,
                            });
                          }
                        }}
                        className={cn(
                          'w-3.5 h-3.5 rounded-sm transition-all',
                          mood
                            ? 'cursor-pointer hover:ring-2 hover:ring-gray-300 hover:scale-125'
                            : ''
                        )}
                        style={{ backgroundColor: color }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* 月份标签 */}
          <div className="flex gap-1 mt-1 ml-5">
            {weekData.map((week, wi) => {
              const firstDate = week.find(Boolean);
              if (!firstDate) return <div key={wi} className="w-3.5" />;
              const date = new Date(firstDate);
              const isMonthStart = date.getDate() <= 7;
              if (!isMonthStart) return <div key={wi} className="w-3.5" />;
              return (
                <div key={wi} className="text-[9px] text-gray-400 w-3.5">
                  {date.getMonth() + 1}月
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-end gap-1.5 mt-2">
        <span className="text-[10px] text-gray-400">少</span>
        {['#F3F4F6', '#F87171', '#FB923C', '#FCD34D', '#6EE7B7', '#10B981'].map((c) => (
          <div
            key={c}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: c }}
          />
        ))}
        <span className="text-[10px] text-gray-400">好</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2"
          style={{
            left: tooltip.x,
            top: tooltip.y - 70,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-[10px] text-gray-400 mb-1">{tooltip.date}</p>
          {tooltip.mood ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{MOOD_CONFIG[tooltip.mood.moodType].emoji}</span>
              <div>
                <p className="text-xs font-medium text-gray-700">
                  {MOOD_CONFIG[tooltip.mood.moodType].label}
                </p>
                <p className="text-[10px] text-gray-400">
                  {scoreToLabel(tooltip.score)} · 强度{tooltip.mood.intensity}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">无记录</p>
          )}
        </div>
      )}
    </div>
  );
}
