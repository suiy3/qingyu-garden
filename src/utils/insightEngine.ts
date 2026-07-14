/**
 * 智能分析引擎
 * 发现情绪与学习之间的隐藏规律，生成个性化洞察
 */

import { MoodRecord, StudyRecord, MoodType, SubjectType } from '@/types';
import { MOOD_CONFIG, SUBJECT_CONFIG } from '@/utils/constants';
import { formatDate, getPastDays, getDayOfWeek } from '@/utils/date';

// 情绪分值映射（用于量化分析）
const MOOD_SCORE: Record<MoodType, number> = {
  happy: 5,
  calm: 4,
  tired: 2.5,
  anxious: 2,
  sad: 1.5,
  angry: 1,
};

// 负面情绪集合
const NEGATIVE_MOODS: MoodType[] = ['anxious', 'sad', 'angry', 'tired'];

export interface InsightEvidence {
  label: string;
  value: string;
}

export interface Insight {
  id: string;
  type: 'pattern' | 'correlation' | 'warning' | 'positive';
  icon: string;
  title: string;
  detail: string;
  suggestion?: string;
  severity?: 'low' | 'medium' | 'high';
  evidence?: InsightEvidence[];
  actionText?: string;
  actionLink?: string;
}

/**
 * 分析科目与情绪的关联
 * 发现"学什么科目时情绪最差/最好"
 */
export function analyzeSubjectMoodCorrelation(
  moodRecords: MoodRecord[],
  studyRecords: StudyRecord[]
): Insight[] {
  const insights: Insight[] = [];

  // 找同一天的学习和情绪记录
  const moodByDate = new Map<string, MoodRecord[]>();
  moodRecords.forEach((m) => {
    const date = formatDate(m.createdAt);
    if (!moodByDate.has(date)) moodByDate.set(date, []);
    moodByDate.get(date)!.push(m);
  });

  const subjectMoodScores: Record<string, { total: number; count: number; subject: SubjectType }> = {};

  studyRecords.forEach((s) => {
    const date = formatDate(s.createdAt);
    const dayMoods = moodByDate.get(date);
    if (!dayMoods || dayMoods.length === 0) return;

    const avgMoodScore =
      dayMoods.reduce((sum, m) => sum + MOOD_SCORE[m.moodType], 0) / dayMoods.length;

    if (!subjectMoodScores[s.subject]) {
      subjectMoodScores[s.subject] = { total: 0, count: 0, subject: s.subject };
    }
    subjectMoodScores[s.subject].total += avgMoodScore;
    subjectMoodScores[s.subject].count += 1;
  });

  const subjectAverages = Object.values(subjectMoodScores)
    .map((s) => ({
      subject: s.subject,
      avg: s.total / s.count,
      count: s.count,
    }))
    .filter((s) => s.count >= 2) // 至少2次记录才分析
    .sort((a, b) => a.avg - b.avg);

  if (subjectAverages.length >= 2) {
    const worst = subjectAverages[0];
    const best = subjectAverages[subjectAverages.length - 1];
    const worstConfig = SUBJECT_CONFIG[worst.subject];

    // 最差科目
    if (worst.avg < 3) {
      insights.push({
        id: 'subject-worst',
        type: 'correlation',
        icon: worstConfig.emoji,
        title: `学${worstConfig.label}时你的情绪偏低`,
        detail: `记录显示，学习${worstConfig.label}的日子里，你的情绪分值平均只有 ${worst.avg.toFixed(1)} 分（满分5分）。这可能是压力的来源之一。`,
        suggestion: `试试学习${worstConfig.label}前先做1分钟深呼吸，或者把它拆成更小的任务。`,
        severity: worst.avg < 2 ? 'high' : 'medium',
        evidence: [
          { label: '记录次数', value: `${worst.count} 次` },
          { label: '平均情绪分', value: `${worst.avg.toFixed(1)} / 5` },
          { label: '最好科目', value: `${SUBJECT_CONFIG[best.subject].label} ${best.avg.toFixed(1)}分` },
          { label: '情绪差', value: `${((best.avg - worst.avg) / best.avg * 100).toFixed(0)}%` },
        ],
        actionText: '去看看学习记录',
        actionLink: '/study',
      });
    }

    // 最好科目
    if (best.avg >= 4) {
      const bestConfig = SUBJECT_CONFIG[best.subject];
      insights.push({
        id: 'subject-best',
        type: 'positive',
        icon: bestConfig.emoji,
        title: `${bestConfig.label}是你的快乐科目`,
        detail: `学习${bestConfig.label}时你的情绪状态最好，平均分值 ${best.avg.toFixed(1)} 分。`,
        suggestion: `状态不好的时候，可以先从${bestConfig.label}开始，找回节奏感。`,
        evidence: [
          { label: '记录次数', value: `${best.count} 次` },
          { label: '平均情绪分', value: `${best.avg.toFixed(1)} / 5` },
        ],
        actionText: '去学习',
        actionLink: '/study',
      });
    }
  }

  return insights;
}

/**
 * 分析学习时长与情绪的关系
 * 发现"学习多久后开始焦虑"
 */
export function analyzeStudyDurationMood(
  moodRecords: MoodRecord[],
  studyRecords: StudyRecord[]
): Insight[] {
  const insights: Insight[] = [];

  // 找学习时长与当天情绪的关系
  const dayData: { duration: number; moodScore: number; date: string }[] = [];

  const moodByDate = new Map<string, number>();
  moodRecords.forEach((m) => {
    const date = formatDate(m.createdAt);
    const score = MOOD_SCORE[m.moodType];
    if (!moodByDate.has(date) || score < moodByDate.get(date)!) {
      moodByDate.set(date, score);
    }
  });

  const studyByDate = new Map<string, number>();
  studyRecords.forEach((s) => {
    const date = formatDate(s.createdAt);
    studyByDate.set(date, (studyByDate.get(date) || 0) + s.duration);
  });

  moodByDate.forEach((moodScore, date) => {
    const duration = studyByDate.get(date);
    if (duration && duration > 0) {
      dayData.push({ duration, moodScore, date });
    }
  });

  if (dayData.length < 3) return insights;

  // 按学习时长分组分析
  const longStudyDays = dayData.filter((d) => d.duration >= 120);
  const shortStudyDays = dayData.filter((d) => d.duration < 60);

  if (longStudyDays.length >= 2 && shortStudyDays.length >= 2) {
    const avgLongMood = longStudyDays.reduce((s, d) => s + d.moodScore, 0) / longStudyDays.length;
    const avgShortMood = shortStudyDays.reduce((s, d) => s + d.moodScore, 0) / shortStudyDays.length;

    if (avgLongMood < avgShortMood - 0.5) {
      insights.push({
        id: 'duration-overload',
        type: 'pattern',
        icon: '⏰',
        title: '学习超过2小时后情绪明显下降',
        detail: `学习时长超过120分钟的日子，你的情绪分值平均 ${avgLongMood.toFixed(1)} 分，而短时学习的日子是 ${avgShortMood.toFixed(1)} 分。长时间学习可能在消耗你的情绪能量。`,
        suggestion: '试试每学习45分钟休息5分钟，让大脑喘口气。',
        severity: 'medium',
        evidence: [
          { label: '长学习日数', value: `${longStudyDays.length} 天` },
          { label: '短学习日数', value: `${shortStudyDays.length} 天` },
          { label: '长学习日情绪', value: `${avgLongMood.toFixed(1)} 分` },
          { label: '短学习日情绪', value: `${avgShortMood.toFixed(1)} 分` },
          { label: '情绪落差', value: `${(avgShortMood - avgLongMood).toFixed(1)} 分` },
        ],
        actionText: '去看看学习记录',
        actionLink: '/study',
      });
    }
  }

  return insights;
}

/**
 * 分析每周情绪模式
 * 发现"周几情绪最差"
 */
export function analyzeWeeklyPattern(moodRecords: MoodRecord[]): Insight[] {
  const insights: Insight[] = [];

  if (moodRecords.length < 5) return insights;

  const dayMoodMap: Record<string, { total: number; count: number }> = {};
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  moodRecords.forEach((m) => {
    const day = dayNames[new Date(m.createdAt).getDay()];
    if (!dayMoodMap[day]) dayMoodMap[day] = { total: 0, count: 0 };
    dayMoodMap[day].total += MOOD_SCORE[m.moodType];
    dayMoodMap[day].count += 1;
  });

  const dayAverages = Object.entries(dayMoodMap)
    .map(([day, data]) => ({ day, avg: data.total / data.count, count: data.count }))
    .filter((d) => d.count >= 1)
    .sort((a, b) => a.avg - b.avg);

  if (dayAverages.length >= 3) {
    const worst = dayAverages[0];
    const best = dayAverages[dayAverages.length - 1];
    if (worst.avg < 3 && worst.count >= 1) {
      insights.push({
        id: 'weekly-worst',
        type: 'pattern',
        icon: '📅',
        title: `${worst.day}是你的情绪低谷日`,
        detail: `数据显示你在${worst.day}的情绪状态通常不太好，平均分值 ${worst.avg.toFixed(1)} 分。`,
        suggestion: worst.day === '周日'
          ? '周日晚上可以提前准备好周一要用的东西，减少开学焦虑。'
          : `${worst.day}记得给自己安排一点放松时间。`,
        severity: worst.avg < 2 ? 'medium' : 'low',
        evidence: [
          { label: '记录次数', value: `${worst.count} 次` },
          { label: '平均情绪分', value: `${worst.avg.toFixed(1)} / 5` },
          { label: '最好的一天', value: `${best.day} ${best.avg.toFixed(1)}分` },
        ],
        actionText: '看看情绪趋势',
        actionLink: '/mood-insight',
      });
    }
  }

  return insights;
}

/**
 * 连续负面情绪预警
 */
export function analyzeNegativeStreak(moodRecords: MoodRecord[]): Insight[] {
  const insights: Insight[] = [];

  if (moodRecords.length < 3) return insights;

  // 按日期排序，取最近7天
  const recentMoods = [...moodRecords]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15);

  const pastDays = getPastDays(7);
  let negativeCount = 0;
  const negativeDays: string[] = [];

  pastDays.forEach((date) => {
    const dayMoods = recentMoods.filter((m) => formatDate(m.createdAt) === date);
    if (dayMoods.length > 0) {
      const hasNegative = dayMoods.some(
        (m) => NEGATIVE_MOODS.includes(m.moodType) && m.intensity >= 6
      );
      if (hasNegative) {
        negativeCount++;
        negativeDays.push(date);
      }
    }
  });

  if (negativeCount >= 3) {
    insights.push({
      id: 'negative-streak',
      type: 'warning',
      icon: '🌧️',
      title: `近7天有${negativeCount}天情绪低落`,
      detail: `最近一周你有 ${negativeCount} 天记录了较强的负面情绪。持续的压力可能会影响身心状态。`,
      suggestion: '建议和信任的人聊聊，或者试试微行动中的呼吸练习。如果持续不舒服，可以寻求专业帮助。',
      severity: negativeCount >= 5 ? 'high' : 'medium',
      evidence: [
        { label: '统计周期', value: '近 7 天' },
        { label: '负面天数', value: `${negativeCount} 天` },
        { label: '负面比例', value: `${Math.round(negativeCount / 7 * 100)}%` },
      ],
      actionText: '试试微行动缓解',
      actionLink: '/actions',
    });
  }

  return insights;
}

/**
 * 正面模式发现
 */
export function analyzePositivePattern(moodRecords: MoodRecord[]): Insight[] {
  const insights: Insight[] = [];

  if (moodRecords.length < 3) return insights;

  const recentMoods = moodRecords.filter((m) => {
    const days = (Date.now() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 7;
  });

  if (recentMoods.length === 0) return insights;

  const positiveCount = recentMoods.filter(
    (m) => (m.moodType === 'happy' || m.moodType === 'calm') && m.intensity >= 6
  ).length;

  const positiveRate = positiveCount / recentMoods.length;

  if (positiveRate >= 0.6 && recentMoods.length >= 3) {
    insights.push({
      id: 'positive-pattern',
      type: 'positive',
      icon: '🌈',
      title: '最近状态很不错',
      detail: `近7天的记录中，${Math.round(positiveRate * 100)}%的时间你都是开心或平静的。继续保持！`,
      suggestion: '把这份好状态记下来，低落的时候回头看看，它会提醒你：好心情一直都在。',
      evidence: [
        { label: '统计周期', value: '近 7 天' },
        { label: '记录总数', value: `${recentMoods.length} 条` },
        { label: '积极比例', value: `${Math.round(positiveRate * 100)}%` },
      ],
      actionText: '去看看情绪花园',
      actionLink: '/insight',
    });
  }

  // 连续记录天数
  const recordDates = new Set(moodRecords.map((m) => formatDate(m.createdAt)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (recordDates.has(formatDate(d))) {
      streak++;
    } else if (i > 0) break;
  }

  if (streak >= 5) {
    insights.push({
      id: 'streak-positive',
      type: 'positive',
      icon: '🔥',
      title: `已连续记录${streak}天`,
      detail: `你正在养成觉察情绪的习惯！连续记录 ${streak} 天，这说明你在认真关注自己。`,
      suggestion: '坚持记录，你会发现越来越多关于自己的秘密。',
      evidence: [
        { label: '连续天数', value: `${streak} 天` },
        { label: '总记录数', value: `${moodRecords.length} 条` },
      ],
      actionText: '记录今天的心情',
      actionLink: '/mood-record',
    });
  }

  return insights;
}

/**
 * 生成全部洞察
 */
export function generateAllInsights(
  moodRecords: MoodRecord[],
  studyRecords: StudyRecord[]
): Insight[] {
  return [
    ...analyzeSubjectMoodCorrelation(moodRecords, studyRecords),
    ...analyzeStudyDurationMood(moodRecords, studyRecords),
    ...analyzeWeeklyPattern(moodRecords),
    ...analyzeNegativeStreak(moodRecords),
    ...analyzePositivePattern(moodRecords),
  ];
}

/**
 * 计算情绪韧性分数（0-100）
 * 基于记录频率、情绪多样性、正面情绪占比等
 */
export function calculateResilienceScore(moodRecords: MoodRecord[]): {
  total: number;
  frequency: number;
  positivity: number;
  awareness: number;
} {
  if (moodRecords.length === 0) return { total: 0, frequency: 0, positivity: 0, awareness: 0 };

  // 记录频率分（满分40）
  const pastDays = getPastDays(7);
  const recordDates = new Set(moodRecords.map((m) => formatDate(m.createdAt)));
  const recentDays = pastDays.filter((d) => recordDates.has(d)).length;
  const frequency = Math.round(Math.min((recentDays / 7) * 40, 40));

  // 正面情绪占比分（满分30）
  const recentMoods = moodRecords.filter((m) => {
    const days = (Date.now() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 14;
  });
  const positiveRate = recentMoods.length > 0
    ? recentMoods.filter((m) => m.moodType === 'happy' || m.moodType === 'calm').length / recentMoods.length
    : 0;
  const positivity = Math.round(positiveRate * 30);

  // 情绪觉察分（满分30）—— 记录了触发因素和文字
  const awareness = Math.round(
    Math.min(
      (moodRecords.filter((m) => m.triggers.length > 0 || m.note.length > 0).length / moodRecords.length) * 30,
      30
    )
  );

  return {
    total: frequency + positivity + awareness,
    frequency,
    positivity,
    awareness,
  };
}
