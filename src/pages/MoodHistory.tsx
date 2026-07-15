import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Filter } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/common/Card';
import { useAppStore } from '@/store/useAppStore';
import { MOOD_CONFIG, TRIGGER_CONFIG } from '@/utils/constants';
import { MoodType } from '@/types';
import { cn } from '@/lib/utils';

const MOOD_ORDER: MoodType[] = ['happy', 'calm', 'anxious', 'sad', 'angry', 'tired'];

export default function MoodHistory() {
  const navigate = useNavigate();
  const { moodRecords } = useAppStore();
  const [selectedMood, setSelectedMood] = useState<MoodType | 'all'>('all');

  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof moodRecords> = {};
    moodRecords.forEach((record) => {
      const date = record.createdAt.split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(record);
    });
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return { groups, sortedDates };
  }, [moodRecords]);

  const filteredDates = useMemo(() => {
    if (selectedMood === 'all') return groupedByDate.sortedDates;
    return groupedByDate.sortedDates.filter((date) =>
      groupedByDate.groups[date].some((r) => r.moodType === selectedMood)
    );
  }, [groupedByDate, selectedMood]);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) return '今天';
    if (dateStr === yesterday.toISOString().split('T')[0]) return '昨天';

    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${dateStr.slice(5)} ${weekDays[d.getDay()]}`;
  };

  const moodCounts = useMemo(() => {
    const counts: Record<MoodType, number> = {
      happy: 0, calm: 0, anxious: 0, sad: 0, angry: 0, tired: 0,
    };
    moodRecords.forEach((r) => {
      counts[r.moodType]++;
    });
    return counts;
  }, [moodRecords]);

  if (moodRecords.length === 0) {
    return (
      <PageContainer title="情绪记录" showBack>
        <div className="px-4 py-20 text-center">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-600 font-medium">还没有情绪记录</p>
          <p className="text-sm text-gray-400 mt-2">
            记录每天的心情，看见自己的情绪变化
          </p>
          <button
            onClick={() => navigate('/mood-record')}
            className="mt-6 px-6 py-3 rounded-full bg-primary-500 text-white text-sm font-medium"
          >
            去记录心情
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="情绪记录" showBack>
      <div className="px-4 py-4 space-y-4 pb-8">
        {/* 统计概览 */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-rose-500" />
              <h3 className="text-sm font-bold text-gray-800">共 {moodRecords.length} 条记录</h3>
            </div>
            <button
              onClick={() => navigate('/mood-record')}
              className="text-xs text-primary-500 font-medium flex items-center gap-0.5"
            >
              记一条
              <ChevronRight size={14} />
            </button>
          </div>

          {/* 情绪分布 */}
          <div className="flex gap-1 mb-3">
            {MOOD_ORDER.map((mood) => {
              const config = MOOD_CONFIG[mood];
              const count = moodCounts[mood];
              const pct = moodRecords.length > 0 ? (count / moodRecords.length) * 100 : 0;
              if (count === 0) return null;
              return (
                <div
                  key={mood}
                  className="h-2 rounded-full bg-gradient-to-r"
                  style={{
                    width: `${pct}%`,
                    backgroundImage: `linear-gradient(to right, ${config.color}, ${config.color}cc)`,
                    minWidth: '8px',
                  }}
                  title={`${config.label}: ${count}次`}
                />
              );
            })}
          </div>

          {/* 情绪筛选 */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => setSelectedMood('all')}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                selectedMood === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              全部
            </button>
            {MOOD_ORDER.map((mood) => {
              const config = MOOD_CONFIG[mood];
              const count = moodCounts[mood];
              if (count === 0) return null;
              return (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={cn(
                    'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1',
                    selectedMood === mood
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600'
                  )}
                  style={
                    selectedMood === mood
                      ? { backgroundColor: config.color }
                      : undefined
                  }
                >
                  <span>{config.emoji}</span>
                  <span>{config.label}</span>
                  <span className="opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* 记录列表 */}
        <div className="space-y-4">
          {filteredDates.map((date) => (
            <div key={date}>
              <p className="text-xs text-gray-400 mb-2 px-1">{formatDateLabel(date)}</p>
              <Card className="p-0 overflow-hidden">
                {groupedByDate.groups[date].map((record, idx) => {
                  const config = MOOD_CONFIG[record.moodType];
                  const triggers = record.triggers.map((t) => TRIGGER_CONFIG[t]);
                  return (
                    <div
                      key={record.id}
                      className={cn(
                        'px-4 py-3 flex items-start gap-3',
                        idx < groupedByDate.groups[date].length - 1 && 'border-b border-warm-100'
                      )}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        {config.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-800">
                            {config.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            强度 {record.intensity}/10
                          </span>
                        </div>
                        {triggers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {triggers.map((t) => (
                              <span
                                key={t.label}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-warm-100 text-warm-700"
                              >
                                {t.emoji} {t.label}
                              </span>
                            ))}
                          </div>
                        )}
                        {record.note && (
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                            {record.note}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatTime(record.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>

        {filteredDates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">没有找到相关记录</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
