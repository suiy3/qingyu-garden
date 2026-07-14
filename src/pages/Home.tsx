import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ChevronRight, Sparkles, Brain, Shield, ArrowRight, BookOpen } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getGreeting, formatDate, getDayOfWeek, formatDuration } from '@/utils/date';
import { microActions } from '@/data/microActions';
import { MOOD_CONFIG } from '@/utils/constants';
import { generateAllInsights, calculateResilienceScore, Insight } from '@/utils/insightEngine';
import BottomNav from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';

// 今日主角洞察：优先跨变量关联（correlation/pattern），最炸的反直觉规律放首位
function pickHeroInsight(insights: Insight[]): Insight | undefined {
  if (insights.length === 0) return undefined;
  const priority: Record<string, number> = {
    correlation: 3,
    pattern: 2.5,
    warning: 2,
    positive: 1,
  };
  return [...insights].sort(
    (a, b) => (priority[b.type] ?? 0) - (priority[a.type] ?? 0)
  )[0];
}

// 情绪 → 天气场景（让首页有画面感，替代干巴巴的 emoji+数字）
const MOOD_WEATHER: Record<
  string,
  { sky: string; emoji: string; grad: string; quote: string }
> = {
  happy: { sky: '晴', emoji: '☀️', grad: 'from-amber-300 via-orange-200 to-rose-100', quote: '阳光正好，今天很明亮' },
  calm: { sky: '多云', emoji: '⛅', grad: 'from-sky-200 via-indigo-100 to-purple-50', quote: '风很轻，你很稳' },
  anxious: { sky: '雷阵雨', emoji: '⛈️', grad: 'from-indigo-300 via-purple-200 to-slate-100', quote: '心里有点响，先深呼吸' },
  sad: { sky: '小雨', emoji: '🌧️', grad: 'from-blue-300 via-slate-200 to-sky-100', quote: '让它下一会儿，会停的' },
  angry: { sky: '暴雨', emoji: '🌩️', grad: 'from-rose-400 via-red-200 to-orange-100', quote: '先缓缓，不急着放晴' },
  tired: { sky: '阴', emoji: '🌫️', grad: 'from-gray-300 via-slate-200 to-blue-50', quote: '该歇歇了' },
};

export default function Home() {
  const navigate = useNavigate();
  const { user, moodRecords, studyRecords, knowledgeNotes } = useAppStore();

  const todayStr = formatDate(new Date());

  const todayMoodRecords = moodRecords.filter(
    (record) => formatDate(record.createdAt) === todayStr
  );
  const todayMood = todayMoodRecords.length > 0 ? todayMoodRecords[0] : null;
  const moodConfig = todayMood ? MOOD_CONFIG[todayMood.moodType] : null;

  let streakDays = 0;
  const sortedUniqueDates = [...new Set(moodRecords.map((r) => formatDate(r.createdAt)))].sort().reverse();
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    if (sortedUniqueDates.includes(dateStr)) {
      streakDays++;
    } else if (i > 0) {
      break;
    }
  }

  const todayStudyMinutes = studyRecords
    .filter((record) => formatDate(record.createdAt) === todayStr)
    .reduce((sum, record) => sum + record.duration, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = formatDate(weekStart);
  const weekStudyMinutes = studyRecords
    .filter((record) => formatDate(record.createdAt) >= weekStartStr)
    .reduce((sum, record) => sum + record.duration, 0);

  const topActions = microActions.slice(0, 4);

  const dateDisplay = `${formatDate(new Date())} ${getDayOfWeek(new Date())}`;

  // 智能洞察
  const insights = useMemo<Insight[]>(
    () => generateAllInsights(moodRecords, studyRecords),
    [moodRecords, studyRecords]
  );
  const resilienceScore = useMemo(
    () => calculateResilienceScore(moodRecords),
    [moodRecords]
  );
  const heroInsight = pickHeroInsight(insights);

  // 今日心情天气
  const todayWeather = todayMood
    ? MOOD_WEATHER[todayMood.moodType]
    : { sky: '待记录', emoji: '🌤️', grad: 'from-primary-400 to-indigo-300', quote: '今天的心情天气，由你来记录' };

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      {/* 顶部问候 */}
      <div className="relative bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 px-5 pt-12 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform -translate-x-16 translate-y-16" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white/80 text-sm">{getGreeting()}，</p>
              <h1 className="text-white text-2xl font-bold mt-1">{user.nickname}</h1>
            </div>
            <div className="text-5xl animate-float">{user.avatar}</div>
          </div>
          <p className="text-white/70 text-sm mt-2">{dateDisplay}</p>
        </div>
      </div>

      <div className="px-4 -mt-16 space-y-5">
        {/* ① 情绪天气卡（视觉主角：画面感 + 双轨合一） */}
        <div
          onClick={() => navigate('/mood-record')}
          className={cn(
            'relative rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform shadow-lg bg-gradient-to-br',
            todayWeather.grad
          )}
        >
          <div className="absolute -top-1 right-3 text-6xl opacity-25 select-none">
            {todayWeather.emoji}
          </div>
          <div className="relative p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/80 text-xs">今日心情天气</p>
                <h2 className="text-white text-3xl font-bold mt-0.5 leading-tight">
                  {todayWeather.sky}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-4xl">{todayMood ? moodConfig!.emoji : '🌤️'}</div>
                <p className="text-white/90 text-sm font-medium mt-1">
                  {moodConfig ? moodConfig.label : '还没记'}
                </p>
              </div>
            </div>

            <p className="text-white/90 text-sm mt-3 leading-relaxed">{todayWeather.quote}</p>

            {/* 双轨小条：今日心情 × 今日学习 */}
            <div className="mt-4 flex items-center gap-3 bg-white/25 rounded-2xl p-3 backdrop-blur-sm">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-lg">💗</span>
                <div className="min-w-0">
                  <p className="text-white/70 text-[10px]">今日心情</p>
                  <p className="text-white text-sm font-semibold truncate">
                    {moodConfig ? moodConfig.label : '未记录'}
                  </p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/30" />
              <div className="flex-1 flex items-center gap-2">
                <span className="text-lg">📚</span>
                <div className="min-w-0">
                  <p className="text-white/70 text-[10px]">今日学习</p>
                  <p className="text-white text-sm font-semibold truncate">{todayStudyMinutes} 分钟</p>
                </div>
              </div>
            </div>

            {/* 连续天数 + 本周时长 */}
            <div className="mt-3 flex items-center gap-1.5 text-white/85 text-xs">
              <Flame size={13} className="text-orange-200" />
              <span>连续记录 {streakDays} 天</span>
              <span className="opacity-50">·</span>
              <span>本周已学 {formatDuration(weekStudyMinutes)}</span>
            </div>
          </div>
        </div>

        {/* ② 晴语今日发现（唯一 AI hero，优先跨变量洞察） */}
        {heroInsight && (
          <div
            onClick={() => navigate('/insight')}
            className="relative rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform shadow-lg bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />

            <div className="relative p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Brain size={16} className="text-white" />
                </div>
                <span className="text-white text-sm font-medium">晴语发现</span>
                <span className="ml-auto text-white/60 text-xs flex items-center gap-0.5">
                  查看全部 <ChevronRight size={12} />
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">{heroInsight.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base leading-snug">
                    {heroInsight.title}
                  </h3>
                  <p className="text-white/75 text-xs mt-1.5 leading-relaxed line-clamp-3">
                    {heroInsight.detail}
                  </p>
                </div>
              </div>

              {/* 韧性分数迷你条 */}
              <div className="mt-4 flex items-center gap-2">
                <Shield size={12} className="text-white/60" />
                <span className="text-white/60 text-xs">情绪韧性</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-pink-300"
                    style={{ width: `${resilienceScore.total}%`, transition: 'width 1s ease-out' }}
                  />
                </div>
                <span className="text-white text-xs font-bold">{resilienceScore.total}</span>
              </div>
            </div>
          </div>
        )}

        {/* ②.5 晴语对话入口 */}
        <div
          onClick={() => navigate('/chat')}
          className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border border-purple-100 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center text-2xl flex-shrink-0">
              🌱
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-800">和晴语聊聊</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 font-medium">
                  AI 陪伴
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                说说话，心里会轻一点
              </p>
            </div>
            <ArrowRight size={18} className="text-purple-300 flex-shrink-0" />
          </div>
        </div>

        {/* ②.55 知识笔记入口 */}
        <div
          onClick={() => navigate('/knowledge')}
          className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-200 to-cyan-200 flex items-center justify-center text-2xl flex-shrink-0">
              📒
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-800">知识笔记</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-600 font-medium">
                  {knowledgeNotes.length} 篇
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                学过的知识，记下来才是自己的
              </p>
            </div>
            <ArrowRight size={18} className="text-sky-300 flex-shrink-0" />
          </div>
        </div>

        {/* ②.6 周成长报告入口 */}
        <div
          onClick={() => navigate('/weekly-report')}
          className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 text-white"
        >
          <div className="absolute -top-1 -right-1 text-5xl opacity-20">📊</div>
          <div className="relative flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">本周成长报告</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-medium">
                  已生成
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                看看这周的情绪和学习成长
              </p>
            </div>
            <ArrowRight size={18} className="text-white/50 flex-shrink-0" />
          </div>
        </div>

        {/* ③ 微行动推荐（一行横滑，缩窄） */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary-500" />
              <h2 className="text-lg font-bold text-gray-800">微行动推荐</h2>
            </div>
            <button
              onClick={() => navigate('/actions')}
              className="flex items-center gap-1 text-primary-500 text-sm font-medium hover:text-primary-600 transition-colors"
            >
              查看全部
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {topActions.map((action) => (
              <div
                key={action.id}
                onClick={() => navigate(`/action/${action.id}`)}
                className={cn(
                  'flex-shrink-0 w-36 p-4 rounded-2xl cursor-pointer',
                  'bg-gradient-to-br',
                  action.gradient,
                  'shadow-soft active:scale-[0.97] transition-all duration-200'
                )}
              >
                <div className="text-3xl mb-2">{action.icon}</div>
                <h3 className="text-white font-bold text-sm mb-1">{action.name}</h3>
                <p className="text-white/80 text-xs">
                  {Math.floor(action.duration / 60)}分钟
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
