import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Sprout,
} from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, getDayOfWeek, getGreeting } from '@/utils/date';
import { MOOD_CONFIG } from '@/utils/constants';
import { generateAllInsights, Insight } from '@/utils/insightEngine';

function pickHeroInsight(insights: Insight[]) {
  const priority: Record<string, number> = { correlation: 4, pattern: 3, warning: 2, positive: 1 };
  return [...insights].sort((a, b) => (priority[b.type] ?? 0) - (priority[a.type] ?? 0))[0];
}

export default function Home() {
  const navigate = useNavigate();
  const { user, moodRecords, studyRecords, knowledgeNotes, isFirstLaunch } = useAppStore();
  const today = formatDate(new Date());
  const todayMood = moodRecords.find((record) => formatDate(record.createdAt) === today);
  const todayStudyRecords = studyRecords.filter((record) => formatDate(record.createdAt) === today);
  const todayStudyMinutes = todayStudyRecords.reduce((total, record) => total + record.duration, 0);
  const hasStudyCheckIn = todayStudyRecords.length > 0;
  const moodConfig = todayMood ? MOOD_CONFIG[todayMood.moodType] : null;
  const isComplete = Boolean(todayMood && hasStudyCheckIn);
  const questionCount = knowledgeNotes.filter((note) => note.noteType === 'question').length;
  const normalNoteCount = knowledgeNotes.length - questionCount;

  const insights = useMemo(
    () => generateAllInsights(moodRecords, studyRecords),
    [moodRecords, studyRecords]
  );
  const heroInsight = useMemo(() => pickHeroInsight(insights), [insights]);

  const streakDays = useMemo(() => {
    const recordedDates = new Set(moodRecords.map((record) => formatDate(record.createdAt)));
    let count = 0;
    for (let offset = 0; offset < 365; offset++) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      if (!recordedDates.has(formatDate(date))) break;
      count += 1;
    }
    return count;
  }, [moodRecords]);

  const quickLinks = [
    { label: '看看规律', note: '心情 × 学习', icon: BarChart3, color: 'bg-indigo-50 text-indigo-600', path: '/insight' },
    { label: '缓一缓', note: '3 分钟微行动', icon: Sparkles, color: 'bg-amber-50 text-amber-600', path: '/actions' },
    { label: '本周小结', note: '看见自己的变化', icon: CalendarDays, color: 'bg-emerald-50 text-emerald-600', path: '/weekly-report' },
    { label: '和晴语聊聊', note: '随时说几句', icon: MessageCircle, color: 'bg-rose-50 text-rose-600', path: '/chat' },
  ];

  return (
    <div className="min-h-screen bg-warm-50 pb-28">
      <header className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-primary-500 to-rose-400 px-5 pb-24 pt-11 text-white">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
        <div className="relative mx-auto max-w-xl">
          <p className="text-sm text-white/80">{getGreeting()} · {getDayOfWeek(new Date())}</p>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{user.nickname}，今天还好吗？</h1>
              <p className="mt-2 text-sm text-white/80">不用想很久，真实就好。</p>
            </div>
            <div className="text-5xl">{user.avatar}</div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto -mt-16 max-w-xl space-y-5 px-4">
        <section className="overflow-hidden rounded-[28px] bg-white shadow-soft-lg">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary-600">
                  <Clock3 size={14} /> 一分钟双轨记录
                </div>
                <h2 className="mt-2 text-xl font-bold text-gray-800">
                  {isComplete ? '今天已经好好记录过了' : '把心情和学习放在一起'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {isComplete ? '想补充一条也可以，晴语会继续陪你看见规律。' : '只需三小步，记录今天真实的状态。'}
                </p>
              </div>
              <div className="ml-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-warm-100 to-orange-100 text-3xl">
                {isComplete ? '🌱' : '🌤️'}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-rose-50 p-3">
                <p className="text-[11px] text-rose-400">今日心情</p>
                <p className="mt-1 text-sm font-semibold text-gray-700">
                  {moodConfig ? `${moodConfig.emoji} ${moodConfig.label}` : '○ 等你记录'}
                </p>
              </div>
              <div className="rounded-2xl bg-sky-50 p-3">
                <p className="text-[11px] text-sky-500">今日学习</p>
                <p className="mt-1 text-sm font-semibold text-gray-700">
                  {hasStudyCheckIn ? (todayStudyMinutes > 0 ? `📚 ${todayStudyMinutes} 分钟` : '🌙 今天休息') : '○ 等你记录'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/check-in')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-orange-200/60 active:scale-[0.98]"
            >
              {isComplete ? '再记一条' : '开始今日记录'} <ArrowRight size={18} />
            </button>
          </div>
          <div className="flex items-center justify-between bg-warm-50 px-5 py-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><Sprout size={14} className="text-emerald-500" /> 连续记录 {streakDays} 天</span>
            <span>{isComplete ? <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 size={14} /> 今日完成</span> : '完成后种下一株心情植物'}</span>
          </div>
        </section>

        {isFirstLaunch && (
          <section className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-bold text-indigo-600">体验模式</span>
              <p className="flex-1 text-xs leading-5 text-indigo-700">现在展示的是示例记录，方便你体验完整功能。第一次完成自己的记录后，示例数据会自动清空。</p>
            </div>
          </section>
        )}

        <section className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-soft-lg">
          <img src={`${import.meta.env.BASE_URL}garden/bg-home.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-emerald-900/20" />
          <img src={`${import.meta.env.BASE_URL}garden/flower-happy-home.png`} alt="" className="absolute -bottom-5 right-3 h-32 w-24 object-contain drop-shadow-lg" />
          <img src={`${import.meta.env.BASE_URL}garden/flower-calm-home.png`} alt="" className="absolute -bottom-4 right-20 h-24 w-20 object-contain opacity-80" />
          <div className="relative p-5 pr-24 text-white">
            <p className="flex items-center gap-2 text-xs font-semibold text-emerald-200"><BookOpenCheck size={15} /> 学习沉淀</p>
            <h2 className="mt-2 text-xl font-bold">知识点与错题本</h2>
            <p className="mt-1 text-xs leading-5 text-white/65">记录不只停在“学了多久”，还要留下真正学会了什么。</p>
            <div className="mt-4 flex gap-3 text-xs">
              <span className="rounded-full bg-white/15 px-3 py-1.5">📝 知识点 {normalNoteCount}</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">❓ 错题 {questionCount}</span>
            </div>
          </div>
          <div className="relative grid grid-cols-2 border-t border-white/10 bg-black/15">
            <button onClick={() => navigate('/knowledge')} className="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-white"><BookOpenCheck size={15} /> 打开知识本</button>
            <button onClick={() => navigate('/knowledge/new?type=question')} className="flex items-center justify-center gap-1.5 border-l border-white/10 py-3 text-xs font-semibold text-amber-200"><CircleHelp size={15} /> 记一道错题</button>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold text-purple-500">基于你的记录</p>
              <h2 className="mt-0.5 text-lg font-bold text-gray-800">晴语今日发现</h2>
            </div>
            <button onClick={() => navigate('/insight')} className="flex items-center text-xs font-medium text-gray-400">全部 <ChevronRight size={15} /></button>
          </div>

          <button
            onClick={() => navigate('/insight')}
            className="w-full rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 p-5 text-left text-white shadow-soft-lg active:scale-[0.99]"
          >
            {heroInsight ? (
              <div className="flex items-start gap-3">
                <span className="text-3xl">{heroInsight.icon}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold leading-6">{heroInsight.title}</h3>
                  <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-white/75">{heroInsight.detail}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <span className="text-3xl">🔎</span>
                <div>
                  <h3 className="font-bold">规律正在慢慢长出来</h3>
                  <p className="mt-1.5 text-sm leading-6 text-white/75">连续记录几天后，你会在这里看到心情和学习之间的联系。</p>
                </div>
              </div>
            )}
          </button>
        </section>

        <section>
          <h2 className="px-1 text-lg font-bold text-gray-800">接下来，想做什么？</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="rounded-3xl bg-white p-4 text-left shadow-soft active:scale-[0.98]"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.color}`}><Icon size={20} /></div>
                  <p className="mt-3 text-sm font-bold text-gray-700">{item.label}</p>
                  <p className="mt-1 text-xs text-gray-400">{item.note}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-emerald-50 px-4 py-3">
          <div className="flex items-start gap-2 text-xs leading-5 text-emerald-800">
            <ShieldCheck size={17} className="mt-0.5 shrink-0" />
            <p><span className="font-semibold">你的记录属于你。</span> 数据只保存在这台设备；家长端只展示趋势，不展示你写下的原话。</p>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
