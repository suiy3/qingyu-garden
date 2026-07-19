import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  CircleHelp,
  Clock3,
  Heart,
  NotebookPen,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/common/Button';
import MoodSelector from '@/components/mood/MoodSelector';
import IntensitySlider from '@/components/mood/IntensitySlider';
import TriggerTags from '@/components/mood/TriggerTags';
import SubjectSelector from '@/components/study/SubjectSelector';
import { useAppStore } from '@/store/useAppStore';
import { MoodType, SubjectType, TriggerType } from '@/types';
import { MOOD_CONFIG, SUBJECT_CONFIG } from '@/utils/constants';
import { cn } from '@/lib/utils';

type StudyChoice = 'studied' | 'rest' | null;

const durations = [20, 40, 60, 90];
const focusOptions = [
  { value: 2, label: '有点散' },
  { value: 3, label: '还可以' },
  { value: 5, label: '很专注' },
];

const moodRatingMap: Record<MoodType, number> = {
  happy: 5,
  calm: 4,
  anxious: 2,
  sad: 2,
  angry: 1,
  tired: 2,
};

const actionForMood: Record<MoodType, { id: string; icon: string; title: string; copy: string }> = {
  happy: { id: 'mindfulness-rainbow', icon: '🌈', title: '留住这份明亮', copy: '用 3 分钟彩虹呼吸，把好状态安稳地留下来。' },
  calm: { id: 'mindfulness-rainbow', icon: '🍃', title: '把平静延长一点', copy: '做一次轻柔呼吸，让接下来的节奏也稳稳的。' },
  anxious: { id: 'breathing-478', icon: '🌬️', title: '先把呼吸放慢', copy: '不用立刻解决所有事，先用 3 分钟让身体松一点。' },
  sad: { id: 'firstaid-54321', icon: '🖐️', title: '回到此刻', copy: '跟着 5-4-3-2-1 接地法，给难过留一点缓冲。' },
  angry: { id: 'firstaid-54321', icon: '🖐️', title: '先停一小会儿', copy: '先感受周围，再决定下一句话要不要说。' },
  tired: { id: 'relax-neck', icon: '🧘', title: '让肩颈休息一下', copy: '学习先暂停 3 分钟，松开不知不觉绷紧的身体。' },
};

export default function DailyCheckIn() {
  const navigate = useNavigate();
  const addDailyCheckIn = useAppStore((state) => state.addDailyCheckIn);
  const [mood, setMood] = useState<MoodType | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [triggers, setTriggers] = useState<TriggerType[]>([]);
  const [studyChoice, setStudyChoice] = useState<StudyChoice>(null);
  const [subject, setSubject] = useState<SubjectType | null>(null);
  const [duration, setDuration] = useState(40);
  const [focusRating, setFocusRating] = useState(3);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const canSave = Boolean(
    mood &&
    studyChoice &&
    (studyChoice === 'rest' || subject)
  );

  const recommendedAction = useMemo(
    () => (mood ? actionForMood[mood] : null),
    [mood]
  );

  const toggleTrigger = (trigger: TriggerType) => {
    setTriggers((current) =>
      current.includes(trigger)
        ? current.filter((item) => item !== trigger)
        : [...current, trigger]
    );
  };

  const handleSave = () => {
    if (!mood || !studyChoice || (studyChoice === 'studied' && !subject)) return;

    const rested = studyChoice === 'rest';
    addDailyCheckIn(mood, intensity, triggers, note.trim(), {
      subject: rested ? 'other' : subject!,
      duration: rested ? 0 : duration,
      focusRating: rested ? 3 : focusRating,
      efficiencyRating: rested ? 3 : focusRating,
      moodRating: moodRatingMap[mood],
      note: rested ? '今天没有安排学习' : undefined,
    });
    setSaved(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (saved && mood && studyChoice && recommendedAction) {
    const moodConfig = MOOD_CONFIG[mood];
    const rested = studyChoice === 'rest';
    return (
      <PageContainer className="px-4 pt-10">
        <div className="mx-auto max-w-md animate-fade-in">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-mint-100 to-emerald-100 text-4xl shadow-soft">
              🌱
            </div>
            <p className="mt-5 text-sm font-medium text-primary-600">今日双轨记录完成</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-800">你把今天好好接住了</h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">心情和学习放在一起，规律才会慢慢浮现。</p>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-white p-4 shadow-soft">
              <p className="text-xs text-gray-400">此刻心情</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl">{moodConfig.emoji}</span>
                <span className="font-semibold text-gray-700">{moodConfig.label} · {intensity}/10</span>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-soft">
              <p className="text-xs text-gray-400">今日学习</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl">{rested ? '🌙' : SUBJECT_CONFIG[subject!].emoji}</span>
                <span className="font-semibold text-gray-700">
                  {rested ? '今天休息' : `${duration} 分钟`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-primary-500 p-5 text-white shadow-soft-lg">
            <div className="flex items-center gap-2 text-xs text-white/75">
              <Sparkles size={14} />
              根据这次记录，为你推荐
            </div>
            <div className="mt-3 flex items-start gap-3">
              <span className="text-3xl">{recommendedAction.icon}</span>
              <div>
                <h2 className="font-bold">{recommendedAction.title}</h2>
                <p className="mt-1 text-sm leading-6 text-white/80">{recommendedAction.copy}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/action/${recommendedAction.id}`)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-purple-700 active:scale-[0.98]"
            >
              开始 3 分钟微行动 <ArrowRight size={16} />
            </button>
          </div>

          {!rested && subject && (
            <div className="mt-5 rounded-3xl bg-white p-5 shadow-soft">
              <p className="text-xs font-semibold text-sky-600">把学习变成积累</p>
              <h2 className="mt-1 text-lg font-bold text-gray-800">刚才有没有值得留下的知识点？</h2>
              <p className="mt-1 text-xs leading-5 text-gray-400">趁记忆还新鲜，花半分钟写下来。</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => navigate(`/knowledge/new?subject=${subject}`)} className="flex items-center justify-center gap-2 rounded-2xl bg-sky-50 px-3 py-3 text-sm font-semibold text-sky-700"><NotebookPen size={17} /> 记知识点</button>
                <button onClick={() => navigate(`/knowledge/new?subject=${subject}&type=question`)} className="flex items-center justify-center gap-2 rounded-2xl bg-amber-50 px-3 py-3 text-sm font-semibold text-amber-700"><CircleHelp size={17} /> 记错题</button>
              </div>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3 pb-8">
            <Button variant="secondary" className="w-full" onClick={() => navigate('/')}>
              回到首页
            </Button>
            <Button className="w-full" onClick={() => navigate('/insight')}>
              看今日发现
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="一分钟双轨记录" showBack className="px-4 pt-5">
      <div className="mx-auto max-w-xl space-y-4 pb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400 via-rose-400 to-purple-500 p-5 text-white shadow-soft-lg">
          <div className="absolute -right-5 -top-7 text-7xl opacity-20">🌤️</div>
          <div className="absolute -bottom-8 -left-5 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="relative">
            <p className="text-xs font-semibold text-white/75">今天的小天气</p>
            <h1 className="mt-1 text-xl font-bold">先照顾心情，再看看学习</h1>
            <p className="mt-1 text-xs leading-5 text-white/70">没有标准答案，选最接近此刻的感受就好。</p>
          </div>
          <div className="relative mt-5">
            <div className="flex items-center justify-between text-xs font-medium text-white/75">
              <span>心情</span><span>学习</span><span>补充</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {[Boolean(mood), Boolean(studyChoice), Boolean(note || triggers.length)].map((done, index) => (
                <div key={index} className={cn('h-1.5 flex-1 rounded-full transition-colors', done ? 'bg-white' : 'bg-white/25')} />
              ))}
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/60 p-5 shadow-soft">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500"><Heart size={18} /></div>
            <div>
              <p className="text-xs font-semibold text-rose-500">01 · 必填</p>
              <h2 className="mt-0.5 text-lg font-bold text-gray-800">此刻的你，最接近哪种心情？</h2>
            </div>
          </div>
          <MoodSelector selected={mood} onSelect={setMood} />
          {mood && (
            <div className="mt-7 border-t border-warm-100 pt-5 animate-fade-in">
              <IntensitySlider value={intensity} onChange={setIntensity} />
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/60 p-5 shadow-soft">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-500"><BookOpenCheck size={18} /></div>
            <div>
              <p className="text-xs font-semibold text-sky-500">02 · 必填</p>
              <h2 className="mt-0.5 text-lg font-bold text-gray-800">今天的学习状态呢？</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setStudyChoice('studied')}
              className={cn('rounded-2xl border-2 p-4 text-left transition-all', studyChoice === 'studied' ? 'border-sky-400 bg-sky-50' : 'border-gray-100 bg-gray-50')}
            >
              <span className="text-2xl">📚</span>
              <p className="mt-2 text-sm font-semibold text-gray-700">今天学了</p>
              <p className="mt-0.5 text-xs text-gray-400">记下科目和时长</p>
            </button>
            <button
              onClick={() => setStudyChoice('rest')}
              className={cn('rounded-2xl border-2 p-4 text-left transition-all', studyChoice === 'rest' ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100 bg-gray-50')}
            >
              <span className="text-2xl">🌙</span>
              <p className="mt-2 text-sm font-semibold text-gray-700">今天先休息</p>
              <p className="mt-0.5 text-xs text-gray-400">休息也值得被记录</p>
            </button>
          </div>

          {studyChoice === 'studied' && (
            <div className="mt-5 space-y-5 border-t border-gray-100 pt-5 animate-fade-in">
              <div>
                <p className="mb-3 text-sm font-medium text-gray-600">主要学了什么？</p>
                <SubjectSelector selected={subject} onSelect={setSubject} />
              </div>
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-600"><Clock3 size={15} /> 大约学了多久？</div>
                <div className="grid grid-cols-4 gap-2">
                  {durations.map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => setDuration(minutes)}
                      className={cn('rounded-xl py-2.5 text-sm font-semibold transition-colors', duration === minutes ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-700')}
                    >
                      {minutes === 90 ? '90+' : minutes}分
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-gray-600">大部分时间的专注感？</p>
                <div className="grid grid-cols-3 gap-2">
                  {focusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFocusRating(option.value)}
                      className={cn('rounded-xl py-2.5 text-sm font-medium transition-colors', focusRating === option.value ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700')}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/50 p-5 shadow-soft">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-500"><Sparkles size={18} /></div>
            <div>
              <p className="text-xs font-semibold text-amber-500">03 · 可跳过</p>
              <h2 className="mt-0.5 text-lg font-bold text-gray-800">是什么影响了今天？</h2>
            </div>
          </div>
          <TriggerTags selected={triggers} onToggle={toggleTrigger} />
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, 120))}
            placeholder="想说的话可以留在这里，不写也没关系……"
            className="mt-5 h-24 w-full resize-none rounded-2xl border border-warm-200 bg-warm-50 p-3 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-primary-300"
          />
          <p className="mt-1 text-right text-xs text-gray-300">{note.length}/120</p>
        </section>

        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800">
          <div className="flex gap-2"><ShieldCheck size={16} className="mt-0.5 shrink-0" /><span>记录只保存在这台设备。家长端只看趋势，不展示你写下的原话。</span></div>
        </div>

        {!canSave && (
          <p className="text-center text-xs text-gray-400">选好心情和今日学习状态，就可以完成记录</p>
        )}
        <Button size="lg" className="flex w-full items-center justify-center gap-2" disabled={!canSave} onClick={handleSave}>
          <Check size={19} /> 完成今日记录
        </Button>
      </div>
    </PageContainer>
  );
}
