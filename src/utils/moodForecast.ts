/**
 * 情绪预测引擎
 * 基于近14天的情绪趋势 + 周几模式，预测未来3天情绪走向
 */

import { MoodRecord, MoodType } from '@/types';
import { MOOD_CONFIG } from '@/utils/constants';
import { formatDate, getPastDays, getDayOfWeek } from '@/utils/date';

const MOOD_SCORE: Record<MoodType, number> = {
  happy: 5,
  calm: 4,
  tired: 2.5,
  anxious: 2,
  sad: 1.5,
  angry: 1,
};

export interface DayPrediction {
  date: string;
  dayOfWeek: string;
  predictedScore: number; // 1-5
  confidence: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
}

export interface MoodForecast {
  trend: 'improving' | 'stable' | 'declining';
  trendScore: number; // 趋势变化值
  avgScore: number; // 近期平均分
  predictions: DayPrediction[];
  alert: {
    hasAlert: boolean;
    type: 'none' | 'watch' | 'warning';
    title: string;
    message: string;
    suggestion: string;
  };
}

/**
 * 简单线性回归计算趋势斜率
 */
function calcTrend(scores: number[]): number {
  const n = scores.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = scores.reduce((s, v) => s + v, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (scores[i] - yMean);
    den += (i - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

export function predictMood(moodRecords: MoodRecord[]): MoodForecast | null {
  if (moodRecords.length < 5) return null;

  // 近14天每日情绪分（取最低分代表当天主导情绪）
  const past14Days = getPastDays(14);
  const dayScores: (number | null)[] = past14Days.map((date) => {
    const dayMoods = moodRecords.filter((r) => formatDate(r.createdAt) === date);
    if (dayMoods.length === 0) return null;
    return Math.min(...dayMoods.map((m) => MOOD_SCORE[m.moodType]));
  });

  // 有记录的天数
  const validScores = dayScores.filter((s): s is number => s !== null);
  if (validScores.length < 5) return null;

  // 近期平均分
  const recentScores = validScores.slice(-7);
  const avgScore = recentScores.reduce((s, v) => s + v, 0) / recentScores.length;

  // 趋势斜率
  const trendSlope = calcTrend(recentScores);

  // 周几模式：统计每个周几的历史平均分
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dayOfWeekScores: Record<string, number[]> = {};
  past14Days.forEach((date, i) => {
    if (dayScores[i] !== null) {
      const dayName = dayNames[new Date(date).getDay()];
      if (!dayOfWeekScores[dayName]) dayOfWeekScores[dayName] = [];
      dayOfWeekScores[dayName].push(dayScores[i]!);
    }
  });
  const dayOfWeekAvg: Record<string, number> = {};
  Object.entries(dayOfWeekScores).forEach(([day, scores]) => {
    dayOfWeekAvg[day] = scores.reduce((s, v) => s + v, 0) / scores.length;
  });

  // 预测未来3天
  const predictions: DayPrediction[] = [];
  const today = new Date();
  for (let i = 1; i <= 3; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    const dateStr = formatDate(futureDate);
    const dayName = dayNames[futureDate.getDay()];

    // 基础分 = 近期均分 + 趋势 × 天数
    let predictedScore = avgScore + trendSlope * i;

    // 周几模式调整：如果该周几历史平均偏低，下调
    const dayAvg = dayOfWeekAvg[dayName];
    if (dayAvg) {
      const adjustment = (dayAvg - avgScore) * 0.4;
      predictedScore += adjustment;
    }

    predictedScore = Math.max(1, Math.min(5, predictedScore));

    // 置信度：数据越多越高
    const dataPoints = validScores.length + (dayOfWeekScores[dayName]?.length || 0);
    const confidence = Math.min(85, 40 + dataPoints * 5);

    // 风险等级
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (predictedScore < 2) riskLevel = 'high';
    else if (predictedScore < 3) riskLevel = 'medium';

    // 预测理由
    let reason = '';
    if (dayAvg && dayAvg < avgScore - 0.5) {
      reason = `你的${dayName}历史情绪通常偏低（均${dayAvg.toFixed(1)}分）`;
    } else if (trendSlope < -0.15) {
      reason = '近期情绪呈下降趋势';
    } else if (trendSlope > 0.15) {
      reason = '近期情绪在好转';
    } else if (predictedScore >= 4) {
      reason = '状态平稳，继续保持';
    } else {
      reason = '数据平稳，预计无大波动';
    }

    predictions.push({
      date: dateStr,
      dayOfWeek: getDayOfWeek(dateStr),
      predictedScore: Math.round(predictedScore * 10) / 10,
      confidence,
      riskLevel,
      reason,
    });
  }

  // 趋势判断
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (trendSlope > 0.15) trend = 'improving';
  else if (trendSlope < -0.15) trend = 'declining';

  // 预警判断
  const hasHighRiskDay = predictions.some((p) => p.riskLevel === 'high');
  const hasMediumRiskDay = predictions.some((p) => p.riskLevel === 'medium');
  const consecutiveLow = recentScores.filter((s) => s < 2.5).length >= 3;

  let alert: MoodForecast['alert'];
  if (hasHighRiskDay || consecutiveLow) {
    const riskDay = predictions.find((p) => p.riskLevel === 'high');
    alert = {
      hasAlert: true,
      type: 'warning',
      title: '情绪预警',
      message: riskDay
        ? `${riskDay.dayOfWeek}可能出现情绪低谷（预测${riskDay.predictedScore}分）`
        : '近期已连续几天情绪偏低',
      suggestion: '提前安排一个放松活动，或和信任的人聊聊天。别忘了微行动随时可用。',
    };
  } else if (hasMediumRiskDay || trend === 'declining') {
    alert = {
      hasAlert: true,
      type: 'watch',
      title: '需要留意',
      message: trend === 'declining'
        ? '近期情绪有下降趋势，注意观察'
        : '未来几天情绪可能略有波动',
      suggestion: '保持规律作息，适当放松，不用太紧张。',
    };
  } else {
    alert = {
      hasAlert: false,
      type: 'none',
      title: '状态平稳',
      message: '近期情绪稳定，预计未来几天不会有大的波动',
      suggestion: '继续保持当前的节奏，坚持记录会让预测更准。',
    };
  }

  return {
    trend,
    trendScore: Math.round(trendSlope * 100) / 100,
    avgScore: Math.round(avgScore * 10) / 10,
    predictions,
    alert,
  };
}
