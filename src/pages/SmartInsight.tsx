import { useMemo, useRef, useState } from 'react';
import { Brain, TrendingUp, Shield, ChevronDown, Info } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/common/Card';
import MoodGarden from '@/components/mood/MoodGarden';
import InsightCard from '@/components/mood/InsightCard';
import MoodForecastCard from '@/components/mood/MoodForecastCard';
import { useAppStore } from '@/store/useAppStore';
import {
  generateAllInsights,
  calculateResilienceScore,
  Insight,
} from '@/utils/insightEngine';
import { cn } from '@/lib/utils';

export default function SmartInsight() {
  const { moodRecords, studyRecords } = useAppStore();
  const [gardenDays, setGardenDays] = useState<number>(7);
  const [showResilienceDetail, setShowResilienceDetail] = useState(false);

  const insights = useMemo<Insight[]>(
    () => generateAllInsights(moodRecords, studyRecords),
    [moodRecords, studyRecords]
  );

  const resilience = useMemo(
    () => calculateResilienceScore(moodRecords),
    [moodRecords]
  );
  const resilienceScore = resilience.total;

  // 按类型分组
  const warningInsights = insights.filter((i) => i.type === 'warning' || i.severity === 'high');
  const patternInsights = insights.filter((i) => i.type === 'pattern' || i.type === 'correlation');
  const positiveInsights = insights.filter((i) => i.type === 'positive');

  // 蔫花跳转：滚动到「规律与关联」组并短暂高亮
  const patternRef = useRef<HTMLDivElement>(null);
  const [highlightPattern, setHighlightPattern] = useState(false);
  const handleExploreInsight = () => {
    patternRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightPattern(true);
    setTimeout(() => setHighlightPattern(false), 2600);
  };

  // 韧性分数等级
  const scoreLevel = useMemo(() => {
    if (resilienceScore >= 80) return { label: '很强', color: 'text-emerald-500', bg: 'from-emerald-400 to-green-500' };
    if (resilienceScore >= 60) return { label: '不错', color: 'text-blue-500', bg: 'from-blue-400 to-cyan-500' };
    if (resilienceScore >= 40) return { label: '成长中', color: 'text-amber-500', bg: 'from-amber-400 to-orange-500' };
    return { label: '起步', color: 'text-rose-500', bg: 'from-rose-400 to-pink-500' };
  }, [resilienceScore]);

  return (
    <PageContainer title="智能洞察" showBack>
      <div className="px-4 py-6 space-y-6">
        {/* 韧性分数 */}
        <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-purple-100 overflow-hidden">
          <div
            onClick={() => setShowResilienceDetail(!showResilienceDetail)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-purple-500" />
                <h3 className="font-bold text-gray-800">情绪韧性指数</h3>
                <Info size={14} className="text-gray-400" />
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  'text-gray-400 transition-transform duration-300',
                  showResilienceDetail && 'rotate-180'
                )}
              />
            </div>

            <div className="flex items-center gap-6">
              {/* 圆形分数 */}
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(resilienceScore / 100) * 264} 264`}
                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A78BFA" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${scoreLevel.color}`}>
                    {resilienceScore}
                  </span>
                  <span className="text-[10px] text-gray-400">满分100</span>
                </div>
              </div>

              {/* 说明 */}
              <div className="flex-1">
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${scoreLevel.bg} text-white text-sm font-bold mb-2`}>
                  {scoreLevel.label}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  从记录频率、情绪状态和觉察能力三方面综合评估你的心理韧性。
                </p>
              </div>
            </div>
          </div>

          {/* 展开详情 */}
          {showResilienceDetail && (
            <div className="mt-4 pt-4 border-t border-purple-100 space-y-3 animate-fade-in">
              <p className="text-[11px] text-gray-500 -mt-1 mb-1">
                情绪韧性 = 你从低落中恢复的能力。分数越高，说明你越能应对压力。
              </p>

              {/* 三个维度 */}
              {[
                {
                  label: '记录频率',
                  score: resilience.frequency,
                  max: 40,
                  desc: '近7天有几天记录了情绪',
                  color: 'from-blue-400 to-cyan-400',
                  icon: '📅',
                },
                {
                  label: '积极状态',
                  score: resilience.positivity,
                  max: 30,
                  desc: '近14天开心/平静的比例',
                  color: 'from-emerald-400 to-green-400',
                  icon: '☀️',
                },
                {
                  label: '觉察能力',
                  score: resilience.awareness,
                  max: 30,
                  desc: '记录时写了触发原因或感受',
                  color: 'from-purple-400 to-pink-400',
                  icon: '🔍',
                },
              ].map((dim, i) => (
                <div key={i} className="bg-white/60 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{dim.icon}</span>
                      <span className="text-xs font-medium text-gray-700">{dim.label}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-600">
                      {dim.score}/{dim.max}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full bg-gradient-to-r', dim.color)}
                      style={{
                        width: `${(dim.score / dim.max) * 100}%`,
                        transition: 'width 0.8s ease-out',
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{dim.desc}</p>
                </div>
              ))}

              <p className="text-[10px] text-gray-400 text-center pt-1">
                每天记录情绪，分数会越来越准
              </p>
            </div>
          )}
        </Card>

        {/* 情绪预测预警 */}
        <MoodForecastCard moodRecords={moodRecords} />

        {/* 情绪花园 */}
        <Card>
          <MoodGarden
            records={moodRecords}
            studyRecords={studyRecords}
            days={gardenDays}
            showDaySwitcher
            onDaysChange={setGardenDays}
            onExploreInsight={handleExploreInsight}
          />
        </Card>

        {/* 智能分析标题 */}
        <div className="flex items-center gap-2 px-1">
          <Brain size={20} className="text-purple-500" />
          <h2 className="text-lg font-bold text-gray-800">晴语发现了这些</h2>
        </div>

        {/* 需要关注 */}
        {warningInsights.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-rose-500 px-1">⚠️ 需要关注</h3>
            {warningInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}

        {/* 规律发现 */}
        {patternInsights.length > 0 && (
          <div
            ref={patternRef}
            className={`space-y-3 rounded-2xl transition-all duration-700 ${
              highlightPattern ? 'ring-2 ring-amber-300 bg-amber-50/40 p-1' : ''
            }`}
          >
            <h3 className="text-sm font-medium text-amber-600 px-1 flex items-center gap-1">
              <TrendingUp size={14} />
              规律与关联
            </h3>
            {patternInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}

        {/* 积极信号 */}
        {positiveInsights.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-emerald-600 px-1">✨ 积极信号</h3>
            {positiveInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}

        {/* 无洞察时 */}
        {insights.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-600 font-medium">还在收集数据中...</p>
            <p className="text-sm text-gray-400 mt-2">
              继续记录情绪和学习，晴语会帮你发现隐藏的规律
            </p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
