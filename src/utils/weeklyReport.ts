/**
 * 周成长报告生成引擎
 */

import { MoodRecord, StudyRecord, MoodType, SubjectType } from '@/types';
import { MOOD_CONFIG, SUBJECT_CONFIG } from '@/utils/constants';
import { formatDate, getPastDays, getDayOfWeek } from '@/utils/date';

const MOOD_SCORE: Record<MoodType, number> = {
  happy: 5, calm: 4, tired: 2.5, anxious: 2, sad: 1.5, angry: 1,
};

export interface WeeklyReport {
  dateRange: string;
  mood: {
    avgScore: number;
    positiveDays: number;
    negativeDays: number;
    dominantMood: { type: MoodType; count: number; label: string; emoji: string };
    bestDay: { date: string; dayOfWeek: string; score: number } | null;
    worstDay: { date: string; dayOfWeek: string; score: number } | null;
    trend: 'up' | 'down' | 'stable';
    recordDays: number;
  };
  study: {
    totalMinutes: number;
    avgDaily: number;
    recordDays: number;
    topSubject: { subject: SubjectType; minutes: number; label: string; emoji: string } | null;
    longestDay: { date: string; dayOfWeek: string; minutes: number } | null;
  };
  highlights: string[];
  suggestions: string[];
  growthQuote: string;
  resilienceChange: number;
}

export function generateWeeklyReport(
  moodRecords: MoodRecord[],
  studyRecords: StudyRecord[]
): WeeklyReport | null {
  const past7Days = getPastDays(7);
  const dateRange = `${past7Days[0].slice(5)} - ${past7Days[6].slice(5)}`;

  // === 情绪分析 ===
  const weekMoodRecords = moodRecords.filter((r) =>
    past7Days.includes(formatDate(r.createdAt))
  );

  if (weekMoodRecords.length === 0 && studyRecords.length === 0) return null;

  const moodByDate = new Map<string, MoodRecord[]>();
  weekMoodRecords.forEach((r) => {
    const date = formatDate(r.createdAt);
    if (!moodByDate.has(date)) moodByDate.set(date, []);
    moodByDate.get(date)!.push(r);
  });

  const dayScores: { date: string; dayOfWeek: string; score: number }[] = [];
  past7Days.forEach((date) => {
    const dayMoods = moodByDate.get(date);
    if (dayMoods && dayMoods.length > 0) {
      const score = Math.min(...dayMoods.map((m) => MOOD_SCORE[m.moodType]));
      dayScores.push({ date, dayOfWeek: getDayOfWeek(date), score });
    }
  });

  const avgScore = dayScores.length > 0
    ? dayScores.reduce((s, d) => s + d.score, 0) / dayScores.length
    : 0;

  const positiveDays = dayScores.filter((d) => d.score >= 3.5).length;
  const negativeDays = dayScores.filter((d) => d.score < 2.5).length;

  // 最常见情绪
  const moodCount: Record<string, number> = {};
  weekMoodRecords.forEach((r) => {
    moodCount[r.moodType] = (moodCount[r.moodType] || 0) + 1;
  });
  const dominantMoodType = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0];
  const dominantMood = dominantMoodType
    ? {
        type: dominantMoodType[0] as MoodType,
        count: dominantMoodType[1],
        label: MOOD_CONFIG[dominantMoodType[0] as MoodType].label,
        emoji: MOOD_CONFIG[dominantMoodType[0] as MoodType].emoji,
      }
    : { type: 'calm' as MoodType, count: 0, label: '平静', emoji: '😌' };

  const bestDay = dayScores.length > 0
    ? [...dayScores].sort((a, b) => b.score - a.score)[0]
    : null;
  const worstDay = dayScores.length > 0
    ? [...dayScores].sort((a, b) => a.score - b.score)[0]
    : null;

  // 趋势
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (dayScores.length >= 4) {
    const first = dayScores.slice(0, Math.floor(dayScores.length / 2));
    const last = dayScores.slice(Math.floor(dayScores.length / 2));
    const firstAvg = first.reduce((s, d) => s + d.score, 0) / first.length;
    const lastAvg = last.reduce((s, d) => s + d.score, 0) / last.length;
    if (lastAvg - firstAvg > 0.4) trend = 'up';
    else if (lastAvg - firstAvg < -0.4) trend = 'down';
  }

  // === 学习分析 ===
  const weekStudyRecords = studyRecords.filter((r) =>
    past7Days.includes(formatDate(r.createdAt))
  );

  const totalMinutes = weekStudyRecords.reduce((s, r) => s + r.duration, 0);
  const studyByDate = new Map<string, number>();
  weekStudyRecords.forEach((r) => {
    const date = formatDate(r.createdAt);
    studyByDate.set(date, (studyByDate.get(date) || 0) + r.duration);
  });

  const subjectMinutes: Record<string, number> = {};
  weekStudyRecords.forEach((r) => {
    subjectMinutes[r.subject] = (subjectMinutes[r.subject] || 0) + r.duration;
  });
  const topSubjectEntry = Object.entries(subjectMinutes).sort((a, b) => b[1] - a[1])[0];
  const topSubject = topSubjectEntry
    ? {
        subject: topSubjectEntry[0] as SubjectType,
        minutes: topSubjectEntry[1],
        label: SUBJECT_CONFIG[topSubjectEntry[0] as SubjectType].label,
        emoji: SUBJECT_CONFIG[topSubjectEntry[0] as SubjectType].emoji,
      }
    : null;

  const longestDayEntry = [...studyByDate.entries()].sort((a, b) => b[1] - a[1])[0];
  const longestDay = longestDayEntry
    ? {
        date: longestDayEntry[0],
        dayOfWeek: getDayOfWeek(longestDayEntry[0]),
        minutes: longestDayEntry[1],
      }
    : null;

  // === 亮点 ===
  const highlights: string[] = [];
  if (positiveDays >= 4) {
    highlights.push(`这周有 ${positiveDays} 天状态不错，情绪稳定是最大的成就`);
  }
  if (trend === 'up') {
    highlights.push('情绪在好转，这个上升势头值得保持');
  }
  if (studyByDate.size >= 5) {
    highlights.push(`坚持学习了 ${studyByDate.size} 天，自律比天赋更重要`);
  }
  if (topSubject && topSubject.minutes >= 300) {
    highlights.push(`${topSubject.label}投入了 ${topSubject.minutes} 分钟，专注力很棒`);
  }
  if (weekMoodRecords.length >= 5) {
    highlights.push(`记录了 ${weekMoodRecords.length} 条情绪，觉察力越来越强`);
  }
  if (highlights.length === 0) {
    highlights.push('开始记录就是改变的起点，下周会更好');
  }

  // === 建议 ===
  const suggestions: string[] = [];
  if (negativeDays >= 3) {
    suggestions.push('下周试试每天安排15分钟放松时间，不用非得"有用"');
  }
  if (trend === 'down') {
    suggestions.push('情绪在走低，留意一下是什么在消耗你，必要时找人聊聊');
  }
  if (totalMinutes > 700 && avgScore < 3) {
    suggestions.push('学习时长够了但状态没跟上，试试减少单次时长、增加休息');
  }
  if (weekMoodRecords.length < 4) {
    suggestions.push('多记录几天情绪，晴语能发现更多规律');
  }
  if (studyByDate.size <= 2) {
    suggestions.push('下周试试每天至少学习一小段，养成节奏比猛学一天更有效');
  }
  if (suggestions.length === 0) {
    suggestions.push('保持这周的节奏，你做得很好');
  }

  // === 成长金句 ===
  const quotes = [
    '你不需要变好才能被爱，你本来就值得。',
    '情绪没有好坏，它们只是信息，听一听就好。',
    '休息不是放弃，是为了走更远的路。',
    '成长不是一直往上走，而是跌倒了还能站起来。',
    '你的感受很重要，比任何人的评价都重要。',
    '今天比昨天好一点点，就是了不起的进步。',
  ];
  const growthQuote = quotes[Math.floor(Math.random() * quotes.length)];

  // 韧性变化（简单估算）
  const resilienceChange = Math.round(
    (avgScore - 3) * 10 + (positiveDays - negativeDays) * 3 + weekMoodRecords.length
  );

  return {
    dateRange,
    mood: {
      avgScore: Math.round(avgScore * 10) / 10,
      positiveDays,
      negativeDays,
      dominantMood,
      bestDay,
      worstDay,
      trend,
      recordDays: dayScores.length,
    },
    study: {
      totalMinutes,
      avgDaily: Math.round(totalMinutes / 7),
      recordDays: studyByDate.size,
      topSubject,
      longestDay,
    },
    highlights,
    suggestions,
    growthQuote,
    resilienceChange,
  };
}
