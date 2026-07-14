import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, TrendingUp, TrendingDown, Minus, Sparkles, Heart, BookOpen } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { useAppStore } from '@/store/useAppStore';
import { generateWeeklyReport } from '@/utils/weeklyReport';
import { cn } from '@/lib/utils';

export default function WeeklyReportPage() {
  const navigate = useNavigate();
  const { moodRecords, studyRecords } = useAppStore();
  const report = useMemo(
    () => generateWeeklyReport(moodRecords, studyRecords),
    [moodRecords, studyRecords]
  );

  if (!report) {
    return (
      <PageContainer title="周成长报告" showBack>
        <div className="px-4 py-20 text-center">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-600 font-medium">这周还没有记录数据</p>
          <p className="text-sm text-gray-400 mt-2">
            记录几天情绪和学习，下周就能生成成长报告了
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

  const trendConfig = {
    up: { icon: TrendingUp, label: '上升', color: 'text-emerald-500', bg: 'from-emerald-400 to-green-500' },
    stable: { icon: Minus, label: '平稳', color: 'text-blue-500', bg: 'from-blue-400 to-cyan-500' },
    down: { icon: TrendingDown, label: '下降', color: 'text-rose-500', bg: 'from-rose-400 to-pink-500' },
  };
  const tc = trendConfig[report.mood.trend];
  const TrendIcon = tc.icon;

  const handleShare = () => {
    // 简单的分享：复制报告内容到剪贴板
    const text = `【晴语周报】${report.dateRange}\n\n心情：${report.mood.dominantMood.label} ${report.mood.avgScore}/5\n学习：${report.study.totalMinutes}分钟\n\n亮点：${report.highlights[0]}\n\n${report.growthQuote}`;
    navigator.clipboard?.writeText(text);
    alert('报告已复制到剪贴板，可以粘贴分享给家人');
  };

  return (
    <PageContainer title="周成长报告" showBack>
      <div className="px-4 py-4 space-y-4 pb-8">
        {/* 报告头部 */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
          <div className="absolute -top-2 -right-2 text-7xl opacity-20">📊</div>
          <div className="relative">
            <p className="text-white/70 text-xs">本周成长报告</p>
            <h2 className="text-2xl font-bold mt-1">{report.dateRange}</h2>
            <div className="flex items-center gap-3 mt-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
                <p className="text-[10px] text-white/70">情绪均分</p>
                <p className="text-lg font-bold">{report.mood.avgScore}<span className="text-xs text-white/60">/5</span></p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
                <p className="text-[10px] text-white/70">学习时长</p>
                <p className="text-lg font-bold">{report.study.totalMinutes}<span className="text-xs text-white/60">分钟</span></p>
              </div>
              <div className={cn('bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-1')}>
                <TrendIcon size={14} />
                <p className="text-lg font-bold">{tc.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 情绪概览 */}
        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={16} className="text-orange-500" />
            <h3 className="text-sm font-bold text-gray-800">情绪概览</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{report.mood.positiveDays}</p>
              <p className="text-[10px] text-gray-500">好心情天数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-500">{report.mood.negativeDays}</p>
              <p className="text-[10px] text-gray-500">低落天数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">{report.mood.recordDays}</p>
              <p className="text-[10px] text-gray-500">记录天数</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-white/60 rounded-xl">
            <span className="text-2xl">{report.mood.dominantMood.emoji}</span>
            <div className="flex-1">
              <p className="text-xs text-gray-500">最常出现</p>
              <p className="text-sm font-semibold text-gray-700">{report.mood.dominantMood.label}</p>
            </div>
            <span className="text-xs text-gray-400">{report.mood.dominantMood.count}次</span>
          </div>
          {report.mood.bestDay && report.mood.worstDay && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 bg-white/60 rounded-xl">
                <p className="text-[10px] text-emerald-600">最好的一天</p>
                <p className="text-xs font-medium text-gray-700">{report.mood.bestDay.dayOfWeek} · {report.mood.bestDay.score}分</p>
              </div>
              <div className="p-2 bg-white/60 rounded-xl">
                <p className="text-[10px] text-rose-500">最低落的一天</p>
                <p className="text-xs font-medium text-gray-700">{report.mood.worstDay.dayOfWeek} · {report.mood.worstDay.score}分</p>
              </div>
            </div>
          )}
        </div>

        {/* 学习成就 */}
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-cyan-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} className="text-sky-500" />
            <h3 className="text-sm font-bold text-gray-800">学习成就</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-2.5 bg-white/60 rounded-xl text-center">
              <p className="text-xl font-bold text-sky-600">{report.study.totalMinutes}</p>
              <p className="text-[10px] text-gray-500">总学习分钟</p>
            </div>
            <div className="p-2.5 bg-white/60 rounded-xl text-center">
              <p className="text-xl font-bold text-sky-600">{report.study.recordDays}</p>
              <p className="text-[10px] text-gray-500">学习天数</p>
            </div>
          </div>
          {report.study.topSubject && (
            <div className="flex items-center gap-2 p-2.5 bg-white/60 rounded-xl">
              <span className="text-xl">{report.study.topSubject.emoji}</span>
              <div className="flex-1">
                <p className="text-xs text-gray-500">最投入的科目</p>
                <p className="text-sm font-semibold text-gray-700">{report.study.topSubject.label}</p>
              </div>
              <span className="text-xs text-gray-400">{report.study.topSubject.minutes}分钟</span>
            </div>
          )}
          {report.study.longestDay && (
            <div className="mt-2 p-2.5 bg-white/60 rounded-xl">
              <p className="text-[10px] text-gray-500">学得最久的一天</p>
              <p className="text-xs font-medium text-gray-700">
                {report.study.longestDay.dayOfWeek} · {report.study.longestDay.minutes}分钟
              </p>
            </div>
          )}
        </div>

        {/* 本周亮点 */}
        <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-purple-500" />
            <h3 className="text-sm font-bold text-gray-800">本周亮点</h3>
          </div>
          <div className="space-y-2">
            {report.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-white/60 rounded-xl">
                <span className="text-sm">✨</span>
                <p className="text-xs text-gray-700 leading-relaxed flex-1">{h}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 下周建议 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-base">📋</span>
            下周建议
          </h3>
          <div className="space-y-2">
            {report.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-slate-500">{i + 1}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed pt-0.5">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 成长金句 */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 p-6 text-center">
          <div className="text-3xl mb-3">🌸</div>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">
            {report.growthQuote}
          </p>
          <p className="text-[10px] text-gray-400 mt-3">— 晴语</p>
        </div>

        {/* 分享按钮 */}
        <button
          onClick={handleShare}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Share2 size={16} />
          分享给家人
        </button>
      </div>
    </PageContainer>
  );
}
