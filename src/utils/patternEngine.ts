/**
 * 跨变量规律发现引擎
 * 挖掘家长自己看不出来的隐藏模式
 */

import { MoodRecord, StudyRecord, MoodType, SubjectType } from '@/types';
import { MOOD_CONFIG, SUBJECT_CONFIG } from '@/utils/constants';
import { formatDate, getPastDays } from '@/utils/date';

export interface PatternInsight {
  id: string;
  title: string;
  description: string;
  counterintuitive: string;
  suggestion: string;
  confidence: number;
  dataSource: string;
  icon: 'clock' | 'subject' | 'weekday' | 'duration' | 'streak' | 'ratio';
  accentColor: string;
}

const MOOD_SCORE: Record<MoodType, number> = {
  happy: 5, calm: 4, tired: 2.5, anxious: 2, sad: 1.5, angry: 1,
};

function avgMoodScore(records: MoodRecord[]): number {
  if (records.length === 0) return 0;
  const total = records.reduce((sum, r) => {
    const base = MOOD_SCORE[r.moodType];
    return sum + base + (base * (r.intensity / 10) * 0.3);
  }, 0);
  return Math.min(5, total / records.length);
}

function avgMoodByDate(records: MoodRecord[]): Record<string, number> {
  const byDate: Record<string, MoodRecord[]> = {};
  records.forEach((r) => {
    const d = formatDate(r.createdAt);
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(r);
  });
  const result: Record<string, number> = {};
  Object.keys(byDate).forEach((d) => {
    result[d] = avgMoodScore(byDate[d]);
  });
  return result;
}

function studyMinutesByDate(records: StudyRecord[]): Record<string, number> {
  const byDate: Record<string, number> = {};
  records.forEach((r) => {
    const d = formatDate(r.createdAt);
    byDate[d] = (byDate[d] || 0) + r.duration;
  });
  return byDate;
}

function getWeekday(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getDay();
}

function weekdayName(day: number): string {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][day];
}

/**
 * 规律1：长时间学习 → 次日情绪下降
 */
function checkLongStudyNextDayMood(
  moodRecords: MoodRecord[],
  studyRecords: StudyRecord[],
  pastDays: string[]
): PatternInsight | null {
  const moodByDate = avgMoodByDate(moodRecords);
  const studyByDate = studyMinutesByDate(studyRecords);

  const longStudyDays: string[] = [];
  const normalStudyDays: string[] = [];

  pastDays.forEach((date) => {
    const minutes = studyByDate[date] || 0;
    if (minutes >= 120) longStudyDays.push(date);
    else if (minutes > 0) normalStudyDays.push(date);
  });

  if (longStudyDays.length < 2) return null;

  // 次日情绪
  const nextDayMoodsAfterLong = longStudyDays
    .map((d) => {
      const idx = pastDays.indexOf(d);
      return idx < pastDays.length - 1 ? moodByDate[pastDays[idx + 1]] : 0;
    })
    .filter((s) => s > 0);

  const nextDayMoodsAfterNormal = normalStudyDays
    .map((d) => {
      const idx = pastDays.indexOf(d);
      return idx < pastDays.length - 1 ? moodByDate[pastDays[idx + 1]] : 0;
    })
    .filter((s) => s > 0);

  if (nextDayMoodsAfterLong.length < 2) return null;

  const avgAfterLong = nextDayMoodsAfterLong.reduce((a, b) => a + b, 0) / nextDayMoodsAfterLong.length;
  const avgAfterNormal = nextDayMoodsAfterNormal.length > 0
    ? nextDayMoodsAfterNormal.reduce((a, b) => a + b, 0) / nextDayMoodsAfterNormal.length
    : 3.0;

  const diff = avgAfterNormal - avgAfterLong;

  if (diff < 0.4) return null;

  return {
    id: 'long-study-next-day',
    title: '长时间学习后的"情绪透支"',
    description: `过去${pastDays.length}天中，有${longStudyDays.length}天学习超过2小时。这些天的第二天，孩子情绪分平均${avgAfterLong.toFixed(1)}分，比正常学习日的次日低${diff.toFixed(1)}分。`,
    counterintuitive: `不是"懒"——可能是"累过头了"。多学2小时的代价，是第二天情绪低落${Math.round(diff / 5 * 100)}%。`,
    suggestion: `建议将单日学习总时长控制在2小时以内，或者长学习后安排一段放松时间。效率比时长重要。`,
    confidence: Math.min(95, 50 + longStudyDays.length * 10 + diff * 15),
    dataSource: `情绪记录${moodRecords.length}条 + 学习记录${studyRecords.length}条`,
    icon: 'duration',
    accentColor: '#EF4444',
  };
}

/**
 * 规律2：特定科目 → 特定情绪
 */
function checkSubjectMoodPattern(
  moodRecords: MoodRecord[],
  studyRecords: StudyRecord[],
  pastDays: string[]
): PatternInsight | null {
  const moodByDate = avgMoodByDate(moodRecords);

  const subjectMoods: Record<string, number[]> = {};

  pastDays.forEach((date) => {
    const dayStudies = studyRecords.filter((s) => formatDate(s.createdAt) === date);
    const dayMood = moodByDate[date];
    if (dayMood > 0 && dayStudies.length > 0) {
      dayStudies.forEach((s) => {
        if (!subjectMoods[s.subject]) subjectMoods[s.subject] = [];
        subjectMoods[s.subject].push(dayMood);
      });
    }
  });

  const subjectsWithData = Object.entries(subjectMoods).filter(([, arr]) => arr.length >= 2);
  if (subjectsWithData.length < 2) return null;

  const subjectAvgs = subjectsWithData.map(([sub, arr]) => ({
    subject: sub as SubjectType,
    avg: arr.reduce((a, b) => a + b, 0) / arr.length,
    count: arr.length,
  }));

  subjectAvgs.sort((a, b) => a.avg - b.avg);

  const worst = subjectAvgs[0];
  const best = subjectAvgs[subjectAvgs.length - 1];
  const diff = best.avg - worst.avg;

  if (diff < 0.6) return null;

  const worstLabel = SUBJECT_CONFIG[worst.subject].label;
  const bestLabel = SUBJECT_CONFIG[best.subject].label;

  return {
    id: 'subject-mood',
    title: `${worstLabel}和${bestLabel}的情绪温差`,
    description: `学${worstLabel}的日子，孩子情绪平均${worst.avg.toFixed(1)}分；学${bestLabel}时${best.avg.toFixed(1)}分，差了${diff.toFixed(1)}分。`,
    counterintuitive: `科目本身没有"好坏"，但孩子对${worstLabel}可能有畏难情绪或压力源。这比"偏科"更深层——是情绪性的回避。`,
    suggestion: `不要直接说"${worstLabel}要加油"。试试聊聊"${worstLabel}里哪部分最让你头疼？"，找到具体的卡点再帮。`,
    confidence: Math.min(90, 45 + worst.count * 8 + diff * 12),
    dataSource: `情绪记录${moodRecords.length}条 + 学习记录${studyRecords.length}条`,
    icon: 'subject',
    accentColor: '#F59E0B',
  };
}

/**
 * 规律3：周几情绪模式
 */
function checkWeekdayPattern(
  moodRecords: MoodRecord[],
  pastDays: string[]
): PatternInsight | null {
  const moodByDate = avgMoodByDate(moodRecords);

  const weekdayMoods: Record<number, number[]> = {};
  pastDays.forEach((date) => {
    const mood = moodByDate[date];
    if (mood > 0) {
      const wd = getWeekday(date);
      if (!weekdayMoods[wd]) weekdayMoods[wd] = [];
      weekdayMoods[wd].push(mood);
    }
  });

  const weekdayAvgs = Object.entries(weekdayMoods)
    .map(([wd, arr]) => ({
      weekday: parseInt(wd),
      avg: arr.reduce((a, b) => a + b, 0) / arr.length,
      count: arr.length,
    }))
    .filter((d) => d.count >= 1);

  if (weekdayAvgs.length < 3) return null;

  weekdayAvgs.sort((a, b) => a.avg - b.avg);
  const worst = weekdayAvgs[0];
  const best = weekdayAvgs[weekdayAvgs.length - 1];
  const diff = best.avg - worst.avg;

  if (diff < 0.5) return null;

  // 跳过周日，因为周日数据少
  if (worst.weekday === 0 && worst.count < 2) return null;

  return {
    id: 'weekday-mood',
    title: `${weekdayName(worst.weekday)}是他的情绪低谷`,
    description: `综合${pastDays.length}天数据，${weekdayName(worst.weekday)}的情绪分平均${worst.avg.toFixed(1)}，是整周最低；${weekdayName(best.weekday)}最高，达${best.avg.toFixed(1)}。`,
    counterintuitive: `这不是偶然。${weekdayName(worst.weekday)}的情绪低谷可能是周期性压力（考试、作业截止等）的反映，而不是"状态不好"。`,
    suggestion: `${weekdayName(worst.weekday)}晚上少安排学习任务，多给空间。${weekdayName(best.weekday)}是个好时机聊聊心事——状态好的时候更容易打开话匣子。`,
    confidence: Math.min(85, 40 + pastDays.length * 3 + diff * 15),
    dataSource: `情绪记录${moodRecords.length}条`,
    icon: 'weekday',
    accentColor: '#8B5CF6',
  };
}

/**
 * 规律4：记录频率与情绪稳定性
 */
function checkRecordingStreak(
  moodRecords: MoodRecord[],
  pastDays: string[]
): PatternInsight | null {
  const moodByDate = avgMoodByDate(moodRecords);
  const recordedDays = pastDays.filter((d) => moodByDate[d] > 0);

  if (recordedDays.length < 5) return null;

  // 检查情绪波动
  const scores = recordedDays.map((d) => moodByDate[d]);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // 连续记录天数
  let maxStreak = 0;
  let currentStreak = 0;
  pastDays.forEach((d) => {
    if (moodByDate[d] > 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  if (stdDev > 0.8 && maxStreak >= 5) {
    return {
      id: 'high-volatility',
      title: '情绪波动较大，但记录习惯已建立',
      description: `连续记录${maxStreak}天，情绪波动标准差${stdDev.toFixed(2)}——比同龄人平均水平偏高。说明孩子在经历较大的情绪起伏，但愿意记录本身是积极信号。`,
      counterintuitive: `波动大不一定是坏事。能感知到自己的情绪变化，说明孩子的情绪觉察能力在提升。真正的危险是"麻木"。`,
      suggestion: `波动期是建立信任的最佳时机。关注低谷日的触发因素，但不要过度干预——让孩子知道"有起伏很正常"。`,
      confidence: Math.min(80, 40 + maxStreak * 5),
      dataSource: `连续记录${maxStreak}天`,
      icon: 'streak',
      accentColor: '#3B82F6',
    };
  }

  if (stdDev < 0.3 && maxStreak >= 5) {
    return {
      id: 'stable-mood',
      title: '情绪非常稳定——也许太稳定了',
      description: `连续记录${maxStreak}天，情绪波动标准差仅${stdDev.toFixed(2)}，几乎是一条直线。`,
      counterintuitive: `青少年情绪"太稳定"有时意味着在压抑感受，或者记录时趋于选择"安全"的答案。真正健康的状态是有波动的。`,
      suggestion: `试着问问孩子"今天有没有哪个瞬间让你有点不开心？"——帮他识别那些被忽略的小情绪。`,
      confidence: Math.min(70, 35 + maxStreak * 4),
      dataSource: `连续记录${maxStreak}天`,
      icon: 'streak',
      accentColor: '#10B981',
    };
  }

  return null;
}

/**
 * 规律5：学习效率与情绪的比值
 */
function checkStudyMoodRatio(
  moodRecords: MoodRecord[],
  studyRecords: StudyRecord[],
  pastDays: string[]
): PatternInsight | null {
  const moodByDate = avgMoodByDate(moodRecords);
  const studyByDate = studyMinutesByDate(studyRecords);

  let bothDays = 0;
  let moodGoodStudyLow = 0;
  let moodBadStudyHigh = 0;

  pastDays.forEach((date) => {
    const mood = moodByDate[date];
    const study = studyByDate[date] || 0;
    if (mood > 0 && study > 0) {
      bothDays++;
      if (mood >= 3.5 && study < 60) moodGoodStudyLow++;
      if (mood < 3 && study >= 90) moodBadStudyHigh++;
    }
  });

  if (bothDays < 4) return null;

  if (moodBadStudyHigh >= 2) {
    return {
      id: 'overcompensation',
      title: '"用学习填补情绪"的信号',
      description: `有${moodBadStudyHigh}天，孩子情绪较低（<3分）但学习时长反而超过90分钟。这种"情绪越差学得越多"的模式值得关注。`,
      counterintuitive: `看起来是"努力"，实际上可能是用学习转移情绪困扰。短期能维持，长期会导致耗竭。`,
      suggestion: `情绪低落时，与其让他"化悲愤为力量"，不如先接住情绪。一张今日对话卡可能比多刷一套题更有价值。`,
      confidence: Math.min(85, 50 + moodBadStudyHigh * 12),
      dataSource: `情绪+学习双记录${bothDays}天`,
      icon: 'ratio',
      accentColor: '#EC4899',
    };
  }

  if (moodGoodStudyLow >= 2) {
    return {
      id: 'relaxed-mode',
      title: '心情好的时候反而不太学习',
      description: `有${moodGoodStudyLow}天，孩子情绪很好（≥3.5分）但学习时长不足1小时。`,
      counterintuitive: `这其实是正常的——情绪好的时候想玩。但如果频繁出现，可能是"学习"和"不开心"在孩子心里画了等号。`,
      suggestion: `别急着说"心情好正好多学点"。先确认学习没有变成孩子情绪的负担源。如果是，可能需要调整学习方式或目标。`,
      confidence: Math.min(75, 45 + moodGoodStudyLow * 10),
      dataSource: `情绪+学习双记录${bothDays}天`,
      icon: 'ratio',
      accentColor: '#06B6D4',
    };
  }

  return null;
}

/**
 * 主入口：生成所有规律发现
 */
export function discoverPatterns(
  moodRecords: MoodRecord[],
  studyRecords: StudyRecord[]
): PatternInsight[] {
  const pastDays = getPastDays(21);

  const recentMoods = moodRecords.filter((m) =>
    pastDays.includes(formatDate(m.createdAt))
  );
  const recentStudies = studyRecords.filter((s) =>
    pastDays.includes(formatDate(s.createdAt))
  );

  // 数据不足，不生成
  if (recentMoods.length < 5) return [];

  const insights: (PatternInsight | null)[] = [
    checkLongStudyNextDayMood(recentMoods, recentStudies, pastDays),
    checkSubjectMoodPattern(recentMoods, recentStudies, pastDays),
    checkWeekdayPattern(recentMoods, pastDays),
    checkRecordingStreak(recentMoods, pastDays),
    checkStudyMoodRatio(recentMoods, recentStudies, pastDays),
  ];

  return insights
    .filter((i): i is PatternInsight => i !== null)
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * 获取最重要的规律（头条）
 */
export function getTopPattern(
  moodRecords: MoodRecord[],
  studyRecords: StudyRecord[]
): PatternInsight | null {
  const patterns = discoverPatterns(moodRecords, studyRecords);
  return patterns[0] || null;
}
